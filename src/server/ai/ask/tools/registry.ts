import { getPlayers } from "./get-players";
import { getSeasonOverview } from "./get-season-overview";
import { getStandings } from "./get-standings";
import { getTeamRecord } from "./get-team-record";
import { getTopPlayers } from "./get-top-players";
import { listMatches } from "./list-matches";
import { searchNews } from "./search-news";

/** To add a tool: one new file, one new line here. */
export const ASK_TOOLS = [
  getSeasonOverview,
  listMatches,
  getTeamRecord,
  getStandings,
  getPlayers,
  getTopPlayers,
  searchNews,
];
