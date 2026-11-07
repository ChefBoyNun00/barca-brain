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

**2026-11-05 · Database access: Supabase web API closed, row level security on**
Why: Supabase exposes the `public` schema through a web API and gives `anon` and `authenticated`
full access to new tables by default. The app connects to Postgres directly and never uses that
API. Migration 0001 revokes that access and enables row level security; migration 0002 adds
`barca_readonly` with select-only grants and policies, excluding `raw_payloads`.
Rejected: leaving tables open because the API key is unused (one leaked key would allow writes).
Revisit: if the browser ever needs Supabase directly, e.g. Realtime for Live Second Screen.

**2026-11-05 · Home page: the season as a woven shirt, not a dashboard**
Why: nearly all football apps stack scores and tables. Barça's identity is vertical stripes, so
each match is one stripe, and one stripe is the unit everywhere: a match, a point, a goal. Results
use shape (a defeat tears the stripe), so they read without colour vision. Half-time scores give
the page its own story, written from data by `season-story.ts`.
Colours: blaugrana for the shirt and data, with the vivid design system's purple for controls and
its light surfaces, motion and spacing. This departs from purple-first on purpose.
Rejected: the first version's card dashboard (looked like every other sports app).
Revisit: if the fixture list grows far past 46 stripes, or phone stripes get too thin to read.

**2026-11-06 · Player photos: Wikimedia Commons, matched by birth date**
Why: football-data.org's free tier has no photos. Wikidata and Commons give freely licensed ones.
A photo is only used when exactly one Wikidata person matches the player's birth date, so a
namesake cannot appear, and only under an allowed licence. Credit, licence and source page are
stored, and a photo with no licence details is not shown. Players with no photo show initials.
Rejected: scraping club or agency photos (not licensed for reuse).
Revisit: if a paid provider supplies licensed headshots.

**2026-11-06 · Weave the ending: a what-if in the browser, not a forecast**
Why: it lets a fan play with the season without a model or an account. Picked matches count
exactly, and also count for the opponent. Everything else runs at each team's points per match.
Picks stay in the viewer's browser, because the app's database login is read-only by design.
Rejected: presenting the result as a prediction (points per match is not a forecasting model).
Revisit: when accounts exist, if people want to save or share an ending.

**2026-11-06 · News is in scope: the Spanish press, in English**
Why: this replaces "no news" from the v1 brief. Daniel's real pain is that most Barça reporting is
in Spanish, so he relies on English accounts on X. The app reads the press itself. Only headlines
and feed snippets are stored, for 30 days, and every story links to its outlet: the product is a
translated summary that sends readers to the source, not a copy of the article. Outlets are
labelled by city because Barcelona and Madrid papers lean towards their own club.
Rejected: scraping X (against its terms, and its API is paid); fetching full articles (copyright);
Marca's feed (frozen since June 2025) and Sport's (refuses readers), both covered by Google News.
Revisit: if the app goes public or commercial, since Google News feeds are for personal use.

**2026-11-06 · Models: Sonnet for Ask Blaugrana, Haiku for translation**
Why: follows `05_ASK_BARCA_AI.md`. Questions need good tool use. Translating headlines is high
volume and simple, which is the doc's "cheap mode" case. Refusal fallback is on for Ask.
Revisit: if translation quality disappoints. It is one line in `src/config/ai.ts`.

**2026-11-06 · Ask Blaugrana: an access code instead of a database rate limit**
Why: `05_ASK_BARCA_AI.md` planned a per-IP limit and an `ai_requests` log in Postgres, but the app's
login is read-only by design, and this is mainly a personal app. A shared code is the real cost
gate: with no code set, the live site stays closed. An in-memory hourly limit backs it up.
Rejected: giving the web app a write login just for logging.
Revisit: before opening Ask to other people. Add Upstash or a write-only role, then logging and
the 20-question eval.
