export type TicketStatus =
  | "perlu_verifikasi"
  | "diproses"
  | "menunggu_warga"
  | "selesai"
  | "ditolak";

export type TicketPriority = "rendah" | "normal" | "tinggi" | "mendesak";

export type Ticket = {
  id: string;
  ticket_number: string;
  requester_name: string;
  requester_nik: string;
  requester_email: string;
  requester_phone: string;
  service_name: string;
  category_slug: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to_name: string | null;
  unit: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export type Message = {
  id: string;
  ticket_id: string;
  author_name: string;
  author_role: "warga" | "petugas" | "sistem";
  body: string;
  is_internal: boolean;
  created_at: string;
};

export type ServiceCatalog = {
  id: string;
  slug: string;
  name: string;
  description: string;
  requirements: string[];
  sla_hours: number;
  active: boolean;
  color: "blue" | "amber" | "emerald" | "violet";
};

export type ActivityLog = {
  id: string;
  actor_name: string;
  action: string;
  entity_type: "ticket" | "catalog" | "auth" | "message";
  entity_id: string | null;
  description: string;
  ip_address: string;
  created_at: string;
};

export type RealtimeMode = "connecting" | "supabase" | "local";

export const STATUS_LABEL: Record<TicketStatus, string> = {
  perlu_verifikasi: "Perlu Verifikasi",
  diproses: "Sedang Diproses",
  menunggu_warga: "Menunggu Warga",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  rendah: "Rendah",
  normal: "Normal",
  tinggi: "Tinggi",
  mendesak: "Mendesak",
};
