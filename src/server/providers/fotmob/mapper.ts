import { FOTMOB } from "@/config/match-room";
import type {
  Absence,
  ExpectedReturn,
  FetchedMatchRoom,
  LineupPlayer,
  MatchEventKind,
  MatchRoomEvent,
  TeamSheet,
} from "@/domain/match-room";
import {
  EventsSchema,
  InfoBoxSchema,
  LineupSchema,
  PlayerOfTheMatchSchema,
  type RawEvent,
  type RawLineupPlayer,
  type RawLineupSide,
  type RawMatchDetails,
} from "./schemas";

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const DURATION = /^about (\d+)(?:\s*-\s*(\d+))? (day|week|month)s?$/i;
const PERIOD = /^(early|mid|late)[\s-]+([a-z]+) (\d{4})$/i;

/** FotMob writes "About 1-2 weeks", "Late November 2026" or "Doubtful". Anything else is kept as text. */
export function parseExpectedReturn(text: string | null | undefined): ExpectedReturn {
  const clean = text?.trim();
  if (!clean) return { kind: "unknown", text: null };
  if (/^doubtful$/i.test(clean)) return { kind: "doubtful" };

  const duration = DURATION.exec(clean);
  if (duration) {
    const min = Number(duration[1]);
    const max = Number(duration[2] ?? duration[1]);
    const unit = `${duration[3]?.toLowerCase()}s` as "days" | "weeks" | "months";
    if (min <= max) return { kind: "duration", unit, min, max };
  }

  const period = PERIOD.exec(clean);
  if (period) {
    const month = MONTHS.indexOf(period[2]?.toLowerCase() ?? "") + 1;
    const part = period[1]?.toLowerCase() as "early" | "mid" | "late";
    if (month > 0) return { kind: "period", part, month, year: Number(period[3]) };
  }
  return { kind: "unknown", text: clean };
}

function toRating(value: number | string | null | undefined): number | null {
  const rating = typeof value === "string" ? Number.parseFloat(value) : value;
  return typeof rating === "number" && Number.isFinite(rating) ? rating : null;
}

function toShirtNumber(value: number | string | null | undefined): number | null {
  const text = String(value ?? "").trim();
  return /^\d+$/.test(text) ? Number(text) : null;
}

function mapPlayer(raw: RawLineupPlayer): LineupPlayer {
  const substitutions = raw.performance?.substitutionEvents ?? [];
  return {
    name: raw.name,
    shirtNumber: toShirtNumber(raw.shirtNumber),
    isCaptain: raw.isCaptain === true,
    rating: toRating(raw.performance?.rating),
    pitch: raw.verticalLayout ? { x: raw.verticalLayout.x, y: raw.verticalLayout.y } : null,
    subbedOnAt: substitutions.find((change) => change.type === "subIn")?.time ?? null,
    subbedOffAt: substitutions.find((change) => change.type === "subOut")?.time ?? null,
  };
}

function mapAbsence(raw: NonNullable<RawLineupSide["unavailable"]>[number]): Absence {
  const type = raw.unavailability?.type;
  return {
    name: raw.name,
    reason: type === "injury" || type === "suspension" ? type : "other",
    expectedReturn: parseExpectedReturn(raw.unavailability?.expectedReturn),
  };
}

function mapSide(raw: RawLineupSide): TeamSheet {
  return {
    formation: raw.formation?.trim() || null,
    coach: raw.coach?.name ?? null,
    starters: (raw.starters ?? []).map(mapPlayer),
    bench: (raw.subs ?? []).map(mapPlayer),
    absences: (raw.unavailable ?? []).map(mapAbsence),
  };
}

function eventKind(raw: RawEvent): MatchEventKind | null {
  if (raw.isPenaltyShootoutEvent) return null;
  if (raw.type === "Goal") {
    if (raw.ownGoal) return "own-goal";
    return raw.goalDescriptionKey === "penalty" ? "penalty-goal" : "goal";
  }
  if (raw.type === "Card") {
    // A second yellow arrives as a red-type card ("YellowRed"), and is a sending off.
    if (/red/i.test(raw.card ?? "")) return "red";
    if (/yellow/i.test(raw.card ?? "")) return "yellow";
    return null;
  }
  if (raw.type === "MissedPenalty") return "missed-penalty";
  return null;
}

function mapEvent(raw: RawEvent, barcaIsHome: boolean): MatchRoomEvent | null {
  const kind = eventKind(raw);
  if (kind === null) return null;
  const player = raw.player?.name ?? raw.nameStr;
  // A goal we cannot place or credit would make the timeline wrong, so the whole section fails.
  if (typeof raw.time !== "number" || typeof raw.isHome !== "boolean" || !player) {
    throw new Error(`Incomplete ${raw.type} event`);
  }
  return {
    kind,
    minute: raw.time,
    addedMinute: raw.overloadTime ? raw.overloadTime : null,
    player,
    forBarca: raw.isHome === barcaIsHome,
  };
}

const byMatchTime = (a: MatchRoomEvent, b: MatchRoomEvent) =>
  a.minute - b.minute || (a.addedMinute ?? 0) - (b.addedMinute ?? 0);

/** Reads one optional section. A section that is there but unreadable is null and named in `warnings`. */
function readSection<T>(
  name: string,
  value: unknown,
  read: (value: unknown) => T,
  warnings: string[],
  matchId: string,
): T | null {
  if (value === undefined || value === null) return null;
  try {
    return read(value);
  } catch {
    warnings.push(`FotMob match ${matchId}: could not read ${name}`);
    return null;
  }
}

export function mapMatchDetails(raw: RawMatchDetails, warnings: string[]): FetchedMatchRoom {
  const { general, content } = raw;
  const barcaIsHome = general.homeTeam.id === FOTMOB.teamId;
  if (!barcaIsHome && general.awayTeam.id !== FOTMOB.teamId) {
    throw new Error(`FotMob match ${general.matchId} does not involve Barça`);
  }
  const kickoffAt = new Date(general.matchTimeUTCDate);
  if (Number.isNaN(kickoffAt.getTime())) {
    throw new Error(`FotMob match ${general.matchId} has no readable kickoff time`);
  }

  const facts = content.matchFacts;
  const read = <T>(name: string, value: unknown, reader: (value: unknown) => T) =>
    readSection(name, value, reader, warnings, general.matchId);

  const lineup = read("lineup", content.lineup, (value) => {
    const { homeTeam, awayTeam } = LineupSchema.parse(value);
    const [barca, opponent] = barcaIsHome ? [homeTeam, awayTeam] : [awayTeam, homeTeam];
    return { barca: mapSide(barca), opponent: mapSide(opponent) };
  });

  const events = read("events", facts?.events, (value) =>
    EventsSchema.parse(value)
      .events.flatMap((event) => mapEvent(event, barcaIsHome) ?? [])
      .sort(byMatchTime),
  );

  const info = read("match info", facts?.infoBox, (value) => InfoBoxSchema.parse(value));

  // Before kickoff FotMob sends an empty or partial object here, which simply means "not yet".
  const best = PlayerOfTheMatchSchema.safeParse(facts?.playerOfTheMatch);

  return {
    externalId: general.matchId,
    kickoffAt,
    barcaIsHome,
    details: {
      barca: lineup?.barca ?? null,
      opponent: lineup?.opponent ?? null,
      events,
      playerOfTheMatch: best.success
        ? {
            name: best.data.name.fullName,
            rating: toRating(best.data.rating?.num),
            forBarca: best.data.teamId === FOTMOB.teamId,
          }
        : null,
      stadium: info?.Stadium?.name?.trim() || null,
      referee: info?.Referee?.text?.trim() || null,
    },
  };
}
