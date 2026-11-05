// All football IDs and API settings live here. Logic must never inline them.

export const FOOTBALL_PROVIDERS = ["api-football", "football-data"] as const;

/** 2026 means the 2026-27 season. */
export const CURRENT_SEASON = 2026;

export const API_FOOTBALL = {
  baseUrl: "https://v3.football.api-sports.io",
  authHeader: "x-apisports-key",
  requestTimeoutMs: 15_000,
  teamId: 529,
  competitions: [
    { key: "la_liga", id: 140 },
    { key: "ucl", id: 2 },
    { key: "copa", id: 143 },
  ],
} as const;

export const FOOTBALL_DATA = {
  baseUrl: "https://api.football-data.org",
  authHeader: "X-Auth-Token",
  requestTimeoutMs: 15_000,
  teamId: 81,
  competitions: [
    { key: "la_liga", code: "PD" },
    { key: "ucl", code: "CL" },
  ],
} as const;
