import { describe, expect, it } from "vitest";
import { HISTORY_MOMENTS } from "@/config/history";
import { HISTORY_MOMENTS_HE } from "@/config/history-he";
import { describeMatch } from "@/features/home/season-story";
import { formatUpdatedAgo } from "@/features/home/format";
import { projectEnding } from "@/features/home/simulator";
import { formatStoryAge } from "@/features/news/stories";
import { DICTIONARY, LANGUAGES, translate, type TextKey } from "@/i18n/dictionary";
import { ASK_TOOLS } from "@/server/ai/ask/tools/registry";

describe("translations", () => {
  it("has every word in every language", () => {
    const keys = Object.keys(DICTIONARY.en) as TextKey[];
    for (const language of LANGUAGES) {
      expect(Object.keys(DICTIONARY[language]).sort()).toEqual([...keys].sort());
    }
  });

  it("fills in placeholders", () => {
    expect(translate("en", "hero.kicker", { season: "2026–27", played: 15, total: 46 })).toBe(
      "Més que un club · Season 2026–27 · 15 of 46 played",
    );
    expect(translate("he", "headline.wins", { wins: 13, played: 15 })).toBe("13 ניצחונות מתוך 15.");
  });

  it("writes ordinals the way each language does", () => {
    expect(translate("en", "headline.rank", { rank: 2, league: "La Liga" })).toBe(
      "2nd in La Liga.",
    );
    expect(translate("en", "headline.rank", { rank: 11, league: "La Liga" })).toBe(
      "11th in La Liga.",
    );
    expect(translate("he", "headline.rank", { rank: 2, league: "La Liga" })).toBe(
      "במקום ה־2 ב\u2068La Liga\u2069.",
    );
    expect(translate("he", "headline.rank", { rank: 11, league: "La Liga" })).toBe(
      "במקום ה־11 ב\u2068La Liga\u2069.",
    );
  });

  it("leaves a placeholder visible rather than printing undefined", () => {
    expect(translate("en", "news.showAll")).toBe("Show all {count}");
  });

  it("keeps every placeholder the English text has", () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(DICTIONARY.en) as TextKey[]) {
      expect(placeholders(DICTIONARY.he[key])).toEqual(placeholders(DICTIONARY.en[key]));
    }
  });

  it("isolates names and scores in Hebrew so they keep their own direction", () => {
    expect(translate("he", "ticker.result", { score: "2–1", opponent: "Sevilla FC" })).toBe(
      "ברסה \u20682–1\u2069 \u2068Sevilla FC\u2069",
    );
    // English is left exactly as written.
    expect(translate("en", "ticker.result", { score: "2–1", opponent: "Sevilla FC" })).toBe(
      "Barça 2–1 Sevilla FC",
    );
  });
});

describe("Hebrew content", () => {
  it("has every history moment in Hebrew", () => {
    for (const moment of HISTORY_MOMENTS) {
      expect(HISTORY_MOMENTS_HE[moment.id], moment.id).toBeDefined();
    }
    expect(Object.keys(HISTORY_MOMENTS_HE).sort()).toEqual(HISTORY_MOMENTS.map((m) => m.id).sort());
  });

  it("names every Ask tool, and the English names match the tools' own labels", () => {
    for (const tool of ASK_TOOLS) {
      const key = `tool.${tool.name}` as TextKey;
      expect(DICTIONARY.en[key], tool.name).toBe(tool.label);
    }
  });

  it("writes dates, ages and match descriptions in Hebrew", () => {
    const kickoff = new Date("2026-11-08T20:00:00Z");
    const match = {
      id: "m1",
      kickoffAt: kickoff,
      competition: "Primera Division",
      round: null,
      isLeague: true,
      isHome: true,
      status: "finished",
      goalsFor: 2,
      goalsAgainst: 1,
      halfTimeFor: null,
      halfTimeAgainst: null,
      opponent: { id: "t1", name: "Sevilla FC", logoUrl: null },
    } as unknown as Parameters<typeof describeMatch>[0];
    expect(describeMatch(match)).toBe("Win, 2–1 at home to Sevilla FC, 8 Nov");
    const hebrew = describeMatch(match, "he");
    expect(hebrew).toContain("ניצחון");
    expect(hebrew).toContain("בבית");
    expect(hebrew).toContain("נוב");
    expect(hebrew).not.toMatch(/Win|home|Nov/);

    const now = new Date("2026-11-08T23:00:00Z");
    expect(formatStoryAge(kickoff, now)).toBe("3h ago");
    expect(formatStoryAge(kickoff, now, "he")).toBe("לפני 3 שע׳");
    expect(formatUpdatedAgo(kickoff, now, "he")).toBe("עודכן לפני 3 שעות");
  });

  it("writes the what-if verdict in Hebrew", () => {
    const row = (teamId: string, points: number, isBarca = false) => ({
      teamId,
      name: teamId,
      logoUrl: null,
      isBarca,
      rank: 1,
      played: 10,
      won: 0,
      drawn: 0,
      lost: 0,
      points,
      goalsFor: 0,
      goalsAgainst: 0,
      form: null,
    });
    const table = [row("barca", 30, true), row("madrid", 20)] as Parameters<typeof projectEnding>[0];
    expect(projectEnding(table, [], {})?.title).toBe("Champions by 10 points");
    expect(projectEnding(table, [], {}, "he")?.title).toBe("אלופים בהפרש \u206810 נקודות\u2069");
  });
});
