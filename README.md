# Customer Service Kota Bandung

Portal operasional Customer Service untuk mengelola permohonan warga, percakapan tiket, katalog persyaratan, log aktivitas, dan keamanan akun. Tampilan mengikuti ekspor Google Stitch proyek `14050045954780934507`.

## Menjalankan lokal

```powershell
npm install
npm run dev
```

Buka `http://localhost:3001`. Konfigurasi publik Supabase ditempatkan di `.env.local` dan tidak boleh masuk Git.

## Supabase dan realtime

Proyek menggunakan Supabase yang sama dengan SSO. Semua tabel memakai awalan `cs_` agar tidak bertabrakan dengan modul lain.

1. Terapkan migration `supabase/migrations/202610110001_customer_service_realtime.sql`.
2. Daftarkan akun melalui SSO/Supabase Auth.
3. Salin `supabase/bootstrap_staff.sql`, ganti email administrator, lalu jalankan sekali melalui SQL Editor.
4. Muat ulang aplikasi. Indikator header akan berubah dari **Realtime lokal** menjadi **Supabase realtime**.

Tanpa tabel atau sesi staf, aplikasi menggunakan data pratinjau yang tersimpan di browser. Perubahan tetap langsung tersinkron antartab melalui `BroadcastChannel`.

## Pemeriksaan

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```
