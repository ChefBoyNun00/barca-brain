-- The news in Hebrew, for readers in Israel.
-- Every column is new and nullable: the English stays as it is, and a row without Hebrew yet is
-- shown in English until the next news run fills it. Nothing existing is changed or dropped.

-- Each article's headline and one-line summary in Hebrew. For Israeli outlets this is their own
-- Hebrew text; for the rest it is translated by Claude.
alter table news_articles
  add column title_he   text,
  add column summary_he text;

-- A story's full write-up in Hebrew, translated from the English one, in the same shape:
-- { headline, standfirst, body[], keyFacts[], quotes[{ text, speaker, outlet }], whatsNext }.
alter table news_stories
  add column hebrew jsonb;

-- The daily briefing in Hebrew: { headline, bullets[{ text, topic }] }.
alter table news_briefings
  add column hebrew jsonb;

-- The read-only role already has select on these tables; new columns are covered by that grant
-- and by the existing row-level-security policies, so no new rules are needed.
