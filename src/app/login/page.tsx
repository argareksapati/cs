"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Headphones, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) return setMessage("Supabase belum dikonfigurasi.");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else router.push("/dashboard");
    setLoading(false);
  }

  async function googleSignIn() {
    const supabase = createClient();
    if (!supabase) return setMessage("Supabase belum dikonfigurasi.");
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand"><span><BrandMark /></span><div><strong>Kota Bandung</strong><small>Portal Pelayanan Terpadu</small></div></div>
        <div className="login-story__content"><span className="login-eyebrow"><Headphones size={17} /> Customer Service</span><h1>Melayani warga lebih cepat, jelas, dan terukur.</h1><p>Kelola seluruh permohonan, percakapan, dan tindak lanjut layanan publik dalam satu ruang kerja yang terhubung.</p><div className="login-points"><div><ShieldCheck /><span><strong>Aman & terintegrasi</strong><small>Menggunakan akun SSO Kota Bandung</small></span></div><div><ArrowRight /><span><strong>Pembaruan langsung</strong><small>Status dan pesan tersinkron secara realtime</small></span></div></div></div>
        <footer>Sistem Customer Service Kota Bandung · Versi 1.0</footer>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={signIn}>
          <span className="login-card__tag">Akses petugas</span><h2>Masuk ke portal layanan</h2><p>Gunakan akun yang sudah terdaftar pada SSO Kota Bandung.</p>
          <button type="button" className="google-button" onClick={() => void googleSignIn()}><span className="google-g">G</span> Masuk dengan Google</button>
          <div className="divider"><span>atau gunakan email</span></div>
          <label className="login-field"><span>Alamat email</span><div><Mail size={18} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@bandung.go.id" /></div></label>
          <label className="login-field"><span>Kata sandi</span><div><LockKeyhole size={18} /><input type={visible ? "text" : "password"} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Kata sandi" /><button type="button" onClick={() => setVisible((value) => !value)} aria-label="Tampilkan kata sandi">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          {message && <p className="form-message" role="alert">{message}</p>}
          <button className="button button--primary button--wide" disabled={loading}>{loading ? "Memeriksa akun…" : "Masuk"}<ArrowRight size={17} /></button>
          <Link href="/dashboard" className="preview-link">Buka pratinjau antarmuka</Link>
        </form>
      </section>
    </main>
  );
}
