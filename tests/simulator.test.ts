import { describe, expect, it } from "vitest";
import type { LeagueRow, SeasonMatch, SquadPlayer } from "@/domain/home";
import { parseForm } from "@/features/home/season-story";
import {
  getFinishPreview,
  getNextPick,
  getRemainingLeagueMatches,
  getWinsNeeded,
  pickEvery,
  pickLoseBigGames,
  projectEnding,
} from "@/features/home/simulator";
import { buildTape, findLastMeeting } from "@/features/home/tale-of-the-tape";
import {
  formatGoalsPerMatch,
  formatShareOfGoals,
  getAge,
  getInitials,
  getPlayerTotals,
  sortSquad,
} from "@/features/squad/squad-stats";

function team(teamId: string, rank: number, points: number, played = 10): LeagueRow {
  return {
    teamId,
    name: teamId,
    logoUrl: null,
    isBarca: teamId === "barca",
    rank,
    points,
    played,
    won: null,
    drawn: null,
    lost: null,
    goalsFor: 20,
    goalsAgainst: 10,
    form: null,
  };
}

function fixture(id: string, opponentId: string, changes: Partial<SeasonMatch> = {}): SeasonMatch {
  return {
    id,
    kickoffAt: new Date("2026-12-01T18:00:00Z"),
    status: "scheduled",
    competition: "Primera Division",
    isLeague: true,
    round: null,
    opponent: { id: opponentId, name: opponentId, logoUrl: null },
    isHome: true,
    goalsFor: null,
    goalsAgainst: null,
    halfTimeFor: null,
    halfTimeAgainst: null,
    ...changes,
  };
}

// Three teams means a 4 match season, so each has 2 left after playing 2.
const table = [team("barca", 1, 6, 2), team("rival", 2, 4, 2), team("other", 3, 0, 2)];
const remaining = [fixture("a", "rival"), fixture("b", "other")];
const pointsOf = (ending: ReturnType<typeof projectEnding>, id: string) =>
  ending?.finish.find((row) => row.teamId === id)?.points;

describe("the ending simulator", () => {
  it("leaves out played, cancelled and European matches", () => {
    const played = fixture("played", "x", {
      status: "finished",
      goalsFor: 1,
      goalsAgainst: 0,
    });
    const cancelled = fixture("cancelled", "x", { status: "cancelled" });
    const europe = fixture("europe", "x", { isLeague: false });
    const open = fixture("open", "x");
    expect(getRemainingLeagueMatches([played, cancelled, europe, open])).toEqual([open]);
  });

  it("cycles a pick through every result and back to nothing", () => {
    expect(getNextPick(undefined)).toBe("W");
    expect(getNextPick("W")).toBe("D");
    expect(getNextPick("D")).toBe("L");
    expect(getNextPick("L")).toBeUndefined();
  });

  it("runs everyone at their current pace when nothing is picked", () => {
    const ending = projectEnding(table, remaining, {});
    expect(pointsOf(ending, "barca")).toBe(12);
    expect(pointsOf(ending, "rival")).toBe(8);
    expect(ending?.title).toBe("Champions by 4 points");
  });

  it("counts a picked result exactly", () => {
    const ending = projectEnding(table, remaining, { a: "L", b: "L" });
    expect(pointsOf(ending, "barca")).toBe(6);
    expect(ending?.picked).toBe(2);
  });

  it("gives a picked result to the opponent too", () => {
    const beaten = projectEnding(table, remaining, { a: "W" });
    const lostTo = projectEnding(table, remaining, { a: "L" });
    const drawn = projectEnding(table, remaining, { a: "D" });
    expect(pointsOf(beaten, "rival")).toBe(6);
    expect(pointsOf(lostTo, "rival")).toBe(9);
    expect(pointsOf(drawn, "rival")).toBe(7);
  });

  it("names a defeat in the race, and a tie as a tie", () => {
    const behind = projectEnding(table, remaining, { a: "L", b: "L" });
    expect(behind?.barcaRank).toBe(2);
    expect(behind?.title).toBe("2nd, 3 points short");
    const level = projectEnding([team("barca", 1, 6, 2), team("rival", 2, 6, 2)], [], {});
    expect(level?.title).toBe("Level with rival");
    expect(level?.barcaRank).toBe(1);
  });

  it("uses a singular point", () => {
    const close = projectEnding([team("barca", 1, 7, 2), team("rival", 2, 6, 2)], [], {});
    expect(close?.title).toBe("Champions by 1 point");
  });

  it("survives a team with no matches played", () => {
    const ending = projectEnding([team("barca", 1, 0, 0), team("rival", 2, 0, 0)], [], {});
    expect(ending?.finish.every((row) => row.points === 0)).toBe(true);
  });

  it("returns nothing without Barça in the table", () => {
    expect(projectEnding([team("rival", 1, 3)], remaining, {})).toBeNull();
    expect(projectEnding([], [], {})).toBeNull();
  });

  it("offers presets for every remaining match", () => {
    expect(pickEvery(remaining, "W")).toEqual({ a: "W", b: "W" });
    expect(pickLoseBigGames(remaining, table, 1)).toEqual({ a: "L", b: "W" });
  });

  it("works out the wins needed, or says it cannot be done", () => {
    expect(getWinsNeeded(table, remaining)).toBe(1);
    const hopeless = [team("barca", 2, 0, 2), team("rival", 1, 6, 2)];
    expect(getWinsNeeded(hopeless, remaining)).toBeNull();
  });

  it("always keeps Barça in the preview", () => {
    const finish = ["a", "b", "c", "barca"].map((teamId, index) => ({
      ...team(teamId, index + 1, 10 - index),
    }));
    expect(getFinishPreview(finish, 3).map((row) => row.teamId)).toEqual(["a", "b", "barca"]);
    expect(getFinishPreview(finish, 4)).toHaveLength(4);
  });
});

describe("form", () => {
  it("flips the provider's newest-first order", () => {
    expect(parseForm("W,L,D")).toEqual(["D", "L", "W"]);
  });

  it("treats a blank or unknown form as nothing", () => {
    expect(parseForm(null)).toEqual([]);
    expect(parseForm("W,?,L")).toEqual(["L", "W"]);
  });
});

describe("tale of the tape", () => {
  it("compares the two sides, with a longer bar always better", () => {
    const tape = buildTape(table, "rival");
    expect(tape?.rows.find((row) => row.label === "Position")?.barca).toBe("1st");
    expect(tape?.rows.find((row) => row.label === "Points")?.barcaShare).toBeCloseTo(0.6);
    const leaky = buildTape([table[0]!, { ...table[1]!, goalsAgainst: 30 }], "rival");
    const conceded = leaky?.rows.find((row) => row.label === "Goals conceded");
    expect(conceded?.barcaShare).toBeCloseTo(0.75);
  });

  it("does not divide by zero", () => {
    const tape = buildTape([team("barca", 1, 0), team("rival", 2, 0)], "rival");
    expect(tape?.rows.find((row) => row.label === "Points")?.barcaShare).toBe(0.5);
  });

  it("drops a row the provider left blank", () => {
    const tape = buildTape([table[0]!, { ...table[1]!, goalsFor: null }], "rival");
    expect(tape?.rows.map((row) => row.label)).not.toContain("Goals scored");
  });

  it("skips an opponent outside the league", () => {
    expect(buildTape(table, "psg")).toBeNull();
    expect(buildTape(table, undefined)).toBeNull();
  });

  it("finds the latest finished meeting only", () => {
    const first = fixture("first", "rival", {
      status: "finished",
      goalsFor: 1,
      goalsAgainst: 0,
    });
    const second = fixture("second", "rival", {
      status: "finished",
      goalsFor: 2,
      goalsAgainst: 2,
    });
    const later = fixture("later", "rival");
    expect(findLastMeeting([first, second, later], "rival")?.id).toBe("second");
    expect(findLastMeeting([later], "rival")).toBeNull();
  });
});

function player(name: string, changes: Partial<SquadPlayer> = {}): SquadPlayer {
  return {
    id: name,
    name,
    position: "FW",
    birthDate: null,
    nationality: null,
    photo: null,
    stats: [],
    ...changes,
  };
}

const league = (goals: number, assists: number | null, matches: number | null = 10) => ({
  competition: "Primera Division",
  isLeague: true,
  matches,
  goals,
  assists,
});
const europe = (goals: number, assists: number | null) => ({
  competition: "UEFA Champions League",
  isLeague: false,
  matches: 4,
  goals,
  assists,
});

describe("squad stats", () => {
  it("adds up competitions, keeping an all-blank figure blank", () => {
    const both = player("A", { stats: [league(5, null), europe(2, 3)] });
    expect(getPlayerTotals(both)).toEqual({
      goals: 7,
      assists: 3,
      matches: 14,
    });
    expect(getPlayerTotals(player("B", { stats: [league(1, null)] })).assists).toBeNull();
  });

  it("works out age around a birthday", () => {
    const now = new Date("2026-11-06T12:00:00Z");
    expect(getAge("2007-07-13", now)).toBe(19);
    expect(getAge("2007-11-06", now)).toBe(19);
    expect(getAge("2007-11-07", now)).toBe(18);
    expect(getAge(null, now)).toBeNull();
    expect(getAge("not a date", now)).toBeNull();
  });

  it("guards against dividing by zero", () => {
    expect(formatGoalsPerMatch({ goals: 3, assists: null, matches: 0 })).toBeNull();
    expect(formatGoalsPerMatch({ goals: 3, assists: null, matches: 4 })).toBe("0.75");
    expect(formatShareOfGoals(3, 0)).toBeNull();
    expect(formatShareOfGoals(15, 60)).toBe("25%");
  });

  it("makes initials from one or several names", () => {
    expect(getInitials("Pedri")).toBe("P");
    expect(getInitials("Frenkie de Jong")).toBe("FJ");
  });

  it("sorts the squad, keeping unknown birth dates last", () => {
    const squad = [
      player("Old", { birthDate: "1990-01-01" }),
      player("Blank"),
      player("Young", { birthDate: "2007-01-01", stats: [league(2, null)] }),
    ];
    expect(sortSquad(squad, "youngest").map((row) => row.name)).toEqual(["Young", "Old", "Blank"]);
    expect(sortSquad(squad, "goals")[0]?.name).toBe("Young");
    expect(sortSquad(squad, "name")[0]?.name).toBe("Blank");
  });
});
