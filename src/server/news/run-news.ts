import { CURRENT_SEASON } from "@/config/football";
import {
  BRIEFING_EVERY_HOURS,
  BRIEFING_MAX_STORIES,
  BRIEFING_MIN_STORIES,
  BRIEFING_WINDOW_HOURS,
  HEBREW_BATCH_SIZE,
  HEBREW_HEADLINES_PER_RUN,
  HEBREW_STORIES_PER_RUN,
  NEWS_KEEP_DAYS,
  NEWS_MAX_AGE_DAYS,
  NEWS_RECENT_TOPICS_LIMIT,
  NEWS_STORIES_PER_RUN,
  NEWS_STORY_SOURCES_LIMIT,
  NEWS_TRANSLATE_BATCH_SIZE,
  NEWS_TRANSLATE_PER_RUN,
  type NewsFeed,
} from "@/config/news";
import type { Db } from "@/server/db/client";
import {
  copyHebrewOriginals,
  deleteOldNews,
  getArticlesWithoutHebrew,
  getBriefingWithoutHebrew,
  getHoursSinceBriefing,
  getRecentTopics,
  getSquadNames,
  getStoriesForBriefing,
  getStoriesWithoutHebrew,
  getStorySources,
  getTopicsToWrite,
  getUntranslatedArticles,
  insertArticle,
  saveBriefing,
  saveBriefingHebrew,
  saveHebrewHeadline,
  saveStory,
  saveStoryHebrew,
  saveTranslation,
} from "@/server/db/queries/news-writes";
import type { NewsProvider } from "@/server/providers/types";
import { prepareArticles } from "./prepare";
import type { NewsAi } from "./types";

export type FeedResult = { feed: string; found: number; added: number; error?: string };

export type NewsRunResult = {
  status: "success" | "failed";
  feeds: FeedResult[];
  translated: number;
  translationErrors: string[];
  storiesWritten: number;
  storyErrors: string[];
  briefing: "written" | "not needed" | "skipped" | "failed";
  /** The Hebrew pass: how many headlines and stories got their Hebrew this run. */
  hebrew: { copied: number; headlines: number; stories: number; briefing: boolean; errors: string[] };
};

type NewsDeps = {
  db: Db;
  provider: NewsProvider;
  /** Null when no API key is set: headlines are still stored, in Spanish. */
  ai: NewsAi | null;
  feeds: NewsFeed[];
  now?: Date;
};

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

async function collectFeed(db: Db, provider: NewsProvider, feed: NewsFeed, now: Date) {
  try {
    const articles = prepareArticles(await provider.fetchFeed(feed), feed, now);
    let added = 0;
    for (const article of articles) {
      if (await insertArticle(db, article)) added += 1;
    }
    return { feed: feed.id, found: articles.length, added };
  } catch (error) {
    return { feed: feed.id, found: 0, added: 0, error: messageOf(error) };
  }
}

async function translateNew(db: Db, ai: NewsAi) {
  const pending = await getUntranslatedArticles(db, NEWS_MAX_AGE_DAYS, NEWS_TRANSLATE_PER_RUN);
  const squad = await getSquadNames(db, CURRENT_SEASON);
  const errors: string[] = [];
  let translated = 0;

  for (let start = 0; start < pending.length; start += NEWS_TRANSLATE_BATCH_SIZE) {
    const batch = pending.slice(start, start + NEWS_TRANSLATE_BATCH_SIZE);
    try {
      const topics = await getRecentTopics(db, NEWS_MAX_AGE_DAYS, NEWS_RECENT_TOPICS_LIMIT);
      const wanted = new Set(batch.map((article) => article.id));
      for (const translation of await ai.translate(batch, { squad, topics })) {
        // Anything the model returns outside the batch is ignored, not written.
        if (!wanted.has(translation.id)) continue;
        await saveTranslation(db, translation);
        translated += 1;
      }
    } catch (error) {
      // The batch stays untranslated, so the next run picks it up.
      errors.push(messageOf(error));
    }
  }
  return { translated, errors };
}

/** Each story is written on its own, so one failure leaves the rest, and it is retried next run. */
async function writeStories(db: Db, ai: NewsAi) {
  const topics = await getTopicsToWrite(db, NEWS_MAX_AGE_DAYS, NEWS_STORIES_PER_RUN);
  const errors: string[] = [];
  let written = 0;
  for (const { topic, coverage, latest } of topics) {
    try {
      const sources = await getStorySources(db, topic, NEWS_STORY_SOURCES_LIMIT);
      if (sources.length === 0) continue;
      const story = await ai.writeStory(topic, sources);
      // All the coverage counts, not only what was sent, so it is rewritten only when more arrives.
      await saveStory(db, { ...story, topic, articleCount: coverage, latestArticleAt: latest });
      written += 1;
    } catch (error) {
      errors.push(`${topic}: ${messageOf(error)}`);
    }
  }
  return { written, errors };
}

async function refreshBriefing(db: Db, ai: NewsAi): Promise<NewsRunResult["briefing"]> {
  const hoursSince = await getHoursSinceBriefing(db);
  if (hoursSince !== null && hoursSince < BRIEFING_EVERY_HOURS) return "not needed";

  const stories = await getStoriesForBriefing(db, BRIEFING_WINDOW_HOURS, BRIEFING_MAX_STORIES);
  if (stories.length < BRIEFING_MIN_STORIES) return "not needed";

  try {
    const briefing = await ai.writeBriefing(stories);
    await saveBriefing(db, { ...briefing, storyCount: stories.length });
    return "written";
  } catch {
    return "failed";
  }
}

/**
 * Hebrew for readers in Israel, after the English is done. Israeli outlets' own Hebrew is copied
 * as is; everything else is translated from our English. Every failure is kept for the next run:
 * an item without Hebrew is simply shown in English until then.
 */
async function writeHebrew(db: Db, ai: NewsAi | null): Promise<NewsRunResult["hebrew"]> {
  const result: NewsRunResult["hebrew"] = { copied: 0, headlines: 0, stories: 0, briefing: false, errors: [] };
  result.copied = await copyHebrewOriginals(db);
  if (!ai) return result;

  const pending = await getArticlesWithoutHebrew(db, NEWS_MAX_AGE_DAYS, HEBREW_HEADLINES_PER_RUN);
  for (let start = 0; start < pending.length; start += HEBREW_BATCH_SIZE) {
    const batch = pending.slice(start, start + HEBREW_BATCH_SIZE);
    try {
      const wanted = new Set(batch.map((headline) => headline.id));
      for (const headline of await ai.headlinesToHebrew(batch)) {
        if (!wanted.has(headline.id)) continue;
        await saveHebrewHeadline(db, headline);
        result.headlines += 1;
      }
    } catch (error) {
      result.errors.push(`headlines: ${messageOf(error)}`);
    }
  }

  for (const { topic, ...english } of await getStoriesWithoutHebrew(db, HEBREW_STORIES_PER_RUN)) {
    try {
      const hebrew = await ai.storyToHebrew(english);
      await saveStoryHebrew(db, { topic, englishHeadline: english.headline, hebrew });
      result.stories += 1;
    } catch (error) {
      result.errors.push(`${topic}: ${messageOf(error)}`);
    }
  }

  const briefing = await getBriefingWithoutHebrew(db);
  if (briefing) {
    try {
      const { id, ...english } = briefing;
      await saveBriefingHebrew(db, id, await ai.briefingToHebrew(english));
      result.briefing = true;
    } catch (error) {
      result.errors.push(`briefing: ${messageOf(error)}`);
    }
  }
  return result;
}

/** One feed failing never stops the others, and nothing here touches football data. */
export async function runNews({ db, provider, ai, feeds, now = new Date() }: NewsDeps) {
  const feedResults: FeedResult[] = [];
  for (const feed of feeds) feedResults.push(await collectFeed(db, provider, feed, now));

  const { translated, errors } = ai
    ? await translateNew(db, ai)
    : { translated: 0, errors: [] as string[] };
  const stories = ai
    ? await writeStories(db, ai)
    : { written: 0, errors: [] as string[] };
  const briefing = ai ? await refreshBriefing(db, ai) : "skipped";
  const hebrew = await writeHebrew(db, ai);
  await deleteOldNews(db, NEWS_KEEP_DAYS);

  const allFeedsFailed = feedResults.every((result) => result.error);
  const failed =
    allFeedsFailed ||
    errors.length > 0 ||
    stories.errors.length > 0 ||
    briefing === "failed";
  // Hebrew errors are reported but never fail the run: the item shows in English meanwhile, and
  // the next run (an hour later) retries it. A red job for that would only cry wolf.
  return {
    status: failed ? "failed" : "success",
    feeds: feedResults,
    translated,
    translationErrors: errors,
    storiesWritten: stories.written,
    storyErrors: stories.errors,
    briefing,
    hebrew,
  } satisfies NewsRunResult;
}
