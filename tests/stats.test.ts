import { describe, expect, it } from "vitest";
import type { SeasonMatch } from "@/domain/home";
import { buildSeasonNumbers, projectPoints } from "@/features/stats/season-stats";

let counter = 0;
function match(
  goalsFor: number | null,
  goalsAgainst: number | null,
  changes: Partial<SeasonMatch> = {},
): SeasonMatch {
  counter += 1;
  return {
    id: `m${counter}`,
    kickoffAt: new Date(2026, 8, counter),
    status: goalsFor === null ? "scheduled" : "finished",
    competition: "Primera Division",
    isLeague: true,
    round: null,
    opponent: { id: "o", name: "Rival", logoUrl: null },
    isHome: true,
    goalsFor,
    goalsAgainst,
    halfTimeFor: null,
    halfTimeAgainst: null,
    ...changes,
  };
}

describe("season numbers", () => {
  const season = [
    match(3, 0, { halfTimeFor: 1, halfTimeAgainst: 0 }),
    match(2, 1, { isHome: false, halfTimeFor: 0, halfTimeAgainst: 1 }),
    match(1, 1),
    match(0, 4, { isHome: false }),
    match(5, 1),
    match(null, null),
  ];
  const numbers = buildSeasonNumbers(season);

  it("counts the record, goals and clean sheets, ignoring matches not played", () => {
    expect(numbers).toMatchObject({
      played: 5,
      wins: 3,
      draws: 1,
      losses: 1,
      goalsFor: 11,
      goalsAgainst: 7,
      cleanSheets: 1,
    });
  });

  it("splits the record by home and away", () => {
    expect(numbers.home).toEqual({ played: 3, wins: 2, draws: 1, losses: 0 });
    expect(numbers.away).toEqual({ played: 2, wins: 1, draws: 0, losses: 1 });
  });

  it("finds the standout matches", () => {
    expect(numbers.biggestWin?.goalsFor).toBe(5);
    expect(numbers.heaviestDefeat?.goalsAgainst).toBe(4);
    expect(numbers.highestScoring?.goalsFor).toBe(5);
  });

  it("measures runs, and the current one", () => {
    expect(numbers.longestWinning).toBe(2);
    expect(numbers.longestUnbeaten).toBe(3);
    expect(numbers.currentUnbeaten).toBe(1);
  });

  it("counts goals by half only where the half-time score is known", () => {
    expect(numbers.halfTimeKnown).toBe(2);
    expect(numbers.firstHalfGoals).toBe(1);
    expect(numbers.secondHalfGoals).toBe(4);
  });

  it("is quiet before a ball is kicked", () => {
    const empty = buildSeasonNumbers([match(null, null)]);
    expect(empty).toMatchObject({ played: 0, biggestWin: null, longestWinning: 0 });
  });

  it("projects points over a season, or says nothing yet", () => {
    expect(projectPoints(30, 11, 38)).toBe(104);
    expect(projectPoints(0, 0, 38)).toBeNull();
  });
});
