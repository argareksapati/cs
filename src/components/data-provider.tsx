"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { initialCatalog, initialLogs, initialMessages, initialTickets } from "@/lib/demo-data";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type {
  ActivityLog,
  Message,
  RealtimeMode,
  ServiceCatalog,
  Ticket,
  TicketStatus,
} from "@/lib/types";

type Snapshot = {
  tickets: Ticket[];
  messages: Message[];
  catalog: ServiceCatalog[];
  logs: ActivityLog[];
};

type DataContextValue = Snapshot & {
  mode: RealtimeMode;
  lastSync: Date | null;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  addMessage: (ticketId: string, body: string, internal?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
};

const STORAGE_KEY = "bandung-cs-preview-v1";
const CHANNEL_NAME = "bandung-cs-realtime";

const DataContext = createContext<DataContextValue | null>(null);

function defaultSnapshot(): Snapshot {
  return {
    tickets: initialTickets,
    messages: initialMessages,
    catalog: initialCatalog,
    logs: initialLogs,
  };
}

function readLocalSnapshot(): Snapshot {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Snapshot) : defaultSnapshot();
  } catch {
    return defaultSnapshot();
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot>(defaultSnapshot);
  const [mode, setMode] = useState<RealtimeMode>("local");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const localRevisionRef = useRef(0);
  const supabase = useMemo(() => createClient(), []);

  const publishLocal = useCallback((next: Snapshot) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    channelRef.current?.postMessage(next);
    setLastSync(new Date());
  }, []);

  const loadRemote = useCallback(async () => {
    if (!supabase || !hasSupabaseConfig()) return false;
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return false;

    const [{ data: ticketData, error: ticketError }, messagesResult, catalogResult, logsResult] =
      await Promise.all([
        supabase.from("cs_tickets").select("*").order("created_at", { ascending: false }),
        supabase.from("cs_messages").select("*").order("created_at", { ascending: true }),
        supabase.from("cs_service_catalog").select("*").order("name", { ascending: true }),
        supabase.from("cs_activity_logs").select("*").order("created_at", { ascending: false }),
      ]);

    if (ticketError || !ticketData) return false;

    setSnapshot({
      tickets: ticketData as Ticket[],
      messages: (messagesResult.data ?? []) as Message[],
      catalog: (catalogResult.data ?? []) as ServiceCatalog[],
      logs: (logsResult.data ?? []) as ActivityLog[],
    });
    setMode("supabase");
    setLastSync(new Date());
    return true;
  }, [supabase]);

  const refresh = useCallback(async () => {
    const revisionAtStart = localRevisionRef.current;
    const loaded = await loadRemote();
    if (!loaded) {
      if (revisionAtStart === localRevisionRef.current) setSnapshot(readLocalSnapshot());
      setMode("local");
      setLastSync(new Date());
    }
  }, [loadRemote]);

  useEffect(() => {
    const broadcast = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = broadcast;
    broadcast.onmessage = (event: MessageEvent<Snapshot>) => {
      setSnapshot(event.data);
      setLastSync(new Date());
    };

    let active = true;
    window.queueMicrotask(() => {
      if (!active) return;
      setSnapshot(readLocalSnapshot());
      setMode("local");
      setLastSync(new Date());
    });
    const refreshTimer = window.setTimeout(() => void loadRemote(), 0);
    return () => {
      active = false;
      window.clearTimeout(refreshTimer);
      broadcast.close();
      channelRef.current = null;
    };
  }, [loadRemote]);

  useEffect(() => {
    if (!supabase) return;
    const subscription = supabase
      .channel("customer-service-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cs_tickets" },
        () => void loadRemote(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cs_messages" },
        () => void loadRemote(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cs_activity_logs" },
        () => void loadRemote(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(subscription);
    };
  }, [loadRemote, supabase]);

  const updateTicketStatus = useCallback(
    async (ticketId: string, status: TicketStatus) => {
      if (mode === "supabase" && supabase) {
        const { error } = await supabase
          .from("cs_tickets")
          .update({
            status,
            updated_at: new Date().toISOString(),
            resolved_at: status === "selesai" ? new Date().toISOString() : null,
          })
          .eq("id", ticketId);
        if (!error) {
          await loadRemote();
          return;
        }
      }

      localRevisionRef.current += 1;
      setSnapshot((current) => {
        const ticket = current.tickets.find((item) => item.id === ticketId);
        const now = new Date().toISOString();
        const next: Snapshot = {
          ...current,
          tickets: current.tickets.map((item) =>
            item.id === ticketId
              ? {
                  ...item,
                  status,
                  updated_at: now,
                  resolved_at: status === "selesai" ? now : null,
                }
              : item,
          ),
          logs: ticket
            ? [
                {
                  id: crypto.randomUUID(),
                  actor_name: "Petugas Layanan",
                  action: "Pembaruan Status",
                  entity_type: "ticket",
                  entity_id: ticketId,
                  description: `Memperbarui ${ticket.ticket_number} menjadi ${status.replaceAll("_", " ")}.`,
                  ip_address: "Sesi lokal",
                  created_at: now,
                },
                ...current.logs,
              ]
            : current.logs,
        };
        window.queueMicrotask(() => publishLocal(next));
        return next;
      });
    },
    [loadRemote, mode, publishLocal, supabase],
  );

  const addMessage = useCallback(
    async (ticketId: string, body: string, internal = false) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const message: Message = {
        id: crypto.randomUUID(),
        ticket_id: ticketId,
        author_name: "Petugas Layanan",
        author_role: "petugas",
        body: trimmed,
        is_internal: internal,
        created_at: new Date().toISOString(),
      };

      if (mode === "supabase" && supabase) {
        const { error } = await supabase.from("cs_messages").insert(message);
        if (!error) {
          await loadRemote();
          return;
        }
      }

      localRevisionRef.current += 1;
      setSnapshot((current) => {
        const next: Snapshot = {
          ...current,
          messages: [...current.messages, message],
          logs: [
            {
              id: crypto.randomUUID(),
              actor_name: "Petugas Layanan",
              action: internal ? "Catatan Internal" : "Balasan Warga",
              entity_type: "message",
              entity_id: ticketId,
              description: internal
                ? "Menambahkan catatan internal pada permohonan."
                : "Mengirim balasan kepada pemohon.",
              ip_address: "Sesi lokal",
              created_at: message.created_at,
            },
            ...current.logs,
          ],
        };
        window.queueMicrotask(() => publishLocal(next));
        return next;
      });
    },
    [loadRemote, mode, publishLocal, supabase],
  );

  const value = useMemo(
    () => ({
      ...snapshot,
      mode,
      lastSync,
      updateTicketStatus,
      addMessage,
      refresh,
    }),
    [snapshot, mode, lastSync, updateTicketStatus, addMessage, refresh],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useCsData() {
  const value = useContext(DataContext);
  if (!value) throw new Error("useCsData must be used inside DataProvider");
  return value;
}
