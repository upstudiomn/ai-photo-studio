# TODO

## Phase 0 — Project setup
- [x] Create Next.js project
- [x] Add TypeScript
- [x] Add Tailwind CSS
- [x] Add shadcn/ui foundation
- [x] Create folder structure
- [x] Add `/doc/memory`
- [x] Add `/doc/tasks`
- [x] Create `.env.example`
- [x] Create `.env.local` locally

## Phase 1 — Static MVP pages
- [x] Home page
- [x] Template gallery page shadcn polish
- [x] Template detail page shadcn polish
- [x] Upload page UI shadcn polish
- [x] Real browser UI create/upload flow verified end-to-end
- [x] Order status page UI
- [x] Results page product selection shadcn polish
- [x] Checkout page UI shadcn polish
- [x] Admin dashboard UI
- [x] Admin order detail UI

## Phase 2 — Data model
- [ ] Create/verify production Supabase project
- [x] Add database tables
- [x] Add template seed data
- [x] Add local PostgreSQL fallback schema
- [x] Add local template seed SQL
- [x] Add backend/storage mode env placeholders
- [x] Add local file upload storage helper
- [x] Add generation session creation logic
- [x] Add uploaded_images storage logic
- [x] Add generated_outputs logic
- [x] Add confirmed order creation after checkout/product decision
- [x] Add admin confirmed order list logic

## Auth foundation
- [x] Add customer signup with Supabase Auth
- [x] Store first name, last name, phone, email in profiles
- [x] Add email + password login
- [x] Add phone + password login without SMS OTP
- [x] Fix local/dev signup reliability around Supabase email validation/rate limits
- [x] Add logout route
- [x] Link logged-in upload sessions to user_id
- [x] Replace separate header login/signup buttons with shadcn account dropdown
- [x] Standardize first shared UI primitives with Radix/shadcn/lucide foundation
- [ ] Run `supabase/auth_profiles_update.sql` in Supabase SQL Editor for existing project DB
- [ ] Add richer account/order history page

## Phase 4 — Admin dashboard
- [x] Add SaaS-style admin shell/sidebar
- [x] Polish admin shell/sidebar with shadcn-style active states
- [x] Add Supabase-backed admin overview metrics
- [x] Add generation sessions admin page
- [x] Add review queue admin page
- [x] Add confirmed orders admin table
- [x] Add confirmed order detail page
- [x] Add print queue admin page
- [x] Add template status overview
- [x] Add real admin status update actions
- [x] Polish admin tables/status controls/notes with shadcn primitives
- [x] Add template prompt editor
- [x] Add seeded local/dev admin E2E account setup and authorized admin browser test
- [x] Add idempotent local/dev default admin setup command
- [x] Add one-command production admin setup script
- [x] Add production admin browser smoke test
- [x] Separate local/dev E2E admin credentials from production admin credentials with a fail-fast guard
- [x] Remove harmful demo-session/demo-order fallback from real user/admin flows

## Phase 3 — Mock AI flow
- [x] Create mock AI provider
- [x] Generate preview image records for generation sessions
- [x] Show generation session processing status
- [x] Show preview results
- [x] Allow user to select output
- [x] Add preview/watermark placeholder fields
- [x] Add Playwright E2E preview-first smoke test
- [x] Verify real UI click path from home CTA to confirmed order

## Phase 4 — Real AI flow / provider readiness
- [x] Add Replicate provider validation guard
- [x] Add safe model validation script
- [x] Preserve mock provider for no-credit local/E2E tests
- [ ] Add OpenAI API key later
- [ ] Create OpenAI image provider later
- [ ] Validate production AI quality with real image-to-image model
- [ ] Save generated full-res outputs for delivery

## Phase 5 — Payment and print
- [x] Manual payment status first
- [x] Add order_items for digital/print choices
- [x] Add print_jobs only for print products
- [x] Add delivery address form
- [x] Add admin print queue
- [ ] Add QPay API later

## Phase 6 — Launch preparation
- [ ] Add privacy page
- [ ] Add terms page
- [x] Add consent checkbox
- [x] Add before/after examples
- [ ] Test 20 sample orders
- [ ] Prepare social media launch content

## Current debt / risks
- [x] Add production admin auth/role gate before launch
- [x] Add local/dev default admin setup for `e2e-admin@uuree.mn`
- [ ] Run `npm run setup:production-admin` and `npm run test:production-admin` in the final production environment before launch
- [x] Clean lint warnings in `scripts/gemini-smoke-test.ts`
- [ ] Review local upload serving/file tracing warning
- [x] Keep production-admin smoke separate from full local/dev E2E with credential isolation
- [ ] Add pagination for admin lists before high-volume use
- [ ] Add cleanup policy for local/generated uploads
