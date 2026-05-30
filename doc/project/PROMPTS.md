# Codex Prompts

Use these prompts in VSCode + Codex to maintain the local MVP.

All prompts must follow `/doc/tasks/06_codex_prompt_template.md`.

Important:
AI Photo Studio uses preview-first flow:

```text
upload photo → choose template/style → generate AI preview → view results → choose digital/print → checkout → confirmed order
```

Do not create confirmed orders before AI preview/results exist.

## Prompt 1 — Read project context

```text
Read all markdown files in /doc/memory and /doc/tasks first. Understand the AI Photo Studio MVP plan, preview-first business flow, tech stack, template system, database schema, and coding rules. Do not start coding until you summarize the build order and confirm the MVP scope.
```

## Prompt 2 — Create project structure

```text
Create the initial Next.js App Router project structure for AI Photo Studio using TypeScript and Tailwind CSS. Follow the docs in /doc/memory and /doc/tasks. Build clean placeholder pages and reusable layout components. Do not connect real APIs yet. Preserve preview-first flow.
```

## Current prompt status

Historical prompts 1-8 are mostly implemented. New tasks should treat them as background, not as pending work.

Current facts:

- Visible UI copy is English.
- Local `DATABASE_MODE=local` and `STORAGE_MODE=local` are the primary safe test path.
- Mock AI provider must remain available for no-credit tests.
- Supabase remains supported, but no Supabase/local sync or dual-write is planned.
- Replicate model validation exists; `stability-ai/stable-diffusion-img2img` is the current valid candidate.

## Prompt 3 — Build preview-first UI pages

```text
Build the MVP UI pages:
- Home page
- Upload/create page
- Template selection page
- Generation processing page
- Results page
- Checkout page from session
- Confirmed order status page
- Admin dashboard
- Admin order detail

Use clean ecommerce design, professional English visible UI copy, and mobile-friendly layout. Use mock/local data where safe. Do not create confirmed orders before AI preview/results exist.
```

## Prompt 4 — Add template data

```text
Create a local template data system for AI Photo Studio. Add initial templates:
1. Old photo restoration
2. Black and white colorization
3. Scratch and damage removal
4. AI studio portrait
5. Product photo background upgrade
6. Family merge beta
7. Couple cinematic portrait beta
8. Kids storybook poster beta
9. Pet portrait beta

Use the prompt text and template strategy from /doc/memory/05_template_system.md.
```

## Prompt 5 — Add preview-first Supabase schema

```text
Add Supabase database schema based on /doc/memory/07_database_schema.md. Create SQL migration files for profiles, ai_templates, generation_sessions, uploaded_images, generated_outputs, orders, order_items, print_jobs, payments, and admin_notes. Also create TypeScript types for the tables.
```

## Prompt 6 — Add session upload and generation flow

```text
Implement the upload and generation session flow. Users should upload 1–5 images, choose a template/style, add a note, and generate AI preview results. Save uploaded images and generated outputs to the generation session. Do not create a confirmed order until checkout/product decision.
```

## Prompt 7 — Add mock AI provider

```text
Create a mock AI provider that simulates image generation for generation_sessions. It should create generated_outputs records with preview URLs and mark the session preview_ready. Use this to complete the UI flow before connecting OpenAI.
```

## Prompt 8 — Add admin dashboard

```text
Build the admin dashboard for confirmed orders. Admin can view orders, linked generation session images, generated outputs, selected product, print job, customer info, and update order/print status.
```

## Prompt 9 — Add real AI provider later

```text
Add or harden a real image provider behind the existing provider interface. Do not remove the mock provider. The system should allow safe switching between mock, replicate, and later openai providers. Use environment variables for API keys and do not spend live credits during local/E2E tests.
```

## Prompt 10 — Improve MVP for local launch

```text
Review the entire app against /doc/tasks/02_mvp_checklist.md. Fix missing MVP requirements, improve UX, add loading states, error states, empty states, and make sure the project can run locally with npm run dev.
```

## Prompt 11 — Audit and docs sync

```text
Audit implemented code against /doc/memory and /doc/tasks. Update outdated docs only. Preserve preview-first flow and do not change production logic. Run lint, build, and safe E2E/smoke tests where possible. Classify statuses as implemented and tested, implemented but not fully tested, supported but not primary, planned, paused, deprecated, or risk/debt.
```
