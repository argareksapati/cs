"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CircleUserRound,
  FileCheck2,
  Mail,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useCsData } from "@/components/data-provider";
import { EmptyState, PriorityBadge, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { STATUS_LABEL, type TicketStatus } from "@/lib/types";

const statusOptions: TicketStatus[] = ["perlu_verifikasi", "diproses", "menunggu_warga", "selesai", "ditolak"];

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const { tickets, messages, updateTicketStatus, addMessage, mode } = useCsData();
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [saving, setSaving] = useState(false);
  const ticket = tickets.find((item) => item.id === params.id);
  const thread = useMemo(
    () => messages.filter((message) => message.ticket_id === params.id).sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)),
    [messages, params.id],
  );

  if (!ticket) {
    return <EmptyState icon={<FileCheck2 />} title="Tiket tidak ditemukan" description="Permohonan ini tidak tersedia atau sudah dipindahkan." />;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!reply.trim()) return;
    setSaving(true);
    await addMessage(ticket!.id, reply, internal);
    setReply("");
    setSaving(false);
  }

  return (
    <div className="page-stack">
      <div className="detail-heading">
        <Link href="/permohonan" className="back-link"><ArrowLeft size={18} /> Kembali ke antrean</Link>
        <div className="detail-heading__row">
          <div>
            <span className="detail-heading__number">#{ticket.ticket_number}</span>
            <h1>{ticket.subject}</h1>
            <p>Dibuat {formatDateTime(ticket.created_at)} · {ticket.service_name}</p>
          </div>
          <div className="detail-heading__badges"><PriorityBadge priority={ticket.priority} /><StatusBadge status={ticket.status} /></div>
        </div>
      </div>

      <div className="detail-layout">
        <section className="conversation-card">
          <div className="card__header">
            <div><span className="card__eyebrow">Komunikasi tiket</span><h2>Percakapan dengan warga</h2></div>
            <span className="connection-label"><span />{mode === "supabase" ? "Tersinkron Supabase" : "Realtime lokal"}</span>
          </div>

          <div className="conversation-thread" aria-live="polite">
            <div className="thread-event"><span>Tiket dibuat</span><time>{formatDateTime(ticket.created_at)}</time></div>
            {thread.map((message) => (
              <article key={message.id} className={`message message--${message.author_role} ${message.is_internal ? "message--internal" : ""}`}>
                <div className="message__avatar"><CircleUserRound size={19} /></div>
                <div className="message__body">
                  <header><strong>{message.author_name}</strong><span>{message.is_internal ? "Catatan internal" : message.author_role === "warga" ? "Warga" : "Petugas"}</span><time>{formatDateTime(message.created_at)}</time></header>
                  <p>{message.body}</p>
                </div>
              </article>
            ))}
          </div>

          <form className="reply-box" onSubmit={handleSubmit}>
            <div className="reply-box__tabs">
              <button type="button" className={!internal ? "active" : ""} onClick={() => setInternal(false)}>Balas warga</button>
              <button type="button" className={internal ? "active" : ""} onClick={() => setInternal(true)}>Catatan internal</button>
            </div>
            <label>
              <span className="sr-only">Isi balasan</span>
              <textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder={internal ? "Tulis catatan untuk petugas lain…" : "Tulis balasan yang jelas dan membantu…"} rows={4} />
            </label>
            <div className="reply-box__footer"><span>{internal ? "Catatan hanya dapat dilihat petugas." : "Balasan akan tercatat dalam riwayat tiket."}</span><button className="button button--primary" type="submit" disabled={!reply.trim() || saving}>{saving ? "Mengirim…" : "Kirim balasan"}<Send size={16} /></button></div>
          </form>
        </section>

        <aside className="detail-sidebar">
          <section className="card ticket-action-card">
            <span className="card__eyebrow">Tindakan pelayanan</span>
            <h2>Perbarui status</h2>
            <label className="field-label" htmlFor="ticket-status">Status permohonan</label>
            <select id="ticket-status" value={ticket.status} onChange={(event) => void updateTicketStatus(ticket.id, event.target.value as TicketStatus)}>
              {statusOptions.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}
            </select>
            <div className="sla-panel"><CalendarClock size={19} /><div><strong>Target layanan 24 jam</strong><span>Tersisa 3 jam 18 menit</span></div></div>
            <div className="assignment"><span>Petugas penanggung jawab</span><strong>{ticket.assigned_to_name ?? "Belum ditugaskan"}</strong></div>
          </section>

          <section className="card profile-card">
            <span className="card__eyebrow">Data pemohon</span>
            <div className="profile-card__name"><div>{ticket.requester_name.slice(0, 1)}</div><div><h2>{ticket.requester_name}</h2><span>NIK {ticket.requester_nik}</span></div></div>
            <ul>
              <li><Mail size={16} /><span>{ticket.requester_email}</span></li>
              <li><Phone size={16} /><span>{ticket.requester_phone}</span></li>
              <li><Building2 size={16} /><span>{ticket.unit}</span></li>
            </ul>
          </section>

          <section className="card security-note"><ShieldCheck size={22} /><div><strong>Jejak audit aktif</strong><span>Setiap perubahan status dan pesan dicatat otomatis.</span></div></section>
        </aside>
      </div>
    </div>
  );
}
