import { describe, expect, it } from "vitest";
import { classifySeasonAccess } from "@/server/providers/football-data/season-access";

const barca = { id: 81, name: "FC Barcelona" };
const laLiga = { code: "PD", name: "Primera Division" };
const ucl = { code: "CL", name: "UEFA Champions League" };

describe("classifySeasonAccess", () => {
  it("recognises the invalid token reply seen from the live API", () => {
    const body = { message: "Your API token is invalid.", errorCode: 400 };
    expect(classifySeasonAccess(400, body).kind).toBe("bad-key");
  });

  it("does not call every 400 a bad key", () => {
    expect(classifySeasonAccess(400, { message: "Invalid season" }).kind).toBe("unexpected");
  });

  it("treats 403 as a plan restriction", () => {
    const body = { message: "The resource you are looking for is restricted." };
    expect(classifySeasonAccess(403, body).kind).toBe("plan-restricted");
  });

  it("treats 429 as rate limited", () => {
    expect(classifySeasonAccess(429, { message: "Too many requests" }).kind).toBe("rate-limited");
  });

  it("reports no matches as empty, not ok", () => {
    expect(classifySeasonAccess(200, { matches: [] })).toEqual({ kind: "empty" });
  });

  it("does not crash on a non-JSON reply", () => {
    expect(classifySeasonAccess(502, "<html>Bad Gateway</html>").kind).toBe("unexpected");
  });

  it("summarises matches and allows teams that are not known yet", () => {
    const body = {
      matches: [
        {
          id: 2,
          utcDate: "2026-09-01T19:00:00Z",
          status: "TIMED",
          competition: laLiga,
          homeTeam: barca,
          awayTeam: { id: 86, name: "Real Madrid CF" },
        },
        {
          id: 1,
          utcDate: "2026-08-23T19:30:00Z",
          status: "FINISHED",
          competition: laLiga,
          homeTeam: { id: 86, name: "Real Madrid CF" },
          awayTeam: barca,
        },
        {
          id: 3,
          utcDate: "2027-03-10T20:00:00Z",
          status: "SCHEDULED",
          competition: ucl,
          homeTeam: barca,
          awayTeam: { id: null, name: null },
        },
      ],
    };
    expect(classifySeasonAccess(200, body)).toEqual({
      kind: "ok",
      matchCount: 3,
      finishedCount: 1,
      teamName: "FC Barcelona",
      competitions: [
        { ...laLiga, matches: 2 },
        { ...ucl, matches: 1 },
      ],
      firstKickoff: "2026-08-23T19:30:00Z",
      lastKickoff: "2027-03-10T20:00:00Z",
    });
  });
});
