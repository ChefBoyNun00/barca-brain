import {
  BARCA_KEYWORDS,
  BLOCKED_OUTLETS,
  NEWS_MAX_AGE_DAYS,
  OUTLET_SIDES,
  type NewsFeed,
} from "@/config/news";
import type { ArticleToStore } from "@/server/db/queries/news-writes";
import type { FeedArticle } from "@/server/providers/types";

const DAY_MS = 86_400_000;

/** Same words, same key, whatever the punctuation, accents or case. */
export function makeDedupeKey(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isWanted(article: FeedArticle, feed: NewsFeed, now: Date): boolean {
  const age = now.getTime() - article.publishedAt.getTime();
  if (age > NEWS_MAX_AGE_DAYS * DAY_MS) return false;
  if (BLOCKED_OUTLETS.has(article.outlet)) return false;
  if (feed.barcaOnly) return true;
  return BARCA_KEYWORDS.test(`${article.title} ${article.snippet ?? ""}`);
}

export function prepareArticles(
  articles: FeedArticle[],
  feed: NewsFeed,
  now: Date,
): ArticleToStore[] {
  return articles
    .filter((article) => isWanted(article, feed, now))
    .map((article) => ({
      ...article,
      dedupeKey: makeDedupeKey(article.title),
      pressSide: OUTLET_SIDES[article.outlet] ?? "national",
    }));
}
