import { z } from "zod";
import { defineTool } from "./define";

export const getStandings = defineTool({
  name: "get_standings",
  label: "Checking the table",
  description: "The full La Liga table. There is no Champions League table available.",
  inputSchema: z.object({}),
  run: async (_input, { table }) => ({
    table: (await table()).map((row) => ({
      position: row.rank,
      team: row.name,
      points: row.points,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      formNewestFirst: row.form,
    })),
  }),
});
