import {
  CLASICO_RIVAL,
  DISPLAY_LOCALE,
  DISPLAY_TIME_ZONE,
  MATCH_LENGTH_MINUTES,
} from "@/config/display";
import type { SeasonMatch } from "@/domain/home";
import { getMatchOutcome } from "./season-story";

const HOUR_MS = 3_600_000;
/** After the final whistle the home page keeps celebrating (or mourning) for this long. */
export const FULL_TIME_WINDOW_HOURS = 24;

export type MatchdayState =
  | { kind: "none" }
  | { kind: "today" | "live" | "fulltime"; match: SeasonMatch; isClasico: boolean };

const dayOf = (date: Date) =>
  new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    timeZone: DISPLAY_TIME_ZONE,
    dateStyle: "short",
  }).format(date);

export const isClasico = (match: SeasonMatch) => match.opponent?.name === CLASICO_RIVAL;

/**
 * What the home page should make of this moment: a match later today, one in play, or one
 * that just finished. The data updates once a day, so "live" means "should be in play now",
 * judged from the kick-off time, and the page says so rather than showing a score.
 */
export function getMatchdayState(matches: SeasonMatch[], now: Date): MatchdayState {
  for (const match of matches) {
    const sinceKickoff = now.getTime() - match.kickoffAt.getTime();
    const flag = isClasico(match);

    if (getMatchOutcome(match) !== null) {
      if (sinceKickoff >= 0 && sinceKickoff < FULL_TIME_WINDOW_HOURS * HOUR_MS) {
        return { kind: "fulltime", match, isClasico: flag };
      }
      continue;
    }
    if (match.status === "postponed" || match.status === "cancelled") continue;

    const isInPlay =
      match.status === "live" ||
      (sinceKickoff >= 0 && sinceKickoff < MATCH_LENGTH_MINUTES * 60_000);
    if (isInPlay) return { kind: "live", match, isClasico: flag };
    if (sinceKickoff < 0 && dayOf(match.kickoffAt) === dayOf(now)) {
      return { kind: "today", match, isClasico: flag };
    }
  }
  return { kind: "none" };
}
