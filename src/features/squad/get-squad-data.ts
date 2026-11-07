import { NEWS_PAGE_LIMIT } from "@/config/news";
import { getAppDatabase } from "@/server/db/app-database";
import { getSeasonMatches } from "@/server/db/queries/home";
import { getRecentArticles } from "@/server/db/queries/news";
import { getSquad } from "@/server/db/queries/squad";
import { getCurrentTeamScope } from "@/server/db/team-scope";
import { groupStories } from "../news/stories";
import { summariseSeason } from "../home/season-story";

export async function getSquadData() {
  const scope = getCurrentTeamScope();
  const db = getAppDatabase();
  const [squad, articles, matches] = await Promise.all([
    getSquad(db, scope),
    getRecentArticles(db, NEWS_PAGE_LIMIT),
    getSeasonMatches(db, scope),
  ]);
  return {
    now: new Date(),
    squad,
    stories: groupStories(articles),
    teamGoals: summariseSeason(matches).goalsFor,
  };
}
