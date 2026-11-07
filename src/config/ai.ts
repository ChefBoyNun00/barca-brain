// Models and limits for everything that calls Claude. Change these here, never in logic.

/** Ask Blaugrana: per docs/05_ASK_BARCA_AI.md, Sonnet by default. */
export const ASK_MODEL = "claude-sonnet-5-5";

/** Translating headlines is high volume and simple, the doc's "cheap mode" case. */
export const NEWS_MODEL = "claude-haiku-5-5";

export const ASK_MAX_TOOL_ROUNDS = 6;
export const ASK_MAX_OUTPUT_TOKENS = 4_000;
export const ASK_MAX_MESSAGES = 12;
export const ASK_MAX_MESSAGE_CHARS = 8_000;
export const ASK_REQUESTS_PER_HOUR = 30;

export const NEWS_MAX_OUTPUT_TOKENS = 16_000;

export const ASK_SEARCH_NEWS_LIMIT = 12;
export const ASK_TOP_PLAYERS_MAX = 15;
