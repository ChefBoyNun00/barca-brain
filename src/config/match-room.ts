// The Matchday Room: lineups, absences and match events from FotMob, plus where to watch in Israel.

export const FOTMOB = {
  baseUrl: "https://www.fotmob.com",
  /** FotMob's own id for FC Barcelona. */
  teamId: 8634,
  /** Asks as a visitor from Israel would, the same way FotMob's own site does. */
  countryCode: "ISR",
  /** FotMob refuses requests with no user agent. We say who we are instead of posing as a browser. */
  userAgent: "barca-brain (fan project)",
  requestTimeoutMs: 15_000,
} as const;

/**
 * A FotMob match is the same as one of our fixtures when Barça is on the same side and the
 * kickoffs are this close. Barça never plays twice within it, and it absorbs a kickoff time that
 * one source has moved before the other.
 */
export const MATCH_ROOM_KICKOFF_TOLERANCE_HOURS = 24;

/**
 * Where to watch in Israel, by competition name as stored in our database. Edit by hand when the
 * rights change. A competition that is not listed shows no channel rather than a guess.
 */
export const ISRAEL_TV_CHANNELS: Record<string, { en: string; he: string }> = {
  "Primera Division": { en: "Channel 50", he: "ערוץ 50" },
};
