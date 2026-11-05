# 09 — Decisions Log (lightweight ADRs)

Append-only. Format: date · decision · why · alternatives rejected · revisit when.

---

**2026-11-02 · Project name: "Barça Brain"**
Why: describes the AI-native angle. Revisit: anytime, cheap to change.

**2026-11-02 · Stack: Next.js + TypeScript + Tailwind + Supabase Postgres + Anthropic API, hosted on Vercel**
Why: one language, employable stack, free tiers, real SQL.
Rejected: Python/FastAPI backend (two languages, two deploys); Firebase (NoSQL hides SQL learning).
Revisit: if heavy data science (xG models) is added → small Python service alongside.

**2026-11-02 · Scheduler: GitHub Actions cron, not Vercel Cron**
Why: free, no frequency cap that matters, decouples ingest from web app, visible logs.
Revisit: when live data (Phase 5) needs sub-minute polling → dedicated worker (Railway/Fly) or paid tier.

**2026-11-02 · Primary data provider: API-Football (pending free-season verification)**
Why: only free option with per-player match stats.
Fallback: football-data.org (free, but no lineups/player stats).
Revisit: Phase 0 verification result; Phase 5 live needs.

**2026-11-02 · AI answers via fixed typed tools, not text-to-SQL, in v1**
Why: predictable, safe, easier to evaluate, teaches tool design.
Rejected for now: free-form SQL tool. Revisit: after v1 eval ≥85%.

**2026-11-02 · Store raw API payloads**
Why: re-normalise when schema changes without spending API requests. Cost: DB storage (small).

**2026-11-05 · Primary data provider: football-data.org (replaces API-Football)**
Why: the Phase 0 check against API-Football failed: "Free plans do not have access to this season,
try from 2022 to 2024." football-data.org's free tier returned the live 2026–27 season: 46 Barça
matches (38 La Liga, 8 Champions League), standings, and season scorers with goals, assists and
penalties.
Cost accepted: no scorers, lineups, cards, subs or per-match player stats on match data; no Copa del
Rey; scores delayed. Ask Barça is limited to results, standings and season scorer totals.
Rejected: API-Football on season 2024 for free (data two seasons old); API-Football Pro at about
$19/month (cost while still learning).
Revisit: if per-match player questions become the priority → add API-Football Pro or football-data's
paid add-on as a new provider adapter.

**2026-11-05 · Data model: season totals table, per-match tables deferred**
Why: football-data.org's free tier gives season scorer totals but no per-match player data.
`player_season_stats` stores those totals; `fixture_events`, `fixture_lineups`,
`team_match_stats` and `player_match_stats` leave migration 0001 so that "no data" cannot look
like zero. `FootballProvider` drops `getFixtureDetails` and gains `getSeasonScorers`.
Rejected: keeping the empty tables for later (misleading to Ask Barça, and a new migration is cheap).
Revisit: if a paid provider is added.
