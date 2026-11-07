import type { HomeStanding, SeasonMatch } from "@/domain/home";
import { displayCompetition, formatMatchDate } from "./format";

export type MatchOutcome = "W" | "D" | "L";

/** A finished match with both scores known. Anything else cannot be counted. */
type ScoredMatch = SeasonMatch & {
  goalsFor: number;
  goalsAgainst: number;
};

export type SeasonSummary = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  secondHalfGoals: number;
  withHalfTimeScore: number;
  notBehindAtHalfTime: number;
  winsWhenNotBehind: number;
  behindAtHalfTime: number;
  winsFromBehind: number;
};

const isScored = (match: SeasonMatch): match is ScoredMatch =>
  match.status === "finished" && match.goalsFor !== null && match.goalsAgainst !== null;

/** Null when a score is missing: no outcome is better than a guessed one. */
export function getMatchOutcome(match: SeasonMatch): MatchOutcome | null {
  if (!isScored(match)) return null;
  if (match.goalsFor === match.goalsAgainst) return "D";
  return match.goalsFor > match.goalsAgainst ? "W" : "L";
}

const OUTCOME_WORDS: Record<MatchOutcome, string> = { W: "Win", D: "Draw", L: "Defeat" };

export function describeOutcome(outcome: MatchOutcome): string {
  return OUTCOME_WORDS[outcome];
}

/** One plain sentence per match, for screen readers and the list view. */
export function describeMatch(match: SeasonMatch): string {
  const opponent = match.opponent?.name ?? "Opponent to be decided";
  const venue = match.isHome ? "at home" : "away";
  const outcome = getMatchOutcome(match);
  if (!outcome) return `${opponent}, ${venue}, ${formatMatchDate(match.kickoffAt)}, not played yet`;
  return `${OUTCOME_WORDS[outcome]}, ${match.goalsFor}–${match.goalsAgainst} ${venue} to ${opponent}, ${formatMatchDate(match.kickoffAt)}`;
}

/** The provider lists form newest first. Returned oldest first, to read left to right. */
export function parseForm(form: string | null): MatchOutcome[] {
  if (!form) return [];
  return form
    .split(",")
    .filter((item): item is MatchOutcome => item === "W" || item === "D" || item === "L")
    .reverse();
}

export function getLastPlayedIndex(matches: SeasonMatch[]): number {
  return matches.findLastIndex(isScored);
}

export function getNextMatchIndex(matches: SeasonMatch[], now: Date): number {
  return matches.findIndex(
    (match) => match.status === "scheduled" && match.kickoffAt.getTime() >= now.getTime(),
  );
}

export function summariseSeason(matches: SeasonMatch[]): SeasonSummary {
  const summary: SeasonSummary = {
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    secondHalfGoals: 0,
    withHalfTimeScore: 0,
    notBehindAtHalfTime: 0,
    winsWhenNotBehind: 0,
    behindAtHalfTime: 0,
    winsFromBehind: 0,
  };

  for (const match of matches.filter(isScored)) {
    const outcome = getMatchOutcome(match);
    summary.played += 1;
    summary.goalsFor += match.goalsFor;
    if (outcome === "W") summary.wins += 1;
    if (outcome === "D") summary.draws += 1;
    if (outcome === "L") summary.losses += 1;

    if (match.halfTimeFor === null || match.halfTimeAgainst === null) continue;
    summary.withHalfTimeScore += 1;
    summary.secondHalfGoals += match.goalsFor - match.halfTimeFor;
    if (match.halfTimeFor < match.halfTimeAgainst) {
      summary.behindAtHalfTime += 1;
      if (outcome === "W") summary.winsFromBehind += 1;
    } else {
      summary.notBehindAtHalfTime += 1;
      if (outcome === "W") summary.winsWhenNotBehind += 1;
    }
  }
  return summary;
}

function describeRank(standing: HomeStanding): string {
  const league = displayCompetition(standing.competition);
  return standing.rank === 1 ? `Top of ${league}.` : `${ordinal(standing.rank)} in ${league}.`;
}

export function ordinal(rank: number): string {
  const lastTwo = rank % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${rank}th`;
  const suffix = { 1: "st", 2: "nd", 3: "rd" }[rank % 10] ?? "th";
  return `${rank}${suffix}`;
}

/** Written from the data, so it can never claim something the season did not do. */
export function buildHeadline(summary: SeasonSummary, standing: HomeStanding | null): string[] {
  const lines = standing ? [describeRank(standing)] : [];
  if (summary.played === 0) return [...lines, "The season starts here."];
  const wins = summary.wins === 1 ? "1 win" : `${summary.wins} wins`;
  return [...lines, `${wins} from ${summary.played}.`];
}
