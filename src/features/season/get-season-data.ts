import { getAppDatabase } from "@/server/db/app-database";
import { getSeasonMatches } from "@/server/db/queries/home";
import { getLeagueTable } from "@/server/db/queries/league-table";
import { getCurrentTeamScope } from "@/server/db/team-scope";

/** Matches and the league table: what the table page and Weave the ending both need. */
export async function getSeasonData() {
  const scope = getCurrentTeamScope();
  const db = getAppDatabase();
  const [matches, table] = await Promise.all([
    getSeasonMatches(db, scope),
    getLeagueTable(db, scope),
  ]);
  return { matches, table };
}
