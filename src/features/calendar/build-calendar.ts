import { MATCH_LENGTH_MINUTES } from "@/config/display";
import type { SeasonMatch } from "@/domain/home";
import { displayCompetition } from "../home/format";

const MINUTE_MS = 60_000;

/** Commas, semicolons and new lines mean something in calendar files. */
const escapeText = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

const toCalendarTime = (date: Date) => date.toISOString().replace(/[-:]|\.\d{3}/g, "");

function buildEvent(match: SeasonMatch, stamp: string): string[] {
  const opponent = match.opponent?.name ?? "To be decided";
  const teams = match.isHome ? `Barça v ${opponent}` : `${opponent} v Barça`;
  const score =
    match.goalsFor === null || match.goalsAgainst === null
      ? ""
      : ` (Barça ${match.goalsFor}–${match.goalsAgainst})`;
  const end = new Date(match.kickoffAt.getTime() + MATCH_LENGTH_MINUTES * MINUTE_MS);
  return [
    "BEGIN:VEVENT",
    `UID:${match.id}@barca-brain`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toCalendarTime(match.kickoffAt)}`,
    `DTEND:${toCalendarTime(end)}`,
    `SUMMARY:${escapeText(`${teams}${score}`)}`,
    `DESCRIPTION:${escapeText(
      [displayCompetition(match.competition), match.round].filter(Boolean).join(" · "),
    )}`,
    "END:VEVENT",
  ];
}

/** Times are in UTC, so each viewer's calendar shows them in their own time zone. */
export function buildCalendar(matches: SeasonMatch[], now: Date): string {
  const stamp = toCalendarTime(now);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Barca Brain//Fixtures//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Barça fixtures",
    ...matches.filter((match) => match.status !== "cancelled").flatMap((m) => buildEvent(m, stamp)),
    "END:VCALENDAR",
  ];
  return `${lines.join("\r\n")}\r\n`;
}
