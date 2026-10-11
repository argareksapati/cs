"use client";

import { Check, Eye, EyeOff, KeyRound, LockKeyhole, Save, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { PageIntro } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function PasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const strength = useMemo(() => [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length, [password]);
  const rules = [
    { label: "Minimal 8 karakter", ok: password.length >= 8 },
    { label: "Mengandung huruf besar", ok: /[A-Z]/.test(password) },
    { label: "Mengandung angka", ok: /[0-9]/.test(password) },
    { label: "Mengandung simbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (password !== confirmation) return setMessage("Konfirmasi kata sandi belum sama.");
    if (strength < 4) return setMessage("Kata sandi baru belum memenuhi seluruh ketentuan.");
    setSaving(true);
    const supabase = createClient();
    if (!supabase) {
      setMessage("Supabase belum dikonfigurasi. Perubahan tidak dikirim.");
    } else {
      const { error } = await supabase.auth.updateUser({ password });
      setMessage(error ? error.message : "Kata sandi berhasil diperbarui.");
      if (!error) { setCurrentPassword(""); setPassword(""); setConfirmation(""); }
    }
    setSaving(false);
  }

  return (
    <div className="page-stack">
      <PageIntro eyebrow="Keamanan akun" title="Ganti Password" description="Perbarui kata sandi akun layanan secara berkala untuk menjaga keamanan akses portal." action={<div className="security-chip"><LockKeyhole size={19} /><span>Proteksi sistem<strong>Enkripsi 256-bit</strong></span></div>} />
      <div className="password-layout">
        <form className="card password-form" onSubmit={submit}>
          <div className="form-title"><span><KeyRound size={21} /></span><div><h2>Perbarui Kata Sandi</h2><p>Gunakan kombinasi kata sandi yang unik dan sulit ditebak.</p></div></div>
          <PasswordField label="Kata sandi saat ini" value={currentPassword} setValue={setCurrentPassword} visible={visible} toggle={() => setVisible((value) => !value)} />
          <PasswordField label="Kata sandi baru" value={password} setValue={setPassword} visible={visible} toggle={() => setVisible((value) => !value)} />
          <div className="strength-row"><span>Kekuatan sandi</span><strong>{strength === 4 ? "Kuat" : strength >= 2 ? "Sedang" : "Lemah"}</strong><div>{[1,2,3,4].map((step) => <i key={step} className={strength >= step ? "active" : ""} />)}</div></div>
          <PasswordField label="Konfirmasi kata sandi baru" value={confirmation} setValue={setConfirmation} visible={visible} toggle={() => setVisible((value) => !value)} />
          {message && <p className="form-message" role="status">{message}</p>}
          <div className="form-actions"><button type="button" className="button button--ghost" onClick={() => { setPassword(""); setConfirmation(""); }}>Batalkan</button><button className="button button--primary" disabled={saving || !password || !confirmation}>{saving ? "Menyimpan…" : "Simpan kata sandi"}<Save size={16} /></button></div>
        </form>
        <aside className="card security-tips"><div className="form-title"><span className="green"><ShieldCheck size={21} /></span><div><h2>Tips Keamanan</h2><p>Jaga akun tetap aman saat mengganti password.</p></div></div><ul>{rules.map((rule) => <li key={rule.label} className={rule.ok ? "done" : ""}><span><Check size={15} /></span><div><strong>{rule.label}</strong><small>{rule.ok ? "Sudah terpenuhi" : "Belum terpenuhi"}</small></div></li>)}</ul></aside>
      </div>
    </div>
  );
}

function PasswordField({ label, value, setValue, visible, toggle }: { label: string; value: string; setValue: (value: string) => void; visible: boolean; toggle: () => void }) {
  return <label className="password-field"><span>{label}</span><div><input required type={visible ? "text" : "password"} value={value} onChange={(event) => setValue(event.target.value)} placeholder={`Masukkan ${label.toLocaleLowerCase("id")}`} /><button type="button" onClick={toggle} aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>;
}
