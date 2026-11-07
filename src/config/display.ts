// How the app shows data. Change these here, never in components.

export const DISPLAY_LOCALE = "en-GB";
export const DISPLAY_TIME_ZONE = "Asia/Jerusalem";
/** Barça's crest, from the same crest host as every opponent's. */
export const BARCA_CREST_URL = "https://crests.football-data.org/81.png";
export const RACE_TEAMS_LIMIT = 4;

/** Provider names fans do not use. Anything not listed shows as it arrives. */
export const COMPETITION_DISPLAY_NAMES: Record<string, string> = {
  "Primera Division": "La Liga",
  "UEFA Champions League": "Champions League",
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
