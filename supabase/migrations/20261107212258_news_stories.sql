-- One full write-up per story, written by Claude from every outlet's coverage of it.
-- Keyed by topic, the label that groups articles about one story.
-- article_count is how much coverage it was written from: when more arrives, it is rewritten.

create table news_stories (
  topic              text primary key,
  headline           text not null,
  standfirst         text not null,
  body               text[] not null,
  key_facts          text[] not null default '{}',
  quotes             jsonb not null default '[]',  -- [{ text, speaker, outlet }]
  whats_next         text,
  certainty          text not null,                -- 'official'|'reported'|'rumour'|'opinion'|'news'
  article_count      int not null,
  latest_article_at  timestamptz not null,
  written_at         timestamptz not null default now()
);

create index news_stories_latest_idx on news_stories (latest_article_at desc);

-- New tables get none of the earlier setup, so each rule is repeated here.
revoke all on news_stories from anon, authenticated;
alter table news_stories enable row level security;

grant select on news_stories to barca_readonly;
create policy readonly_select on news_stories for select to barca_readonly using (true);
