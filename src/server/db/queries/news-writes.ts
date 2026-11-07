import { z } from "zod";
import type { PressSide } from "@/config/news";
import type { BriefingBullet } from "@/domain/news";
import type { Translation } from "@/server/news/types";
import type { FeedArticle } from "@/server/providers/types";
import type { Db } from "../client";

export type ArticleToStore = FeedArticle & { dedupeKey: string; pressSide: PressSide };

/** Returns true when the article was new. Either unique column can reject a repeat. */
export async function insertArticle(db: Db, article: ArticleToStore): Promise<boolean> {
  const { rows } = await db.query(
    `insert into news_articles
       (url, dedupe_key, outlet, press_side, title_original, snippet_original, published_at)
     values ($1, $2, $3, $4, $5, $6, $7)
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
    ],
  );
  return rows.length > 0;
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
     where translated_at is null and published_at > now() - make_interval(days => $1)
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

export async function deleteOldNews(db: Db, keepDays: number): Promise<void> {
  await db.query(`delete from news_articles where published_at < now() - make_interval(days => $1)`, [
    keepDays,
  ]);
  await db.query(`delete from news_briefings where created_at < now() - make_interval(days => $1)`, [
    keepDays,
  ]);
}
