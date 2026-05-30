# AI Photo Studio Roadmap & Phases

## Overview

AI Photo Studio is developed in a ChatGPT + Codex loop.

Working method:

1. ChatGPT gives one focused Codex task prompt.
2. Codex implements the task.
3. Codex reports completed work, files changed, issues, errors, and next suggested step.
4. User sends the Codex report back to ChatGPT.
5. ChatGPT reviews the report and provides the next task prompt.

Important rules:

- One task should be focused and reviewable.
- Do not create confirmed orders before AI preview/results exist.
- Do not spend live AI credits during local/E2E tests.
- Do not remove the mock provider; it is required for no-credit verification.
- Do not auto-deliver face-sensitive AI outputs without admin review.

## Final business flow

```text
Home
→ Upload photo
→ Choose template/style
→ Generate AI preview
→ View results
→ Choose digital download or print product
→ Checkout
→ Confirmed order
→ Admin fulfillment
```

The early stage is a generation session, not a confirmed order.

## Phase 0 — Project docs / memory setup

Status: done

Goal:
Set up shared project context so ChatGPT and Codex can work from the same source files.

Done criteria:

- Core docs exist
- Memory files exist
- Task files exist
- ChatGPT and Codex can both read the same project context

## Phase 1 — Local MVP skeleton

Status: done

Goal:
Create the first local Next.js MVP skeleton with mock data.

Routes expected now:

- /
- /templates
- /templates/[slug]
- /upload/[templateId] (transitional)
- /orders/[id]
- /success
- /admin
- /admin/orders
- /admin/orders/[id]
- /admin/templates
- /admin/print-queue

Future preferred routes:

- /create
- /create/template
- /generate/[sessionId]
- /results/[sessionId]
- /checkout/[sessionId]
- /orders/[orderId]

## Phase 2 — Branding + UX/UI system

Status: done

Goal:
Lock Modern Sage Premium branding and Manrope before deeper flow work.

Current UI foundation:

- shadcn/ui-style primitives are the preferred shared component layer under `components/ui`.
- Radix UI powers accessible primitives through shadcn-style wrappers.
- `lucide-react` is the icon system.
- Tailwind CSS remains the styling base.
- Modern Sage Premium remains the brand system.
- Pages should migrate gradually to shared primitives without changing business flow.

## Phase 3 — Public user flow polish

Status: implemented and tested

Goal:
Make customer-facing pages premium, clear, trustworthy, and easy to use.

Current UI implementation notes:

- Key public pages `/`, `/create`, `/create/template`, `/templates`, `/templates/[slug]`, `/generate/[sessionId]`, `/results/[sessionId]`, `/checkout/[sessionId]`, `/orders/[orderId]`, `/auth/login`, `/auth/signup`, and `/account` exist.
- Public pages have shadcn-style polish and visible English UI copy.
- Shared public components now cover section headings, template cards, and product choice cards.
- Preview-first flow remains unchanged; confirmed orders still start only after checkout confirmation.
- Admin page redesign is intentionally outside this public UI migration task.

Required copy direction:

- Use professional global SaaS/ecommerce English in visible UI.
- Use preview/results language before checkout.
- Use order/checkout language only after user selects digital/print.

Do not mix Mongolian visible UI copy back in unless a localization task asks for it.

## Phase 4 — Admin dashboard polish

Status: done for SaaS-style read/admin review foundation; shadcn admin polish added

Goal:
Make admin workflow practical for local AI photo review, order fulfillment, and print handling.

Current implementation notes:

- `/admin` is a SaaS-style operations dashboard with real Supabase metrics where available.
- `/admin/sessions` shows pre-order generation sessions.
- `/admin/review` shows generated outputs for quality review.
- `/admin/orders` shows confirmed orders only.
- `/admin/orders/[id]` reads real confirmed order detail with uploaded images, outputs, payments, and print jobs.
- `/admin/print-queue` reads print jobs.
- `/admin/templates` reads template status overview.
- Admin tables, metric cards, status controls, order detail sections, print queue, template overview, and admin notes now use shadcn-style primitives.
- Admin status update actions and admin notes are preserved and still use the existing API routes.
- Admin template prompt editor is live on `/admin/templates` for safe existing `ai_templates` fields.
- Admin auth/role gate now protects `/admin/*` pages and admin mutation endpoints.
- Admin authorization uses authenticated Supabase user plus `profiles.role` or server-only `ADMIN_EMAILS`.
- Review queue checklist is read-only MVP UI; persisted approve/reject actions remain later.
- Template slug changes, template creation, and template deletion remain later tasks.

## Phase 4.5 — Preview-first flow refactor

Status: implemented and Playwright-tested

Goal:
Refactor mock UX/data flow so upload + template + AI preview happens before order/checkout.

Main tasks:

- Add or align /create route for upload-first flow
- Introduce generation session concept
- Move confirmed order creation to after results/checkout
- Update CTAs and customer-facing copy
- Keep /templates as browse/education page
- Keep /orders only for confirmed order tracking

Done criteria:

- User can upload photo first
- User can choose template/style
- User can see generated preview/mock results
- User chooses digital/print only after seeing result
- Confirmed order is created after product decision

## Phase 5 — Supabase integration

Status: live preview-first public flow wired; local PostgreSQL fallback added for development

Goal:
Replace mock data with real database and storage after Phase 4.5 flow is aligned.

Main tables:

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

Done criteria:

- User upload can be saved to storage under a generation session
- Template selection can be saved to a generation session
- Generated previews can be saved before checkout
- Confirmed order is created only after product decision
- Admin can fetch confirmed orders
- Mock data can still exist for fallback/demo

Current implementation notes:

- Supabase remains supported through `DATABASE_MODE=supabase` and `STORAGE_MODE=supabase`.
- Local PostgreSQL mode is available through `DATABASE_MODE=local`.
- Local file storage is available through `STORAGE_MODE=local`.
- Local fallback exists because Supabase setup/email rate limits can slow MVP debugging.
- Local mode is for data/session/order/storage development; full custom local auth is not implemented yet.
- Customer signup/login is wired through Supabase Auth.
- Local/dev signup reliability is fixed for local DB mode by creating a confirmed Supabase Auth user server-side and then signing in.
- Signup fields: first name, last name, phone, email, password.
- Login supports email + password and phone + password through server-side profile lookup.
- Guest upload remains allowed; logged-in uploads link `generation_sessions.user_id`.
- `/create` creates real `generation_sessions` and `uploaded_images`.
- `/create/template` saves template selection for real sessions.
- `/generate/[sessionId]` stores mock `generated_outputs` rows only after the user clicks `Generate preview`.
- `/results/[sessionId]` reads real generated outputs.
- `/checkout/[sessionId]` creates `orders`, `order_items`, `payments`, and `print_jobs` after product decision.
- `/orders/[orderId]` reads real confirmed order tracking.
- Admin status update actions now work (order, payment, print statuses)
- Admin notes now work (add/view)
- `npm run setup:admin` creates or updates the local/dev E2E admin `e2e-admin@uuree.mn`; password `123456` is local/dev only.
- `npm run setup:production-admin` creates or updates a real Supabase admin from production env variables.
- `npm run test:production-admin` verifies production admin login and read-only access to protected admin pages without touching local/dev E2E credentials.
- `npm run test:e2e` verifies the local browser UI path and skips production-admin smoke intentionally.
- `E2E_ADMIN_EMAIL` and `PRODUCTION_ADMIN_EMAIL` must differ; setup/test scripts fail fast before user mutation if they match.
- Harmful demo fallback links/data were removed from real public/admin flows; explicit demo fixture IDs remain only for direct demo routes/tests.

Local SQL run order:

1. `local-db/schema.sql`
2. `local-db/seed_templates.sql`

## Phase 6 — AI provider readiness

Status: implemented but not fully production-tested

Goal:
Test Replicate provider with real API call and uploaded image input.

What now works:
- Replicate provider implemented with safety guard
- Model capability guard blocks text-to-image-only models
- Model validation helper in `server/ai/replicate-models.ts`
- Safe schema check script `scripts/check-replicate-model.ts`
- Candidate model list maintained
- Clear error message if wrong model configured
- Mock fallback verified working
- Provider interface stable

What still uses mock:
- Local/E2E no-credit tests.
- Gemini paused (model/API limitation).
- OpenAI not connected.

Provider env settings:
```env
AI_PROVIDER=replicate  # live test (requires image-to-image model)
AI_PROVIDER=mock       # fallback (default)
```

Replicate details:
- Package: replicate (npm)
- Token: REPLICATE_API_TOKEN
- Model: REPLICATE_IMAGE_MODEL (REQUIRED - must support "image" input)

Model validation:
- `server/ai/replicate-models.ts` - validates model against blocklist and candidates
- `scripts/check-replicate-model.ts` - safe schema check without spending credits
- Blocked models: flux-schnell, flux-dev, sd3-medium
- Candidate models: stability-ai/stable-diffusion-img2img, etc.

Safety guard:
- Text-to-image-only models blocked: flux-schnell, flux-dev, sd3-medium
- Clear error message if wrong model configured
- Does not fake image-to-image success

Current model guidance:
- `black-forest-labs/flux-schnell` is deprecated/blocked for uploaded photo editing.
- `stability-ai/stable-diffusion-img2img` is the current valid image-input candidate.
- Live use still requires Replicate account credit and quality validation.

Required for next live test:
1. Replicate credit: https://replicate.com/account/billing
2. Image-to-image model with "image" input parameter
3. Example: stability-ai/stable-diffusion-img2img
4. Run `npx tsx scripts/check-replicate-model.ts` to validate

Gemini status: PAUSED - model/API limitation.

Next step for live AI: configure an image-input model, run safe validation, then run a controlled manual smoke test.

## Phase 7 — Print fulfillment workflow

Status: implemented baseline; automation planned

Goal:
Create print jobs only after a print product is purchased. The baseline record creation and print queue exist; vendor automation and print-ready generation remain planned.

## Phase 8 — Payment / QPay

Status: implemented baseline; QPay planned

Goal:
Manual pending payment records exist after checkout. QPay automation remains planned.

## Phase 9 — Launch preparation

Status: upcoming

Goal:
Prepare privacy, terms, pricing, FAQ, delivery info, QA, and launch assets.

## Phase 10 — Replicate / Premium AI upgrade

Status: later

Goal:
Add advanced AI providers after OpenAI MVP remains stable.

## Current status summary

- Phase 0: done
- Phase 1: done
- Phase 2: done
- Phase 3: done and visible UI English cleanup complete
- Phase 4: done (admin status update actions and admin auth/role gate)
- Phase 4.5: done and E2E verified
- Phase 5: done, with Supabase supported and local PostgreSQL/uploads primary for E2E
- Phase 6: implemented but not production AI-tested
- Phase 7: baseline implemented; automation planned
- Phase 8: manual baseline implemented; QPay planned
- Phase 9-10: upcoming/later

## Next task order

1. Verify production admin setup/browser smoke in the final production environment.
2. Clean build warnings.
3. Validate live Replicate image-to-image quality without changing preview-first flow.
4. Add QPay automation.
5. Prepare launch/legal content.
