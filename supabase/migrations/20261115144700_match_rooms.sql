-- The Matchday Room: lineups, absences and events for one of our fixtures, from FotMob.
-- `details` holds the app's own checked shape (src/domain/match-room.ts), never FotMob's raw
-- reply. It is replaced as a whole on every refresh, so one column is simpler than many tables.

create table match_rooms (
  fixture_id  uuid primary key references fixtures(id) on delete cascade,
  provider    text not null,           -- 'fotmob'
  external_id text not null,           -- the provider's match id
  details     jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table match_rooms enable row level security;

grant select on match_rooms to barca_readonly;
create policy readonly_select on match_rooms for select to barca_readonly using (true);
