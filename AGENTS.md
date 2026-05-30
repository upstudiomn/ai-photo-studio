# AGENTS.md

## Communication

Always respond to the user in Mongolian.

Call the user “Master”.

Keep responses:
- short
- clear
- practical
- checklist-style when useful
- not long essay style

Use a few helpful emojis, but do not overuse them.

## Project

Project name: AI Photo Studio

This is a Mongolia-focused AI photo processing, ecommerce, and local print fulfillment project.

The product lets users upload photos, generate AI preview/results, then choose digital file delivery, printed product delivery, or both.

## Core business principle

The user must see AI preview/results before a confirmed order is created.

The early stage is a creation/preview session.

A confirmed order starts only after the user chooses a product option such as digital download, print, or both.

Face-sensitive AI outputs must support admin review before final delivery.

## Source of truth

Before important work, read the project docs:

```text
1. AGENTS.md
2. /doc/tasks/06_codex_prompt_template.md
3. /doc/memory/*.md
4. /doc/tasks/*.md
5. /doc/project/README.md
6. /doc/project/TODO.md
7. /doc/project/PROMPTS.md
8. /doc/project/TEMPLATES.md
9. /doc/project/CODING_TASKS.md
10. README.md only as repo entrypoint
```

Important:
- `/doc/memory` contains project knowledge and current decisions.
- `/doc/tasks` contains build order, prompt rules, and task checklists.
- `/doc/project` contains project README/TODO/PROMPTS/TEMPLATES/CODING_TASKS.
- Root `README.md` is an entrypoint only, not the detailed source of truth.
- Do not rely on old assumptions if memory files were updated.

## Development rules

Do not:
- create a confirmed order before AI preview/results
- expose service role keys in client code
- connect real AI/payment providers before the required flow is stable
- auto-deliver face-sensitive outputs without admin review
- change the approved brand direction unless the user explicitly asks

Always preserve:
- current visible UI language direction
- simple, clear ecommerce UX
- current project memory decisions
- checklist-style Codex reports
- small focused tasks

## Codex task rule

Each Codex task should:
1. Read relevant docs first
2. State the current phase/task
3. Make one focused change
4. Avoid unrelated changes
5. Run lint/build when relevant
6. Report back using the project checklist format

## Report rule

After every task, report briefly with:
- task summary
- files changed
- new files
- main implementation
- business flow check
- data/schema check if relevant
- UI/UX check if relevant
- lint/build result
- issues/risks
- one next suggested step only

### Memory / Docs Check

For any task that changes project behavior, data flow, route flow, schema, AI provider strategy, payment flow, order flow, admin workflow, or business logic, Codex **must update the relevant memory/docs after implementation**.

Check and update if needed:
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

Required report checklist:

```text
### Memory / Docs Check
- [ ] Memory/docs update needed? yes/no
- [ ] Memory/docs updated? yes/no/not needed
- [ ] Files updated:
- [ ] Any outdated docs still remaining:
- [ ] If not updated, why not:
```

Use `[x]` for completed/passed items. Use `[ ]` only for failed/skipped/not relevant items and explain why.
