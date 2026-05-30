# AI Photo Studio

AI Photo Studio is a Mongolia-focused AI photo ecommerce web app.

Users can:
- Upload photos
- Create an account with email/password
- Login with email + password or phone + password
- Choose ready-made AI templates
- Generate AI-edited or AI-created photo previews
- View AI preview results before purchase
- Choose digital files, A4/A3 printed products, or both
- Confirm checkout/payment after choosing a result

## Current status

AI Photo Studio is currently a local-first, preview-first MVP.

Implemented and tested:

- Public preview-first flow is wired from `/create` through order detail.
- Real browser UI integration is verified from home CTA through upload, template selection, explicit preview generation, results, checkout, and order detail.
- Local PostgreSQL mode is supported for development/testing.
- Local upload storage is supported for development/testing.
- Mock AI provider is the default safe provider for local and E2E tests.
- Confirmed orders are created only after checkout/product decision.
- Admin dashboard, order status mutations, notes, print queue, and template prompt editing exist.
- Admin pages and admin write actions are protected by a server-side admin auth/role gate.
- Authorized admin Playwright E2E verifies login, protected admin UI actions, non-admin blocking, and public `/create` access in local mode.
- Local/dev signup reliability fix is implemented: local DB mode creates a confirmed Supabase Auth user server-side, then signs the user in without relying on public signup email delivery.
- `npm run setup:admin` creates or updates the local/dev default admin account.
- `npm run setup:production-admin` creates or updates a real Supabase admin account from server-side env variables.
- `npm run test:production-admin` verifies the configured production admin can log in and open read-only protected admin pages without touching local/dev E2E credentials.
- Local/dev E2E admin credentials are separated from production admin credentials; setup/test commands fail fast if the emails match.
- Visible customer/admin UI has been cleaned up to English.
- Playwright E2E covers the local preview-first flow.
- Real user-flow pages no longer silently fall back to `demo-session-001` or `demo-order-001`; missing real sessions/orders show clear recovery or not-found states.

Supported but not primary:

- Supabase database/storage code remains supported with `DATABASE_MODE=supabase` and `STORAGE_MODE=supabase`.
- Supabase Auth is still used for signup/login, including local database mode.

Planned or paused:

- QPay API integration is planned.
- Real production AI quality validation is still required.
- Gemini provider is paused.
- OpenAI image provider is later.
- Replicate provider has a validation guard; live usage requires an image-to-image model and account credit.

## Current MVP tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase database/storage supported
- Local PostgreSQL + local uploads supported for development/testing
- Mock AI provider for local/no-credit tests
- Replicate provider with model validation guard
- Current valid Replicate image model candidate: `stability-ai/stable-diffusion-img2img`
- OpenAI image API later
- Manual payment first
- QPay API later

## Local development first

The first version is developed locally.

Do not overbuild production systems immediately. Current local mode uses:
- Local Next.js app
- Local PostgreSQL
- Local uploads
- Mock AI provider
- Generation sessions before confirmed orders
- Manual admin order status
- Manual payment status

Do not document Supabase/local sync or dual-write as planned. The modes are separate runtime choices.

## Preview-first business flow

```text
Home
→ Upload photo
→ Choose template/style
→ Click generate AI preview
→ View results
→ Choose digital download or print product
→ Checkout
→ Confirmed order
→ Admin fulfillment
```

The early stage is a generation session, not a confirmed order.

## Auth MVP

- Signup collects first name, last name, phone, email, and password.
- Phone login uses a server-side profile lookup and Supabase email/password login.
- SMS OTP is not implemented yet.
- Guest upload remains available; logged-in uploads are linked to the user when possible.
- Local DB mode still uses Supabase Auth for login/signup unless a later task adds custom local auth.
- Admin access requires authenticated Supabase user plus `profiles.role` of `admin`, `owner`, or `super_admin`, or a server-only `ADMIN_EMAILS` fallback.
- Admin mutation endpoints fail closed with 401/403 when unauthorized.
- Local/dev default admin setup: run `npm run setup:admin`.
- Local/dev E2E admin email: `e2e-admin@uuree.mn` by default, or set `E2E_ADMIN_EMAIL`.
- Local/dev default admin password: `123456`.
- This password is local/dev only and must never be used for production admin accounts.
- Production admin setup command: `npm run setup:production-admin`.
- Production admin env variables: `PRODUCTION_ADMIN_EMAIL`, `PRODUCTION_ADMIN_PASSWORD`, and optional `PRODUCTION_ADMIN_ROLE` (`owner` by default).
- Production admin browser smoke command: `npm run test:production-admin`.
- `E2E_ADMIN_EMAIL` must differ from `PRODUCTION_ADMIN_EMAIL`; local/dev E2E setup fails before any user mutation when they match.
- The production admin browser smoke is read-only: it logs in and opens admin pages, but does not create/update users or reset passwords.
- Production passwords must be strong; do not use `123456` in production.
- Production admin accounts must be configured securely with strong credentials and the correct role.
- `SUPABASE_SERVICE_ROLE_KEY` is used only by server-side scripts/helpers and must never be exposed to client code.

## Local PostgreSQL Mode

Local mode is controlled by:

```env
DATABASE_MODE=local
STORAGE_MODE=local
LOCAL_DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_photo_studio_dev
LOCAL_UPLOAD_DIR=./uploads
NEXT_PUBLIC_LOCAL_UPLOAD_BASE_URL=/uploads
```

Create `ai_photo_studio_dev` manually in pgAdmin, then run SQL in this order:

```text
1. local-db/schema.sql
2. local-db/seed_templates.sql
```

Supabase remains supported with `DATABASE_MODE=supabase` and `STORAGE_MODE=supabase`.

## Project docs

Important project planning files:

```text
/doc/memory
  Project knowledge, business plan, tech stack, AI strategy, template system,
  branding guide, and roadmap phases

/doc/tasks
  Build order, Codex prompts, MVP checklist, Supabase setup, AI API setup
```

## MVP build command idea

```bash
npm install
npm run dev
```

## Verification commands

```bash
npm run lint
npm run build
npm run setup:admin
npm run setup:production-admin
npm run test:production-admin
npm run test:e2e
npm run test:e2e -- e2e/smoke.spec.ts --project=chromium
npx tsx scripts/local-db-smoke-test.ts
npx tsx scripts/local-storage-smoke-test.ts
npx tsx scripts/check-replicate-model.ts
```

Known cleanup debt:

- `npm run build` currently passes with a file tracing warning around `app/uploads/[...path]/route.ts` and dynamic auth-related logs.
- Playwright may log browser-extension-style hydration warnings in local runs.
- `npm run test:e2e` skips the production-admin smoke intentionally; run `npm run test:production-admin` separately with production admin env values.

## Build principle

Build a working MVP skeleton first. Then improve AI quality, payment, and print automation step by step.
