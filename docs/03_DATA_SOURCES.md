# 03 — Data Sources

Researched Nov 2026. **Verify limits with a live key before building on them** — free tiers change.

## Primary: football-data.org
Verified with a live token on 2026-11-05 (see `09_DECISIONS_LOG.md`).
- Base URL: `https://api.football-data.org/v4`, header `X-Auth-Token`.
- Free for 12 competitions incl. La Liga (`PD`) and Champions League (`CL`).
- 10 requests/minute. **Scores delayed on free.**
- Available on free: team matches (full-time and half-time scores, matchday, referee), standings,
  season scorers (goals, assists, penalties, matches played).
- **Not on free:** scorers per match, lineups, cards, subs, match stats (paid add-on).
- Season scorers only list players with at least 1 goal, and carry no minutes. Players with
  assists but no goals are absent. Assists and penalties can be null.
- Scorers are cut off at `limit`: always pass a high one. `limit=100` dropped 6 of 13 Barça
  La Liga scorers; `limit=1000` returned all 160 rows.
- Squad comes from `GET /v4/teams/81`: id, name, position (blank for some), birth date,
  nationality. No shirt numbers; those appear on scorer rows.
- Copa del Rey **not** included.
- Errors use real HTTP codes: 400 invalid token (seen live); 403 restricted and 429 rate limited
  expected, not yet seen.

### IDs (keep in `src/config/football.ts`, never inline)
| Thing | football-data.org ID |
|---|---|
| FC Barcelona | 81 (verified) |
| La Liga | `PD` (verified) |
| UEFA Champions League | `CL` (verified) |
| Season 2026–27 | `season=2026` (verified) |

### Request budget (per daily ingest)
| Job | Calls |
|---|---|
| Barça matches, current season | 1 |
| Standings per competition | 2 |
| Scorers per competition | 2 |
| Squad | 1 |
| **Total daily ingest** | **~6** — well inside 10/minute |

Live polling (Phase 5) is not possible on free: scores are delayed. Live = paid tier.

## Alternative (not in use): API-Football (api-sports.io)
- Base URL: `https://v3.football.api-sports.io`
- Auth header: `x-apisports-key: <key>`
- Free plan: **100 requests/day**, all endpoints, but **seasons available on free are limited**.
  Paid "Pro" is ~$19/month for 7,500/day and all seasons.
- Has what we need: fixtures, events, lineups, team stats, **player stats per match**.
- `GET /fixtures?id=...` or `ids=a-b-c` (up to 20 IDs) returns events + lineups + statistics +
  players in one call → batch match details.
- Live fixtures update roughly every 15 seconds on their side.

### Risk #1 — free plan season access (happened)
`GET /fixtures?team=529&season=2026` on the free plan returned: "Free plans do not have access
to this season, try from 2022 to 2024." So we moved to football-data.org. API-Football remains
the upgrade path for per-player match stats, on a paid plan, as a new provider adapter.

### IDs (verify on first call — keep in `src/config/football.ts`, never inline)
| Thing | API-Football ID |
|---|---|
| FC Barcelona | 529 |
| La Liga | 140 |
| UEFA Champions League | 2 |
| Copa del Rey | 143 |
| Supercopa de España | verify via `/leagues?search=supercopa` |
| Season 2026–27 | `season=2026` |

### Request budget (free plan, per day)
| Job | Calls |
|---|---|
| Team fixtures, current season | 1 |
| Match details for newly finished matches (batched 20/call) | 1 |
| Squad / player season stats (`/players?team=529&season=2026`, paginated) | 2–3 |
| Standings per competition | 2–3 |
| **Total daily ingest** | **~8** — leaves >90 for dev/testing |

Live polling (Phase 5) breaks the free budget: 1 call/minute × ~120 min = ~120 calls per match.
Live = paid tier, or polling every 2–3 minutes with degraded UX.

## Later phases
- **News / rumors (Phase 6):** RSS feeds of reputable outlets + manual entry form. Scraping
  social media is fragile and against most ToS — avoid.
- **La Masia (Phase 7):** Barça Atlètic / youth data is thin in free APIs. Check API-Football
  coverage for Primera Federación; otherwise manual curation.

## Caching rules
- The app **never** calls football APIs on page load. Only the ingest job does.
- Every raw response is stored in `raw_payloads` (provider, endpoint, params, fetched_at, json)
  so we can re-normalise without re-fetching when our schema changes.
- Respect rate limits in the client: count requests per run, abort with a clear error before
  exceeding a configured `DAILY_REQUEST_BUDGET`.
