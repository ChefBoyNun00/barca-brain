import { z } from "zod";
import { ASK_TOP_PLAYERS_MAX } from "@/config/ai";
import { defineTool } from "./define";
import { ASSISTS_NOTE, CompetitionSchema, statsIn } from "./shared";

export const getTopPlayers = defineTool({
  name: "get_top_players",
  label: "Ranking the squad",
  description: "Barça's top players this season by goals or assists.",
  inputSchema: z.object({
    metric: z.enum(["goals", "assists"]),
    competition: CompetitionSchema.optional(),
    limit: z.number().int().optional().describe("How many players. Defaults to 5."),
  }),
  run: async ({ metric, competition, limit = 5 }, { squad }) => {
    const ranked = (await squad())
      .map((player) => {
        const rows = statsIn(player.stats, competition);
        return {
          name: player.name,
          goals: rows.reduce((total, row) => total + row.goals, 0),
          assists: rows.reduce((total, row) => total + (row.assists ?? 0), 0),
        };
      })
      .filter((player) => player[metric] > 0)
      .sort((a, b) => b[metric] - a[metric] || a.name.localeCompare(b.name));
    return { note: ASSISTS_NOTE, players: ranked.slice(0, Math.min(limit, ASK_TOP_PLAYERS_MAX)) };
  },
});
