import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SeasonMatch } from "@/domain/home";
import {
  displayCompetition,
  formatOptionalStat,
  formatSeason,
  formatUpdatedAgo,
  getCountdownParts,
} from "@/features/home/format";
import {
  buildFacts,
  buildHeadline,
  getLastPlayedIndex,
  getMatchOutcome,
  getNextMatchIndex,
  summariseSeason,
} from "@/features/home/season-story";
import {
  getLastSuccessfulIngestAt,
  getLeagueRace,
  getLeagueStanding,
  getSeasonMatches,
  getTopLeagueScorers,
} from "@/server/db/queries/home";
import { createEmptyDatabase, createIngestedDatabase } from "./helpers/ingested-database";

const scope = { provider: "football-data", teamExternalId: "81", season: 2026 };
const recordedAt = new Date("2026-11-05T21:00:00Z");

function played(
  goalsFor: number,
  goalsAgainst: number,
  halfTimeFor: number | null = 0,
  halfTimeAgainst: number | null = 0,
): SeasonMatch {
  return {
    id: "match",
    kickoffAt: new Date("2026-09-01T18:00:00Z"),
    status: "finished",
    competition: "Primera Division",
    isLeague: true,
    round: "Matchday 1",
    opponent: { name: "Rival", logoUrl: null },
    isHome: true,
    goalsFor,
    goalsAgainst,
    halfTimeFor,
    halfTimeAgainst,
  };
}

const upcoming: SeasonMatch = {
  ...played(0, 0),
  status: "scheduled",
  kickoffAt: new Date("2026-12-01T18:00:00Z"),
  goalsFor: null,
  goalsAgainst: null,
  halfTimeFor: null,
  halfTimeAgainst: null,
};

describe("home queries on ingested data", () => {
  let created: Awaited<ReturnType<typeof createIngestedDatabase>>;

  beforeAll(async () => {
    created = await createIngestedDatabase();
  }, 30_000);
  afterAll(() => created.pg.close());

  it("returns the whole season in date order, told from Barça's side", async () => {
    const matches = await getSeasonMatches(created.database, scope);
    expect(matches).toHaveLength(46);
    const times = matches.map((match) => match.kickoffAt.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));

    const away = matches.find((match) => match.opponent?.name === "Elche" && !match.isHome);
    expect([away?.goalsFor, away?.goalsAgainst]).toEqual([5, 0]);
    const defeat = matches.find((match) => match.opponent?.name === "PSG");
    expect(defeat?.isHome).toBe(false);
    expect([defeat?.goalsFor, defeat?.goalsAgainst]).toEqual([2, 4]);
    expect([defeat?.halfTimeFor, defeat?.halfTimeAgainst]).toEqual([0, 1]);
    expect(defeat?.isLeague).toBe(false);
  });

  it("tells the real season's story", async () => {
    const matches = await getSeasonMatches(created.database, scope);
    expect(summariseSeason(matches)).toEqual({
      played: 15,
      wins: 13,
      draws: 0,
      losses: 2,
      goalsFor: 60,
      secondHalfGoals: 34,
      withHalfTimeScore: 15,
      notBehindAtHalfTime: 13,
      winsWhenNotBehind: 13,
      behindAtHalfTime: 2,
      winsFromBehind: 0,
    });
    expect(matches[getLastPlayedIndex(matches)]?.opponent?.name).toBe("Aston Villa");
    expect(matches[getNextMatchIndex(matches, recordedAt)]?.opponent?.name).toBe("Atleti");
  });

  it("reads the league standing, not the Champions League one", async () => {
    const standing = await getLeagueStanding(created.database, scope);
    expect(standing).toMatchObject({ rank: 1, points: 30, played: 11 });
    expect(standing?.competition).not.toMatch(/champions/i);
  });

  it("returns the top of the race with Barça marked", async () => {
    const race = await getLeagueRace(created.database, scope, 4);
    expect(race.map((team) => team.points)).toEqual([30, 28, 27, 23]);
    expect(race.filter((team) => team.isBarca).map((team) => team.name)).toEqual(["Barça"]);
  });

  it("lists only Barça league scorers, best first, up to the limit", async () => {
    const scorers = await getTopLeagueScorers(created.database, scope, 5);
    expect(scorers).toHaveLength(5);
    expect(scorers[0]).toMatchObject({ name: "Raphinha", goals: 15 });
  });

  it("reports when data last updated", async () => {
    expect(await getLastSuccessfulIngestAt(created.database, "football-data")).toBeInstanceOf(Date);
  });
});

describe("home queries on an empty database", () => {
  let created: Awaited<ReturnType<typeof createEmptyDatabase>>;

  beforeAll(async () => {
    created = await createEmptyDatabase();
  }, 30_000);
  afterAll(() => created.pg.close());

  it("returns nothing instead of failing", async () => {
    const { database } = created;
    expect(await getSeasonMatches(database, scope)).toEqual([]);
    expect(await getLeagueStanding(database, scope)).toBeNull();
    expect(await getLeagueRace(database, scope, 4)).toEqual([]);
    expect(await getTopLeagueScorers(database, scope, 5)).toEqual([]);
    expect(await getLastSuccessfulIngestAt(database, "football-data")).toBeNull();
  });
});

describe("season story", () => {
  it.each([
    [3, 0, "W"],
    [0, 3, "L"],
    [1, 1, "D"],
  ])("reads %s-%s as %s", (goalsFor, goalsAgainst, expected) => {
    expect(getMatchOutcome(played(goalsFor, goalsAgainst))).toBe(expected);
  });

  it("gives an unplayed match no outcome", () => {
    expect(getMatchOutcome(upcoming)).toBeNull();
  });

  it("does not count a finished match with no score", () => {
    const summary = summariseSeason([{ ...played(0, 0), goalsFor: null, goalsAgainst: null }]);
    expect(summary.played).toBe(0);
  });

  it("counts a comeback", () => {
    const summary = summariseSeason([played(2, 1, 0, 1)]);
    expect(summary).toMatchObject({ behindAtHalfTime: 1, winsFromBehind: 1 });
    expect(buildFacts(summary).map((fact) => fact.text)).toContain(
      "Wins after trailing at half-time.",
    );
  });

  it("only claims 'every single one' when it is true", () => {
    const allWon = buildFacts(summariseSeason([played(2, 0, 1, 0)]));
    const notAll = buildFacts(summariseSeason([played(2, 0, 1, 0), played(1, 1, 1, 0)]));
    expect(allWon[0]?.text).toMatch(/every single one/);
    expect(notAll[0]?.text).not.toMatch(/every single one/);
  });

  it("drops the second-half fact when a half-time score is missing", () => {
    const facts = buildFacts(summariseSeason([played(2, 0, 1, 0), played(1, 0, null, null)]));
    expect(facts.some((fact) => fact.text.includes("after the break"))).toBe(false);
  });

  it("has nothing to say before a match is played", () => {
    expect(buildFacts(summariseSeason([upcoming]))).toEqual([]);
  });

  it("writes the headline from the data", () => {
    const standing = { competition: "Primera Division", rank: 1, points: 30, played: 11 };
    const summary = summariseSeason([played(2, 0), played(1, 0), played(0, 1)]);
    expect(buildHeadline(summary, standing)).toEqual(["Top of La Liga.", "2 wins from 3."]);
    expect(buildHeadline(summary, { ...standing, rank: 2 })[0]).toBe("2nd in La Liga.");
    expect(buildHeadline(summary, { ...standing, rank: 11 })[0]).toBe("11th in La Liga.");
    expect(buildHeadline(summariseSeason([upcoming]), null)).toEqual(["The season starts here."]);
  });

  it("finds the last played and next matches", () => {
    const matches = [played(1, 0), upcoming];
    expect(getLastPlayedIndex(matches)).toBe(0);
    expect(getNextMatchIndex(matches, recordedAt)).toBe(1);
    expect(getNextMatchIndex(matches, new Date("2030-01-01T00:00:00Z"))).toBe(-1);
    expect(getLastPlayedIndex([upcoming])).toBe(-1);
  });
});

describe("home formatting", () => {
  it("breaks a countdown into parts and stops at zero", () => {
    const now = new Date("2026-11-05T12:00:00Z");
    expect(getCountdownParts(new Date("2026-11-07T15:04:05Z"), now)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
    expect(getCountdownParts(new Date("2026-11-01T00:00:00Z"), now).days).toBe(0);
  });

  it("formats how old the data is", () => {
    const now = new Date("2026-11-05T12:00:00Z");
    const before = (hours: number) => new Date(now.getTime() - hours * 3_600_000);
    expect(formatUpdatedAgo(before(0.2), now)).toBe("Updated within the last hour");
    expect(formatUpdatedAgo(before(3), now)).toBe("Updated 3 hours ago");
    expect(formatUpdatedAgo(before(48), now)).toBe("Updated 2 days ago");
  });

  it("shows a blank stat as a dash, never zero", () => {
    expect(formatOptionalStat(null)).toBe("–");
    expect(formatOptionalStat(0)).toBe("0");
  });

  it("uses the names fans use", () => {
    expect(displayCompetition("Primera Division")).toBe("La Liga");
    expect(displayCompetition("Copa Something")).toBe("Copa Something");
  });

  it("formats the season", () => {
    expect(formatSeason(2026)).toBe("2026–27");
  });
});
