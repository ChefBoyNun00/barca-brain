import { NEWS_CATCH_ALL_TOPICS, type PressSide, type ScoopJournalist } from "@/config/news";
import type { NewsArticle, NewsCategory, NewsCertainty, StoryWriteup } from "@/domain/news";

/** One real-world story, however many outlets covered it. */
export type Story = {
  id: string;
  lead: NewsArticle;
  coverage: NewsArticle[];
  outlets: string[];
  sides: PressSide[];
  players: string[];
  latestAt: Date;
};

const CERTAINTY_ORDER: NewsCertainty[] = ["official", "reported", "news", "opinion", "rumour"];

const firmness = (article: NewsArticle) => {
  const position = article.certainty ? CERTAINTY_ORDER.indexOf(article.certainty) : -1;
  return position === -1 ? CERTAINTY_ORDER.length : position;
};

/** The headline shown is the firmest report, then the one with the most detail. */
function pickLead(articles: NewsArticle[]): NewsArticle {
  return [...articles].sort(
    (a, b) =>
      firmness(a) - firmness(b) ||
      Number(Boolean(b.summaryEn)) - Number(Boolean(a.summaryEn)) ||
      b.publishedAt.getTime() - a.publishedAt.getTime(),
  )[0]!;
}

/** The model can still reach for a catch-all, which must not merge unrelated stories. */
const CATCH_ALL_TOPICS = new Set(NEWS_CATCH_ALL_TOPICS);

const unique = <T>(items: T[]) => [...new Set(items)];

/** Articles arrive newest first. Untranslated ones have no topic, so each stands alone. */
export function groupStories(articles: NewsArticle[]): Story[] {
  const groups = new Map<string, NewsArticle[]>();
  for (const article of articles) {
    const key = article.topic && !CATCH_ALL_TOPICS.has(article.topic) ? article.topic : article.id;
    groups.set(key, [...(groups.get(key) ?? []), article]);
  }
  return [...groups.entries()]
    .map(([id, coverage]) => ({
      id,
      lead: pickLead(coverage),
      coverage,
      outlets: unique(coverage.map((article) => article.outlet)),
      sides: unique(coverage.map((article) => article.pressSide)),
      players: unique(coverage.flatMap((article) => article.playerNames)),
      latestAt: new Date(Math.max(...coverage.map((article) => article.publishedAt.getTime()))),
    }))
    .sort((a, b) => b.latestAt.getTime() - a.latestAt.getTime());
}

/** Both cities on one story is worth flagging, because they read it differently. */
export const isCoveredByBothCities = (story: Story) =>
  story.sides.includes("barcelona") && story.sides.includes("madrid");

export type SideFilter = "all" | "barcelona" | "madrid" | "english" | "both";
export type CategoryFilter = "all" | NewsCategory;

export function filterStories<S extends Story>(
  stories: S[],
  filters: { category: CategoryFilter; side: SideFilter },
): S[] {
  return stories.filter((story) => {
    if (filters.category !== "all") {
      if (!story.coverage.some((article) => article.category === filters.category)) return false;
    }
    if (filters.side === "both") return isCoveredByBothCities(story);
    return filters.side === "all" || story.sides.includes(filters.side);
  });
}

/** Stories that mention a player, for their card. */
export const findPlayerStories = (stories: Story[], playerName: string, limit: number) =>
  stories.filter((story) => story.players.includes(playerName)).slice(0, limit);

const MINUTE_MS = 60_000;

export function formatStoryAge(date: Date, now: Date): string {
  const minutes = Math.max(0, Math.round((now.getTime() - date.getTime()) / MINUTE_MS));
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export type StoryTopic = NewsCategory;

/** The row a story sits in. Untranslated stories have no category yet, so they go under "other". */
export const topicOf = (story: Story): StoryTopic => story.lead.category ?? "other";

/** The top story: the one most outlets are running, among the freshest, then the newest. */
export function pickHero<S extends Story>(stories: S[], freshest = 10): S | null {
  return (
    [...stories.slice(0, freshest)].sort(
      (a, b) => b.outlets.length - a.outlets.length || b.latestAt.getTime() - a.latestAt.getTime(),
    )[0] ?? null
  );
}

/** A story with its full write-up, once Claude has written one. */
export type NewsStory = Story & { writeup: StoryWriteup | null };

export function attachWriteups(stories: Story[], writeups: StoryWriteup[]): NewsStory[] {
  const byTopic = new Map(writeups.map((writeup) => [writeup.topic, writeup]));
  return stories.map((story) => ({ ...story, writeup: byTopic.get(story.id) ?? null }));
}

/** Only stories grouped under a real topic have a page of their own. */
export const hasStoryPage = (story: Story) => story.lead.topic === story.id;

export const headlineOf = (story: NewsStory) =>
  story.writeup?.headline ?? story.lead.titleEn ?? story.lead.titleOriginal;

export const standfirstOf = (story: NewsStory) =>
  story.writeup?.standfirst ?? story.lead.summaryEn;

export const certaintyOf = (story: NewsStory): NewsCertainty | null =>
  story.writeup?.certainty ?? story.lead.certainty;

/** The journalist whose reporting a story carries, if any outlet credits one. */
export const scoopOf = (story: Story): ScoopJournalist | null =>
  story.coverage.find((article) => article.scoopBy)?.scoopBy ?? null;

/** Still waiting for translation, and not already in English. */
export const isUntranslated = (story: Story) =>
  story.lead.titleEn === null && story.lead.language !== "en";

/**
 * How close a deal is, as four steps: talk, a firm report, a named insider, done.
 * Opinion and plain news sit at the first step, because neither moves a deal on.
 */
export type MeterStep = 1 | 2 | 3 | 4;

export function meterStepOf(story: NewsStory): MeterStep {
  const certainty = certaintyOf(story);
  if (certainty === "official") return 4;
  if (scoopOf(story) && certainty === "reported") return 3;
  if (certainty === "reported") return 2;
  return 1;
}

const HOUR_MS = 3_600_000;

export const isBreaking = (story: Story, now: Date, hours: number) =>
  now.getTime() - story.latestAt.getTime() < hours * HOUR_MS;
