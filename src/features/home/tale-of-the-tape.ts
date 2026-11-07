import type { LeagueRow, SeasonMatch } from "@/domain/home";
import { getMatchOutcome, ordinal } from "./season-story";

export type TapeRow = {
  label: string;
  barca: string;
  rival: string;
  /** Barça's slice of the bar, from 0 to 1. Longer always means better. */
  barcaShare: number;
};

export type Tape = { barca: LeagueRow; rival: LeagueRow; rows: TapeRow[] };

function share(barca: number, rival: number): number {
  const total = barca + rival;
  return total === 0 ? 0.5 : barca / total;
}

function countRow(
  label: string,
  barca: number | null,
  rival: number | null,
  lowerIsBetter = false,
): TapeRow[] {
  if (barca === null || rival === null) return [];
  const barcaShare = lowerIsBetter ? share(rival, barca) : share(barca, rival);
  return [{ label, barca: String(barca), rival: String(rival), barcaShare }];
}

/** Null when the opponent is not in the league table, such as a European side. */
export function buildTape(table: LeagueRow[], opponentId: string | undefined): Tape | null {
  const barca = table.find((row) => row.isBarca);
  const rival = table.find((row) => row.teamId === opponentId);
  if (!barca || !rival || rival.isBarca) return null;

  return {
    barca,
    rival,
    rows: [
      {
        label: "Position",
        barca: ordinal(barca.rank),
        rival: ordinal(rival.rank),
        barcaShare: share(rival.rank, barca.rank),
      },
      ...countRow("Points", barca.points, rival.points),
      ...countRow("Goals scored", barca.goalsFor, rival.goalsFor),
      ...countRow("Goals conceded", barca.goalsAgainst, rival.goalsAgainst, true),
    ],
  };
}

/** The most recent finished match against this opponent, if there has been one. */
export function findLastMeeting(
  matches: SeasonMatch[],
  opponentId: string | undefined,
): SeasonMatch | null {
  return (
    matches.findLast((match) => match.opponent?.id === opponentId && getMatchOutcome(match)) ?? null
  );
}
