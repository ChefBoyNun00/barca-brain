-- Migration 0001: core tables. Source of truth for the design: docs/04_DATA_MODEL.md.

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
  venue          text,                -- not on football-data match responses; stays null
  referee        text
);
create index on fixtures (season, kickoff_at);

-- Season totals straight from the provider's scorers endpoint.
-- Null assists/penalties are kept as null: the provider does not say they mean zero.
create table player_season_stats (
  player_id      uuid references players(id),
  team_id        uuid references teams(id),
  competition_id uuid references competitions(id),
  season         int not null,
  matches_played int,
  goals          int not null,
  assists        int,
  penalties      int,
  updated_at     timestamptz not null default now(),
  primary key (player_id, team_id, competition_id, season)
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

-- Close Supabase's web API. It exposes the public schema, and by default the anon and
-- authenticated roles get full access to new tables. This app never uses that API.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;

-- Second lock: with row level security on and no policy, a role sees no rows.
-- Ingest connects as the table owner, which is not affected.
alter table schema_meta         enable row level security;
alter table external_ids        enable row level security;
alter table competitions        enable row level security;
alter table teams               enable row level security;
alter table players             enable row level security;
alter table squad_memberships   enable row level security;
alter table fixtures            enable row level security;
alter table player_season_stats enable row level security;
alter table standings           enable row level security;
alter table raw_payloads        enable row level security;
alter table ingest_runs         enable row level security;
