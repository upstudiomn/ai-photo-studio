create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  full_name text,
  phone text,
  role text not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists role text not null default 'customer';
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.ai_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_mn text not null,
  title_en text,
  category text,
  description_mn text,
  preview_image_url text,
  required_images_min int not null default 1,
  required_images_max int not null default 1,
  prompt text not null,
  negative_prompt text,
  default_aspect_ratio text not null default '1:1',
  output_type text not null default 'both',
  requires_admin_review boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  template_id uuid references public.ai_templates(id) on delete set null,
  status text not null default 'draft',
  customer_note text,
  selected_output_id uuid,
  converted_order_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.uploaded_images (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.generation_sessions(id) on delete cascade,
  file_url text not null,
  file_path text,
  image_type text not null default 'source',
  created_at timestamptz not null default now()
);

create table if not exists public.generated_outputs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.generation_sessions(id) on delete cascade,
  provider text not null default 'mock',
  model text,
  preview_url text,
  watermarked_url text,
  full_res_url text,
  is_selected boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id uuid not null references public.generation_sessions(id) on delete restrict,
  selected_output_id uuid references public.generated_outputs(id) on delete set null,
  status text not null default 'pending_payment',
  payment_status text not null default 'unpaid',
  customer_name text,
  customer_phone text,
  customer_email text,
  delivery_address text,
  total_price numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type text not null,
  title text,
  quantity int not null default 1,
  unit_price numeric not null default 0,
  total_price numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null default 'print_ready',
  print_size text,
  paper_type text,
  delivery_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'manual',
  amount numeric not null,
  currency text not null default 'MNT',
  status text not null default 'pending',
  invoice_id text,
  payment_reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.generation_sessions(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  admin_id uuid references auth.users(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

alter table public.generation_sessions
  drop constraint if exists generation_sessions_selected_output_id_fkey;

alter table public.generation_sessions
  add constraint generation_sessions_selected_output_id_fkey
  foreign key (selected_output_id)
  references public.generated_outputs(id)
  on delete set null;

alter table public.generation_sessions
  drop constraint if exists generation_sessions_converted_order_id_fkey;

alter table public.generation_sessions
  add constraint generation_sessions_converted_order_id_fkey
  foreign key (converted_order_id)
  references public.orders(id)
  on delete set null;

create index if not exists generation_sessions_user_id_idx on public.generation_sessions(user_id);
create index if not exists profiles_email_idx on public.profiles(email);
create unique index if not exists profiles_phone_unique_idx on public.profiles(phone) where phone is not null and phone <> '';
create index if not exists generation_sessions_status_idx on public.generation_sessions(status);
create index if not exists uploaded_images_session_id_idx on public.uploaded_images(session_id);
create index if not exists generated_outputs_session_id_idx on public.generated_outputs(session_id);
create index if not exists orders_session_id_idx on public.orders(session_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists print_jobs_order_id_idx on public.print_jobs(order_id);
create index if not exists payments_order_id_idx on public.payments(order_id);

alter table public.profiles enable row level security;
alter table public.ai_templates enable row level security;
alter table public.generation_sessions enable row level security;
alter table public.uploaded_images enable row level security;
alter table public.generated_outputs enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.print_jobs enable row level security;
alter table public.payments enable row level security;
alter table public.admin_notes enable row level security;

drop policy if exists "Public can read active templates" on public.ai_templates;
create policy "Public can read active templates"
on public.ai_templates
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can insert own generation sessions" on public.generation_sessions;
create policy "Users can insert own generation sessions"
on public.generation_sessions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can read own generation sessions" on public.generation_sessions;
create policy "Users can read own generation sessions"
on public.generation_sessions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can update own generation sessions" on public.generation_sessions;
create policy "Users can update own generation sessions"
on public.generation_sessions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can insert own uploaded images" on public.uploaded_images;
create policy "Users can insert own uploaded images"
on public.uploaded_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.generation_sessions
    where generation_sessions.id = uploaded_images.session_id
      and generation_sessions.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own uploaded images" on public.uploaded_images;
create policy "Users can read own uploaded images"
on public.uploaded_images
for select
to authenticated
using (
  exists (
    select 1
    from public.generation_sessions
    where generation_sessions.id = uploaded_images.session_id
      and generation_sessions.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own generated outputs" on public.generated_outputs;
create policy "Users can read own generated outputs"
on public.generated_outputs
for select
to authenticated
using (
  exists (
    select 1
    from public.generation_sessions
    where generation_sessions.id = generated_outputs.session_id
      and generation_sessions.user_id = auth.uid()
  )
);

drop policy if exists "Users can insert own confirmed orders" on public.orders;
create policy "Users can insert own confirmed orders"
on public.orders
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can read own confirmed orders" on public.orders;
create policy "Users can read own confirmed orders"
on public.orders
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read own order items" on public.order_items;
create policy "Users can read own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own print jobs" on public.print_jobs;
create policy "Users can read own print jobs"
on public.print_jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = print_jobs.order_id
      and orders.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = payments.order_id
      and orders.user_id = auth.uid()
  )
);

-- MVP note:
-- Anonymous/pre-auth preview sessions and admin writes are expected to happen
-- through server-side helpers using the service role key until auth policies
-- are fully hardened. The service role bypasses RLS and must never be exposed
-- client-side.
