-- More than the Spanish press: English outlets, club videos and fan threads.
-- kind keeps them apart: only articles are translated and grouped into stories.
-- scoop_by marks stories that come from a named journalist, such as Fabrizio Romano.

alter table news_articles
  add column kind      text not null default 'article', -- 'article'|'video'|'fan'
  add column language  text not null default 'es',      -- 'es'|'en'
  add column scoop_by  text,
  add column video_id  text,
  add column author    text;

create index news_articles_kind_published_idx on news_articles (kind, published_at desc);
