import { NEWS_PAGE_LIMIT } from "@/config/news";
import { getAppDatabase } from "@/server/db/app-database";
import { getLatestBriefing, getRecentArticles } from "@/server/db/queries/news";
import { getSquad } from "@/server/db/queries/squad";
import { getCurrentTeamScope } from "@/server/db/team-scope";
import { groupStories } from "./stories";

export async function getNewsData() {
  const db = getAppDatabase();
  const [articles, briefing, squad] = await Promise.all([
    getRecentArticles(db, NEWS_PAGE_LIMIT),
    getLatestBriefing(db),
    getSquad(db, getCurrentTeamScope()),
  ]);
  return { now: new Date(), stories: groupStories(articles), briefing, squad };
}
