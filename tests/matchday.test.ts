import { describe, expect, it } from "vitest";
import type { SeasonMatch } from "@/domain/home";
import { getMatchdayState } from "@/features/home/matchday";

function match(changes: Partial<SeasonMatch>): SeasonMatch {
  return {
    id: "m",
    kickoffAt: new Date("2026-11-08T21:00:00Z"),
    status: "scheduled",
    competition: "Primera Division",
    isLeague: true,
    round: "Matchday 12",
    opponent: { id: "o", name: "Atleti", logoUrl: null },
    isHome: false,
    goalsFor: null,
    goalsAgainst: null,
    halfTimeFor: null,
    halfTimeAgainst: null,
    ...changes,
  };
}

const finished = (changes: Partial<SeasonMatch> = {}) =>
  match({ status: "finished", goalsFor: 3, goalsAgainst: 0, ...changes });

describe("matchday state", () => {
  const kickoff = new Date("2026-11-08T21:00:00Z");

  it("is quiet when nothing is close", () => {
    const now = new Date("2026-11-05T12:00:00Z");
    expect(getMatchdayState([match({})], now)).toEqual({ kind: "none" });
  });

  it("calls the day of the match matchday, before kick-off", () => {
    const now = new Date("2026-11-08T10:00:00Z");
    expect(getMatchdayState([match({})], now).kind).toBe("today");
  });

  it("says a match is on once it should have kicked off", () => {
    const now = new Date(kickoff.getTime() + 30 * 60_000);
    expect(getMatchdayState([match({})], now).kind).toBe("live");
  });

  it("celebrates for a day after the final whistle, then stops", () => {
    const soon = new Date(kickoff.getTime() + 3 * 3_600_000);
    const later = new Date(kickoff.getTime() + 30 * 3_600_000);
    expect(getMatchdayState([finished()], soon).kind).toBe("fulltime");
    expect(getMatchdayState([finished()], later)).toEqual({ kind: "none" });
  });

  it("flags El Clásico", () => {
    const rival = { id: "r", name: "Real Madrid", logoUrl: null };
    const now = new Date("2026-11-08T10:00:00Z");
    const state = getMatchdayState([match({ opponent: rival })], now);
    expect(state).toMatchObject({ kind: "today", isClasico: true });
  });

  it("ignores postponed matches", () => {
    const now = new Date("2026-11-08T10:00:00Z");
    expect(getMatchdayState([match({ status: "postponed" })], now).kind).toBe("none");
  });
});
