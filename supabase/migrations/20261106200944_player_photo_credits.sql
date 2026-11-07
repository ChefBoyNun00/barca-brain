-- Photos need credit, because their free licences require it.
-- photo_checked_at stops ingest searching for the same missing photo every night.

alter table players
  add column photo_credit text,
  add column photo_license text,
  add column photo_page_url text,
  add column photo_checked_at timestamptz;
