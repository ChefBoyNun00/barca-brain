-- The Spanish press, read and translated for an English-speaking fan.
-- Only the headline and the feed's short snippet are kept, never whole articles.

create table news_articles (
  id               uuid primary key default gen_random_uuid(),
  url              text not null unique,
  -- The same story reaches us from several feeds, each with its own link.
  dedupe_key       text not null unique,
  outlet           text not null,
  press_side       text not null,      -- 'barcelona'|'madrid'|'national'|'official'
  title_original   text not null,
  snippet_original text,
  published_at     timestamptz not null,
  fetched_at       timestamptz not null default now(),
  -- Filled by the translation step. Null means not translated yet.
  is_relevant      boolean,
  title_en         text,
  summary_en       text,
  category         text,               -- 'transfers'|'injuries'|'match'|'club'|'other'
  certainty        text,               -- 'official'|'reported'|'rumour'|'opinion'|'news'
  topic            text,
  player_names     text[] not null default '{}',
  translated_at    timestamptz
);

create index news_articles_published_idx on news_articles (published_at desc);

create table news_briefings (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  headline     text not null,
  bullets      jsonb not null,
  story_count  int not null
);

create index news_briefings_created_idx on news_briefings (created_at desc);

-- New tables get none of the earlier setup, so each rule is repeated here.
revoke all on news_articles, news_briefings from anon, authenticated;
alter table news_articles  enable row level security;
alter table news_briefings enable row level security;

grant select on news_articles, news_briefings to barca_readonly;
create policy readonly_select on news_articles  for select to barca_readonly using (true);
create policy readonly_select on news_briefings for select to barca_readonly using (true);
