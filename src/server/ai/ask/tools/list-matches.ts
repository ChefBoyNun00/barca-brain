import { z } from "zod";
import { getMatchOutcome } from "@/features/home/season-story";
import { defineTool } from "./define";
import { CompetitionSchema, inCompetition, toCompactMatch, VenueSchema } from "./shared";

export const listMatches = defineTool({
  name: "list_matches",
  label: "Going through the matches",
  description:
    "Barça's matches this season, oldest first, with full-time and half-time scores. Filter by competition, venue, result, opponent or played status.",
  inputSchema: z.object({
    competition: CompetitionSchema.optional(),
    venue: VenueSchema.optional(),
    result: z.enum(["W", "D", "L"]).optional(),
    opponent: z.string().optional().describe("Part of the opponent's name, such as Atleti."),
    status: z.enum(["played", "upcoming"]).optional(),
  }),
  run: async ({ competition, venue, result, opponent, status }, { matches }) => {
    const search = opponent?.toLowerCase();
    const found = (await matches()).filter((match) => {
      const outcome = getMatchOutcome(match);
      if (!inCompetition(competition, match.isLeague)) return false;
      if (venue && match.isHome !== (venue === "home")) return false;
      if (result && outcome !== result) return false;
      if (status && (status === "played") !== (outcome !== null)) return false;
      return !search || (match.opponent?.name.toLowerCase().includes(search) ?? false);
    });
    return { count: found.length, matches: found.map(toCompactMatch) };
  },
});
