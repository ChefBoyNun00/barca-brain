import type { HomeData } from "@/domain/home";
import { getAppDatabase } from "@/server/db/app-database";
import {
  getLastSuccessfulIngestAt,
  getLeagueStanding,
  getSeasonMatches,
} from "@/server/db/queries/home";
import { getLeagueTable } from "@/server/db/queries/league-table";
import { getCurrentTeamScope } from "@/server/db/team-scope";

export async function getHomeData(): Promise<HomeData> {
  const scope = getCurrentTeamScope();
  const db = getAppDatabase();

  const [matches, standing, table, lastUpdatedAt] = await Promise.all([
    getSeasonMatches(db, scope),
    getLeagueStanding(db, scope),
    getLeagueTable(db, scope),
    getLastSuccessfulIngestAt(db, scope.provider),
  ]);

  return { now: new Date(), matches, standing, table, lastUpdatedAt };
}
