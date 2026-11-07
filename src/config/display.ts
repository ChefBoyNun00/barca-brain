// How the app shows data. Change these here, never in components.

export const DISPLAY_LOCALE = "en-GB";
export const DISPLAY_TIME_ZONE = "Asia/Jerusalem";
export const TOP_SCORERS_LIMIT = 5;
export const RACE_TEAMS_LIMIT = 4;

/** Provider names fans do not use. Anything not listed shows as it arrives. */
export const COMPETITION_DISPLAY_NAMES: Record<string, string> = {
  "Primera Division": "La Liga",
  "UEFA Champions League": "Champions League",
};
