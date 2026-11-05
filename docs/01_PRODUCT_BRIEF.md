# 01 — Product Brief

## One line
An FC Barcelona app you can **talk to**: it holds every match, result and scorer stat for the season,
and an AI analyst answers anything about the team from real data, never from guesses.

## Why it's not "another scores app"
Scores, fixtures and lineups are table stakes; they come free from the data we ingest anyway.
The product is the layer on top that only AI makes possible:

| Feature | What it does | Why it's different |
|---|---|---|
| **Ask Barça** (core) | Natural-language questions answered from our own database via Claude tool use | You can't Google "what's our record away in the Champions League when we led at half-time?" |
| **Opponent Scout Report** | Auto-generated page 48h before each match: opponent form, weaknesses, key matchup | Personalised pre-match analysis, every match, zero effort |
| **Live Second Screen** | During matches, explains what just changed, momentum, key events | Commentary that reasons over data, not just a ticker |
| **Rumor Credibility Tracker** | Logs transfer rumors per journalist, scores who turns out right | Nobody tracks journalist accuracy for Barça |
| **La Masia Radar** | Tracks academy/loan players' minutes and stats, alerts on breakthroughs | Hard-to-find data, fan-favourite topic |

## Users
1. **Daniel** — daily use as a fan (catch up, settle arguments, pre-match prep).
2. **Recruiters / sports-tech employers** — portfolio piece: real data pipeline, real DB,
   real LLM engineering, deployed.
3. **Friends / other Barça fans** — shareable public URL.

## Learning goals (the real point)
- REST APIs: auth, rate limits, pagination, caching.
- Backend: scheduled jobs, data normalisation, Postgres schema design, SQL.
- AI engineering: Anthropic API, tool use, grounding, streaming, cost control.
- Frontend: Next.js App Router, React Server Components, Tailwind, data-fetching states.
- Ops: deploy (Vercel), secrets, cron (GitHub Actions), logging.

## Version 1 — definition of done
- [ ] 2026–27 Barça matches (La Liga + Champions League) ingested into Supabase, with full-time
      and half-time scores.
- [ ] Season scorer totals (goals, assists, penalties, matches played) and standings ingested.
- [ ] Ingest runs daily on a schedule without anyone touching it; each run logged.
- [ ] `/ask` page: question in → streamed answer out, with a "data used" panel showing the
      tool calls and numbers behind the answer.
- [ ] Answers a correct, verifiable answer to e.g. "How many La Liga goals has Lamine Yamal
      scored this season?" and "What's our record at home?"
- [ ] Deployed at a public URL with a per-visitor rate limit on `/ask`.

## Non-goals for v1
No live data. No per-match player stats, lineups or goal events, and no Copa del Rey (free-tier
limits, see `03_DATA_SOURCES.md`). No news/rumors. No user accounts. No mobile app. No design polish beyond clean.
No historical seasons (only current season — free-tier limitation, see `03_DATA_SOURCES.md`).

## Future synergy
The data engine + Scout Report generator is the same pipeline the "footynews" video show needs
(fetch → verify → script). Keep the AI generation code reusable (`src/server/ai/`) so a video
script generator can become another consumer later.
