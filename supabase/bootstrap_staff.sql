-- Run once after the intended administrator has registered through SSO.
-- Replace the email value before running in Supabase SQL Editor.
insert into public.cs_staff (user_id, full_name, role, unit)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', email),
  'admin',
  'Kecamatan Bojongloa Kidul'
from auth.users
where email = 'admin@example.com'
on conflict (user_id) do update set role = 'admin', active = true, updated_at = now();
