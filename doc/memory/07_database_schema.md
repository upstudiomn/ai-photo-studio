# Database Schema

## Direction

The database must support preview-first flow.

The early stage is a `generation_sessions` record, not a confirmed order.

Confirmed `orders` are created only after the user sees AI preview/results and chooses digital download, print, or both during checkout.

## Backend modes

Supabase remains supported.

Local PostgreSQL mode is also available for faster MVP development/debugging when Supabase setup or email rate limits slow work.

Current status:

- Local schema and seed SQL are implemented and runtime-smoke tested.
- Playwright E2E verifies local `generation_sessions`, `uploaded_images`, `generated_outputs`, `orders`, `order_items`, `payments`, and `print_jobs`.
- Supabase schema/types are preserved and supported, but local mode is the primary current test path.
- Do not document Supabase/local sync or dual-write as planned.
- `generation_sessions.user_id` is nullable to support guest preview sessions.

Mode env:

```env
DATABASE_MODE=supabase
STORAGE_MODE=supabase

DATABASE_MODE=local
STORAGE_MODE=local
LOCAL_DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_photo_studio_dev
LOCAL_UPLOAD_DIR=./uploads
NEXT_PUBLIC_LOCAL_UPLOAD_BASE_URL=/uploads
```

Local setup:

1. Create database manually in pgAdmin: `ai_photo_studio_dev`
2. Run `local-db/schema.sql`
3. Run `local-db/seed_templates.sql`

Local schema mirrors the preview-first model but does not reference Supabase `auth.users`.
`profiles.id` is a local `uuid primary key`, and `generation_sessions.user_id` is nullable.
Local auth is not fully custom yet; Supabase Auth may still be used while local DB handles sessions/orders/storage.

## Tables

### profiles

```sql
id uuid primary key references auth.users(id),
first_name text,
last_name text,
email text,
full_name text,
phone text unique,
role text default 'customer',
created_at timestamptz default now(),
updated_at timestamptz default now()
```

Auth note:

- Customer signup stores first name, last name, phone, email, and role in `profiles`.
- Phone login uses server-side profile lookup to find the related email, then Supabase email/password login.
- SMS OTP is not part of the current auth MVP.
- In local PostgreSQL mode, `profiles.id` is a standalone uuid primary key and does not reference `auth.users`.

### ai_templates

```sql
id uuid primary key default gen_random_uuid(),
slug text unique not null,
title_mn text not null,
title_en text,
category text,
description_mn text,
preview_image_url text,
required_images_min int default 1,
required_images_max int default 1,
prompt text not null,
negative_prompt text,
default_aspect_ratio text default '1:1',
output_type text default 'both',
requires_admin_review boolean default false,
is_active boolean default true,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

### generation_sessions

Pre-purchase AI creation session.

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid references auth.users(id),
template_id uuid references ai_templates(id),
status text default 'draft',
customer_note text,
selected_output_id uuid,
converted_order_id uuid,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

Statuses:

- draft
- uploaded
- template_selected
- generating
- preview_ready
- failed
- converted_to_order

### uploaded_images

Images uploaded for a generation session.

```sql
id uuid primary key default gen_random_uuid(),
session_id uuid references generation_sessions(id) on delete cascade,
file_url text not null,
file_path text,
image_type text default 'source',
created_at timestamptz default now()
```

### generated_outputs

AI preview images created for a generation session.

```sql
id uuid primary key default gen_random_uuid(),
session_id uuid references generation_sessions(id) on delete cascade,
provider text default 'mock',
model text,
preview_url text,
watermarked_url text,
full_res_url text,
is_selected boolean default false,
created_at timestamptz default now()
```

### orders

Created only after results and checkout/product decision.

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid references auth.users(id),
session_id uuid references generation_sessions(id),
selected_output_id uuid references generated_outputs(id),
status text default 'pending_payment',
payment_status text default 'unpaid',
customer_name text,
customer_phone text,
customer_email text,
delivery_address text,
total_price numeric default 0,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

### order_items

Purchased items in a confirmed order.

```sql
id uuid primary key default gen_random_uuid(),
order_id uuid references orders(id) on delete cascade,
item_type text not null,
title text,
quantity int default 1,
unit_price numeric default 0,
total_price numeric default 0,
created_at timestamptz default now()
```

Allowed item types:

- digital_file
- a4_print
- a3_print
- digital_plus_print

### print_jobs

Created only when a print product is purchased.

```sql
id uuid primary key default gen_random_uuid(),
order_id uuid references orders(id) on delete cascade,
status text default 'print_ready',
print_size text,
paper_type text,
delivery_address text,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

### payments

Linked to confirmed orders, not early generation sessions.

```sql
id uuid primary key default gen_random_uuid(),
order_id uuid references orders(id) on delete cascade,
provider text default 'manual',
amount numeric not null,
currency text default 'MNT',
status text default 'pending',
invoice_id text,
payment_reference text,
created_at timestamptz default now(),
paid_at timestamptz
```

### admin_notes

Can link to either generation session or confirmed order.

```sql
id uuid primary key default gen_random_uuid(),
session_id uuid references generation_sessions(id) on delete cascade,
order_id uuid references orders(id) on delete cascade,
admin_id uuid references auth.users(id),
note text not null,
created_at timestamptz default now()
```

## Indexes

- generation_sessions(user_id)
- generation_sessions(status)
- uploaded_images(session_id)
- generated_outputs(session_id)
- orders(session_id)
- orders(status)
- orders(payment_status)
- order_items(order_id)
- print_jobs(order_id)
- payments(order_id)

## MVP RLS rule

For MVP, server-side service role helpers may create sessions, uploads, generated outputs, confirmed orders, print jobs, and payments until auth policies are fully hardened.

Service role key must stay server-side only.
Local PostgreSQL credentials must also stay server-side only.
