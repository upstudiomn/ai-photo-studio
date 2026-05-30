# Supabase Setup

## Current implementation sync

- Supabase remains supported for database/storage/auth.
- Local PostgreSQL + local uploads are currently the primary safe development and E2E mode.
- Do not plan Supabase/local sync or dual-write.
- Supabase Auth is still used for signup/login, including local database mode.
- Before production launch, verify Supabase schema, RLS policies, storage buckets, and service role server-only usage.

## MVP use

Supabase is used for:

- Auth
- Database
- Image storage
- Admin data

## Preview-first database direction

Use these core tables:

- profiles
- ai_templates
- generation_sessions
- uploaded_images
- generated_outputs
- orders
- order_items
- print_jobs
- payments
- admin_notes

The early stage is a generation session, not a confirmed order.

Payments are linked to confirmed orders only.

## Setup steps

1. Create Supabase project.
2. Copy project URL.
3. Copy anon key.
4. Copy service role key.
5. Add keys to `.env.local`.
6. Run `supabase/schema.sql`.
7. Run `supabase/seed_templates.sql`.
8. Create storage buckets.

## `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Storage buckets

Create:

- `source-images`
- `generated-previews`
- `final-outputs`

Bucket meaning:

- `source-images`: uploaded_images for generation sessions
- `generated-previews`: generated_outputs previews
- `final-outputs`: paid final files

Keep all private for MVP and use signed URLs later.

## Local development shortcut

If Supabase UI wiring is not ready yet:

- Use local mock data
- Keep current mock UI flow working
- Connect Supabase after preview-first route/data flow is aligned

## Admin role

Admin access is server-side only and should be configured through `profiles.role`:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

Allowed roles are `admin`, `owner`, and `super_admin`.

Optional local/dev fallback:

```env
ADMIN_EMAILS=admin@example.com,owner@example.com
```

Do not expose admin email allowlists or service role keys to client code.
