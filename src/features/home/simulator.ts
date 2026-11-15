import { POINTS_FOR } from "@/config/display";
import type { LeagueRow, SeasonMatch } from "@/domain/home";
import { translate, type Language } from "@/i18n/dictionary";
import { getMatchOutcome, type MatchOutcome } from "./season-story";

export type Picks = Record<string, MatchOutcome>;

export type FinishRow = Pick<LeagueRow, "teamId" | "name" | "logoUrl" | "isBarca"> & {
  points: number;
};

export type Ending = {
  /** Every team, most points first. */
  finish: FinishRow[];
  barcaRank: number;
  picked: number;
  remaining: number;
  maxPoints: number;
  title: string;
  detail: string;
};

const OPPOSITE: Record<MatchOutcome, MatchOutcome> = { W: "L", D: "D", L: "W" };
const PICK_ORDER: (MatchOutcome | undefined)[] = [undefined, "W", "D", "L"];

const points = (count: number, language: Language) =>
  count === 1 ? translate(language, "sim.point") : translate(language, "sim.points", { n: count });

/** League matches with no result yet. A cancelled match will never have one. */
export function getRemainingLeagueMatches(matches: SeasonMatch[]): SeasonMatch[] {
  return matches.filter(
    (match) => match.isLeague && match.status !== "cancelled" && !getMatchOutcome(match),
  );
}

/** Each tap moves a match on one step: no pick, win, draw, defeat, and round again. */
export function getNextPick(current: MatchOutcome | undefined): MatchOutcome | undefined {
  return PICK_ORDER[(PICK_ORDER.indexOf(current) + 1) % PICK_ORDER.length];
}

export function pickEvery(remaining: SeasonMatch[], outcome: MatchOutcome): Picks {
  return Object.fromEntries(remaining.map((match) => [match.id, outcome]));
}

/** Win everything except the matches against the sides just below Barça in the table. */
export function pickLoseBigGames(
  remaining: SeasonMatch[],
  table: LeagueRow[],
  rivalCount: number,
): Picks {
  const rivals = new Set(
    table
      .filter((row) => !row.isBarca)
      .slice(0, rivalCount)
      .map((row) => row.teamId),
  );
  return Object.fromEntries(
    remaining.map((match) => [match.id, rivals.has(match.opponent?.id ?? "") ? "L" : "W"]),
  );
}

const pacePerMatch = (row: LeagueRow) =>
  row.played && row.played > 0 ? row.points / row.played : 0;

function projectRival(row: LeagueRow, seasonLength: number, remaining: SeasonMatch[], picks: Picks) {
  const pickedAgainstBarca = remaining.flatMap((match) => {
    const pick = picks[match.id];
    return match.opponent?.id === row.teamId && pick ? [OPPOSITE[pick]] : [];
  });
  const matchesLeft = Math.max(0, seasonLength - (row.played ?? 0) - pickedAgainstBarca.length);
  const fromPicks = pickedAgainstBarca.reduce((total, pick) => total + POINTS_FOR[pick], 0);
  return Math.round(row.points + fromPicks + pacePerMatch(row) * matchesLeft);
}

function projectBarca(row: LeagueRow, remaining: SeasonMatch[], picks: Picks) {
  const chosen = remaining.flatMap((match) => picks[match.id] ?? []);
  const fromPicks = chosen.reduce((total, pick) => total + POINTS_FOR[pick], 0);
  const unpicked = remaining.length - chosen.length;
  return {
    points: Math.round(row.points + fromPicks + pacePerMatch(row) * unpicked),
    picked: chosen.length,
  };
}

function describeBasis(picked: number, remaining: number, language: Language): string {
  if (picked === 0) return translate(language, "sim.basisNone");
  const yours =
    picked === 1 ? translate(language, "sim.yoursOne") : translate(language, "sim.yours", { n: picked });
  return translate(language, picked === remaining ? "sim.basisAll" : "sim.basisSome", { yours });
}

function buildTitle(
  finish: FinishRow[],
  barca: FinishRow,
  barcaRank: number,
  language: Language,
): string {
  const bestRival = finish.find((row) => !row.isBarca);
  if (!bestRival) return translate(language, "sim.champions");
  const lead = barca.points - bestRival.points;
  if (lead > 0) return translate(language, "sim.championsBy", { points: points(lead, language) });
  if (lead === 0) return translate(language, "sim.level", { team: bestRival.name });
  const leader = finish[0];
  const gap = (leader?.points ?? barca.points) - barca.points;
  return translate(language, "sim.short", { rank: barcaRank, points: points(gap, language) });
}

/**
 * A what-if, not a forecast. Barça's picked matches count exactly, and they also count
 * for the opponent, so beating a rival takes points from that rival. Everything else
 * runs at each team's current points per match.
 */
export function projectEnding(
  table: LeagueRow[],
  remaining: SeasonMatch[],
  picks: Picks,
  language: Language = "en",
): Ending | null {
  const barcaRow = table.find((row) => row.isBarca);
  if (!barcaRow) return null;

  const seasonLength = (table.length - 1) * 2;
  const { points: barcaPoints, picked } = projectBarca(barcaRow, remaining, picks);

  const finish: FinishRow[] = table
    .map(({ teamId, name, logoUrl, isBarca, ...row }) => ({
      teamId,
      name,
      logoUrl,
      isBarca,
      points: isBarca
        ? barcaPoints
        : projectRival({ teamId, name, logoUrl, isBarca, ...row }, seasonLength, remaining, picks),
    }))
    .sort((a, b) => b.points - a.points);

  const barca = finish.find((row) => row.isBarca);
  if (!barca) return null;
  const barcaRank = 1 + finish.filter((row) => row.points > barca.points).length;

  return {
    finish,
    barcaRank,
    picked,
    remaining: remaining.length,
    maxPoints: seasonLength * POINTS_FOR.W,
    title: buildTitle(finish, barca, barcaRank, language),
    detail: describeBasis(picked, remaining.length, language),
  };
}

/** Wins Barça need, with no other points, to pass the best rival's current pace. */
export function getWinsNeeded(table: LeagueRow[], remaining: SeasonMatch[]): number | null {
  const barca = table.find((row) => row.isBarca);
  if (!barca) return null;
  const seasonLength = (table.length - 1) * 2;
  const target = Math.max(
    0,
    ...table
      .filter((row) => !row.isBarca)
      .map((row) => projectRival(row, seasonLength, remaining, {})),
  );
  const wins = Math.max(0, Math.ceil((target + 1 - barca.points) / POINTS_FOR.W));
  return wins > remaining.length ? null : wins;
}

/** The top of the finish, with Barça always included even if they fall below it. */
export function getFinishPreview(finish: FinishRow[], limit: number): FinishRow[] {
  const top = finish.slice(0, limit);
  if (top.some((row) => row.isBarca)) return top;
  const barca = finish.find((row) => row.isBarca);
  return barca ? [...top.slice(0, limit - 1), barca] : top;
}
