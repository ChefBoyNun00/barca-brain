import {
  NEWS_CATCH_ALL_TOPICS,
  NEWS_HEAT_HALF_LIFE_HOURS,
  NEWS_LEAD_CANDIDATES,
  type PressSide,
  type ScoopJournalist,
} from "@/config/news";
import type {
  NewsArticle,
  NewsCategory,
  NewsCertainty,
  StoryWriteup,
} from "@/domain/news";
import { translate, type Language } from "@/i18n/dictionary";

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

const CERTAINTY_ORDER: NewsCertainty[] = [
  "official",
  "reported",
  "news",
  "opinion",
  "rumour",
];

const firmness = (article: NewsArticle) => {
  const position = article.certainty
    ? CERTAINTY_ORDER.indexOf(article.certainty)
    : -1;
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
    const key =
      article.topic && !CATCH_ALL_TOPICS.has(article.topic)
        ? article.topic
        : article.id;
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
      latestAt: new Date(
        Math.max(...coverage.map((article) => article.publishedAt.getTime())),
      ),
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
      if (
        !story.coverage.some((article) => article.category === filters.category)
      )
        return false;
    }
    if (filters.side === "both") return isCoveredByBothCities(story);
    return filters.side === "all" || story.sides.includes(filters.side);
  });
}

/** Stories that mention a player, for their card. */
export const findPlayerStories = (
  stories: Story[],
  playerName: string,
  limit: number,
) =>
  stories.filter((story) => story.players.includes(playerName)).slice(0, limit);

const MINUTE_MS = 60_000;

export function formatStoryAge(
  date: Date,
  now: Date,
  language: Language = "en",
): string {
  const minutes = Math.max(
    0,
    Math.round((now.getTime() - date.getTime()) / MINUTE_MS),
  );
  if (minutes < 60)
    return translate(language, "age.minutes", { n: Math.max(minutes, 1) });
  const hours = Math.round(minutes / 60);
  if (hours < 24) return translate(language, "age.hours", { n: hours });
  const days = Math.round(hours / 24);
  return days === 1
    ? translate(language, "age.day")
    : translate(language, "age.days", { n: days });
}

export type StoryTopic = NewsCategory;

/** The row a story sits in. Untranslated stories have no category yet, so they go under "other". */
export const topicOf = (story: Story): StoryTopic =>
  story.lead.category ?? "other";

/** The top story: the one most outlets are running, among the freshest, then the newest. */
export function pickHero<S extends Story>(
  stories: S[],
  freshest = 10,
): S | null {
  return (
    [...stories.slice(0, freshest)].sort(
      (a, b) =>
        b.outlets.length - a.outlets.length ||
        b.latestAt.getTime() - a.latestAt.getTime(),
    )[0] ?? null
  );
}

/** A story with its full write-up, once Claude has written one. */
export type NewsStory = Story & { writeup: StoryWriteup | null };

export function attachWriteups(
  stories: Story[],
  writeups: StoryWriteup[],
): NewsStory[] {
  const byTopic = new Map(writeups.map((writeup) => [writeup.topic, writeup]));
  return stories.map((story) => ({
    ...story,
    writeup: byTopic.get(story.id) ?? null,
  }));
}

/** Only stories grouped under a real topic have a page of their own. */
export const hasStoryPage = (story: Story) => story.lead.topic === story.id;

/** A story's photo and whose it is: the lead article's own, else the newest one any outlet ran. */
export type StoryPhoto = { url: string; outlet: string };

export function photoOf(story: Story): StoryPhoto | null {
  const withPhoto = [story.lead, ...story.coverage].find(
    (article) => article.imageUrl,
  );
  return withPhoto?.imageUrl
    ? { url: withPhoto.imageUrl, outlet: withPhoto.outlet }
    : null;
}

export const headlineOf = (story: NewsStory) =>
  story.writeup?.headline ?? story.lead.titleEn ?? story.lead.titleOriginal;

export const standfirstOf = (story: NewsStory) =>
  story.writeup?.standfirst ?? story.lead.summaryEn;

/**
 * For a Hebrew reader, the best Hebrew there is: our Hebrew write-up, else an Israeli outlet's own
 * headline, else the lead's translated headline. Null when the story has no Hebrew yet.
 */
export const hebrewHeadlineOf = (story: NewsStory): string | null =>
  story.writeup?.hebrew?.headline ??
  coverageIn(story, "he")?.titleOriginal ??
  story.lead.titleHe ??
  null;

/** The Hebrew summary under the headline, chosen the same way. */
export const hebrewStandfirstOf = (story: NewsStory): string | null =>
  story.writeup?.hebrew?.standfirst ??
  coverageIn(story, "he")?.snippetOriginal ??
  story.lead.summaryHe ??
  null;

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

/** The newest coverage written in this language, if any outlet covered the story in it. */
export const coverageIn = (story: Story, language: NewsArticle["language"]) =>
  story.coverage.find((article) => article.language === language) ?? null;

/**
 * How hot a story is: the outlets running it, halved for every half-life since the latest one.
 * A story ten outlets ran this morning beats one twelve outlets ran two days ago.
 */
export function heatOf(story: Story, now: Date, halfLifeHours: number): number {
  const hours = Math.max(0, now.getTime() - story.latestAt.getTime()) / HOUR_MS;
  return story.outlets.length * 0.5 ** (hours / halfLifeHours);
}

/** Hottest first. Ties go to the newer story. */
export function rankByHeat<S extends Story>(
  stories: S[],
  now: Date,
  halfLifeHours: number,
): S[] {
  return [...stories].sort(
    (a, b) =>
      heatOf(b, now, halfLifeHours) - heatOf(a, now, halfLifeHours) ||
      b.latestAt.getTime() - a.latestAt.getTime(),
  );
}

/** One city's take on a story: its newest headline from that city's press. */
export type CityTake = {
  outlet: string;
  headline: string;
  language: NewsArticle["language"];
};

const takeFrom = (story: Story, side: PressSide): CityTake | null => {
  const article = story.coverage.find((item) => item.pressSide === side);
  if (!article) return null;
  return {
    outlet: article.outlet,
    headline: article.titleEn ?? article.titleOriginal,
    language: article.titleEn ? "en" : article.language,
  };
};

/** The same story as Barcelona's press and Madrid's press tell it, hottest first. */
export function spinsOf<S extends Story>(ranked: S[], limit: number) {
  return ranked
    .flatMap((story) => {
      const barcelona = takeFrom(story, "barcelona");
      const madrid = takeFrom(story, "madrid");
      return barcelona && madrid ? [{ story, barcelona, madrid }] : [];
    })
    .slice(0, limit);
}

/**
 * The world story an Israeli story matches: the same topic label, or, since two batches can
 * label one story differently, the same kind of story about the same player.
 */
export function findAbroad<S extends Story>(
  story: Story,
  world: S[],
): S | null {
  const sameTopic = world.find((other) => other.id === story.id);
  if (sameTopic) return sameTopic;
  if (story.players.length === 0) return null;
  return (
    world.find(
      (other) =>
        topicOf(other) === topicOf(story) &&
        other.players.some((player) => story.players.includes(player)),
    ) ?? null
  );
}

/** Big stories abroad that no Israeli outlet has picked up yet, hottest first. */
export function notYetIn<S extends Story>(
  rankedWorld: S[],
  local: Story[],
  limit: number,
): S[] {
  return rankedWorld
    .filter(hasStoryPage)
    .filter((story) => story.outlets.length > 1)
    .filter((story) => !local.some((mine) => findAbroad(mine, [story])))
    .slice(0, limit);
}

/** A lead should be news, not someone's view or a whisper. */
const isFirmNews = (story: NewsStory) => {
  const certainty = certaintyOf(story);
  return certainty !== "opinion" && certainty !== "rumour";
};

/**
 * Most important first, and only stories we can show properly: one still waiting for its
 * translation would appear half in Spanish, so it waits for the next run instead. The lead is
 * the most important firm news story with a photo among the top few; failing that, firm news
 * without a photo; failing that, simply the most important story.
 */
export function orderForReader(
  stories: NewsStory[],
  now: Date,
  limit: number,
): NewsStory[] {
  const ranked = rankByHeat(
    stories.filter((story) => !isUntranslated(story)),
    now,
    NEWS_HEAT_HALF_LIFE_HOURS,
  ).slice(0, limit);
  const top = ranked.slice(0, NEWS_LEAD_CANDIDATES);
  const lead =
    top.find((story) => isFirmNews(story) && photoOf(story)) ??
    top.find(isFirmNews) ??
    ranked[0];
  if (!lead) return ranked;
  return [lead, ...ranked.filter((story) => story !== lead)];
}
