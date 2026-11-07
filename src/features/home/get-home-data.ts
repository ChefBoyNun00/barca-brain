import { NEWS_PAGE_LIMIT } from "@/config/news";
import type { HomeData } from "@/domain/home";
import { getAppDatabase } from "@/server/db/app-database";
import {
  getLastSuccessfulIngestAt,
  getLeagueStanding,
  getSeasonMatches,
} from "@/server/db/queries/home";
import { getLeagueTable } from "@/server/db/queries/league-table";
import { getLatestBriefing, getRecentArticles } from "@/server/db/queries/news";
import { getSquad } from "@/server/db/queries/squad";
import { getCurrentTeamScope } from "@/server/db/team-scope";

export async function getHomeData(): Promise<HomeData> {
  const scope = getCurrentTeamScope();
  const db = getAppDatabase();

  const [matches, standing, table, squad, articles, briefing, lastUpdatedAt] = await Promise.all([
    getSeasonMatches(db, scope),
    getLeagueStanding(db, scope),
    getLeagueTable(db, scope),
    getSquad(db, scope),
    getRecentArticles(db, NEWS_PAGE_LIMIT),
    getLatestBriefing(db),
    getLastSuccessfulIngestAt(db, scope.provider),
  ]);

  return { now: new Date(), matches, standing, table, squad, articles, briefing, lastUpdatedAt };
}
