# Supabase / Local Backend Integration Setup

## Current implementation sync

- Local mode is implemented and tested with runtime smoke scripts plus Playwright E2E.
- Supabase mode remains supported through existing helpers and schema/types.
- Local and Supabase are separate runtime modes; no sync/dual-write is planned.
- `/create`, `/create/template`, `/generate/[sessionId]`, `/results/[sessionId]`, `/checkout/[sessionId]`, and `/orders/[orderId]` are wired to the preview-first data flow.
- Checkout creates `orders`, `order_items`, `payments`, and `print_jobs` only after preview/product decision.
- Admin status mutations, admin notes, and template prompt editor are implemented.

Supabase remains supported. Local PostgreSQL + local uploads can be used as a fallback for faster MVP development/debugging.

## Required Environment Variables

Add these values to `.env.local`:

```env
DATABASE_MODE=supabase
STORAGE_MODE=supabase

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not put real secret values in `.env.example`.

Local setup note:

- Create `.env.local` manually at the project root if it does not exist.
- Copy the Supabase Project URL into `NEXT_PUBLIC_SUPABASE_URL`.
- Copy the Supabase Publishable key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Copy the Supabase Secret key into `SUPABASE_SERVICE_ROLE_KEY`.
- Restart the dev server after editing environment variables.

Security rule:

- `NEXT_PUBLIC_*` values can be used by browser-safe clients.
- `SUPABASE_SERVICE_ROLE_KEY` must only be used server-side.
- Do not import `lib/supabase/admin.ts` into client components.

## Local PostgreSQL Mode

Create the database manually in pgAdmin:

```text
ai_photo_studio_dev
```

Run SQL in this exact order:

```text
1. local-db/schema.sql
2. local-db/seed_templates.sql
```

Then set `.env.local`:

```env
DATABASE_MODE=local
STORAGE_MODE=local
LOCAL_DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_photo_studio_dev
LOCAL_UPLOAD_DIR=./uploads
NEXT_PUBLIC_LOCAL_UPLOAD_BASE_URL=/uploads
```

Local mode uses local PostgreSQL for sessions/templates/results/orders/admin data and local `uploads/` for files.
Supabase Auth may still be used for login/signup. Full custom local password auth is a later task if needed.

## Preview-first integration rule

Do not create confirmed orders before AI preview/results exist.

Supabase UI wiring must use:

```text
generation_sessions
→ uploaded_images
→ generated_outputs
→ checkout/product decision
→ orders
→ order_items / print_jobs / payments
```

## Run Database Schema

Open Supabase SQL Editor and run:

```text
supabase/schema.sql
```

If your Supabase project was created before customer auth fields were added, also run:

```text
supabase/auth_profiles_update.sql
```

This adds `first_name`, `last_name`, `phone`, `email`, and `updated_at` to existing `profiles`
without deleting data.

This creates:

- `profiles`
- `ai_templates`
- `generation_sessions`
- `uploaded_images`
- `generated_outputs`
- `orders`
- `order_items`
- `print_jobs`
- `payments`
- `admin_notes`

## Seed Templates

After schema creation, run:

```text
supabase/seed_templates.sql
```

The seed is safe to rerun because it uses:

```sql
on conflict (slug) do update
```

## Create Storage Buckets

Create these private buckets:

```text
source-images
generated-previews
final-outputs
```

See:

```text
supabase/storage_setup.md
```

## What Is Done Now

- Supabase JS package installed.
- Supabase SSR auth helper installed for cookie-backed signup/login.
- Browser, server, and admin Supabase client helpers added.
- Database schema SQL corrected to preview-first.
- `profiles` supports first name, last name, phone, email, role, and updated timestamps.
- Customer signup/login is wired with Supabase Auth.
- Phone login uses server-side profile lookup + email/password. SMS OTP is not implemented.
- Guest upload remains available; logged-in upload links `generation_sessions.user_id`.
- Template seed SQL added.
- Storage bucket setup documentation aligned with sessions/results/final outputs.
- Server-side session/storage/order helper foundations added.
- TypeScript database types aligned with preview-first schema.
- `/create` creates real `generation_sessions` and `uploaded_images`.
- `/create/template` can save the selected template to a real generation session.
- `/generate/[sessionId]` creates mock `generated_outputs` rows for real sessions.
- `/results/[sessionId]` reads real generated previews and keeps demo fallback.
- `/checkout/[sessionId]` converts a preview-ready session to a confirmed order only after product decision.
- `/orders/[orderId]` can read confirmed Supabase orders.
- Local PostgreSQL schema and seed SQL added under `local-db/`.
- `DATABASE_MODE` and `STORAGE_MODE` can switch core session/order/storage helpers between Supabase and local mode.
- Local uploads are served from `/uploads/...` and stored under `uploads/`.

## What Remains For Next Task

- Apply any new profile columns/indexes from `supabase/schema.sql` in Supabase SQL Editor if the project database was created before auth.
- Add admin review actions for face-sensitive generated outputs.
- Keep AI provider as mock until the live provider phase starts.
- Keep QPay/payment API for a later phase; manual payment records are used now.
