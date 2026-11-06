import { RACE_TEAMS_LIMIT, TOP_SCORERS_LIMIT } from "@/config/display";
import { getEnvVars } from "@/config/env";
import { CURRENT_SEASON, INGEST_TARGETS } from "@/config/football";
import type { HomeData } from "@/domain/home";
import { getAppDatabase } from "@/server/db/app-database";
import {
  getLastSuccessfulIngestAt,
  getLeagueRace,
  getLeagueStanding,
  getSeasonMatches,
  getTopLeagueScorers,
} from "@/server/db/queries/home";

export async function getHomeData(): Promise<HomeData> {
  const { FOOTBALL_PROVIDER: provider } = getEnvVars(["FOOTBALL_PROVIDER"]);
  const target = INGEST_TARGETS[provider];
  if (!target) throw new Error(`No team configured for provider ${provider}`);

  const db = getAppDatabase();
  const scope = { provider, teamExternalId: target.teamId, season: CURRENT_SEASON };

  const [matches, standing, race, topScorers, lastUpdatedAt] = await Promise.all([
    getSeasonMatches(db, scope),
    getLeagueStanding(db, scope),
    getLeagueRace(db, scope, RACE_TEAMS_LIMIT),
    getTopLeagueScorers(db, scope, TOP_SCORERS_LIMIT),
    getLastSuccessfulIngestAt(db, provider),
  ]);

  return { now: new Date(), matches, standing, race, topScorers, lastUpdatedAt };
}
