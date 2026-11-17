import {
  BARCA_KEYWORDS,
  BLOCKED_OUTLETS,
  FAN_THREAD_SKIP,
  NEWS_MAX_AGE_DAYS,
  NOT_FOOTBALL_HE,
  OUTLET_SIDES,
  PODCAST_MAX_AGE_DAYS,
  SCOOP_JOURNALISTS,
  type NewsFeed,
  type PressSide,
  type ScoopJournalist,
} from "@/config/news";
import type { ArticleToStore } from "@/server/db/queries/news-writes";
import type { FeedArticle } from "@/server/providers/types";

const DAY_MS = 86_400_000;

/**
 * Same words, same key, whatever the punctuation, accents or case.
 * Hebrew letters (א–ת) are kept: before they were, every Hebrew headline shrank to almost
 * nothing, collided with the first one stored, and was dropped as a "repeat".
 */
export function makeDedupeKey(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9א-ת]+/g, " ")
    .trim();
}

function isWanted(article: FeedArticle, feed: NewsFeed, now: Date): boolean {
  const age = now.getTime() - article.publishedAt.getTime();
  const maxAgeDays = feed.kind === "podcast" ? PODCAST_MAX_AGE_DAYS : NEWS_MAX_AGE_DAYS;
  if (age > maxAgeDays * DAY_MS) return false;
  if (feed.kind === "podcast" && !article.audioUrl) return false;
  if (BLOCKED_OUTLETS.has(article.outlet)) return false;
  if (feed.kind === "fan" && FAN_THREAD_SKIP.test(article.title)) return false;
  if (feed.skip?.test(article.title)) return false;
  const text = `${article.title} ${article.snippet ?? ""}`;
  if (feed.language === "he" && NOT_FOOTBALL_HE.test(text)) return false;
  if (feed.barcaOnly) return true;
  return BARCA_KEYWORDS.test(text);
}

/** The journalist a story comes from, when the headline or summary names one. */
export function findScoop(text: string): ScoopJournalist | null {
  return SCOOP_JOURNALISTS.find((journalist) => journalist.pattern.test(text))?.id ?? null;
}

const SIDE_BY_LANGUAGE: Record<NewsFeed["language"], PressSide> = {
  es: "national",
  en: "english",
  he: "israel",
};

function sideOf(outlet: string, feed: NewsFeed): PressSide {
  if (feed.kind === "video") return "official";
  return OUTLET_SIDES[outlet] ?? SIDE_BY_LANGUAGE[feed.language];
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
      pressSide: sideOf(article.outlet, feed),
      kind: feed.kind,
      language: feed.language,
      scoopBy:
        feed.kind === "article"
          ? (feed.scoopBy ?? findScoop(`${article.title} ${article.snippet ?? ""}`))
          : null,
    }));
}
