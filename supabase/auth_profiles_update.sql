-- Non-destructive auth profile update for existing AI Photo Studio projects.
-- Run this in Supabase SQL Editor if `profiles` was created before auth signup/login.

alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists role text not null default 'customer';
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create index if not exists profiles_email_idx on public.profiles(email);
create unique index if not exists profiles_phone_unique_idx
on public.profiles(phone)
where phone is not null and phone <> '';
