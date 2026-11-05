# 05 — Ask Barça: AI Design

## The core principle
**Claude never answers stats from its own memory.** It answers only from tool results that come
from our database. If the tools don't return the data, the answer says "I don't have that data"
instead of guessing. This is the difference between a toy chatbot and a portfolio piece.

## Flow
```
User question
  → POST /api/ask (rate-limited)
  → Claude (system prompt + tool definitions)
  → Claude requests tool calls  ──► our tool handlers ──► query functions ──► Postgres
  → tool results back to Claude (loop until done, max N iterations)
  → streamed final answer + list of tool calls/results ("data used" panel)
```

## Model choice (keep in `src/config/ai.ts`)
- Default: `claude-sonnet-5-5` — strong tool use, good cost/quality.
- Cheap mode / high traffic: `claude-haiku-5-5`.
- Check current model names and pricing at https://docs.claude.com before coding.

## v1 tools (one file each in `src/server/ai/tools/`)
Scoped to what football-data.org's free tier provides (see `03_DATA_SOURCES.md`).
Assist numbers cover goalscorers only, so any assists answer must say so.
Every tool has: a name, a description written for Claude, a zod input schema (converted to
JSON Schema for the API), and a handler that calls query functions only.

| Tool | Input | Returns |
|---|---|---|
| `find_player` | `{ name: string }` | matching players (id, name, position) — fuzzy/ILIKE match |
| `get_player_season_stats` | `{ player_id, competition?: 'la_liga'\|'ucl'\|'all' }` | matches played, goals, assists, penalties |
| `list_matches` | `{ competition?, venue?: 'home'\|'away', result?: 'W'\|'D'\|'L', opponent?, from?, to?, limit? }` | matches with score, date, opponent |
| `get_match_detail` | `{ match_id }` | full-time and half-time score, matchday, referee |
| `get_team_record` | `{ competition?, venue?, half_time_state?: 'leading'\|'level'\|'trailing' }` | W/D/L, goals for/against |
| `get_standings` | `{ competition }` | table rows |
| `compare_players` | `{ player_ids: string[] (2–4), competition? }` | side-by-side season stats |
| `get_top_players` | `{ metric: 'goals'\|'assists'\|'penalties', competition?, limit? }` | ranked list |

Tool-design rules:
- Small, specific tools beat one giant "query anything" tool. Claude picks better.
- Return compact JSON (no raw payloads). Token cost scales with tool output size.
- Enum inputs wherever possible (competition, metric) → fewer invalid calls.
- Handlers validate input with zod and return `{ error: "..." }` (not throw) on bad input,
  so Claude can recover.

### v1.5 option (only after v1 ships): guarded SQL tool
`run_readonly_sql` against the views only, using the read-only DB role, `statement_timeout`
of 3s, row limit 200, and a whitelist of allowed views. More flexible; more risk.
Log a decision in `09_DECISIONS_LOG.md` before adding it.

## System prompt (store in `src/server/ai/prompts/ask-barca.v1.md`)
Key instructions it must contain:
- You are a Barça data analyst. Season in scope: 2026–27.
- Use tools for every factual/statistical claim. Never use prior knowledge for numbers.
- If data is missing, say so and say what data would answer it.
- Cite which match/competition numbers come from. Keep answers short; tables for comparisons.
- Answer in the user's language (Hebrew, English, Spanish).
- Refuse off-topic requests briefly.
Prompts are versioned files (`.v1`, `.v2`); the active version is set in `config/ai.ts`.

## Agent loop limits
- Max 6 tool-use iterations per question; then answer with what's available.
- Max output tokens configured in `config/ai.ts`.
- Per-request timeout; on timeout return a recoverable error with a "retry" button.

## Cost & abuse control (public URL!)
- Rate limit `/api/ask` per IP (e.g. 10 questions/hour) — use Upstash Redis free tier or a
  Postgres table.
- Global daily cap on questions; when hit, the UI shows "Daily limit reached, back tomorrow".
- Cache identical questions for 1 hour (key = normalised question + data version).
- Log every request: question, tools called, tokens in/out, latency → `ai_requests` table.
  This doubles as portfolio material ("here's my eval data").

## Streaming
Stream the final answer to the UI (Server-Sent Events via the route handler). Show tool calls
as they happen ("Looking up Pedri's stats…") — makes the AI feel alive and shows the engineering.

## Evaluation (do this; it's what impresses technical reviewers)
`tests/ai-evals/questions.json`: 20 questions with known correct answers computed by SQL.
A script runs them against `/api/ask` and reports accuracy. Run it whenever the prompt or tools
change.
