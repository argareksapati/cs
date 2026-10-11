"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Grid2X2,
  KeyRound,
  LogOut,
  Menu,
  RefreshCcw,
  Radio,
  X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useCsData } from "./data-provider";
import { BrandMark } from "./brand-mark";

const navigation = [
  { href: "/permohonan", label: "Permohonan & Layanan", icon: ClipboardList },
  { href: "/dashboard", label: "Dashboard CS", icon: Grid2X2 },
  { href: "/katalog", label: "Katalog & Persyaratan", icon: BookOpen },
  { href: "/activity", label: "Activity Logs", icon: Activity },
];

const titles: Record<string, string> = {
  "/dashboard": "Dashboard CS",
  "/permohonan": "Permohonan & Layanan",
  "/katalog": "Katalog & Persyaratan",
  "/activity": "Activity Logs",
  "/settings/password": "Ganti Password",
};

export function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { mode, lastSync, refresh } = useCsData();
  const [open, setOpen] = useState(false);

  const pageTitle = useMemo(() => {
    if (pathname.startsWith("/permohonan/") && pathname !== "/permohonan") return "Detail Permohonan";
    return titles[pathname] ?? "Portal CS";
  }, [pathname]);

  return (
    <div className="portal-shell">
      <button
        className="mobile-menu-button"
        type="button"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && <button className="sidebar-scrim" aria-label="Tutup menu" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <div className="sidebar__scroll">
          <Link href="/dashboard" className="sidebar__brand">
            <div className="sidebar__logo"><BrandMark compact /></div>
            <div>
              <strong>Kota Bandung</strong>
              <span>Multi-Tenant Portal</span>
            </div>
          </Link>

          <nav className="sidebar__nav" aria-label="Navigasi utama">
            <p className="sidebar__label">Menu Utama</p>
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`sidebar__link ${active ? "sidebar__link--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={19} aria-hidden />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="sidebar__chevron" size={16} aria-hidden />}
                </Link>
              );
            })}

            <p className="sidebar__label sidebar__label--settings">Pengaturan</p>
            <Link
              href="/settings/password"
              onClick={() => setOpen(false)}
              className={`sidebar__link ${pathname === "/settings/password" ? "sidebar__link--active" : ""}`}
            >
              <KeyRound size={19} aria-hidden />
              <span>Ganti Password</span>
            </Link>
          </nav>
        </div>

        <Link href="/login" className="sidebar__logout">
          <LogOut size={18} aria-hidden />
          <span>Keluar</span>
        </Link>
      </aside>

      <div className="portal-main">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Portal OPD</span>
            <ChevronRight size={14} aria-hidden />
            <strong>{pageTitle}</strong>
          </div>

          <div className="topbar__actions">
            <button className="sync-pill" type="button" data-realtime-ready={lastSync ? "true" : "false"} onClick={() => void refresh()} title="Sinkronkan data">
              {mode === "connecting" ? <RefreshCcw className="spin" size={15} /> : <Radio size={15} />}
              <span>{mode === "supabase" ? "Supabase realtime" : mode === "local" ? "Realtime lokal" : "Menghubungkan"}</span>
              {lastSync && <time>{lastSync.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</time>}
            </button>
            <div className="user-widget">
              <div className="user-widget__avatar"><CircleUserRound size={20} /></div>
              <div>
                <strong>Petugas Layanan – Bojongloa Kidul</strong>
                <span>Customer Support / Pelayanan Publik</span>
              </div>
            </div>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
