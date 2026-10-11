-- Customer Service Kota Bandung
-- Namespaced with cs_ so it can safely share the existing SSO Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.cs_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'agent' check (role in ('agent', 'supervisor', 'admin')),
  unit text not null default 'Kecamatan Bojongloa Kidul',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cs_service_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  requirements jsonb not null default '[]'::jsonb,
  sla_hours integer not null default 24 check (sla_hours > 0),
  active boolean not null default true,
  color text not null default 'blue' check (color in ('blue', 'amber', 'emerald', 'violet')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.cs_ticket_number_seq start 1;

create or replace function public.cs_next_ticket_number()
returns text
language sql
security definer
set search_path = public
as $$
  select 'REQ-' || extract(year from now())::int || '-' || lpad(nextval('public.cs_ticket_number_seq')::text, 4, '0');
$$;

create table if not exists public.cs_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique default public.cs_next_ticket_number(),
  requester_id uuid references auth.users(id) on delete set null,
  requester_name text not null,
  requester_nik text not null default '',
  requester_email text not null default '',
  requester_phone text not null default '',
  service_name text not null,
  category_slug text not null,
  subject text not null,
  description text not null,
  status text not null default 'perlu_verifikasi' check (status in ('perlu_verifikasi', 'diproses', 'menunggu_warga', 'selesai', 'ditolak')),
  priority text not null default 'normal' check (priority in ('rendah', 'normal', 'tinggi', 'mendesak')),
  assigned_to uuid references public.cs_staff(user_id) on delete set null,
  assigned_to_name text,
  unit text not null default 'Kecamatan Bojongloa Kidul',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.cs_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.cs_tickets(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_role text not null check (author_role in ('warga', 'petugas', 'sistem')),
  body text not null check (char_length(body) between 1 and 10000),
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.cs_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text not null,
  action text not null,
  entity_type text not null check (entity_type in ('ticket', 'catalog', 'auth', 'message')),
  entity_id uuid,
  description text not null,
  ip_address text not null default 'server',
  created_at timestamptz not null default now()
);

create index if not exists cs_tickets_status_created_idx on public.cs_tickets(status, created_at desc);
create index if not exists cs_tickets_assigned_to_idx on public.cs_tickets(assigned_to);
create index if not exists cs_tickets_category_idx on public.cs_tickets(category_slug);
create index if not exists cs_messages_ticket_created_idx on public.cs_messages(ticket_id, created_at);
create index if not exists cs_activity_logs_created_idx on public.cs_activity_logs(created_at desc);

create or replace function public.cs_is_staff(required_roles text[] default array['agent','supervisor','admin'])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cs_staff
    where user_id = auth.uid()
      and active = true
      and role = any(required_roles)
  );
$$;

revoke all on function public.cs_is_staff(text[]) from public;
grant execute on function public.cs_is_staff(text[]) to authenticated;

alter table public.cs_staff enable row level security;
alter table public.cs_service_catalog enable row level security;
alter table public.cs_tickets enable row level security;
alter table public.cs_messages enable row level security;
alter table public.cs_activity_logs enable row level security;

create policy "staff can read own staff profile" on public.cs_staff
  for select to authenticated using (user_id = auth.uid() or public.cs_is_staff(array['supervisor','admin']));
create policy "admins manage staff" on public.cs_staff
  for all to authenticated using (public.cs_is_staff(array['admin'])) with check (public.cs_is_staff(array['admin']));

create policy "staff read service catalog" on public.cs_service_catalog
  for select to authenticated using (public.cs_is_staff());
create policy "supervisors manage service catalog" on public.cs_service_catalog
  for all to authenticated using (public.cs_is_staff(array['supervisor','admin'])) with check (public.cs_is_staff(array['supervisor','admin']));

create policy "staff read tickets" on public.cs_tickets
  for select to authenticated using (public.cs_is_staff());
create policy "staff create tickets" on public.cs_tickets
  for insert to authenticated with check (public.cs_is_staff());
create policy "staff update tickets" on public.cs_tickets
  for update to authenticated using (public.cs_is_staff()) with check (public.cs_is_staff());

create policy "staff read messages" on public.cs_messages
  for select to authenticated using (public.cs_is_staff());
create policy "staff create messages" on public.cs_messages
  for insert to authenticated with check (public.cs_is_staff() and author_id = auth.uid());

create policy "staff read activity logs" on public.cs_activity_logs
  for select to authenticated using (public.cs_is_staff());
create policy "staff append activity logs" on public.cs_activity_logs
  for insert to authenticated with check (public.cs_is_staff() and actor_id = auth.uid());

insert into public.cs_service_catalog (slug, name, description, requirements, sla_hours, color)
values
  ('domisili', 'Surat Keterangan Domisili', 'Penerbitan surat keterangan domisili warga, organisasi, atau usaha.', '["KTP pemohon","Kartu Keluarga","Surat pengantar RT/RW"]', 24, 'blue'),
  ('iumk', 'Perizinan Usaha Mikro (IUMK)', 'Pendampingan dokumen dan rekomendasi usaha mikro tingkat kecamatan.', '["KTP dan KK","Foto lokasi usaha","Formulir permohonan"]', 72, 'violet'),
  ('ktp-kk', 'Pengantar KTP / KK', 'Surat pengantar administrasi kependudukan untuk KTP dan Kartu Keluarga.', '["Dokumen pendukung","Surat pengantar RT/RW"]', 24, 'emerald'),
  ('aduan', 'Aduan / Keluhan Warga', 'Kanal laporan fasilitas umum, ketertiban, dan pelayanan publik.', '["Lokasi kejadian","Uraian masalah","Foto pendukung (opsional)"]', 12, 'amber')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  requirements = excluded.requirements,
  sla_hours = excluded.sla_hours,
  color = excluded.color,
  updated_at = now();

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cs_tickets') then
    alter publication supabase_realtime add table public.cs_tickets;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cs_messages') then
    alter publication supabase_realtime add table public.cs_messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cs_activity_logs') then
    alter publication supabase_realtime add table public.cs_activity_logs;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cs_service_catalog') then
    alter publication supabase_realtime add table public.cs_service_catalog;
  end if;
end $$;

alter table public.cs_tickets replica identity full;
alter table public.cs_messages replica identity full;
alter table public.cs_activity_logs replica identity full;
alter table public.cs_service_catalog replica identity full;
