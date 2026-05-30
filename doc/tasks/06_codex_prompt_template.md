# Codex Prompt Template & Working Rules

## Core working method

AI Photo Studio is developed using a ChatGPT + Codex loop.

Workflow:

1. ChatGPT gives one focused Codex task prompt.
2. Codex implements the task.
3. Codex reports back using the required checklist format.
4. User sends the report to ChatGPT.
5. ChatGPT reviews and gives the next task.

## Memory/docs update requirement

For any task that changes project behavior, data flow, route flow, schema, AI provider strategy, payment flow, order flow, admin workflow, or business logic, Codex **must update the relevant memory/docs after implementation**.

Current status categories to use in docs:

- implemented and tested
- implemented but not fully tested
- supported but not primary
- planned
- paused
- deprecated
- risk/debt

Update only what changed. Do not rewrite unrelated docs.

### When to update

Update memory/docs when:
- Project behavior changes
- Data flow changes
- Route flow changes
- Schema changes (tables, columns, relationships)
- AI provider strategy changes
- Payment flow changes
- Order flow changes
- Admin workflow changes
- Business logic changes

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
- /doc/tasks/06_codex_prompt_template.md (only if reporting/prompt rules changed)

Root `README.md` is only a short repository entrypoint and should not duplicate detailed implementation status.

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

## Final business flow

AI Photo Studio must follow preview-first flow:

User enters website
→ uploads photo
→ chooses AI template/style
→ starts AI generation
→ sees AI preview/results
→ chooses digital file, print, or both
→ checkout/payment
→ confirmed order is created
→ admin fulfillment

Key principle:
Do not create a confirmed order before AI preview/results exist.

## Correct data concepts

generation_sessions:
Pre-purchase AI creation session.

uploaded_images:
Images uploaded for a generation session.

generated_outputs:
AI preview images created for a generation session.

orders:
Created only after the user sees results and chooses digital/print during checkout.

order_items:
Purchased items such as digital_file, a4_print, a3_print, digital_plus_print.

print_jobs:
Created only when a print product is purchased.

payments:
Linked to confirmed orders, not early generation sessions.

## Correct route direction

Preferred route direction:

/create

- upload-first creation flow

/create/template

- choose template after uploading, or combined upload + template step

/generate/[sessionId]

- AI processing state

/results/[sessionId]

- show AI preview results and product decision

/checkout/[sessionId]

- choose digital/print, delivery info if needed, confirm payment

/orders/[orderId]

- confirmed order tracking after checkout/payment decision

/templates

- browse/education page

/templates/[slug]

- template detail page
- CTA leads into upload/generation session flow, not confirmed order creation

Correct template CTA:
“Start with this template”

Wrong before preview exists:
“Create order”

## Prompt safety rules

Never:

- create confirmed orders before AI preview exists
- spend live AI credits during local/E2E testing
- remove mock provider fallback
- connect QPay before checkout/order flow is stable
- use text-to-image-only Replicate models for uploaded photo editing
- auto-deliver face-sensitive AI output without admin review
- expose `SUPABASE_SERVICE_ROLE_KEY` in client code
- change branding away from Modern Sage Premium unless user approves

Always preserve:

- preview-first business flow
- Manrope font
- Modern Sage Premium palette
- mock fallback during integration
- admin review for face-sensitive outputs
- current visible UI language direction

## Required Codex report format

Add this exact report checklist:

```text
## Codex Report

### 1. Task Summary
- [ ] Task:
- [ ] Status: completed / partially completed / not completed
- [ ] Short summary:

### 2. Files Changed
- [ ] path/to/file — what changed

### 3. New Files Created
- [ ] path/to/file — purpose

### 4. Main Implementation
- [ ] What was added:
- [ ] What was updated:
- [ ] What existing behavior was preserved:
- [ ] What was intentionally not changed:

### 5. Business Flow Check
- [ ] Does this preserve preview-first flow? yes/no
- [ ] Does it avoid confirmed order creation before AI preview? yes/no/not relevant
- [ ] Any old order-first logic still remaining?

### 6. Data / Schema Check
- [ ] Tables changed? yes/no
- [ ] If yes, list tables:
- [ ] Does schema use generation_sessions before orders? yes/no/not relevant
- [ ] Any migration or SQL files created/updated?

### 7. UI / UX Check
- [ ] Customer-facing mock/dev wording removed? yes/no/not relevant
- [ ] Visible UI copy follows current language direction? yes/no/not relevant
- [ ] Manrope + Modern Sage preserved? yes/no/not relevant
- [ ] Responsive layout considered? yes/no/not relevant

### 8. Checks
- [ ] npm run lint: pass/fail/not run
- [ ] npm run build: pass/fail/not run
- [ ] npm run test:e2e: pass/fail/not run/not relevant
- [ ] Routes smoke-checked: pass/fail/not checked
- [ ] Routes checked:

### 8b. Memory / Docs Check
- [ ] Memory/docs update needed? yes/no
- [ ] Memory/docs updated? yes/no/not needed
- [ ] Files updated:
- [ ] Any outdated docs still remaining:
- [ ] If not updated, why not:

### 9. Important Notes
- [ ] Temporary/mock logic still used:
- [ ] Risks or manual review needed:
- [ ] Anything skipped and why:

### 10. Issues / Errors
- [ ] Errors encountered:
- [ ] How they were handled:

### 11. Next Suggested Step
- [ ] One recommended next task only:
```

Reporting rules:

- Do not write a long essay.
- Use the checklist format exactly.
- Be specific about file paths.
- Do not hide incomplete work.
- If something was skipped, say clearly why.
- Suggest only one next step.
