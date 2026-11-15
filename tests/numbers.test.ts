import { describe, expect, it } from "vitest";
import { HISTORY_MOMENTS_HE } from "@/config/history-he";
import { formatScore, formatSigned } from "@/i18n/numbers";

/** The isolate marks are invisible; strip them to compare what the reader sees, in order. */
const visible = (text: string) => text.replace(/[⁦-⁩]/g, "");

describe("formatScore", () => {
  it("puts the first team's goals on the left in English", () => {
    expect(formatScore("en", 3, 1)).toBe("3–1");
  });

  it("puts the first team's goals on the right in Hebrew, read first", () => {
    // Displayed left to right as 1–3, so a Hebrew reader meets Barça's 3 first.
    expect(visible(formatScore("he", 3, 1))).toBe("1–3");
    expect(formatScore("he", 3, 1).startsWith("⁦")).toBe(true);
  });

  it("shows a dash for a missing score", () => {
    expect(formatScore("en", null, 2)).toBe("––2");
  });
});

describe("formatSigned", () => {
  it("signs positive numbers and keeps negatives and zero", () => {
    expect(visible(formatSigned(34))).toBe("+34");
    expect(visible(formatSigned(-13))).toBe("-13");
    expect(visible(formatSigned(0))).toBe("0");
  });

  it("locks the number left to right so Hebrew shows +34, not 34+", () => {
    expect(formatSigned(34)).toBe("⁦+34⁩");
  });
});

describe("Hebrew history scores", () => {
  it("shows Barça's goals on the right in every win", () => {
    // Cruyff's 5–0 at the Bernabéu reads, right to left, 5 then 0.
    const cruyff = HISTORY_MOMENTS_HE["cruyff-0-5"];
    expect(cruyff).toBeDefined();
    expect(visible(cruyff?.story ?? "")).toContain("וניצחה 0–5");
  });
});
