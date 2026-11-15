import {
  COMPETITION_DISPLAY_NAMES,
  COMPETITION_DISPLAY_NAMES_HE,
  DISPLAY_LOCALES,
  DISPLAY_TIME_ZONE,
} from "@/config/display";
import { isTextKey, translate, type Language } from "@/i18n/dictionary";

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

export function formatSeason(season: number): string {
  return `${season}–${String(season + 1).slice(-2)}`;
}

/** The competition as fans call it, in the visitor's language. Server code and AI tools pass no language and get English. */
export function displayCompetition(name: string, language: Language = "en"): string {
  if (language === "he") return COMPETITION_DISPLAY_NAMES_HE[name] ?? COMPETITION_DISPLAY_NAMES[name] ?? name;
  return COMPETITION_DISPLAY_NAMES[name] ?? name;
}

/**
 * The round as the provider names it ("Matchday 12", "Quarter finals"), in the visitor's language.
 * English keeps the stored text exactly; a round the dictionary doesn't know shows as stored.
 */
export function displayRound(round: string | null, language: Language = "en"): string | null {
  if (round === null || language === "en") return round;
  const matchday = /^Matchday (\d+)$/.exec(round);
  if (matchday) return translate(language, "round.matchday", { n: Number(matchday[1]) });
  const key = `round.${round}`;
  return isTextKey(key) ? translate(language, key) : round;
}

export function formatKickoff(date: Date, language: Language = "en"): string {
  return new Intl.DateTimeFormat(DISPLAY_LOCALES[language], {
    timeZone: DISPLAY_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    // English says "GMT+2"; Hebrew readers expect "שעון ישראל" (Israel time) instead.
    timeZoneName: language === "en" ? "short" : undefined,
  })
    .format(date)
    .concat(language === "en" ? "" : ` ${translate(language, "time.zone")}`);
}

export function formatMatchDate(date: Date, language: Language = "en"): string {
  return new Intl.DateTimeFormat(DISPLAY_LOCALES[language], {
    timeZone: DISPLAY_TIME_ZONE,
    day: "numeric",
    month: "short",
  }).format(date);
}

export type CountdownParts = { days: number; hours: number; minutes: number; seconds: number };

export function getCountdownParts(kickoffAt: Date, now: Date): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor((kickoffAt.getTime() - now.getTime()) / 1000));
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor(totalSeconds / 3_600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
  };
}

export function formatUpdatedAgo(updatedAt: Date, now: Date, language: Language = "en"): string {
  const elapsed = Math.max(0, now.getTime() - updatedAt.getTime());
  if (elapsed < HOUR_MS) return translate(language, "updated.recent");
  if (elapsed < DAY_MS) {
    const hours = Math.floor(elapsed / HOUR_MS);
    return hours === 1
      ? translate(language, "updated.hour")
      : translate(language, "updated.hours", { n: hours });
  }
  const days = Math.floor(elapsed / DAY_MS);
  return days === 1
    ? translate(language, "updated.day")
    : translate(language, "updated.days", { n: days });
}

/** A blank stat stays visibly blank, because the provider never said it was zero. */
export function formatOptionalStat(value: number | null): string {
  return value === null ? "–" : String(value);
}
