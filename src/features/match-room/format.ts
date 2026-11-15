import { DISPLAY_LOCALES } from "@/config/display";
import type { ExpectedReturn } from "@/domain/match-room";
import type { Language } from "@/i18n/dictionary";

/** Keeps a range such as 1–2 in reading order inside Hebrew, where it would otherwise show as 2–1. */
const LTR = (text: string) => `⁦${text}⁩`;

const monthName = (month: number, language: Language) =>
  new Intl.DateTimeFormat(DISPLAY_LOCALES[language], { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2000, month - 1, 15)),
  );

const EN_UNITS = {
  days: ["day", "days"],
  weeks: ["week", "weeks"],
  months: ["month", "months"],
} as const;

/** Hebrew has a word for one, a dual for two, and a plural from three. */
const HE_UNITS = {
  days: ["יום", "יומיים", "ימים"],
  weeks: ["שבוע", "שבועיים", "שבועות"],
  months: ["חודש", "חודשיים", "חודשים"],
} as const;

const EN_PARTS = { early: "early", mid: "mid-", late: "late" } as const;
const HE_PARTS = { early: "תחילת", mid: "אמצע", late: "סוף" } as const;

/** When an absent player should be back, in a sentence a fan would write. */
export function formatExpectedReturn(expected: ExpectedReturn, language: Language): string {
  if (language === "he") {
    switch (expected.kind) {
      case "duration": {
        const [one, two, many] = HE_UNITS[expected.unit];
        if (expected.min !== expected.max) {
          return `צפוי לחזור בעוד כ־${LTR(`${expected.min}–${expected.max}`)} ${many}`;
        }
        if (expected.min === 1) return `צפוי לחזור בעוד כ${one}`;
        if (expected.min === 2) return `צפוי לחזור בעוד כ${two}`;
        return `צפוי לחזור בעוד כ־${expected.min} ${many}`;
      }
      case "period":
        return `צפוי לחזור ב${HE_PARTS[expected.part]} ${monthName(expected.month, "he")} ${expected.year}`;
      case "doubtful":
        return "בספק";
      case "unknown":
        return "מועד החזרה לא ידוע";
    }
  }

  switch (expected.kind) {
    case "duration": {
      const [one, many] = EN_UNITS[expected.unit];
      if (expected.min !== expected.max) {
        return `Expected back in about ${expected.min}–${expected.max} ${many}`;
      }
      return `Expected back in about ${expected.min} ${expected.min === 1 ? one : many}`;
    }
    case "period": {
      const part = EN_PARTS[expected.part];
      const joiner = expected.part === "mid" ? "" : " ";
      return `Expected back in ${part}${joiner}${monthName(expected.month, "en")} ${expected.year}`;
    }
    case "doubtful":
      return "Doubtful";
    case "unknown":
      return expected.text ?? "Return date unknown";
  }
}

/** 45′, or 90+3′ in stoppage time. */
export const formatMinute = (minute: number, addedMinute: number | null) =>
  `${minute}${addedMinute ? `+${addedMinute}` : ""}′`;
