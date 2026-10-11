"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Inbox,
  MessagesSquare,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { useCsData } from "@/components/data-provider";
import { PageIntro, PriorityBadge, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { ticketMetrics } from "@/lib/tickets";

export default function DashboardPage() {
  const { tickets, messages, mode } = useCsData();
  const metrics = ticketMetrics(tickets);
  const recent = [...tickets].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)).slice(0, 4);
  const urgent = tickets.filter((ticket) => ticket.priority === "mendesak" && ticket.status !== "selesai");

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Pusat Kendali Pelayanan"
        title="Dashboard Customer Service"
        description="Pantau antrean, capaian penyelesaian, dan percakapan warga secara langsung dari satu ruang kerja."
        action={
          <Link href="/permohonan" className="button button--primary">
            Buka antrean <ArrowRight size={17} />
          </Link>
        }
      />

      <section className="metric-grid" aria-label="Ringkasan layanan">
        <MetricCard label="Perlu verifikasi" value={metrics.verification} icon={<CircleAlert />} tone="amber" detail="Perlu ditinjau petugas" />
        <MetricCard label="Sedang diproses" value={metrics.processing} icon={<Clock3 />} tone="blue" detail="Termasuk menunggu warga" />
        <MetricCard label="Selesai" value={metrics.resolved} icon={<CheckCircle2 />} tone="emerald" detail="Permohonan terselesaikan" />
        <MetricCard label="Total permohonan" value={metrics.total} icon={<Inbox />} tone="slate" detail="Seluruh tiket tercatat" />
      </section>

      <section className="dashboard-grid">
        <div className="card card--large">
          <div className="card__header">
            <div>
              <span className="card__eyebrow">Aktivitas terkini</span>
              <h2>Permohonan terbaru</h2>
            </div>
            <Link href="/permohonan" className="text-link">Lihat semua <ArrowRight size={15} /></Link>
          </div>
          <div className="ticket-list">
            {recent.map((ticket) => (
              <Link href={`/permohonan/${ticket.id}`} className="ticket-list__item" key={ticket.id}>
                <div className="ticket-list__number">
                  <span>{ticket.ticket_number}</span>
                  <time>{formatDateTime(ticket.updated_at)}</time>
                </div>
                <div className="ticket-list__subject">
                  <strong>{ticket.subject}</strong>
                  <span>{ticket.requester_name} · {ticket.service_name}</span>
                </div>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
                <ArrowRight className="ticket-list__arrow" size={17} />
              </Link>
            ))}
          </div>
        </div>

        <div className="side-stack">
          <div className="card workload-card">
            <div className="card__header card__header--compact">
              <div>
                <span className="card__eyebrow">Kapasitas hari ini</span>
                <h2>Beban layanan</h2>
              </div>
              <TrendingUp size={20} className="text-blue" />
            </div>
            <div className="donut" style={{ "--progress": `${Math.min(94, 38 + tickets.length * 7)}%` } as React.CSSProperties}>
              <div><strong>{tickets.length}</strong><span>tiket aktif</span></div>
            </div>
            <div className="mini-stats">
              <div><UsersRound size={16} /><span>Petugas aktif</span><strong>4</strong></div>
              <div><MessagesSquare size={16} /><span>Pesan masuk</span><strong>{messages.length}</strong></div>
            </div>
          </div>

          <div className={`realtime-card realtime-card--${mode}`}>
            <span className="realtime-card__pulse" />
            <div>
              <strong>{mode === "supabase" ? "Realtime Supabase aktif" : "Pratinjau realtime aktif"}</strong>
              <span>{mode === "supabase" ? "Perubahan data langsung tersinkron ke seluruh petugas." : "Perubahan tersinkron antar-tab melalui BroadcastChannel."}</span>
            </div>
          </div>
        </div>
      </section>

      {urgent.length > 0 && (
        <section className="attention-card">
          <CircleAlert size={22} />
          <div>
            <strong>{urgent.length} permohonan mendesak membutuhkan perhatian</strong>
            <span>Prioritaskan tindak lanjut agar target waktu layanan tetap terpenuhi.</span>
          </div>
          <Link href={`/permohonan/${urgent[0].id}`} className="button button--white">Tinjau sekarang</Link>
        </section>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
  tone: "amber" | "blue" | "emerald" | "slate";
}) {
  return (
    <article className="metric-card">
      <div>
        <span className={`metric-card__label metric-card__label--${tone}`}>{label}</span>
        <strong className="metric-card__value">{value}</strong>
        <small>{detail}</small>
      </div>
      <span className={`metric-card__icon metric-card__icon--${tone}`}>{icon}</span>
    </article>
  );
}
