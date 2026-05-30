# Admin Dashboard

## Purpose

Admin dashboard controls AI preview review, confirmed order fulfillment, printing, and delivery.

## Current implementation status

Implemented:

- `/admin` overview dashboard.
- `/admin/sessions` pre-order generation sessions.
- `/admin/review` generated output review workspace.
- `/admin/orders` confirmed order list.
- `/admin/orders/[id]` confirmed order detail.
- `/admin/print-queue` print job list.
- `/admin/templates` template status and prompt editor.
- Admin order/payment/print status mutations.
- Admin notes save and persist.
- Admin auth/role gate protects all `/admin/*` pages.
- Admin write actions require server-side admin authorization.
- Authorized admin browser E2E is implemented for local/dev mode with seeded test auth/profile users.
- Full local E2E verifies admin order/payment/print status updates, admin note persistence, and template prompt edit/revert through the visible UI.
- `npm run setup:admin` creates or updates the local/dev default admin account.
- `npm run setup:production-admin` creates or updates a real Supabase admin account from server-side production env variables.
- `npm run test:production-admin` verifies production admin login and read-only access to `/admin`, `/admin/templates`, and `/admin/orders` without resetting local/dev E2E credentials.
- Local/dev E2E admin credentials are isolated from production admin credentials; setup/test scripts fail fast before any user mutation if `E2E_ADMIN_EMAIL` equals `PRODUCTION_ADMIN_EMAIL`.

Implemented but not fully production-hardened:

- Production admin accounts can be configured with `npm run setup:production-admin`, which sets `profiles.role` to `admin`, `owner`, or `super_admin`.
- The production setup command reads `PRODUCTION_ADMIN_EMAIL`, `PRODUCTION_ADMIN_PASSWORD`, and optional `PRODUCTION_ADMIN_ROLE` (`owner` by default).
- Production passwords must be strong; do not use `123456` in production.
- Manual production admin configuration through `profiles.role` or server-only `ADMIN_EMAILS` remains supported if needed.
- The default `e2e-admin@uuree.mn` / `123456` account is local/dev E2E only and must not be used for production.
- Review queue approval/rejection is still MVP/read-oriented unless later wired to persisted actions.

AI Photo Studio is preview-first, so admin must keep two concepts separate:

- `generation_sessions`: pre-order AI preview work
- `orders`: confirmed orders created only after checkout/product decision

## Current admin direction

Admin UI now follows a Modern Sage Premium SaaS operations style:

- left sidebar
- top operations header
- metric cards
- shadcn-style data tables
- status badges
- review queue
- print queue
- image preview panels
- Radix/shadcn Select controls for status updates
- shadcn Textarea/Button/Card primitives for admin notes

It should feel practical and fast, not like a public landing page.

Current UI implementation notes:

- `/admin`, `/admin/sessions`, `/admin/review`, `/admin/orders`, `/admin/orders/[id]`, `/admin/print-queue`, and `/admin/templates` are polished with shadcn-style cards, badges, table primitives, buttons, and form controls.
- `/admin/*` pages redirect unauthenticated users to `/auth/login` and show a forbidden page for signed-in non-admin users.
- Status update behavior is preserved through the existing `/api/admin/update-status` route.
- Admin notes behavior is preserved through the existing `/api/admin/add-note` route.
- `/admin/templates` now includes a focused prompt editor dialog for existing safe `ai_templates` fields.
- Playwright authorized admin E2E logs in with `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`, updates order/payment/print status, adds a persistent admin note, edits and reverts a template prompt marker, verifies a customer role is blocked, and confirms `/create` remains public.
- The authorized admin E2E setup creates/updates only the E2E admin account and refuses to run when it matches `PRODUCTION_ADMIN_EMAIL`.
- Review queue is still a read-only MVP workspace; checklist visuals do not fake saved approvals.
- Admin UI keeps `generation_sessions` and confirmed `orders` separate in copy and routes.

## Admin routes

```text
/admin
/admin/sessions
/admin/review
/admin/orders
/admin/orders/[id]
/admin/templates
/admin/print-queue
```

## What uses Supabase real data

- `/admin`: metrics, recent sessions, recent confirmed orders
- `/admin/sessions`: `generation_sessions` with template/upload/output counts
- `/admin/review`: `generated_outputs` with linked sessions/templates
- `/admin/orders`: confirmed `orders` only
- `/admin/orders/[id]`: confirmed order detail, uploaded images, generated outputs, payments, print jobs
- `/admin/templates`: `ai_templates`
- `/admin/print-queue`: `print_jobs`

## Fallback behavior

Admin real workflow pages should not silently display demo orders when database reads fail or return empty.

Current behavior:

- `/admin` shows empty-state counts/lists instead of mock orders when real data is unavailable.
- `/admin/orders` shows an empty state instead of mock orders when no confirmed orders exist.
- `/admin/print-queue` shows an empty state instead of mock print jobs when no print jobs exist.
- `/admin/orders/demo-order-001` remains an explicit demo fixture route only.

## Admin order list columns

- Order ID short
- Customer
- Product type
- Payment status
- Order status
- Print status
- Total price
- Created date
- Action

## Admin session list columns

- Session ID short
- Status
- Template
- Uploaded image count
- Generated output count
- Created date
- Action

## Admin order detail

Shows:

- Order summary
- Customer info
- Uploaded source images
- Selected/generated previews
- Purchased items
- Payment info
- Print job info
- Delivery info
- Quality checklist
- Admin notes (add/view)
- Status controls (order, payment, print)

## Admin actions

Status update actions now work:

- Order status update: pending_payment → paid → preparing_final → print_ready → printing → packed → out_for_delivery → delivered / cancelled
- Payment status update: unpaid → pending → paid → failed → refunded
- Print job status update: print_ready → printing → packed → out_for_delivery → delivered / cancelled
- Admin notes: add/view notes linked to orders

API routes:
- `/api/admin/update-status` — status updates
- `/api/admin/add-note` — admin notes

Both API routes fail closed with 401/403 unless `server/admin-auth.ts` confirms admin access.

Server functions in `server/admin.ts`:
- `updateAdminOrderStatus`
- `updateAdminPaymentStatus`
- `updateAdminPrintJobStatus`
- `addAdminOrderNote`
- `listAdminOrderNotes`

## Review queue

Purpose:

- AI output quality review
- face-sensitive template review
- preview output inspection

Quality checklist:

- Face identity preserved?
- Eyes, teeth, hands normal?
- No unwanted text/logo?
- Skin tone natural?
- Background realistic?
- Print resolution OK?
- Customer request followed?

## Template management

Current template admin page supports:

- Template list overview
- Prompt preview
- Safe edit dialog for title, description, prompt, negative prompt, and active status
- Read-only slug
- Mode-aware saving to local PostgreSQL or Supabase

Template prompt saves are protected by the same server-side admin authorization helper.

## Admin authorization

Admin authorization strategy:

- Requires an authenticated Supabase user.
- Uses `profiles.role` in both local DB mode and Supabase mode.
- Allowed roles: `admin`, `owner`, `super_admin`.
- Optional fallback: server-only `ADMIN_EMAILS` comma-separated allowlist.
- Local/dev E2E seed setup creates or updates Supabase Auth test users and upserts matching local/Supabase `profiles` roles. Production credentials must not be used for those env values.
- Local/dev default setup command: `npm run setup:admin`.
- Default local/dev E2E admin: `e2e-admin@uuree.mn`.
- Default local/dev password: `123456`, not production-safe.
- `E2E_ADMIN_EMAIL` must differ from `PRODUCTION_ADMIN_EMAIL`; matching values throw a clear error before Supabase Auth or profile mutation.
- The setup script is idempotent, uses the service role only in a server-side Node script, upserts Supabase/local profiles, and preserves existing `owner` or `super_admin` profile roles.
- Production setup command: `npm run setup:production-admin`.
- Production browser smoke command: `npm run test:production-admin`.
- Required production env: `PRODUCTION_ADMIN_EMAIL` and `PRODUCTION_ADMIN_PASSWORD`.
- Optional production env: `PRODUCTION_ADMIN_ROLE`; default is `owner`; allowed roles are `admin`, `owner`, and `super_admin`.
- The production setup script rejects weak passwords, creates/updates Supabase Auth, confirms email when supported, upserts `profiles.role`, and uses the service role only server-side.
- The production browser smoke test is read-only and does not create/update users, reset passwords, or perform admin mutations.
- Fails closed when the user is missing, profile role is not admin, and email is not allowlisted.
- Service role key remains server-only and is never used in client components.

## Admin review required for

- Family merge
- Couple portrait
- Kids portrait
- Memorial photo
- Premium portrait
- Any output involving multiple people
