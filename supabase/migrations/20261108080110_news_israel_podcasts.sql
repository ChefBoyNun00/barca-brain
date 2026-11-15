-- The Israeli press and Israeli Barça podcasts.
-- press_side gains 'israel', language gains 'he', and kind gains 'podcast'. Those are plain text
-- columns, so only the podcast's audio file needs a new column.

alter table news_articles
  add column audio_url text; -- podcasts only: the episode's audio file

-- Country choice on the news page filters by press side, newest first.
create index news_articles_side_published_idx on news_articles (press_side, published_at desc);
