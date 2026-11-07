import { NEWS_FAN_LIMIT, NEWS_PAGE_LIMIT, NEWS_VIDEOS_LIMIT } from "@/config/news";
import { getAppDatabase } from "@/server/db/app-database";
import {
  getLatestBriefing,
  getRecentArticles,
  getRecentMedia,
  getStoryWriteups,
} from "@/server/db/queries/news";
import { getSquad } from "@/server/db/queries/squad";
import { getCurrentTeamScope } from "@/server/db/team-scope";
import { attachWriteups, groupStories, hasStoryPage } from "./stories";

export async function getNewsData() {
  const db = getAppDatabase();
  const [articles, briefing, squad, videos, fans] = await Promise.all([
    getRecentArticles(db, NEWS_PAGE_LIMIT),
    getLatestBriefing(db),
    getSquad(db, getCurrentTeamScope()),
    getRecentMedia(db, "video", NEWS_VIDEOS_LIMIT),
    getRecentMedia(db, "fan", NEWS_FAN_LIMIT),
  ]);
  const grouped = groupStories(articles);
  const writeups = await getStoryWriteups(
    db,
    grouped.filter(hasStoryPage).map((story) => story.id),
  );
  return {
    now: new Date(),
    stories: attachWriteups(grouped, writeups),
    briefing,
    squad,
    videos,
    fans,
  };
}
