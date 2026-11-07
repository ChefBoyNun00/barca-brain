# 06 — Roadmap

Each phase ends with something that runs. Tick boxes as they ship.

## Phase 0 — Setup (1 evening)
- [x] Accounts: GitHub, Vercel, Supabase, football-data.org (free token), Anthropic Console (API key + small credit).
- [x] **Verify free-plan season access:** `GET /fixtures?team=529&season=2026` (see `03_DATA_SOURCES.md` Risk #1). Decide provider; log decision.
- [x] Create repo `barca-brain`, Next.js + TS strict + Tailwind + ESLint.
- [x] `src/config/env.ts` with zod validation; `.env.local` with keys; `.env.example` committed (no values).
- [x] Deploy the empty app to Vercel (prove the pipeline end to end on day 1).

**Done =** empty app live at a URL, keys stored as secrets, provider decision logged.

## Phase 1 — Data engine (weekend 1)
- [x] Supabase migrations 0001 + 0002 applied.
- [x] `FootballProvider` interface + football-data.org adapter (client, zod schemas, mapper).
- [x] Jobs: fixtures → squad → scorers → standings.
- [x] Runner logs every run to `ingest_runs`, enforces request budget.
- [x] `npm run ingest` works locally; re-running produces no duplicates.
- [x] GitHub Actions workflow runs ingest daily (e.g. 04:00 Israel time).
- [x] Mapper unit tests using recorded JSON in `tests/fixtures/`.

**Done =** Supabase shows every Barça match of the season with scores, plus scorers and standings, updated daily automatically.

## Phase 2 — Ask Blaugrana (weekend 2)
- [x] Query functions needed by tools.
- [x] 7 tools + registry; system prompt v1.
- [x] `/api/ask` route: agent loop, streaming, limits. Request logging waits on a write path.
- [x] `/ask` UI: input, streamed answer, "data used" line, loading/error/empty states.
- [x] Access code + per-instance rate limit (see decisions log).
- [x] First live run with a real API key: 11 checks, one maths error found and fixed in the prompt.
- [ ] 20-question eval set; ≥85% correct.

**Done =** v1 definition of done in `01_PRODUCT_BRIEF.md` fully met.

## Phase 2.5 — The Spanish press, in English
- [x] RSS ingest (`npm run news`) with freshness check, dedupe and off-topic filter.
- [x] AI translation, story grouping, certainty labels and a daily briefing.
- [x] `/news` page, home preview, press on player cards, Barcelona v Madrid press filter.
- [x] Fixtures calendar feed at `/calendar.ics`.
- [x] First live translation run with a real API key.

## Phase 3 — App shell (1 weekend)
- [ ] Home: next match countdown, last result, table position, form strip.
- [ ] Match detail page: full-time and half-time score, competition, round, referee.
- [ ] Player page: season stats (goals, assists, penalties, matches played).
- Needs a paid provider, so not in this phase: events timeline, lineups, team stats, per-match player chart.
- [ ] Barça visual identity (blaugrana palette, typography), mobile-first.

## Phase 4 — Opponent Scout Report (1 weekend)
- [ ] Ingest opponent's recent fixtures (budget check!).
- [ ] Scheduled generation 48h before kickoff → stored in `scout_reports` table.
- [ ] Report page with charts + AI narrative grounded in tool data.

## Phase 5 — Live Second Screen (needs paid data tier — decide first)
- [ ] Live ingest job polling during match windows only.
- [ ] `fixture_events` updates pushed to UI (Supabase Realtime or SSE).
- [ ] AI "what just changed" summaries every N events.

## Phase 6 — Rumor Credibility Tracker
- [ ] `rumors` + `journalists` tables; RSS ingest + manual entry form.
- [ ] AI extracts (player, from/to club, journalist, claim) from articles.
- [ ] Resolution: mark rumors true/false when transfers complete; journalist accuracy leaderboard.

## Phase 7 — La Masia Radar
- [ ] Data source decision (API coverage vs manual curation).
- [ ] Academy/loan player tracking + breakthrough alerts.

## Phase 8 — footynews integration
- [ ] Scout Report → 45–60s video script generator reusing `src/server/ai/`.
