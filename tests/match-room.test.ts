import { readFileSync } from "node:fs";
import type { PGlite } from "@electric-sql/pglite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { SeasonMatch } from "@/domain/home";
import type { FetchedMatchRoom, MatchRoomEvent } from "@/domain/match-room";
import type { Database } from "@/server/db/client";
import { formatExpectedReturn, formatMinute } from "@/features/match-room/format";
import { getSeasonMatches } from "@/server/db/queries/home";
import { getMatchRoom } from "@/server/db/queries/match-room";
import { findFixtureFor, runMatchRoom } from "@/server/match-room/run-match-room";
import type { FetchFotmob } from "@/server/providers/fotmob/client";
import { parseExpectedReturn } from "@/server/providers/fotmob/mapper";
import { createFotmobProvider } from "@/server/providers/fotmob/provider";
import { createIngestedDatabase } from "./helpers/ingested-database";

const recorded = (name: string): unknown =>
  JSON.parse(readFileSync(`tests/fixtures/fotmob/${name}.json`, "utf8"));

const MATCH_FILES: Record<string, string> = {
  "5868121": "match-finished-away",
  "5868133": "match-upcoming-home",
  "5868066": "match-penalties-own-goal",
  "5868091": "match-red-card",
};

/** Replays recorded FotMob replies. `team` picks which matches count as last and next. */
function recordedFotmob(
  options: { last?: number; next?: number; edit?: (matchId: string, body: unknown) => unknown } = {},
): FetchFotmob {
  return async (path, params) => {
    if (path === "/api/data/teams") {
      const team = recorded("team") as {
        fixtures: { allFixtures: { lastMatch: { id: number }; nextMatch: { id: number } } };
      };
      if (options.last) team.fixtures.allFixtures.lastMatch.id = options.last;
      if (options.next) team.fixtures.allFixtures.nextMatch.id = options.next;
      return team;
    }
    if (path === "/api/data/matchDetails") {
      const matchId = String(params.matchId);
      const file = MATCH_FILES[matchId];
      if (!file) throw new Error(`No recording for match ${matchId}`);
      const body = recorded(file);
      return options.edit ? options.edit(matchId, body) : body;
    }
    throw new Error(`No recording for ${path}`);
  };
}

async function fetchRooms(options?: Parameters<typeof recordedFotmob>[0]) {
  const { rooms, warnings } = await createFotmobProvider(recordedFotmob(options)).getBarcaMatchRooms();
  const byId = (id: string): FetchedMatchRoom => {
    const room = rooms.find((candidate) => candidate.externalId === id);
    if (!room) throw new Error(`Room ${id} missing`);
    return room;
  };
  return { rooms, warnings, byId };
}

const describeEvent = (event: MatchRoomEvent) =>
  `${event.minute}${event.addedMinute ? `+${event.addedMinute}` : ""} ${event.kind} ${event.player} ${event.forBarca ? "barca" : "opponent"}`;

describe("parseExpectedReturn", () => {
  it("reads the wordings FotMob uses", () => {
    expect(parseExpectedReturn("About 1-2 weeks")).toEqual({ kind: "duration", unit: "weeks", min: 1, max: 2 });
    expect(parseExpectedReturn("About 2 weeks")).toEqual({ kind: "duration", unit: "weeks", min: 2, max: 2 });
    expect(parseExpectedReturn("About 1 week")).toEqual({ kind: "duration", unit: "weeks", min: 1, max: 1 });
    expect(parseExpectedReturn("About 3 months")).toEqual({ kind: "duration", unit: "months", min: 3, max: 3 });
    expect(parseExpectedReturn("Late November 2026")).toEqual({ kind: "period", part: "late", month: 11, year: 2026 });
    expect(parseExpectedReturn("Mid September 2026")).toEqual({ kind: "period", part: "mid", month: 9, year: 2026 });
    expect(parseExpectedReturn("Early January 2027")).toEqual({ kind: "period", part: "early", month: 1, year: 2027 });
    expect(parseExpectedReturn("Doubtful")).toEqual({ kind: "doubtful" });
  });

  it("keeps anything else as text instead of guessing", () => {
    expect(parseExpectedReturn("Unknown")).toEqual({ kind: "unknown", text: "Unknown" });
    expect(parseExpectedReturn("Late Smarch 2026")).toEqual({ kind: "unknown", text: "Late Smarch 2026" });
    expect(parseExpectedReturn("About 3-1 weeks")).toEqual({ kind: "unknown", text: "About 3-1 weeks" });
    expect(parseExpectedReturn("")).toEqual({ kind: "unknown", text: null });
    expect(parseExpectedReturn(null)).toEqual({ kind: "unknown", text: null });
  });
});

describe("formatExpectedReturn", () => {
  const ltr = (text: string) => `⁦${text}⁩`;

  it("writes English a fan would write", () => {
    expect(formatExpectedReturn({ kind: "duration", unit: "weeks", min: 1, max: 2 }, "en")).toBe(
      "Expected back in about 1–2 weeks",
    );
    expect(formatExpectedReturn({ kind: "duration", unit: "weeks", min: 1, max: 1 }, "en")).toBe(
      "Expected back in about 1 week",
    );
    expect(formatExpectedReturn({ kind: "duration", unit: "months", min: 3, max: 3 }, "en")).toBe(
      "Expected back in about 3 months",
    );
    expect(formatExpectedReturn({ kind: "period", part: "late", month: 11, year: 2026 }, "en")).toBe(
      "Expected back in late November 2026",
    );
    expect(formatExpectedReturn({ kind: "period", part: "mid", month: 1, year: 2027 }, "en")).toBe(
      "Expected back in mid-January 2027",
    );
    expect(formatExpectedReturn({ kind: "doubtful" }, "en")).toBe("Doubtful");
    expect(formatExpectedReturn({ kind: "unknown", text: "Unknown" }, "en")).toBe("Unknown");
    expect(formatExpectedReturn({ kind: "unknown", text: null }, "en")).toBe("Return date unknown");
  });

  it("uses Hebrew's one, two and many forms", () => {
    expect(formatExpectedReturn({ kind: "duration", unit: "weeks", min: 1, max: 1 }, "he")).toBe(
      "צפוי לחזור בעוד כשבוע",
    );
    expect(formatExpectedReturn({ kind: "duration", unit: "weeks", min: 2, max: 2 }, "he")).toBe(
      "צפוי לחזור בעוד כשבועיים",
    );
    expect(formatExpectedReturn({ kind: "duration", unit: "months", min: 3, max: 3 }, "he")).toBe(
      "צפוי לחזור בעוד כ־3 חודשים",
    );
    expect(formatExpectedReturn({ kind: "duration", unit: "weeks", min: 1, max: 2 }, "he")).toBe(
      `צפוי לחזור בעוד כ־${ltr("1–2")} שבועות`,
    );
    expect(formatExpectedReturn({ kind: "period", part: "late", month: 11, year: 2026 }, "he")).toBe(
      "צפוי לחזור בסוף נובמבר 2026",
    );
    expect(formatExpectedReturn({ kind: "period", part: "early", month: 1, year: 2027 }, "he")).toBe(
      "צפוי לחזור בתחילת ינואר 2027",
    );
    expect(formatExpectedReturn({ kind: "doubtful" }, "he")).toBe("בספק");
    // Never shows English wording inside the Hebrew page.
    expect(formatExpectedReturn({ kind: "unknown", text: "Unknown" }, "he")).toBe("מועד החזרה לא ידוע");
  });

  it("writes stoppage time the way scoreboards do", () => {
    expect(formatMinute(45, null)).toBe("45′");
    expect(formatMinute(90, 3)).toBe("90+3′");
  });
});

describe("FotMob provider", () => {
  it("fetches Barça's last and next match", async () => {
    const { rooms, warnings } = await fetchRooms();
    expect(rooms.map((room) => room.externalId)).toEqual(["5868121", "5868133"]);
    expect(warnings).toEqual([]);
  });

  it("reads a finished away match from Barça's side", async () => {
    const room = (await fetchRooms()).byId("5868121");
    expect(room.barcaIsHome).toBe(false);
    expect(room.kickoffAt.toISOString()).toBe("2026-11-08T20:00:00.000Z");

    const { barca, opponent } = room.details;
    expect(barca?.formation).toBe("4-1-2-3");
    expect(barca?.coach).toBe("Hans-Dieter Flick");
    expect(barca?.starters).toHaveLength(11);
    expect(barca?.bench.length).toBeGreaterThan(0);
    expect(barca?.starters.filter((player) => player.isCaptain).map((player) => player.name)).toEqual(["Raphinha"]);
    expect(barca?.starters[0]).toMatchObject({ name: "Joan García", shirtNumber: 1, rating: 7.3 });
    expect(barca?.starters.every((player) => player.pitch !== null)).toBe(true);
    expect(opponent?.coach).toBe("Diego Simeone");

    const deJong = barca?.bench.find((player) => player.name === "Frenkie de Jong");
    expect(deJong).toMatchObject({ subbedOnAt: 46, subbedOffAt: null });

    // 1-2 at full time, Atlético scoring first.
    const goals = room.details.events?.filter((event) => event.kind.endsWith("goal")) ?? [];
    expect(goals.map(describeEvent)[0]).toBe("9 goal Giuliano Simeone opponent");
    expect(goals.filter((goal) => goal.forBarca)).toHaveLength(2);
    expect(goals.filter((goal) => !goal.forBarca)).toHaveLength(1);

    expect(room.details.playerOfTheMatch).toEqual({ name: "Fermín López", rating: 9.1, forBarca: true });
    expect(room.details.stadium).toBe("Riyadh Air Metropolitano");
    expect(room.details.referee).toBe("Javier Alberola Rojas");
  });

  it("reads absences before a match, when there is no lineup yet", async () => {
    const room = (await fetchRooms()).byId("5868133");
    expect(room.barcaIsHome).toBe(true);
    expect(room.details.barca?.starters).toEqual([]);
    expect(room.details.barca?.formation).toBeNull();
    expect(room.details.barca?.absences).toContainEqual({
      name: "Frenkie de Jong",
      reason: "injury",
      expectedReturn: { kind: "duration", unit: "weeks", min: 1, max: 2 },
    });
    expect(room.details.barca?.absences).toContainEqual({
      name: "Rodri",
      reason: "injury",
      expectedReturn: { kind: "period", part: "late", month: 11, year: 2026 },
    });
    expect(room.details.opponent?.absences.length).toBeGreaterThan(0);
    expect(room.details.playerOfTheMatch).toBeNull();
    // FotMob sends an empty referee before one is named.
    expect(room.details.referee).toBeNull();
    expect(room.details.stadium).toBe("Spotify Camp Nou");
  });

  it("credits own goals to the side that benefits, and marks penalties", async () => {
    const room = (await fetchRooms({ last: 5868066 })).byId("5868066");
    const lines = room.details.events?.map(describeEvent);
    expect(lines).toContain("25 penalty-goal Raphinha barca");
    expect(lines).toContain("36 own-goal Asier Villalibre barca");
    expect(lines).toContain("45 missed-penalty Lamine Yamal barca");
    expect(lines).toContain("45+5 yellow Lamine Yamal barca");
    expect(lines).toContain("23 yellow Pedro Felipe opponent");
    expect(lines).toContain("30 goal Maguette Gueye opponent");
    // 7-2 at full time: every goal is there and credited to the right side.
    const goals = room.details.events?.filter((event) => event.kind.endsWith("goal")) ?? [];
    expect(goals.filter((goal) => goal.forBarca)).toHaveLength(7);
    expect(goals.filter((goal) => !goal.forBarca)).toHaveLength(2);
  });

  it("shows a second yellow as a red card, for the right side", async () => {
    const room = (await fetchRooms({ last: 5868091 })).byId("5868091");
    expect(room.barcaIsHome).toBe(false);
    const lines = room.details.events?.map(describeEvent);
    expect(lines).toContain("54 red Facundo Bernal opponent");
    expect(lines).toContain("55 yellow Lamine Yamal barca");
    expect(lines).toContain("10 goal Lamine Yamal barca");
  });

  it("lists events in match order", async () => {
    const room = (await fetchRooms({ last: 5868066 })).byId("5868066");
    const times = room.details.events?.map((event) => event.minute * 100 + (event.addedMinute ?? 0)) ?? [];
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("drops a section it cannot read instead of showing it wrong", async () => {
    const { byId, warnings } = await fetchRooms({
      edit: (matchId, body) => {
        if (matchId !== "5868121") return body;
        const copy = structuredClone(body) as {
          content: { matchFacts: { events: { events: { type: string; time?: number }[] } } };
        };
        const goal = copy.content.matchFacts.events.events.find((event) => event.type === "Goal");
        if (goal) delete goal.time;
        return copy;
      },
    });
    const room = byId("5868121");
    expect(room.details.events).toBeNull();
    expect(room.details.barca?.starters).toHaveLength(11);
    expect(warnings).toEqual(["FotMob match 5868121: could not read events"]);
  });

  it("refuses a match that does not involve Barça", async () => {
    const provider = createFotmobProvider(
      recordedFotmob({
        edit: (_matchId, body) => {
          const copy = structuredClone(body) as {
            general: { homeTeam: { id: number }; awayTeam: { id: number } };
          };
          copy.general.homeTeam.id = 1;
          copy.general.awayTeam.id = 2;
          return copy;
        },
      }),
    );
    await expect(provider.getBarcaMatchRooms()).rejects.toThrow("does not involve Barça");
  });

  it("fails clearly when FotMob changes its team reply", async () => {
    const provider = createFotmobProvider(async () => ({ something: "else" }));
    await expect(provider.getBarcaMatchRooms()).rejects.toThrow("Unrecognised response shape");
  });
});

describe("findFixtureFor", () => {
  const match = (id: string, kickoff: string, isHome: boolean): SeasonMatch => ({
    id,
    kickoffAt: new Date(kickoff),
    status: "scheduled",
    competition: "Primera Division",
    isLeague: true,
    round: null,
    opponent: null,
    isHome,
    goalsFor: null,
    goalsAgainst: null,
    halfTimeFor: null,
    halfTimeAgainst: null,
  });
  const matches = [
    match("a", "2026-11-08T20:00:00Z", false),
    match("b", "2026-11-11T20:00:00Z", true),
    match("c", "2026-11-22T13:00:00Z", true),
  ];

  it("finds the fixture with the same side and kickoff", () => {
    expect(findFixtureFor({ kickoffAt: new Date("2026-11-22T13:00:00Z"), barcaIsHome: true }, matches)?.id).toBe("c");
  });

  it("allows a kickoff that one source has moved", () => {
    expect(findFixtureFor({ kickoffAt: new Date("2026-11-22T18:30:00Z"), barcaIsHome: true }, matches)?.id).toBe("c");
  });

  it("never matches the other side's fixture or a match days away", () => {
    expect(findFixtureFor({ kickoffAt: new Date("2026-11-08T20:00:00Z"), barcaIsHome: true }, matches)).toBeNull();
    expect(findFixtureFor({ kickoffAt: new Date("2026-11-14T20:00:00Z"), barcaIsHome: true }, matches)).toBeNull();
  });
});

describe("runMatchRoom", () => {
  let pg: PGlite;
  let database: Database;
  const scope = { provider: "football-data", teamExternalId: "81", season: 2026 };

  beforeEach(async () => {
    ({ pg, database } = await createIngestedDatabase());
  });

  afterEach(async () => {
    await pg.close();
  });

  const fixtureAt = async (kickoff: string) => {
    const matches = await getSeasonMatches(database, scope);
    const found = matches.find((match) => match.kickoffAt.toISOString() === kickoff);
    if (!found) throw new Error(`No fixture at ${kickoff}`);
    return found;
  };

  it("stores each room on the right fixture, and reads it back", async () => {
    const result = await runMatchRoom({
      database,
      provider: createFotmobProvider(recordedFotmob()),
      scope,
    });
    expect(result.status).toBe("success");
    expect(result.unmatched).toEqual([]);
    expect(result.saved).toHaveLength(2);

    const atletico = await fixtureAt("2026-11-08T20:00:00.000Z");
    const villarreal = await fixtureAt("2026-11-22T13:00:00.000Z");
    expect(atletico.opponent?.name).toContain("Atl");
    expect(villarreal.opponent?.name).toContain("Villarreal");

    const finished = await getMatchRoom(database, atletico.id);
    expect(finished?.barca?.formation).toBe("4-1-2-3");
    expect(finished?.playerOfTheMatch?.name).toBe("Fermín López");
    expect(finished?.updatedAt).toBeInstanceOf(Date);

    const upcoming = await getMatchRoom(database, villarreal.id);
    expect(upcoming?.barca?.absences.map((absence) => absence.name)).toContain("Frenkie de Jong");
  });

  it("replaces a room on the next run instead of adding a second one", async () => {
    const provider = createFotmobProvider(recordedFotmob());
    await runMatchRoom({ database, provider, scope });
    await runMatchRoom({ database, provider, scope });
    const { rows } = await pg.query<{ n: number }>("select count(*)::int as n from match_rooms");
    expect(rows[0]?.n).toBe(2);
  });

  it("skips a match that is not in our fixtures", async () => {
    // The Betis match was in September, before these recorded fixtures were taken: pretend it is
    // the latest match and it has no fixture of ours on the same side within a day.
    const result = await runMatchRoom({
      database,
      provider: createFotmobProvider(
        recordedFotmob({
          last: 5868091,
          edit: (matchId, body) => {
            if (matchId !== "5868091") return body;
            const copy = structuredClone(body) as { general: { matchTimeUTCDate: string } };
            copy.general.matchTimeUTCDate = "2026-11-15T03:00:00.000Z";
            return copy;
          },
        }),
      ),
      scope,
    });
    expect(result.unmatched).toEqual(["5868091"]);
    expect(result.saved.map((saved) => saved.externalId)).toEqual(["5868133"]);
  });

  it("reports a failure without writing anything", async () => {
    const result = await runMatchRoom({
      database,
      provider: createFotmobProvider(async () => {
        throw new Error("FotMob is down");
      }),
      scope,
    });
    expect(result).toMatchObject({ status: "failed", error: "FotMob is down" });
    const { rows } = await pg.query<{ n: number }>("select count(*)::int as n from match_rooms");
    expect(rows[0]?.n).toBe(0);
  });

  it("returns nothing for a fixture with no room yet", async () => {
    const atletico = await fixtureAt("2026-11-08T20:00:00.000Z");
    expect(await getMatchRoom(database, atletico.id)).toBeNull();
  });

  it("lets the app's read-only role read rooms, and nobody else", async () => {
    const { rows } = await pg.query<{ grantee: string; privilege_type: string }>(
      `select grantee, privilege_type from information_schema.role_table_grants
       where table_name = 'match_rooms' and grantee in ('barca_readonly', 'anon', 'authenticated')`,
    );
    expect(rows).toEqual([{ grantee: "barca_readonly", privilege_type: "SELECT" }]);
  });
});
