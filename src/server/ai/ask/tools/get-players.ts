import { z } from "zod";
import { displayCompetition } from "@/features/home/format";
import { getAge } from "@/features/squad/squad-stats";
import { defineTool } from "./define";
import { ASSISTS_NOTE, CompetitionSchema, statsIn } from "./shared";

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export const getPlayers = defineTool({
  name: "get_players",
  label: "Looking up the players",
  description:
    "This season's stats and details for up to four Barça players, for looking one up or comparing them. Names can be partial and need no accents. Players with empty stats have not scored.",
  inputSchema: z.object({
    names: z.array(z.string()).describe("One to four player names."),
    competition: CompetitionSchema.optional(),
  }),
  run: async ({ names, competition }, { squad, now }) => {
    const everyone = await squad();
    return {
      note: ASSISTS_NOTE,
      players: names.slice(0, 4).map((name) => {
        const search = fold(name);
        const player = everyone.find((candidate) => fold(candidate.name).includes(search));
        if (!player) return { name, found: false };
        return {
          name: player.name,
          found: true,
          position: player.position,
          age: getAge(player.birthDate, now),
          nationality: player.nationality,
          stats: statsIn(player.stats, competition).map((row) => ({
            competition: displayCompetition(row.competition),
            matches: row.matches,
            goals: row.goals,
            assists: row.assists,
          })),
        };
      }),
    };
  },
});
