# MVP Checklist

## Current implementation sync

Implemented and tested:

- Local preview-first browser E2E.
- Real browser UI integration from home CTA through confirmed order.
- Authorized admin browser E2E with seeded local/dev test admin.
- Local/dev signup smoke verified after Supabase Auth email validation/rate-limit fix.
- Local/dev default admin setup command verified.
- Production admin setup command implemented.
- Production admin browser smoke test implemented.
- Production admin and local/dev E2E admin credentials separated with fail-fast guard.
- Local DB smoke.
- Local storage smoke.
- Lint/build pass with documented warnings.
- Public flow, checkout/order creation timing, and key admin operations.
- Harmful demo-session/demo-order fallback removed from real user/admin flows.

Implemented but not fully production-tested:

- Supabase runtime mode.
- Production admin account login in the final production environment.
- Live Replicate output quality.
- Review approval/rejection persistence.

Risk/debt:

- Run and verify production admin setup/browser smoke in the final production environment.
- Build upload route file tracing warning.

## Local app

- [ ] `npm run dev` works
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] No missing core routes
- [ ] Mobile responsive layout
- [ ] Clean navigation
- [ ] Local PostgreSQL mode can run after `local-db/schema.sql` and `local-db/seed_templates.sql`
- [ ] Local uploads are saved under `uploads/` and not committed to git

## Preview-first public flow

- [ ] Home page has clear CTA to upload/create
- [ ] User can upload photo before confirmed order exists
- [ ] User can choose template/style
- [ ] User can start AI preview generation
- [x] AI preview generation is triggered by a visible browser UI action, not page load
- [ ] User can view generated preview results
- [ ] User can choose digital download, A4/A3 print, or both after seeing results
- [ ] Checkout confirms product/payment decision
- [ ] Confirmed order is created only after checkout/product decision
- [ ] `/orders/[orderId]` is used for confirmed order tracking

## Template system

- [ ] At least 5 MVP templates
- [ ] Template prompt exists
- [ ] Template category exists
- [ ] Required image count exists
- [ ] Admin review flag exists
- [ ] Template detail CTA says “Start with this template”

## Generation sessions

- [ ] `generation_sessions` concept exists
- [ ] Uploaded image is linked to a generation session
- [ ] Logged-in upload links `generation_sessions.user_id`
- [ ] Local mode allows guest generation sessions without custom local auth
- [ ] Customer note is linked to a generation session
- [ ] Template selection is linked to a generation session
- [ ] Session status changes from uploaded/template_selected to generating to preview_ready

## Auth

- [x] Customer signup page
- [x] Signup stores first name, last name, phone, email in `profiles`
- [x] Local/dev signup works without relying on public Supabase email delivery
- [x] Email + password login
- [x] Phone + password login through server-side profile lookup
- [x] Logout route
- [x] Guest upload remains allowed
- [ ] Account/order history page beyond basic profile view

## AI flow

- [ ] Mock AI provider exists
- [ ] Preview output exists
- [ ] Generated output is linked to generation session
- [ ] Preview output can be selected for purchase
- [ ] Provider interface supports OpenAI later

## Confirmed orders

- [ ] Order is created after result/product decision
- [ ] Order items record digital_file/a4_print/a3_print/digital_plus_print
- [ ] Payment status is linked to confirmed order
- [ ] Print job is created only for print products

## Admin

- [x] Admin order list for confirmed orders
- [x] Admin order detail
- [x] Source images visible through session/order context
- [x] Generated outputs visible
- [x] Status update controls
- [x] Print queue page
- [x] Generation sessions page
- [x] Review queue page
- [x] Template status overview
- [x] Admin pages protected by server-side admin auth/role gate
- [x] Admin mutation endpoints protected by server-side admin auth/role gate
- [x] Authorized admin E2E verifies login, order/payment/print status mutation, admin notes, template prompt edit, non-admin blocking, and public `/create`
- [x] Local/dev default admin setup command creates/updates `e2e-admin@uuree.mn`
- [x] Production admin setup command creates/updates a Supabase admin from server-side env variables
- [x] Production admin browser smoke verifies login and read-only admin pages when env is present
- [x] Local/dev E2E setup fails fast before mutation if `E2E_ADMIN_EMAIL` equals `PRODUCTION_ADMIN_EMAIL`
- [ ] Production admin setup and browser smoke verified in the final production environment
- [x] Admin UI actions verified through browser E2E

## Safety

- [ ] Consent checkbox
- [ ] Privacy text
- [ ] Watermark preview plan
- [ ] Admin review for face-sensitive templates
- [x] `SUPABASE_SERVICE_ROLE_KEY` stays server-side only
- [x] Local PostgreSQL credentials stay server-side only
- [x] Production admin setup rejects weak passwords such as `123456`
- [x] E2E admin setup never uses production admin credentials when the credential guard passes
- [x] Real flows do not silently show demo-session/demo-order data when a real session/order is missing

## Launch readiness

- [x] Before/after sample section
- [ ] Pricing visible after preview/result decision
- [ ] Contact/phone visible
- [ ] Delivery info visible
