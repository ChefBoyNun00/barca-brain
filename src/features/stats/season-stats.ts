import type { SeasonMatch } from "@/domain/home";
import { getMatchOutcome } from "../home/season-story";

export type Record3 = { played: number; wins: number; draws: number; losses: number };

export type SeasonNumbers = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  home: Record3;
  away: Record3;
  /** Matches with both a score and a half-time score only, so nothing is guessed. */
  firstHalfGoals: number;
  secondHalfGoals: number;
  halfTimeKnown: number;
  biggestWin: SeasonMatch | null;
  heaviestDefeat: SeasonMatch | null;
  highestScoring: SeasonMatch | null;
  longestWinning: number;
  longestUnbeaten: number;
  currentUnbeaten: number;
};

const emptyRecord = (): Record3 => ({ played: 0, wins: 0, draws: 0, losses: 0 });

type Scored = SeasonMatch & { goalsFor: number; goalsAgainst: number };
const isScored = (match: SeasonMatch): match is Scored =>
  getMatchOutcome(match) !== null && match.goalsFor !== null && match.goalsAgainst !== null;

const margin = (match: Scored) => match.goalsFor - match.goalsAgainst;

/** The match that is best by the first measure, ties broken by the second. */
function best(
  matches: Scored[],
  first: (match: Scored) => number,
  second: (match: Scored) => number,
): Scored | null {
  return matches.reduce<Scored | null>((top, match) => {
    if (!top) return match;
    const difference = first(match) - first(top) || second(match) - second(top);
    return difference > 0 ? match : top;
  }, null);
}

/** Everything the season-in-numbers page shows, worked out from the matches alone. */
export function buildSeasonNumbers(matches: SeasonMatch[]): SeasonNumbers {
  const scored = matches.filter(isScored);
  const numbers: SeasonNumbers = {
    played: scored.length,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    cleanSheets: 0,
    home: emptyRecord(),
    away: emptyRecord(),
    firstHalfGoals: 0,
    secondHalfGoals: 0,
    halfTimeKnown: 0,
    biggestWin: null,
    heaviestDefeat: null,
    highestScoring: null,
    longestWinning: 0,
    longestUnbeaten: 0,
    currentUnbeaten: 0,
  };

  let winning = 0;
  let unbeaten = 0;
  for (const match of scored) {
    const outcome = getMatchOutcome(match);
    const venue = match.isHome ? numbers.home : numbers.away;
    numbers.goalsFor += match.goalsFor;
    numbers.goalsAgainst += match.goalsAgainst;
    if (match.goalsAgainst === 0) numbers.cleanSheets += 1;
    venue.played += 1;

    if (outcome === "W") {
      numbers.wins += 1;
      venue.wins += 1;
    } else if (outcome === "D") {
      numbers.draws += 1;
      venue.draws += 1;
    } else {
      numbers.losses += 1;
      venue.losses += 1;
    }

    winning = outcome === "W" ? winning + 1 : 0;
    unbeaten = outcome === "L" ? 0 : unbeaten + 1;
    numbers.longestWinning = Math.max(numbers.longestWinning, winning);
    numbers.longestUnbeaten = Math.max(numbers.longestUnbeaten, unbeaten);

    if (match.halfTimeFor !== null && match.halfTimeAgainst !== null) {
      numbers.halfTimeKnown += 1;
      numbers.firstHalfGoals += match.halfTimeFor;
      numbers.secondHalfGoals += match.goalsFor - match.halfTimeFor;
    }
  }
  numbers.currentUnbeaten = unbeaten;

  const wins = scored.filter((match) => margin(match) > 0);
  const defeats = scored.filter((match) => margin(match) < 0);
  numbers.biggestWin = best(wins, margin, (match) => match.goalsFor);
  numbers.heaviestDefeat = best(
    defeats,
    (match) => -margin(match),
    (match) => match.goalsAgainst,
  );
  numbers.highestScoring = best(
    scored,
    (match) => match.goalsFor + match.goalsAgainst,
    (match) => match.goalsFor,
  );
  return numbers;
}

/** Points per match so far, carried over a full league season. A projection, not a forecast. */
export function projectPoints(
  points: number,
  played: number,
  leagueMatches: number,
): number | null {
  if (played === 0) return null;
  return Math.round((points / played) * leagueMatches);
}
