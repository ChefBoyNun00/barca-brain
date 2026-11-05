-- Migration 0002: read-only role for the web app and AI tools.
-- It can only select, so an AI bug cannot write or delete.
--
-- The password is deliberately not here, because this file is committed to git.
-- The role cannot log in until a password is set once, outside the migrations.

create role barca_readonly with login nosuperuser nocreatedb nocreaterole noreplication;

grant usage on schema public to barca_readonly;

-- raw_payloads is left out: the app reads normalised tables, never raw provider JSON.
grant select on
  schema_meta, external_ids, competitions, teams, players, squad_memberships,
  fixtures, player_season_stats, standings, ingest_runs
to barca_readonly;

-- Row level security also needs a rule allowing these reads.
create policy readonly_select on schema_meta         for select to barca_readonly using (true);
create policy readonly_select on external_ids        for select to barca_readonly using (true);
create policy readonly_select on competitions        for select to barca_readonly using (true);
create policy readonly_select on teams               for select to barca_readonly using (true);
create policy readonly_select on players             for select to barca_readonly using (true);
create policy readonly_select on squad_memberships   for select to barca_readonly using (true);
create policy readonly_select on fixtures            for select to barca_readonly using (true);
create policy readonly_select on player_season_stats for select to barca_readonly using (true);
create policy readonly_select on standings           for select to barca_readonly using (true);
create policy readonly_select on ingest_runs         for select to barca_readonly using (true);
