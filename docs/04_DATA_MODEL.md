# 04 — Data Model (Postgres / Supabase)

Principles:
- Our own IDs (`uuid`) + a mapping table to provider IDs. Switching providers doesn't change keys.
- Raw JSON kept separately; normalised tables are rebuildable.
- Migrations are numbered SQL files in `supabase/migrations/`. Never edit an applied migration —
  add a new one.
- `schema_meta.version` tracks the data shape version.

## Migration 0001 — core
```sql
create extension if not exists "pgcrypto";

create table schema_meta (
  id int primary key default 1 check (id = 1),
  version int not null
);
insert into schema_meta (version) values (1);

-- Provider ID mapping: (entity_type, provider, external_id) -> our uuid
create table external_ids (
  entity_type text not null,          -- 'team' | 'player' | 'fixture' | 'competition'
  provider    text not null,          -- 'api-football' | 'football-data'
  external_id text not null,
  internal_id uuid not null,
  primary key (entity_type, provider, external_id)
);

create table competitions (
  id     uuid primary key default gen_random_uuid(),
  name   text not null,
  type   text not null check (type in ('league','cup','international')),
  country text
);

create table teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  short_name text,
  logo_url   text
);

create table players (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  first_name    text,
  last_name     text,
  birth_date    date,
  nationality   text,
  position      text,                -- 'GK' | 'DF' | 'MF' | 'FW'
  photo_url     text
);

create table squad_memberships (
  player_id   uuid references players(id),
  team_id     uuid references teams(id),
  season      int  not null,
  shirt_number int,
  primary key (player_id, team_id, season)
);

create table fixtures (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid references competitions(id),
  season         int not null,
  round          text,
  kickoff_at     timestamptz not null,
  status         text not null,       -- 'scheduled'|'live'|'finished'|'postponed'|'cancelled'
  home_team_id   uuid references teams(id),
  away_team_id   uuid references teams(id),
  home_goals     int,
  away_goals     int,
  home_goals_ht  int,
  away_goals_ht  int,
  venue          text,
  referee        text,
  details_ingested_at timestamptz     -- null = events/lineups/stats not fetched yet
);
create index on fixtures (season, kickoff_at);

create table fixture_events (
  id          uuid primary key default gen_random_uuid(),
  fixture_id  uuid references fixtures(id) on delete cascade,
  minute      int not null,
  extra_minute int,
  team_id     uuid references teams(id),
  player_id   uuid references players(id),
  assist_player_id uuid references players(id),
  type        text not null,          -- 'goal'|'card'|'subst'|'var'
  detail      text                    -- 'Normal Goal'|'Penalty'|'Own Goal'|'Yellow Card'|...
);
create index on fixture_events (fixture_id);

create table fixture_lineups (
  fixture_id  uuid references fixtures(id) on delete cascade,
  team_id     uuid references teams(id),
  player_id   uuid references players(id),
  is_starter  boolean not null,
  position    text,
  grid        text,                   -- e.g. '2:3' formation grid position
  formation   text,                   -- team formation e.g. '4-3-3'
  primary key (fixture_id, player_id)
);

create table team_match_stats (
  fixture_id uuid references fixtures(id) on delete cascade,
  team_id    uuid references teams(id),
  stats      jsonb not null,          -- { shots_total, shots_on, possession, xg, passes, ... }
  primary key (fixture_id, team_id)
);

-- Typed columns for what Ask Barça queries most; jsonb for the long tail.
create table player_match_stats (
  fixture_id  uuid references fixtures(id) on delete cascade,
  player_id   uuid references players(id),
  team_id     uuid references teams(id),
  minutes     int,
  rating      numeric(3,1),
  goals       int default 0,
  assists     int default 0,
  shots       int,
  shots_on    int,
  key_passes  int,
  passes      int,
  pass_accuracy int,
  dribbles_success int,
  tackles     int,
  yellow      int default 0,
  red         int default 0,
  extra       jsonb,
  primary key (fixture_id, player_id)
);

create table standings (
  competition_id uuid references competitions(id),
  season    int not null,
  team_id   uuid references teams(id),
  rank      int not null,
  points    int not null,
  played    int, won int, drawn int, lost int,
  goals_for int, goals_against int,
  form      text,
  updated_at timestamptz not null default now(),
  primary key (competition_id, season, team_id)
);

create table raw_payloads (
  id          bigserial primary key,
  provider    text not null,
  endpoint    text not null,
  params      jsonb not null,
  fetched_at  timestamptz not null default now(),
  payload     jsonb not null
);

create table ingest_runs (
  id           bigserial primary key,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  status       text not null default 'running',  -- 'running'|'success'|'failed'
  provider     text not null,
  requests_used int default 0,
  summary      jsonb,
  error        text
);
```

## Read-only role for the app/AI (migration 0002)
The web app and AI tools connect with a role that can only `select`.
Ingest uses the service role. If an AI bug ever slips through, it cannot write or delete.

## Useful views (migration 0003, built when Ask Barça needs them)
- `v_barca_matches` — fixtures where Barça played, with `barca_goals`, `opp_goals`, `result`
  ('W'/'D'/'L'), `venue_side` ('home'/'away'), opponent name.
- `v_player_season_totals` — sums per player per competition per season.

## Upsert rule
All ingest writes are **idempotent upserts** keyed on `external_ids`. Running ingest twice
produces the same DB. This is what makes retries safe.
