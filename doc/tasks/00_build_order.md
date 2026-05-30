# Build Order

## Current implementation sync

Status as of 2026-05-30:

- Preview-first local MVP is implemented and Playwright-tested.
- Real browser UI path is verified from home CTA through upload/template/generate/results/checkout/order.
- Local PostgreSQL and local uploads are the primary safe dev/E2E mode.
- Supabase remains supported but is not the primary current test mode.
- No Supabase/local sync or dual-write is planned.
- Visible UI copy is English.
- Mock AI provider is required for no-credit local/E2E tests.
- Admin status updates, notes, print queue, and template prompt editor are implemented.
- Admin pages and admin mutations are protected by a server-side admin auth/role gate.
- Production admin credentials and local/dev E2E admin credentials are separated by a fail-fast guard.
- Harmful demo fallback is removed from real public/admin flows.

## Purpose

This file tells Codex the local MVP build order.

## Preview-first rule

AI Photo Studio must not create a confirmed order before AI preview/results exist.

Correct flow:

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

## Step 1 — Read docs

Read:

- AGENTS.md
- /doc/tasks/06_codex_prompt_template.md
- /doc/memory/*.md
- /doc/tasks/*.md
- /doc/project/README.md
- /doc/project/TODO.md
- /doc/project/PROMPTS.md
- /doc/project/TEMPLATES.md
- /doc/project/CODING_TASKS.md
- README.md only as repo entrypoint

## Step 2 — Maintain static shell

Keep current pages working while route flow is refactored:

- /
- /templates
- /templates/[slug]
- /upload/[templateId] (transitional)
- /orders/[id]
- /success
- /admin

## Step 3 — Refactor to preview-first routes

Preferred routes:

- /create
- /create/template
- /generate/[sessionId]
- /results/[sessionId]
- /checkout/[sessionId]
- /orders/[orderId]

## Step 4 — Add preview-first mock data

Create local mock data for:

- templates
- generation sessions
- uploaded images
- generated outputs
- confirmed orders
- order items
- print jobs
- payments

## Step 5 — Build complete preview-first UI flow

The user should be able to:

- upload photo first
- choose template/style
- generate mock AI preview
- view results
- choose digital/print/both
- checkout
- create confirmed order after product decision
- track confirmed order

## Step 6 — Add Supabase after flow aligns

Add:

- preview-first database schema
- Supabase client helpers
- session upload helper
- generated output helper
- confirmed order helper
- admin order fetch

## Step 7 — Add mock AI provider

Use mock provider first:

- mark session generating
- create generated outputs
- mark session preview_ready

## Step 8 — Add real AI provider readiness

Only after UI + database flow works:

- Keep mock provider
- Use Replicate only with an image-to-image model that passes the validation guard
- Add OpenAI provider later if needed
- Use provider switch

## Step 9 — Add payment later

Start with manual payment on confirmed orders.

QPay API comes later.

## Step 10 — Add print queue

Create print jobs only for confirmed orders with print items.

## Final local MVP definition

A complete local MVP is ready when:

- User can upload image
- User can choose template/style
- User can see preview results
- User can select digital/print/both
- Confirmed order is created after product decision
- Admin can manage confirmed orders and print jobs
