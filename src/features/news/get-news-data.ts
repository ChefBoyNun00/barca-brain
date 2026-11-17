import {
  NEWS_EDITIONS,
  NEWS_PAGE_LIMIT,
  NEWS_PODCASTS_LIMIT,
  type NewsEdition,
} from "@/config/news";
import type { NewsArticle } from "@/domain/news";
import { getAppDatabase } from "@/server/db/app-database";
import {
  getLatestBriefing,
  getRecentArticles,
  getRecentMedia,
  getStoryWriteups,
} from "@/server/db/queries/news";
import { getSquad } from "@/server/db/queries/squad";
import { getCurrentTeamScope } from "@/server/db/team-scope";
import type { Db } from "@/server/db/client";
import { attachWriteups, groupStories, hasStoryPage, type NewsStory } from "./stories";

async function toStories(db: Db, articles: NewsArticle[]): Promise<NewsStory[]> {
  const grouped = groupStories(articles);
  const writeups = await getStoryWriteups(
    db,
    grouped.filter(hasStoryPage).map((story) => story.id),
  );
  return attachWriteups(grouped, writeups);
}

/**
 * Everything one edition of the news page shows. The Israeli edition also reads the world's
 * press, to say how big each story is abroad and what Israel has not picked up yet.
 * Each press is its own query, so Israel's fewer stories are never crowded out by the world's.
 */
export async function getNewsData(edition: NewsEdition = "world") {
  const db = getAppDatabase();
  const israel = edition === "israel";
  const [worldArticles, israelArticles, squad, podcasts, briefing] = await Promise.all([
    getRecentArticles(db, NEWS_PAGE_LIMIT, NEWS_EDITIONS.world),
    israel ? getRecentArticles(db, NEWS_PAGE_LIMIT, NEWS_EDITIONS.israel) : [],
    getSquad(db, getCurrentTeamScope()),
    israel ? getRecentMedia(db, "podcast", NEWS_PODCASTS_LIMIT, NEWS_EDITIONS.israel) : [],
    israel ? null : getLatestBriefing(db),
  ]);
  const [world, local] = await Promise.all([
    toStories(db, worldArticles),
    toStories(db, israelArticles),
  ]);
  return { now: new Date(), world, israel: local, squad, podcasts, briefing };
}
