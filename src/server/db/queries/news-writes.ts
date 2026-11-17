import { z } from "zod";
import type { FeedKind, NewsLanguage, PressSide, ScoopJournalist } from "@/config/news";
import { NEWS_CATCH_ALL_TOPICS, PRESS_SIDES, SCOOP_JOURNALISTS } from "@/config/news";
import type { BriefingBullet, BriefingText, WriteupText } from "@/domain/news";
import type { HebrewHeadline, HeadlineToTranslate, StorySource, Translation, WrittenStory } from "@/server/news/types";
import type { FeedArticle } from "@/server/providers/types";
import type { Db } from "../client";

export type ArticleToStore = FeedArticle & {
  dedupeKey: string;
  pressSide: PressSide;
  kind: FeedKind;
  language: NewsLanguage;
  scoopBy: ScoopJournalist | null;
};

/** Returns true when the article was new. Either unique column can reject a repeat. */
export async function insertArticle(db: Db, article: ArticleToStore): Promise<boolean> {
  const { rows } = await db.query(
    `insert into news_articles
       (url, dedupe_key, outlet, press_side, title_original, snippet_original, published_at,
        kind, language, scoop_by, video_id, author, audio_url, image_url)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     on conflict do nothing
     returning id`,
    [
      article.url,
      article.dedupeKey,
      article.outlet,
      article.pressSide,
      article.title,
      article.snippet,
      article.publishedAt,
      article.kind,
      article.language,
      article.scoopBy,
      article.videoId ?? null,
      article.author ?? null,
      article.audioUrl ?? null,
      article.imageUrl ?? null,
    ],
  );
  if (rows.length > 0) return true;
  // Already stored: still give it the feed's photo if it has none yet (rows saved before the
  // photo column existed, or a feed that added the photo later). Never replaces a photo.
  if (article.imageUrl) {
    await db.query(
      `update news_articles set image_url = $2 where url = $1 and image_url is null`,
      [article.url, article.imageUrl],
    );
  }
  return false;
}

const UntranslatedSchema = z.array(
  z.object({
    id: z.string(),
    outlet: z.string(),
    title_original: z.string(),
    snippet_original: z.string().nullable(),
  }),
);

export async function getUntranslatedArticles(db: Db, maxAgeDays: number, limit: number) {
  const { rows } = await db.query(
    `select id, outlet, title_original, snippet_original from news_articles
     where kind = 'article' and translated_at is null
       and published_at > now() - make_interval(days => $1)
     order by published_at desc
     limit $2`,
    [maxAgeDays, limit],
  );
  return UntranslatedSchema.parse(rows).map((row) => ({
    id: row.id,
    outlet: row.outlet,
    title: row.title_original,
    snippet: row.snippet_original,
  }));
}

export async function saveTranslation(db: Db, translation: Translation): Promise<void> {
  await db.query(
    `update news_articles set
       is_relevant = $2, title_en = $3, summary_en = $4, category = $5, certainty = $6,
       topic = $7, player_names = $8, translated_at = now()
     where id = $1`,
    [
      translation.id,
      translation.relevant,
      translation.titleEn,
      translation.summaryEn,
      translation.category,
      translation.certainty,
      translation.topic,
      translation.players,
    ],
  );
}

/** Topics in recent use, so the same story keeps the same label across runs. */
export async function getRecentTopics(db: Db, days: number, limit: number): Promise<string[]> {
  const { rows } = await db.query(
    `select topic from news_articles
     where topic is not null and published_at > now() - make_interval(days => $1)
     group by topic
     order by max(published_at) desc
     limit $2`,
    [days, limit],
  );
  return z
    .array(z.object({ topic: z.string() }))
    .parse(rows)
    .map((row) => row.topic);
}

export async function getSquadNames(db: Db, season: number): Promise<string[]> {
  const { rows } = await db.query(
    `select distinct p.name from players p
     join squad_memberships m on m.player_id = p.id
     where m.season = $1
     order by p.name`,
    [season],
  );
  return z
    .array(z.object({ name: z.string() }))
    .parse(rows)
    .map((row) => row.name);
}

const StoryForBriefingSchema = z.array(
  z.object({
    topic: z.string().nullable(),
    title_en: z.string(),
    summary_en: z.string().nullable(),
    outlet: z.string(),
    certainty: z.string().nullable(),
  }),
);

export async function getStoriesForBriefing(db: Db, windowHours: number, limit: number) {
  const { rows } = await db.query(
    `select topic, title_en, summary_en, outlet, certainty from news_articles
     where is_relevant and title_en is not null
       and published_at > now() - make_interval(hours => $1)
     order by published_at desc
     limit $2`,
    [windowHours, limit],
  );
  return StoryForBriefingSchema.parse(rows).map((row) => ({
    topic: row.topic,
    title: row.title_en,
    summary: row.summary_en,
    outlet: row.outlet,
    certainty: row.certainty,
  }));
}

export async function getHoursSinceBriefing(db: Db): Promise<number | null> {
  const { rows } = await db.query(
    `select extract(epoch from now() - max(created_at)) / 3600 as hours from news_briefings`,
  );
  const schema = z.array(z.object({ hours: z.coerce.number().nullable() }));
  return schema.parse(rows)[0]?.hours ?? null;
}

export async function saveBriefing(
  db: Db,
  briefing: { headline: string; bullets: BriefingBullet[]; storyCount: number },
): Promise<void> {
  await db.query(`insert into news_briefings (headline, bullets, story_count) values ($1, $2, $3)`, [
    briefing.headline,
    JSON.stringify(briefing.bullets),
    briefing.storyCount,
  ]);
}

const TopicToWriteSchema = z.array(
  z.object({ topic: z.string(), coverage: z.number(), latest: z.coerce.date() }),
);

/**
 * Stories with no write-up yet, or with more coverage than they were written from.
 * The biggest go first, so a capped run spends its budget where most outlets are.
 */
export async function getTopicsToWrite(db: Db, days: number, limit: number) {
  const { rows } = await db.query(
    `select a.topic, count(*)::int as coverage, max(a.published_at) as latest
     from news_articles a
     left join news_stories s on s.topic = a.topic
     where a.kind = 'article' and a.is_relevant and a.topic is not null
       and a.topic <> all($3::text[])
       and a.published_at > now() - make_interval(days => $1)
     group by a.topic, s.article_count
     having s.article_count is null or s.article_count < count(*)
     order by count(*) desc, max(a.published_at) desc
     limit $2`,
    [days, limit, NEWS_CATCH_ALL_TOPICS],
  );
  return TopicToWriteSchema.parse(rows);
}

const StorySourceRowSchema = z.object({
  outlet: z.string(),
  // From the one list in config, so a new side (Israel was missed here) can never be refused.
  press_side: z.enum(PRESS_SIDES),
  published_at: z.coerce.date(),
  title_en: z.string(),
  summary_en: z.string().nullable(),
  title_original: z.string(),
  snippet_original: z.string().nullable(),
  certainty: z.string().nullable(),
  scoop_by: z.enum(SCOOP_JOURNALISTS.map((journalist) => journalist.id)).nullable(),
});

export async function getStorySources(
  db: Db,
  topic: string,
  limit: number,
): Promise<StorySource[]> {
  const { rows } = await db.query(
    `select outlet, press_side, published_at, title_en, summary_en, title_original,
            snippet_original, certainty, scoop_by
     from news_articles
     where kind = 'article' and is_relevant and topic = $1 and title_en is not null
     order by published_at desc
     limit $2`,
    [topic, limit],
  );
  return z
    .array(StorySourceRowSchema)
    .parse(rows)
    .map((row) => ({
      outlet: row.outlet,
      pressSide: row.press_side,
      publishedAt: row.published_at.toISOString(),
      headline: row.title_en,
      summary: row.summary_en,
      originalHeadline: row.title_original,
      originalSnippet: row.snippet_original,
      certainty: row.certainty,
      scoopBy: row.scoop_by,
    }));
}

export async function saveStory(
  db: Db,
  story: WrittenStory & { topic: string; articleCount: number; latestArticleAt: Date },
): Promise<void> {
  await db.query(
    `insert into news_stories
       (topic, headline, standfirst, body, key_facts, quotes, whats_next, certainty,
        article_count, latest_article_at, written_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
     on conflict (topic) do update set
       headline = excluded.headline, standfirst = excluded.standfirst, body = excluded.body,
       key_facts = excluded.key_facts, quotes = excluded.quotes,
       whats_next = excluded.whats_next, certainty = excluded.certainty,
       article_count = excluded.article_count, latest_article_at = excluded.latest_article_at,
       written_at = now(), hebrew = null`,
    [
      story.topic,
      story.headline,
      story.standfirst,
      story.body,
      story.keyFacts,
      JSON.stringify(story.quotes),
      story.whatsNext,
      story.certainty,
      story.articleCount,
      story.latestArticleAt,
    ],
  );
}

export async function deleteOldNews(db: Db, keepDays: number): Promise<void> {
  await db.query(`delete from news_articles where published_at < now() - make_interval(days => $1)`, [
    keepDays,
  ]);
  await db.query(`delete from news_briefings where created_at < now() - make_interval(days => $1)`, [
    keepDays,
  ]);
  await db.query(
    `delete from news_stories where latest_article_at < now() - make_interval(days => $1)`,
    [keepDays],
  );
}

// ---------- Hebrew, for readers in Israel ----------

/**
 * Israeli outlets already write in Hebrew, so their own headline and snippet are the Hebrew text:
 * no translation needed. Returns how many articles it filled.
 */
export async function copyHebrewOriginals(db: Db): Promise<number> {
  const { rows } = await db.query(
    `update news_articles set title_he = title_original, summary_he = snippet_original
     where kind = 'article' and language = 'he' and title_he is null
     returning id`,
  );
  return rows.length;
}

const HeadlineRowSchema = z.array(
  z.object({ id: z.string(), title_en: z.string(), summary_en: z.string().nullable() }),
);

/** Translated, relevant articles from outside Israel that have no Hebrew yet, newest first. */
export async function getArticlesWithoutHebrew(
  db: Db,
  maxAgeDays: number,
  limit: number,
): Promise<HeadlineToTranslate[]> {
  const { rows } = await db.query(
    `select id, title_en, summary_en from news_articles
     where kind = 'article' and is_relevant and title_en is not null and title_he is null
       and language <> 'he' and published_at > now() - make_interval(days => $1)
     order by published_at desc
     limit $2`,
    [maxAgeDays, limit],
  );
  return HeadlineRowSchema.parse(rows).map((row) => ({
    id: row.id,
    title: row.title_en,
    summary: row.summary_en,
  }));
}

export async function saveHebrewHeadline(db: Db, headline: HebrewHeadline): Promise<void> {
  await db.query(`update news_articles set title_he = $2, summary_he = $3 where id = $1`, [
    headline.id,
    headline.titleHe,
    headline.summaryHe,
  ]);
}

const StoryTextRowSchema = z.array(
  z.object({
    topic: z.string(),
    headline: z.string(),
    standfirst: z.string(),
    body: z.array(z.string()),
    key_facts: z.array(z.string()),
    quotes: z.array(z.object({ text: z.string(), speaker: z.string(), outlet: z.string() })),
    whats_next: z.string().nullable(),
  }),
);

/** Write-ups with no Hebrew yet (new, or rewritten since), the most recent first. */
export async function getStoriesWithoutHebrew(
  db: Db,
  limit: number,
): Promise<Array<WriteupText & { topic: string }>> {
  const { rows } = await db.query(
    `select topic, headline, standfirst, body, key_facts, quotes, whats_next from news_stories
     where hebrew is null
     order by latest_article_at desc
     limit $1`,
    [limit],
  );
  return StoryTextRowSchema.parse(rows).map((row) => ({
    topic: row.topic,
    headline: row.headline,
    standfirst: row.standfirst,
    body: row.body,
    keyFacts: row.key_facts,
    quotes: row.quotes,
    whatsNext: row.whats_next,
  }));
}

/**
 * Saves a story's Hebrew, but only onto the English it was translated from: if the story was
 * rewritten in between, the headline differs and nothing is saved, so it is retried next run.
 */
export async function saveStoryHebrew(
  db: Db,
  story: { topic: string; englishHeadline: string; hebrew: WriteupText },
): Promise<void> {
  await db.query(`update news_stories set hebrew = $3 where topic = $1 and headline = $2`, [
    story.topic,
    story.englishHeadline,
    JSON.stringify(story.hebrew),
  ]);
}

const BriefingTextRowSchema = z.array(
  z.object({
    id: z.string(),
    headline: z.string(),
    bullets: z.array(z.object({ text: z.string(), topic: z.string().nullable() })),
  }),
);

/** The latest briefing, if it has no Hebrew yet. Older briefings are never shown, so never translated. */
export async function getBriefingWithoutHebrew(
  db: Db,
): Promise<(BriefingText & { id: string }) | null> {
  const { rows } = await db.query(
    `select id, headline, bullets from news_briefings
     where hebrew is null and created_at = (select max(created_at) from news_briefings)`,
  );
  return BriefingTextRowSchema.parse(rows)[0] ?? null;
}

export async function saveBriefingHebrew(db: Db, id: string, hebrew: BriefingText): Promise<void> {
  await db.query(`update news_briefings set hebrew = $2 where id = $1`, [id, JSON.stringify(hebrew)]);
}
