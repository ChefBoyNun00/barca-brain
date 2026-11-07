import { z } from "zod";
import { getMatchOutcome } from "@/features/home/season-story";
import { defineTool } from "./define";
import { CompetitionSchema, inCompetition, VenueSchema } from "./shared";

function halfTimeState(halfTimeFor: number | null, halfTimeAgainst: number | null) {
  if (halfTimeFor === null || halfTimeAgainst === null) return null;
  if (halfTimeFor === halfTimeAgainst) return "level";
  return halfTimeFor > halfTimeAgainst ? "leading" : "trailing";
}

export const getTeamRecord = defineTool({
  name: "get_team_record",
  label: "Working out the record",
  description:
    "Barça's wins, draws, defeats and goals this season, optionally by competition, venue and half-time state.",
  inputSchema: z.object({
    competition: CompetitionSchema.optional(),
    venue: VenueSchema.optional(),
    half_time_state: z.enum(["leading", "level", "trailing"]).optional(),
  }),
  run: async ({ competition, venue, half_time_state: state }, { matches }) => {
    const record = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
    for (const match of await matches()) {
      const outcome = getMatchOutcome(match);
      if (!outcome || !inCompetition(competition, match.isLeague)) continue;
      if (venue && match.isHome !== (venue === "home")) continue;
      if (state && halfTimeState(match.halfTimeFor, match.halfTimeAgainst) !== state) continue;
      record.played += 1;
      record.goalsFor += match.goalsFor ?? 0;
      record.goalsAgainst += match.goalsAgainst ?? 0;
      if (outcome === "W") record.wins += 1;
      if (outcome === "D") record.draws += 1;
      if (outcome === "L") record.losses += 1;
    }
    return record;
  },
});
