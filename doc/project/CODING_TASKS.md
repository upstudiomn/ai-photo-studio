# Coding Tasks for Local MVP

## Goal

Build a local-first MVP using preview-first flow.

Do not create confirmed orders before AI preview/results exist.

## Current implementation sync

Status as of 2026-05-30:

- Public preview-first flow is implemented and Playwright-tested in local mode.
- Local PostgreSQL and local uploads are supported for development/testing.
- Supabase database/storage code is preserved and supported, but local mode is the primary test path.
- Do not plan Supabase/local sync or dual-write unless Master asks later.
- Mock AI provider is required for no-credit tests.
- Replicate provider has a model guard; `stability-ai/stable-diffusion-img2img` is the current valid image model candidate.
- Visible customer/admin UI copy is English.
- Admin status updates, admin notes, print queue, template prompt editor, and admin auth/role gate are implemented.
- Production admin setup and read-only browser smoke commands are implemented; final production environment verification remains a launch step.
- Local/dev E2E admin credentials are isolated from production admin credentials; E2E setup fails fast before mutation if emails match.
- Real frontend-to-backend browser flow is verified from home CTA through upload, template selection, explicit preview generation, results, checkout, and confirmed order.
- Real public/admin flows no longer silently use demo-session/demo-order fallback data.

## Task order and status

### Task 1 — Initialize app

Status: implemented and tested

- Next.js App Router
- TypeScript
- Tailwind
- shadcn/ui
- Basic layout

### Task 2 — Route structure

Status: implemented and tested

Current primary routes:

```text
/
/create
/create/template
/generate/[sessionId]
/results/[sessionId]
/checkout/[sessionId]
/orders/[orderId]
/templates
/templates/[slug]
/admin
/admin/orders
/admin/orders/[id]
/admin/templates
/admin/print-queue
```

Transitional/deprecated routes can keep working until later cleanup:

```text
/upload/[templateId]
```

### Task 3 — Create core components

Status: implemented but still open for incremental polish

- Header
- Footer
- Button/CTA
- TemplateCard
- UploadDropzone
- OrderStatusBadge
- PreviewGrid
- AdminStatusControls
- PrintOptionCard

### Task 4 — Add local mock data

Status: implemented and partly superseded by local DB/storage mode

- Templates
- Generation sessions
- Uploaded images
- Generated outputs
- Confirmed orders
- Order items
- Print jobs
- Print options

### Task 5 — Build public flow

Status: implemented and Playwright-tested in local mode

```text
Home
→ upload photo
→ choose template/style
→ generate AI preview
→ results
→ choose digital/print/both
→ checkout
→ confirmed order
```

### Task 6 — Build admin flow

Status: implemented; production admin account configuration/verification remains before launch

- Admin confirmed order list
- Admin confirmed order detail
- Source images through generation session context
- Generated outputs
- Status update UI
- Print queue UI

### Task 7 — Add Supabase integration

Status: implemented and preserved; local mode is primary for current E2E

- Client
- Server client
- Database types
- Generation session helper
- Session image upload helper
- Generated output helper
- Confirmed order helper

### Task 8 — Add mock AI provider

Status: implemented and required for no-credit E2E

- provider interface
- mock generated output
- fake delay/status
- session status changes to preview_ready

### Task 9 — Add real AI provider readiness

- Replicate provider and validation guard
- Safe Replicate model check script
- OpenAI provider later
- environment variable config

Status: implemented but not fully production-tested

### Task 10 — Local test

Status: implemented through Playwright E2E and smoke scripts

- Upload test image
- Create generation session
- Choose template/style
- See preview result
- Choose digital/print/both
- Confirm order after result decision
- See admin confirmed order
- Update status

### Task 11 — Admin auth/role gate

- Protect `/admin/*` pages
- Protect admin mutation endpoints
- Use `profiles.role` or server-only `ADMIN_EMAILS`
- Keep all preview-first/order/payment behavior unchanged

Status: implemented

### Task 12 — Production admin setup and smoke

- Create/update a real Supabase admin with `npm run setup:production-admin`
- Verify login and read-only admin access with `npm run test:production-admin`
- Keep local/dev E2E admin credentials separate
- Do not reset production passwords from E2E tests

Status: implemented; credential separation guard added; final production environment verification remains before launch

### Task 13 — Real UI integration audit

- Verify public create/template/generate/results/checkout/order through browser UI
- Verify signup and admin auth/admin mutation UI through browser UI
- Remove harmful demo fallback from real user/admin flows
- Keep preview-first order timing unchanged

Status: implemented and tested in local mode
