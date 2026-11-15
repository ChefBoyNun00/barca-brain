// How the app shows data. Change these here, never in components.

export const DISPLAY_LOCALE = "en-GB";
/** Dates and months are written in the visitor's language: 8 Nov in English, 8 בנוב׳ in Hebrew. */
export const DISPLAY_LOCALES = { en: "en-GB", he: "he-IL" } as const;
export const DISPLAY_TIME_ZONE = "Asia/Jerusalem";
/** Barça's crest, from the same crest host as every opponent's. */
export const BARCA_CREST_URL = "https://crests.football-data.org/81.png";
export const RACE_TEAMS_LIMIT = 4;

/** Provider names fans do not use. Anything not listed shows as it arrives. */
export const COMPETITION_DISPLAY_NAMES: Record<string, string> = {
  "Primera Division": "La Liga",
  "UEFA Champions League": "Champions League",
};

/** The same competitions as Israeli fans and press name them. Anything not listed falls back to English. */
export const COMPETITION_DISPLAY_NAMES_HE: Record<string, string> = {
  "Primera Division": "לה ליגה",
  "UEFA Champions League": "ליגת האלופות",
  "Copa del Rey": "גביע המלך",
  "Supercopa de España": "הסופרקופה",
  "UEFA Europa League": "הליגה האירופית",
  "FIFA Club World Cup": "מונדיאל המועדונים",
};

export const POINTS_FOR = { W: 3, D: 1, L: 0 } as const;

/** How long each stripe stays on screen when the season replays. */
export const REPLAY_STEP_MS = 240;

/** Includes the season, so last season's picks are never read back. */
export const ENDING_PICKS_STORAGE_KEY = "barca-brain:ending-picks:2026";

export const POSITION_LABELS = {
  GK: "Goalkeeper",
  DF: "Defender",
  MF: "Midfielder",
  FW: "Forward",
} as const;

/** Roughly a match with stoppages and half-time, for calendar entries. */
export const MATCH_LENGTH_MINUTES = 115;

/** The opponent's name, as the data provider spells it, that turns a match into El Clásico. */
export const CLASICO_RIVAL = "Real Madrid";

/** Remembers, for this visit only, that the intro has already played. */
export const INTRO_STORAGE_KEY = "barca-brain:intro";

/** Remembers the visitor's language in this browser. Read before the first paint as well. */
export const LANGUAGE_STORAGE_KEY = "barca-brain:language";

/**
 * The official club, linked from the foot of every page so the app sits inside the wider Barça
 * world. Checked on 2026-11-09; the club has no Hebrew site, so every language gets English.
 */
export const CLUB_LINKS = [
  { id: "site", href: "https://www.fcbarcelona.com/en/", icon: "external" },
  { id: "tickets", href: "https://www.fcbarcelona.com/en/tickets", icon: "ticket" },
  { id: "shop", href: "https://store.fcbarcelona.com/", icon: "bag" },
  { id: "video", href: "https://www.youtube.com/@fcbarcelona", icon: "play" },
] as const;
