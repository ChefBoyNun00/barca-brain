import { z } from "zod";
import { SCOOP_JOURNALISTS, type FeedKind } from "@/config/news";
import {
  NEWS_CATEGORIES,
  NEWS_CERTAINTIES,
  type NewsArticle,
  type NewsBriefing,
  type NewsMedia,
} from "@/domain/news";
import type { Db } from "../client";

const ArticleRowSchema = z.object({
  id: z.string(),
  url: z.string(),
  outlet: z.string(),
  press_side: z.enum(["barcelona", "madrid", "national", "english", "official"]),
  title_original: z.string(),
  snippet_original: z.string().nullable(),
  published_at: z.coerce.date(),
  title_en: z.string().nullable(),
  summary_en: z.string().nullable(),
  category: z.enum(NEWS_CATEGORIES).nullable(),
  certainty: z.enum(NEWS_CERTAINTIES).nullable(),
  topic: z.string().nullable(),
  player_names: z.array(z.string()),
  language: z.enum(["es", "en"]),
  scoop_by: z.enum(SCOOP_JOURNALISTS.map((journalist) => journalist.id)).nullable(),
});

const ARTICLE_COLUMNS = `id, url, outlet, press_side, title_original, snippet_original,
  published_at, title_en, summary_en, category, certainty, topic, player_names, language, scoop_by`;

const toArticles = (rows: unknown): NewsArticle[] =>
  z
    .array(ArticleRowSchema)
    .parse(rows)
    .map((row) => ({
      id: row.id,
      url: row.url,
      outlet: row.outlet,
      pressSide: row.press_side,
      titleOriginal: row.title_original,
      snippetOriginal: row.snippet_original,
      publishedAt: row.published_at,
      titleEn: row.title_en,
      summaryEn: row.summary_en,
      category: row.category,
      certainty: row.certainty,
      topic: row.topic,
      playerNames: row.player_names,
      language: row.language,
      scoopBy: row.scoop_by,
    }));

/** Newest first. Articles judged off-topic are left out, untranslated ones are kept. */
export async function getRecentArticles(db: Db, limit: number): Promise<NewsArticle[]> {
  const { rows } = await db.query(
    `select ${ARTICLE_COLUMNS} from news_articles
     where kind = 'article' and is_relevant is not false
     order by published_at desc
     limit $1`,
    [limit],
  );
  return toArticles(rows);
}

const escapeLike = (text: string) => text.replace(/[\\%_]/g, "\\$&");

/** Searches English and Spanish text, newest first. */
export async function searchArticles(
  db: Db,
  search: { query: string; days: number; limit: number },
): Promise<NewsArticle[]> {
  const { rows } = await db.query(
    `select ${ARTICLE_COLUMNS} from news_articles
     where kind = 'article' and is_relevant is not false
       and published_at > now() - make_interval(days => $2)
       and (title_en ilike $1 or summary_en ilike $1 or title_original ilike $1
            or array_to_string(player_names, ' ') ilike $1)
     order by published_at desc
     limit $3`,
    [`%${escapeLike(search.query)}%`, search.days, search.limit],
  );
  return toArticles(rows);
}

const MediaRowSchema = z.object({
  id: z.string(),
  url: z.string(),
  outlet: z.string(),
  title_original: z.string(),
  published_at: z.coerce.date(),
  video_id: z.string().nullable(),
  author: z.string().nullable(),
});

/** Club videos or fan threads, newest first. */
export async function getRecentMedia(
  db: Db,
  kind: Exclude<FeedKind, "article">,
  limit: number,
): Promise<NewsMedia[]> {
  const { rows } = await db.query(
    `select id, url, outlet, title_original, published_at, video_id, author from news_articles
     where kind = $1
     order by published_at desc
     limit $2`,
    [kind, limit],
  );
  return z
    .array(MediaRowSchema)
    .parse(rows)
    .map((row) => ({
      id: row.id,
      url: row.url,
      outlet: row.outlet,
      title: row.title_original,
      publishedAt: row.published_at,
      videoId: row.video_id,
      author: row.author,
    }));
}

const BriefingRowSchema = z.object({
  created_at: z.coerce.date(),
  headline: z.string(),
  bullets: z.array(z.object({ text: z.string(), topic: z.string().nullable() })),
  story_count: z.number(),
});

export async function getLatestBriefing(db: Db): Promise<NewsBriefing | null> {
  const { rows } = await db.query(
    `select created_at, headline, bullets, story_count from news_briefings
     order by created_at desc limit 1`,
  );
  const row = z.array(BriefingRowSchema).parse(rows)[0];
  if (!row) return null;
  return {
    createdAt: row.created_at,
    headline: row.headline,
    bullets: row.bullets,
    storyCount: row.story_count,
  };
}
