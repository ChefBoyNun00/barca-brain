import { describe, expect, it } from "vitest";
import { displayTeam, formatKickoff, isKickoffTimeKnown } from "@/features/home/format";

describe("team names", () => {
  it("shows teams as the Israeli press writes them, and leaves English alone", () => {
    expect(displayTeam("Villarreal", "he")).toBe("ויאריאל");
    expect(displayTeam("Atleti", "he")).toBe("אתלטיקו מדריד");
    expect(displayTeam("Barça", "he")).toBe("בארסה");
    expect(displayTeam("Villarreal", "en")).toBe("Villarreal");
  });

  it("shows a team it does not know as it arrives", () => {
    expect(displayTeam("Some New FC", "he")).toBe("Some New FC");
  });
});

describe("kickoff times", () => {
  const confirmed = new Date("2026-11-22T13:00:00Z");
  const notYetSet = new Date("2026-12-20T00:00:00Z");

  it("treats midnight UTC as a kickoff time not set yet", () => {
    expect(isKickoffTimeKnown(confirmed)).toBe(true);
    expect(isKickoffTimeKnown(notYetSet)).toBe(false);
  });

  it("says the time is to be confirmed instead of showing 02:00", () => {
    expect(formatKickoff(notYetSet, "he")).toContain("השעה תיקבע");
    expect(formatKickoff(notYetSet, "he")).not.toContain("02:00");
    expect(formatKickoff(notYetSet, "en")).toContain("time TBC");
    expect(formatKickoff(confirmed, "he")).toContain("15:00");
    expect(formatKickoff(confirmed, "he")).toContain("שעון ישראל");
  });
});
