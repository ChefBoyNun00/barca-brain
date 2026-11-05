# 02 — Architecture

## High-level flow
```
 Football API(s) ──► Provider adapter ──► Normalizer ──► Postgres (Supabase)
   (external)          (one per API)      (raw → domain)        │
                                                                 │
        GitHub Actions cron ── runs ──► ingest script ───────────┘
                                                                 │
                    Next.js app (Vercel)                         │
                    ├── pages read DB (server components) ◄──────┤
                    └── /api/ask ──► Claude (tool use) ──► tools ─┘ (read-only queries)
```
Three layers that never reach into each other's internals:
1. **Ingest** (writes data) — only place that talks to football APIs.
2. **Data** (Postgres + typed query functions) — only place that writes/reads SQL.
3. **App** (UI + AI) — reads through query functions; never calls football APIs directly.

## Stack and why

| Layer | Choice | Why this over alternatives | Tradeoff accepted |
|---|---|---|---|
| Language | TypeScript (strict) | One language front+back; types catch breaking changes | Slower to start than plain JS |
| Web framework | Next.js (App Router) | Frontend + API routes in one repo; most employable React stack; free Vercel deploy | Framework magic (server vs client components) to learn |
| Styling | Tailwind CSS | Fast, no CSS files to manage | Long class strings |
| Database | Supabase (Postgres) | Real SQL (sports-tech jobs want SQL); free tier; dashboard to inspect data | Vendor-hosted; free projects pause after inactivity |
| DB access | `postgres` (porsager) or Supabase JS client + hand-written SQL in `queries/` | Daniel learns real SQL, not ORM abstractions | More typing of result shapes by hand |
| Validation | zod | Runtime validation of API responses, env vars, AI tool inputs | Schema duplication with TS types (use `z.infer`) |
| Scheduler | GitHub Actions cron | Free, no daily limit, decoupled from web app, logs visible | ~minutes of start delay; not for second-level live data |
| AI | Anthropic API (`@anthropic-ai/sdk`), tool use | Grounded answers from our DB; the core learning goal | Per-request cost — needs rate limiting |
| Hosting | Vercel | Zero-config Next.js deploy, preview URLs per branch | Function timeouts on hobby plan |
| Tests | Vitest | Fast, TS-native | — |

## Folder structure
```
barca-brain/
├── src/
│   ├── app/                      # Next.js routes (UI only, thin)
│   │   ├── page.tsx              # home: next match, last result, table position
│   │   ├── ask/page.tsx          # Ask Barça UI
│   │   ├── matches/[id]/page.tsx # match detail
│   │   └── api/ask/route.ts      # streams Claude answer
│   ├── components/               # presentational components only (no fetching)
│   ├── features/                 # feature-specific UI + hooks (ask/, matches/)
│   ├── domain/                   # domain types: Match, Player, MatchEvent... (no deps)
│   ├── config/
│   │   ├── env.ts                # zod-validated env vars
│   │   ├── football.ts           # team id, competitions, season — all IDs live here
│   │   └── ai.ts                 # model names, max tokens, rate limits
│   └── server/                   # never imported by client components
│       ├── providers/            # one folder per external API
│       │   ├── types.ts          # FootballProvider interface (the contract)
│       │   ├── registry.ts       # { "api-football": ApiFootballProvider, ... }
│       │   ├── api-football/     # client.ts, schemas.ts (zod), mapper.ts
│       │   └── football-data/    # alternative provider, same contract
│       ├── db/
│       │   ├── client.ts
│       │   └── queries/          # matches.ts, players.ts, stats.ts — typed functions
│       ├── ingest/
│       │   ├── jobs/             # fixtures.ts, match-details.ts, squad.ts, standings.ts
│       │   └── runner.ts         # runs jobs, logs to ingest_runs
│       └── ai/
│           ├── client.ts
│           ├── prompts/          # system prompts as versioned files
│           └── tools/            # one file per tool + registry.ts
├── scripts/ingest.ts             # entry point for cron: `npm run ingest`
├── supabase/migrations/          # numbered SQL migrations
├── tests/fixtures/               # recorded raw API JSON for tests
├── .github/workflows/ingest.yml
└── CLAUDE.md                     # copy of key rules for Claude Code later
```

## Switch points (registries, not if/else)
- **Data provider:** `providers/registry.ts` maps a name → implementation of `FootballProvider`.
  Active provider chosen by `FOOTBALL_PROVIDER` env var. Add a provider = add folder + 1 line.
- **AI tools:** `ai/tools/registry.ts` exports the list given to Claude. Add a tool = new file + 1 line.
- **Ingest jobs:** `ingest/runner.ts` reads a job list. Add a job = new file + 1 line.
- **Competitions:** `config/football.ts` array. Add a competition = 1 entry.

## Key boundaries
- `FootballProvider` interface (contract between ingest and any API):
  ```ts
  interface FootballProvider {
    name: string;
    getTeamFixtures(p: { teamId: string; season: number }): Promise<DomainFixture[]>;
    getFixtureDetails(ids: string[]): Promise<DomainFixtureDetail[]>;
    getSquad(teamId: string, season: number): Promise<DomainPlayer[]>;
    getStandings(competitionId: string, season: number): Promise<DomainStanding[]>;
  }
  ```
  Raw API shapes **never** leave the provider folder. Everything outside sees domain types.
- **Query functions** are the only path to the DB from the app and the AI tools.
- **AI tools** call query functions; Claude never writes SQL in v1.

## Most likely future changes (designed for)
- Switching or adding a data provider (free tier limits) → adapter pattern.
- Adding live data → new ingest job + new table; no change to existing ones.
- Adding new AI tools / features → registry.
- Schema evolution → numbered migrations + `raw_payloads` table lets us re-normalise old data.

## How to remove a feature
Each feature lives in `features/<name>/`, `app/<route>/`, and possibly `ai/tools/<tool>.ts`.
Delete those and its registry line. Nothing else imports it.
