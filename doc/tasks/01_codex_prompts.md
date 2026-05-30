# Codex Prompts

## Current prompt sync

- Historical build prompts are mostly implemented.
- New prompts must preserve preview-first flow and should not recreate completed scaffold work.
- Current visible UI is English.
- Current safe test mode is `DATABASE_MODE=local`, `STORAGE_MODE=local`, `AI_PROVIDER=mock`.
- Supabase remains supported, but no sync/dual-write should be planned.
- Real AI work should use the Replicate validation guard and avoid spending credits in E2E.

Use `/doc/project/PROMPTS.md` and `/doc/tasks/06_codex_prompt_template.md` as the source of truth.

Core rule:

```text
upload photo → choose template/style → generate AI preview → view results → choose digital/print → checkout → confirmed order
```

Do not create confirmed orders before AI preview/results exist.
