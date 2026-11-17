-- The photo each outlet attaches to its article in its feed, so the news page can show this
-- season's pictures instead of older free-licensed ones. Only ever a web address (http/https),
-- checked by the feed mapper before it is stored. Null when the feed gave no usable photo.
-- The read-only role already selects every column of news_articles, so no new grant is needed.

alter table news_articles
  add column image_url text;
