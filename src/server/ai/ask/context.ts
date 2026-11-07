import { ASK_SEARCH_NEWS_LIMIT } from "@/config/ai";
import { getAppDatabase } from "@/server/db/app-database";
import { getSeasonMatches } from "@/server/db/queries/home";
import { getLeagueTable } from "@/server/db/queries/league-table";
import { getRecentArticles, searchArticles } from "@/server/db/queries/news";
import { getSquad } from "@/server/db/queries/squad";
import { getCurrentTeamScope } from "@/server/db/team-scope";
import type { AskContext } from "./tools/define";

function once<T>(load: () => Promise<T>): () => Promise<T> {
  let result: Promise<T> | undefined;
  return () => (result ??= load());
}

/** Read-only by construction: this uses the app's login, which can only select. */
export function createAskContext(): AskContext {
  const db = getAppDatabase();
  const scope = getCurrentTeamScope();
  return {
    now: new Date(),
    matches: once(() => getSeasonMatches(db, scope)),
    squad: once(() => getSquad(db, scope)),
    table: once(() => getLeagueTable(db, scope)),
    searchNews: (query, days) =>
      query
        ? searchArticles(db, { query, days, limit: ASK_SEARCH_NEWS_LIMIT })
        : getRecentArticles(db, ASK_SEARCH_NEWS_LIMIT),
  };
}
