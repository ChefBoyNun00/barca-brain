import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FOOTBALL_DATA } from "@/config/football";
import {
  mapFixtures,
  mapPosition,
  mapScorers,
  mapSquad,
  mapStandings,
} from "@/server/providers/football-data/mapper";
import {
  ScorersSchema,
  StandingsSchema,
  TeamFixturesSchema,
  TeamSquadSchema,
  type TeamFixtures,
} from "@/server/providers/football-data/schemas";

const recorded = (name: string): unknown =>
  JSON.parse(readFileSync(`tests/fixtures/football-data/${name}.json`, "utf8"));

const barcaId = String(FOOTBALL_DATA.teamId);
const fixtures = TeamFixturesSchema.parse(recorded("team-matches"));
const firstMatch = fixtures.matches[0]!;
const withMatch = (changes: Partial<TeamFixtures["matches"][number]>): TeamFixtures => ({
  matches: [{ ...firstMatch, ...changes }],
});

describe("mapFixtures", () => {
  const mapped = mapFixtures(fixtures, 2026);

  it("maps every recorded match", () => {
    expect(mapped).toHaveLength(46);
    expect(mapped.filter((fixture) => fixture.status === "finished")).toHaveLength(15);
    expect(mapped.filter((fixture) => fixture.status === "scheduled")).toHaveLength(31);
  });

  it("gives every finished match a full-time and half-time score", () => {
    for (const fixture of mapped.filter((item) => item.status === "finished")) {
      expect(fixture.homeGoals).not.toBeNull();
      expect(fixture.homeGoalsHalfTime).not.toBeNull();
    }
  });

  it("puts Barça in every fixture", () => {
    for (const fixture of mapped) {
      expect([fixture.homeTeam?.externalId, fixture.awayTeam?.externalId]).toContain(barcaId);
    }
  });

  it("maps both competitions with their type", () => {
    expect(mapped.find((item) => item.competition.externalId === "PD")?.competition.type).toBe(
      "league",
    );
    expect(mapped.find((item) => item.competition.externalId === "CL")?.competition.type).toBe(
      "cup",
    );
  });

  it("labels league rounds by matchday and knockout rounds by stage", () => {
    const league = withMatch({ stage: "REGULAR_SEASON", matchday: 12 });
    const knockout = withMatch({ stage: "QUARTER_FINALS", matchday: 1 });
    expect(mapFixtures(league, 2026)[0]?.round).toBe("Matchday 12");
    expect(mapFixtures(knockout, 2026)[0]?.round).toBe("Quarter finals");
  });

  it("keeps an unknown knockout team as null", () => {
    const unknownTeam = { id: null, name: null, shortName: null, crest: null };
    expect(mapFixtures(withMatch({ awayTeam: unknownTeam }), 2026)[0]?.awayTeam).toBeNull();
  });

  it("leaves the referee null when none is assigned", () => {
    expect(mapFixtures(withMatch({ referees: [] }), 2026)[0]?.referee).toBeNull();
  });

  it("fails loudly on an unknown status", () => {
    expect(() => mapFixtures(withMatch({ status: "ABANDONED" }), 2026)).toThrow("ABANDONED");
  });
});

describe("mapSquad", () => {
  const squad = mapSquad(TeamSquadSchema.parse(recorded("team")));

  it("maps every player and keeps blank positions blank", () => {
    expect(squad).toHaveLength(31);
    expect(squad.filter((player) => player.position === null)).toHaveLength(4);
    expect(squad.filter((player) => player.position === "GK")).toHaveLength(3);
  });
});

describe("mapPosition", () => {
  it.each([
    ["Goalkeeper", "GK"],
    ["Defence", "DF"],
    ["Centre-Back", "DF"],
    ["Midfield", "MF"],
    ["Attacking Midfield", "MF"],
    ["Offence", "FW"],
    ["Right Winger", "FW"],
    ["Centre-Forward", "FW"],
    ["Mascot", null],
    [null, null],
  ])("maps %s to %s", (label, expected) => {
    expect(mapPosition(label)).toBe(expected);
  });
});

describe("mapStandings", () => {
  it("keeps only the total table, with each team once", () => {
    const laLiga = mapStandings(StandingsSchema.parse(recorded("standings-pd")));
    const championsLeague = mapStandings(StandingsSchema.parse(recorded("standings-cl")));
    expect(laLiga).toHaveLength(20);
    expect(championsLeague).toHaveLength(36);
    expect(new Set(laLiga.map((row) => row.team.externalId)).size).toBe(20);
  });
});

describe("mapScorers", () => {
  const scorers = mapScorers(ScorersSchema.parse(recorded("scorers-pd")));

  it("keeps all rows, including all 13 Barça scorers", () => {
    expect(scorers).toHaveLength(160);
    expect(scorers.filter((row) => row.team.externalId === barcaId)).toHaveLength(13);
  });

  it("keeps blank assists and penalties as null, not zero", () => {
    expect(scorers.filter((row) => row.assists === null)).toHaveLength(85);
    expect(scorers.filter((row) => row.penalties === null)).toHaveLength(138);
  });

  it("reads position from section when position is blank", () => {
    expect(scorers.every((row) => row.player.position !== null)).toBe(true);
  });
});
