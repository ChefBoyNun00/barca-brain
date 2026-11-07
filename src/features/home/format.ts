import {
  COMPETITION_DISPLAY_NAMES,
  DISPLAY_LOCALE,
  DISPLAY_TIME_ZONE,
} from "@/config/display";

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? "" : "s"}`;

export function formatSeason(season: number): string {
  return `${season}–${String(season + 1).slice(-2)}`;
}

export function displayCompetition(name: string): string {
  return COMPETITION_DISPLAY_NAMES[name] ?? name;
}

export function formatKickoff(date: Date): string {
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    timeZone: DISPLAY_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function formatMatchDate(date: Date): string {
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
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

export function formatUpdatedAgo(updatedAt: Date, now: Date): string {
  const elapsed = Math.max(0, now.getTime() - updatedAt.getTime());
  if (elapsed < HOUR_MS) return "Updated within the last hour";
  if (elapsed < DAY_MS) return `Updated ${plural(Math.floor(elapsed / HOUR_MS), "hour")} ago`;
  return `Updated ${plural(Math.floor(elapsed / DAY_MS), "day")} ago`;
}

/** A blank stat stays visibly blank, because the provider never said it was zero. */
export function formatOptionalStat(value: number | null): string {
  return value === null ? "–" : String(value);
}
