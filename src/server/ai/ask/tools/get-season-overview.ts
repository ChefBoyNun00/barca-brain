import { z } from "zod";
import {
  getLastPlayedIndex,
  getNextMatchIndex,
  summariseSeason,
} from "@/features/home/season-story";
import { defineTool } from "./define";
import { toCompactMatch } from "./shared";

export const getSeasonOverview = defineTool({
  name: "get_season_overview",
  label: "Checking where the season stands",
  description:
    "Today's date, Barça's league position, overall record, last result and next match. Use this first for anything about what is happening now.",
  inputSchema: z.object({}),
  run: async (_input, { now, matches, table }) => {
    const [allMatches, rows] = await Promise.all([matches(), table()]);
    const last = allMatches[getLastPlayedIndex(allMatches)];
    const next = allMatches[getNextMatchIndex(allMatches, now)];
    const barca = rows.find((row) => row.isBarca);
    const { played, wins, draws, losses, goalsFor } = summariseSeason(allMatches);
    return {
      today: now.toISOString().slice(0, 10),
      league: barca ? { position: barca.rank, points: barca.points, played: barca.played } : null,
      allCompetitions: { played, wins, draws, losses, goalsFor },
      lastMatch: last ? toCompactMatch(last) : null,
      nextMatch: next ? { ...toCompactMatch(next), kickoffUtc: next.kickoffAt.toISOString() } : null,
    };
  },
});
