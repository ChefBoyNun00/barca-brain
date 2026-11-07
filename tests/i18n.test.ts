import { describe, expect, it } from "vitest";
import { DICTIONARY, LANGUAGES, translate, type TextKey } from "@/i18n/dictionary";

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
    expect(translate("ca", "headline.wins", { wins: 13, played: 15 })).toBe("13 victòries de 15.");
  });

  it("writes ordinals the way each language does", () => {
    expect(translate("en", "headline.rank", { rank: 2, league: "La Liga" })).toBe(
      "2nd in La Liga.",
    );
    expect(translate("en", "headline.rank", { rank: 11, league: "La Liga" })).toBe(
      "11th in La Liga.",
    );
    expect(translate("ca", "headline.rank", { rank: 2, league: "La Liga" })).toBe("2n a La Liga.");
    expect(translate("ca", "headline.rank", { rank: 5, league: "La Liga" })).toBe("5è a La Liga.");
  });

  it("leaves a placeholder visible rather than printing undefined", () => {
    expect(translate("en", "news.showAll")).toBe("Show all {count}");
  });

  it("keeps every placeholder the English text has", () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(DICTIONARY.en) as TextKey[]) {
      expect(placeholders(DICTIONARY.ca[key])).toEqual(placeholders(DICTIONARY.en[key]));
    }
  });
});
