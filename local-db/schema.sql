create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text unique,
  full_name text,
  phone text unique,
  role text not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_templates (
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

create table if not exists generation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  template_id uuid references ai_templates(id) on delete set null,
  status text not null default 'draft',
  customer_note text,
  selected_output_id uuid,
  converted_order_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uploaded_images (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references generation_sessions(id) on delete cascade,
  file_url text not null,
  file_path text,
  image_type text not null default 'source',
  created_at timestamptz not null default now()
);

create table if not exists generated_outputs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references generation_sessions(id) on delete cascade,
  provider text not null default 'mock',
  model text,
  preview_url text,
  watermarked_url text,
  full_res_url text,
  is_selected boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  session_id uuid not null references generation_sessions(id),
  selected_output_id uuid references generated_outputs(id) on delete set null,
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

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  item_type text not null,
  title text,
  quantity int not null default 1,
  unit_price numeric not null default 0,
  total_price numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists print_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status text not null default 'print_ready',
  print_size text,
  paper_type text,
  delivery_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null default 'manual',
  amount numeric not null,
  currency text not null default 'MNT',
  status text not null default 'pending',
  invoice_id text,
  payment_reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists admin_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references generation_sessions(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  admin_id uuid references profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'generation_sessions_selected_output_id_fkey'
  ) then
    alter table generation_sessions
      add constraint generation_sessions_selected_output_id_fkey
      foreign key (selected_output_id) references generated_outputs(id) on delete set null
      deferrable initially deferred;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'generation_sessions_converted_order_id_fkey'
  ) then
    alter table generation_sessions
      add constraint generation_sessions_converted_order_id_fkey
      foreign key (converted_order_id) references orders(id) on delete set null
      deferrable initially deferred;
  end if;
end $$;

create index if not exists profiles_email_idx on profiles(email);
create index if not exists profiles_phone_idx on profiles(phone);
create index if not exists ai_templates_slug_idx on ai_templates(slug);
create index if not exists ai_templates_active_idx on ai_templates(is_active);
create index if not exists generation_sessions_user_id_idx on generation_sessions(user_id);
create index if not exists generation_sessions_template_id_idx on generation_sessions(template_id);
create index if not exists generation_sessions_status_idx on generation_sessions(status);
create index if not exists uploaded_images_session_id_idx on uploaded_images(session_id);
create index if not exists generated_outputs_session_id_idx on generated_outputs(session_id);
create index if not exists generated_outputs_selected_idx on generated_outputs(is_selected);
create index if not exists orders_user_id_idx on orders(user_id);
create index if not exists orders_session_id_idx on orders(session_id);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_payment_status_idx on orders(payment_status);
create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists print_jobs_order_id_idx on print_jobs(order_id);
create index if not exists print_jobs_status_idx on print_jobs(status);
create index if not exists payments_order_id_idx on payments(order_id);
create index if not exists payments_status_idx on payments(status);
create index if not exists admin_notes_order_id_idx on admin_notes(order_id);
create index if not exists admin_notes_session_id_idx on admin_notes(session_id);
