# Coding Rules for Codex

## Project coding principle

Build fast, clean, and modular. MVP first. Avoid overengineering.

## Memory/docs update requirement

For any task that changes project behavior, data flow, route flow, schema, AI provider strategy, payment flow, order flow, admin workflow, or business logic, Codex **must update the relevant memory/docs after implementation**.

Update only what changed. Do not rewrite unrelated docs.

### Check and update if needed

- /doc/project/README.md
- /doc/project/TODO.md
- /doc/project/PROMPTS.md
- /doc/project/TEMPLATES.md
- /doc/project/CODING_TASKS.md
- /doc/memory/06_user_flow.md
- /doc/memory/07_database_schema.md
- /doc/memory/08_admin_dashboard.md
- /doc/memory/14_roadmap_phases.md
- /doc/tasks/00_build_order.md
- /doc/tasks/02_mvp_checklist.md
- /doc/tasks/05_supabase_integration.md

### What to document

Document:
- What now works
- What is now live
- What still uses mock/fallback
- What changed in the flow/schema/provider/admin/payment
- What the next phase/task should be

### Important rules

- Do not leave outdated memory saying the old flow is current.
- If a feature is now live, mark it as live.
- If something is still mock, mark it clearly as mock/fallback.
- If a task is a small visual polish or tiny bug fix that does not affect project behavior, memory update may be skipped, but the report must say why.

## Preview-first business rule

AI Photo Studio is preview-first:

```text
Upload photo
→ Choose template/style
→ Generate AI preview
→ View results
→ Choose digital download, A4/A3 print, or both
→ Checkout/payment
→ Create confirmed order
→ Admin fulfillment
```

The early stage is a `generation_sessions` record, not a confirmed order.
Do not create confirmed orders before AI preview/results exist.

## General rules

- Use TypeScript everywhere.
- Use Next.js App Router.
- Use Tailwind CSS.
- Keep components small and reusable.
- Never hardcode secrets.
- Put all API keys in environment variables.
- Validate all server inputs.
- Use `DATABASE_MODE=local` and `STORAGE_MODE=local` as the primary safe local/E2E path.
- Keep Supabase database/storage supported through `DATABASE_MODE=supabase` and `STORAGE_MODE=supabase`.
- Do not add or document Supabase/local sync or dual-write unless Master explicitly asks.
- Keep mock AI provider available for no-credit local/E2E tests.
- Keep mock fallback working during integration.
- Keep Manrope and Modern Sage Premium branding.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client components.
- Protect admin pages and admin mutations with server-side admin authorization.
- Do not rely on hidden UI controls for admin security.
- Keep `E2E_ADMIN_EMAIL` separate from `PRODUCTION_ADMIN_EMAIL`; E2E setup must never create/update/reset the production admin account.

## Folder suggestion

```text
/app
  /(public)
  /admin
  /api
/components
/lib
/server
/types
/doc/memory
/doc/tasks
/doc/project
/supabase
```

## Important files

```text
/lib/supabase/client.ts
/lib/supabase/server.ts
/lib/supabase/admin.ts
/lib/templates.ts
/lib/pricing.ts
/lib/status.ts
/server/ai/openai.ts
/server/storage.ts
/server/orders.ts
/server/local-data.ts
/server/local-storage.ts
/lib/db/mode.ts
/lib/db/local.ts
/types/database.ts
/supabase/schema.sql
/local-db/schema.sql
/local-db/seed_templates.sql
```

## MVP development order

1. Create Next.js project
2. Add Tailwind and shadcn/ui if needed
3. Build mock public UI flow
4. Build mock admin UI flow
5. Refactor mock UX/data to preview-first
6. Connect Supabase clients and schema
7. Wire generation sessions and uploaded images
8. Wire generated preview results
9. Create confirmed orders only after checkout/product decision
10. Add manual payment status
11. Add print fulfillment status
12. Add AI generation API route after mock flow is stable
13. Add watermark preview

## AI integration rule

Make AI provider replaceable.

Use interface:

```ts
export type GenerateImageInput = {
  sessionId: string;
  templateId: string;
  prompt: string;
  imageUrls: string[];
  aspectRatio: string;
  quality?: "low" | "medium" | "high";
};

export type GenerateImageOutput = {
  previewUrl: string;
  fullResUrl?: string;
  provider: "mock" | "openai" | "replicate" | "gemini";
  model: string;
};
```

## Provider strategy

Start with mock provider for UI.
Then validate Replicate with an image-to-image model.
Add OpenAI later if it fits the production AI strategy.

## Current verification commands

```bash
npm run lint
npm run build
npm run test:e2e -- e2e/smoke.spec.ts --project=chromium
npx tsx scripts/local-db-smoke-test.ts
npx tsx scripts/local-storage-smoke-test.ts
npx tsx scripts/check-replicate-model.ts
```

Known current debt:

- Build passes with an upload route file-tracing warning and dynamic auth logs.
- Production admin accounts must be configured and verified before launch.

## Admin authorization rule

Admin access uses `server/admin-auth.ts`:

- Require authenticated Supabase user.
- Allow `profiles.role` values: `admin`, `owner`, `super_admin`.
- Optional server-only fallback: `ADMIN_EMAILS`.
- Fail closed by default.
- Keep checks on server actions/API routes, not only UI.

## Admin review rule

For face-sensitive outputs, do not auto-deliver final files. Admin must approve.
