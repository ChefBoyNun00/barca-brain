# 08 — Feature Specs (post-v1)

Specs are intentionally short. Expand into a full spec at the start of each phase.

## Opponent Scout Report (Phase 4)
**Trigger:** scheduled job checks for Barça fixtures kicking off in 36–60h; generates once per fixture.
**Data:** opponent's last 5–8 matches (results, goals for/against by period, set-piece goals,
formation used), head-to-head last 5, injuries/suspensions if the API provides them.
**Output sections:** Form strip · How they set up · Where they're vulnerable · Their danger man ·
The matchup that decides it · Prediction (clearly labelled as opinion).
**Storage:** `scout_reports(fixture_id, generated_at, prompt_version, content_md, data_snapshot jsonb)`.
**Rule:** every number in the narrative must come from `data_snapshot`.
**Risk:** opponent ingest costs API requests — budget ~5–10 calls per report.

## Live Second Screen (Phase 5)
**Prereq:** paid data tier or accepted degraded polling. Decide and log first.
**Ingest:** live job runs only between kickoff−15min and full-time+15min; polls `fixtures?live`
filtered to Barça; upserts events.
**Push to UI:** Supabase Realtime on `fixture_events` (simplest) or SSE from a route.
**AI layer:** after each significant event (goal, red, sub, 10-minute window), generate a
2-sentence "what changed" note from the last N events + stats delta. Cap AI calls per match.
**UI:** live score, event timeline, momentum chart (shots/xG per 5 min), AI notes feed.
**Failure mode to design for:** API lag/out-of-order events → events keyed by provider id, sorted by minute, idempotent.

## Rumor Credibility Tracker (Phase 6)
**Tables:** `journalists`, `rumors(player, from_club, to_club, claim_type, source_url, journalist_id, first_seen, status: open|true|false|expired)`.
**Ingest:** RSS from chosen outlets + manual form. AI extraction step turns an article into
structured rumor rows (with confidence); low confidence → review queue.
**Resolution:** when a transfer completes (API transfers endpoint or manual), resolve matching rumors.
**Output:** leaderboard — accuracy % per journalist, with sample size shown (n < 10 flagged).
**Legal/ethics:** store links + short summaries, never full article text.

## La Masia Radar (Phase 7)
**Data:** Barça Atlètic + loaned-out youth players; source TBD (API coverage vs manual).
**Features:** minutes trend, first-team debuts, "breakthrough" alert when a player crosses
thresholds (e.g. 3 straight starts).
**Biggest risk:** data availability — validate before building UI.
