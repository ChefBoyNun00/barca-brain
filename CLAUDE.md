# CLAUDE.md — barca-brain repo

> Put this file at the repo root. Claude Code reads it automatically.
> Full context lives in the project docs (01–09). Keep this file short.

## What this is
AI-native FC Barcelona app. Ingest football API data → Postgres (Supabase) → Next.js app,
with "Ask Barça": Claude answers questions using typed tools over our DB.

## Commands
- `npm run dev` — local app
- `npm run ingest` — run ingest jobs (needs `DATABASE_URL_INGEST`, `FOOTBALL_DATA_KEY`)
- `npm test` — vitest
- `npm run eval` — Ask Barça accuracy eval
- `npx supabase migration new <name>` — new migration (never edit applied ones)

## Layer rules (do not break)
- Only `src/server/providers/*` talks to football APIs. Raw API types never leave that folder.
- Only `src/server/db/queries/*` contains SQL. App and AI tools call query functions.
- AI tools never write to the DB; app uses the read-only DB role.
- IDs, season, model names, limits live in `src/config/`. Never inline them.
- New provider / tool / ingest job = new file + one registry line.

## Working rules
- Before changing code: what changes, what doesn't, blast radius, rollback.
- Never mix refactor + feature in one change.
- TypeScript strict, zod at every external boundary.
- Every async UI has loading / error / empty states.
- Shortcuts: `// TODO(debt): what — why — proper fix`.
- After writing code: list unhandled edge cases and assumptions.
- Explain key parts of each change to Daniel in plain language — he's learning.
