import type { HomeData } from "@/domain/home";
import { getAppDatabase } from "@/server/db/app-database";
import {
  getLastSuccessfulIngestAt,
  getLeagueStanding,
  getSeasonMatches,
} from "@/server/db/queries/home";
import { getLeagueTable } from "@/server/db/queries/league-table";
import { getCurrentTeamScope } from "@/server/db/team-scope";

/** In development, MOCK_NOW (an ISO time) lets you see match day on any date. Ignored in production. */
function getNow(): Date {
  const mock = process.env.NODE_ENV === "development" ? process.env.MOCK_NOW : undefined;
  const parsed = mock ? new Date(mock) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
}

export async function getHomeData(): Promise<HomeData> {
  const scope = getCurrentTeamScope();
  const db = getAppDatabase();

  const [matches, standing, table, lastUpdatedAt] = await Promise.all([
    getSeasonMatches(db, scope),
    getLeagueStanding(db, scope),
    getLeagueTable(db, scope),
    getLastSuccessfulIngestAt(db, scope.provider),
  ]);

  return { now: getNow(), matches, standing, table, lastUpdatedAt };
}
