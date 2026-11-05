# 07 — Conventions

## TypeScript
- `"strict": true`, `"noUncheckedIndexedAccess": true`. No `any`; use `unknown` + zod.
- Domain types in `src/domain/` are the shared language. API raw types never leave `providers/`.
- Types from zod: `type X = z.infer<typeof XSchema>` — one source of truth.

## Naming
- Files: `kebab-case.ts`. Components: `PascalCase.tsx`. Functions: verbs (`getPlayerSeasonStats`).
- DB: `snake_case` tables/columns. Mapping snake ↔ camel happens only in `db/queries/`.
- Prompt files versioned: `ask-barca.v1.md`.

## Error handling
- External calls (football API, Anthropic, DB) wrapped in a `Result` style or try/catch at the
  boundary; errors carry context (`provider`, `endpoint`, `params`).
- Ingest: one failing job doesn't kill the others; run status = `failed` if any failed, with errors in `summary`.
- Retries: exponential backoff, max 3, only on 429/5xx/network errors. Never retry 4xx validation errors.
- UI: every data view has loading, error (with retry), and empty states. Next.js `error.tsx` per route segment.
- Dev: fail loudly (throw, assertions). Prod: error boundaries + friendly messages + server logs.

## Config
- All IDs, competitions, season, model names, limits → `src/config/`.
- Env vars validated at startup by `config/env.ts`; app refuses to start if a required var is missing.
- Required env: `FOOTBALL_PROVIDER`, `FOOTBALL_DATA_KEY`, `DATABASE_URL` (read-only role),
  `DATABASE_URL_INGEST` (service role), `ANTHROPIC_API_KEY`, `DAILY_REQUEST_BUDGET`.

## Git
- `main` always deployable. Feature branches → PR → Vercel preview → merge.
- Commit messages: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`.
- Refactor and feature commits never mixed.
- Never commit `.env*` except `.env.example`.

## Testing
- Unit: mappers (raw JSON → domain) with recorded fixtures — highest value tests in the project.
- Unit: tool handlers with a test DB or mocked query functions.
- AI evals: `tests/ai-evals/` (see `05_ASK_BARCA_AI.md`).
- No tests for pure presentational components in v1 — TODO(debt) noted.

## Tech debt markers
`// TODO(debt): <what> — <why> — <proper fix>` — grep-able. Review the list at the start of each phase.

## Code-change checklist (Claude does this every time)
1. What's changing / what's not.
2. Blast radius.
3. Rollback path (usually: revert the commit; migrations need a down migration noted).
4. Edge cases + assumptions after the code.
