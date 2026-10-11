"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, Clock3, Inbox, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useCsData } from "@/components/data-provider";
import { EmptyState, PageIntro, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { filterTickets, ticketMetrics } from "@/lib/tickets";
import type { TicketStatus } from "@/lib/types";

export default function RequestsPage() {
  const { tickets, catalog } = useCsData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TicketStatus | "semua">("semua");
  const [service, setService] = useState("semua");
  const metrics = ticketMetrics(tickets);
  const filtered = useMemo(() => filterTickets(tickets, query, status, service), [query, service, status, tickets]);

  return (
    <div className="page-stack">
      <PageIntro
        title="Permohonan & Layanan Warga"
        description="Kelola verifikasi permohonan administrasi, dokumen perizinan, dan aduan warga Kecamatan Bojongloa Kidul."
      />

      <section className="metric-grid">
        <CompactMetric label="Perlu verifikasi" value={metrics.verification} icon={<CircleAlert />} tone="amber" />
        <CompactMetric label="Sedang diproses" value={metrics.processing} icon={<Clock3 />} tone="blue" />
        <CompactMetric label="Selesai" value={metrics.resolved} icon={<CheckCircle2 />} tone="emerald" />
        <CompactMetric label="Total permohonan" value={metrics.total} icon={<Inbox />} tone="slate" />
      </section>

      <section className="table-card">
        <div className="table-card__toolbar">
          <div>
            <span className="card__eyebrow">Antrean pelayanan</span>
            <h2>Daftar Permohonan Masuk</h2>
          </div>
          <div className="filters">
            <label className="select-field">
              <span className="sr-only">Jenis layanan</span>
              <select value={service} onChange={(event) => setService(event.target.value)}>
                <option value="semua">Semua jenis layanan</option>
                {catalog.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
              </select>
            </label>
            <label className="select-field">
              <span className="sr-only">Status permohonan</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as TicketStatus | "semua")}>
                <option value="semua">Semua status</option>
                <option value="perlu_verifikasi">Perlu verifikasi</option>
                <option value="diproses">Sedang diproses</option>
                <option value="menunggu_warga">Menunggu warga</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </label>
            <label className="search-field">
              <Search size={17} />
              <span className="sr-only">Cari permohonan</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari pemohon / nomor tiket" />
            </label>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>No. tiket & waktu</th>
                <th>Pemohon (warga)</th>
                <th>Jenis layanan</th>
                <th>Deskripsi / catatan</th>
                <th>Status</th>
                <th className="align-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <tr key={ticket.id}>
                  <td><Link className="ticket-number" href={`/permohonan/${ticket.id}`}>#{ticket.ticket_number}</Link><time>{formatDateTime(ticket.created_at)}</time></td>
                  <td><strong>{ticket.requester_name}</strong><span>NIK: {ticket.requester_nik}</span></td>
                  <td><span className="service-chip">{ticket.service_name}</span></td>
                  <td className="description-cell"><strong>{ticket.subject}</strong><span>{ticket.description}</span></td>
                  <td><StatusBadge status={ticket.status} /></td>
                  <td className="align-right"><Link className="button button--small" href={`/permohonan/${ticket.id}`}>{ticket.status === "perlu_verifikasi" ? "Proses berkas" : "Detail tiket"}<ArrowRight size={15} /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<SlidersHorizontal />} title="Permohonan tidak ditemukan" description="Ubah kata kunci atau filter untuk menampilkan antrean lain." />
        ) : (
          <footer className="table-footer"><span>Menampilkan {filtered.length} dari {tickets.length} permohonan</span><div><button disabled>Sebelumnya</button><strong>1</strong><button disabled>Selanjutnya</button></div></footer>
        )}
      </section>
    </div>
  );
}

function CompactMetric({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  return <article className="metric-card metric-card--compact"><div><span className={`metric-card__label metric-card__label--${tone}`}>{label}</span><strong className="metric-card__value">{value}</strong></div><span className={`metric-card__icon metric-card__icon--${tone}`}>{icon}</span></article>;
}
