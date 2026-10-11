"use client";

import { Activity, CheckCircle2, Filter, KeyRound, MessageSquareText, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useCsData } from "@/components/data-provider";
import { PageIntro } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export default function ActivityPage() {
  const { logs } = useCsData();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("semua");
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("id");
    return logs.filter((log) => (type === "semua" || log.entity_type === type) && (!needle || `${log.actor_name} ${log.action} ${log.description}`.toLocaleLowerCase("id").includes(needle)));
  }, [logs, query, type]);

  return (
    <div className="page-stack">
      <PageIntro eyebrow="Keamanan & audit" title="Activity Logs" description="Pantau tindakan petugas, perubahan tiket, dan akses sistem dalam satu jejak audit." />
      <section className="audit-banner">
        <div><ShieldCheck size={26} /><div><strong>Audit trail aktif</strong><span>Aktivitas penting dicatat dengan waktu, aktor, serta alamat jaringan.</span></div></div>
        <span><CheckCircle2 size={17} /> Terverifikasi</span>
      </section>
      <section className="table-card">
        <div className="table-card__toolbar">
          <div><span className="card__eyebrow">Rekaman sistem</span><h2>Riwayat aktivitas petugas</h2></div>
          <div className="filters">
            <label className="select-field"><Filter size={16} /><select value={type} onChange={(event) => setType(event.target.value)}><option value="semua">Semua modul</option><option value="ticket">Tiket</option><option value="message">Pesan</option><option value="catalog">Katalog</option><option value="auth">Autentikasi</option></select></label>
            <label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari aktivitas" /></label>
          </div>
        </div>
        <div className="activity-list">
          {filtered.map((log) => {
            const Icon = log.entity_type === "auth" ? KeyRound : log.entity_type === "message" ? MessageSquareText : Activity;
            return (
              <article key={log.id} className="activity-row">
                <span className={`activity-row__icon activity-row__icon--${log.entity_type}`}><Icon size={18} /></span>
                <div className="activity-row__main"><header><strong>{log.action}</strong><span>{log.actor_name}</span></header><p>{log.description}</p></div>
                <div className="activity-row__meta"><time>{formatDateTime(log.created_at)}</time><span>IP: {log.ip_address}</span></div>
              </article>
            );
          })}
        </div>
        <footer className="table-footer"><span>Menampilkan {filtered.length} aktivitas</span><div><button disabled>Sebelumnya</button><strong>1</strong><button disabled>Selanjutnya</button></div></footer>
      </section>
    </div>
  );
}
