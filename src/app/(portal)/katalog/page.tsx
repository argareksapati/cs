"use client";

import { BookOpen, Check, Clock3, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useCsData } from "@/components/data-provider";
import { PageIntro } from "@/components/ui";

export default function CatalogPage() {
  const { catalog } = useCsData();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("id");
    return catalog.filter((item) => !needle || `${item.name} ${item.description}`.toLocaleLowerCase("id").includes(needle));
  }, [catalog, query]);

  return (
    <div className="page-stack">
      <PageIntro eyebrow="Referensi pelayanan" title="Katalog & Persyaratan" description="Acuan petugas untuk menjawab pertanyaan warga secara konsisten dan sesuai standar layanan." action={<label className="search-field search-field--intro"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari layanan" /></label>} />
      <section className="catalog-summary">
        <div><BookOpen size={20} /><span>Layanan aktif</span><strong>{catalog.filter((item) => item.active).length}</strong></div>
        <div><Clock3 size={20} /><span>Rata-rata target</span><strong>{Math.round(catalog.reduce((sum, item) => sum + item.sla_hours, 0) / Math.max(1, catalog.length))} jam</strong></div>
        <div><FileText size={20} /><span>Persyaratan tercatat</span><strong>{catalog.reduce((sum, item) => sum + item.requirements.length, 0)}</strong></div>
      </section>
      <section className="catalog-grid">
        {filtered.map((service) => (
          <article className={`catalog-card catalog-card--${service.color}`} key={service.id}>
            <div className="catalog-card__top"><span className="catalog-card__icon"><FileText size={21} /></span><span className="active-chip"><i /> Aktif</span></div>
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            <div className="catalog-card__sla"><Clock3 size={16} /><span>Target penyelesaian</span><strong>{service.sla_hours} jam</strong></div>
            <div className="catalog-card__requirements"><span>Persyaratan utama</span><ul>{service.requirements.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div>
          </article>
        ))}
      </section>
    </div>
  );
}
