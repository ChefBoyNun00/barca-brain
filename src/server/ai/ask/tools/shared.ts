import { z } from "zod";
import type { PlayerCompetitionStats, SeasonMatch } from "@/domain/home";
import { displayCompetition } from "@/features/home/format";
import { getMatchOutcome } from "@/features/home/season-story";

export const CompetitionSchema = z
  .enum(["la_liga", "champions_league", "all"])
  .describe("Which competition. Defaults to all.");

export type Competition = z.infer<typeof CompetitionSchema>;

export const VenueSchema = z.enum(["home", "away"]);

export const inCompetition = (competition: Competition | undefined, isLeague: boolean) =>
  !competition || competition === "all" || (competition === "la_liga") === isLeague;

export const statsIn = (stats: PlayerCompetitionStats[], competition: Competition | undefined) =>
  stats.filter((row) => inCompetition(competition, row.isLeague));

export function toCompactMatch(match: SeasonMatch) {
  return {
    date: match.kickoffAt.toISOString().slice(0, 10),
    competition: displayCompetition(match.competition),
    round: match.round,
    opponent: match.opponent?.name ?? "To be decided",
    venue: match.isHome ? "home" : "away",
    status: match.status,
    result: getMatchOutcome(match),
    score: match.goalsFor === null ? null : `${match.goalsFor}-${match.goalsAgainst}`,
    halfTimeScore: match.halfTimeFor === null ? null : `${match.halfTimeFor}-${match.halfTimeAgainst}`,
  };
}

export const ASSISTS_NOTE =
  "Assists are only recorded for players who have scored, and null means no figure, not zero.";
