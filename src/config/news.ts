// Where the news comes from and how it is handled. Change these here, never in logic.

export type PressSide = "barcelona" | "madrid" | "national" | "official";

export type NewsFeed = {
  id: string;
  url: string;
  /** Null when each item names its own outlet, as Google News does. */
  outlet: string | null;
  /** False for general football feeds, whose items are filtered by BARCA_KEYWORDS. */
  barcaOnly: boolean;
};

// Marca's own feed is left out on purpose: it stopped updating in June 2025.
// Sport's refuses feed readers. Both still arrive through Google News.
export const NEWS_FEEDS: NewsFeed[] = [
  {
    id: "mundo-deportivo",
    url: "https://www.mundodeportivo.com/rss/futbol/fc-barcelona.xml",
    outlet: "Mundo Deportivo",
    barcaOnly: true,
  },
  {
    id: "google-news-es",
    url: "https://news.google.com/rss/search?q=%22FC+Barcelona%22+OR+Bar%C3%A7a+when:2d&hl=es&gl=ES&ceid=ES:es",
    outlet: null,
    barcaOnly: true,
  },
  {
    id: "as",
    url: "https://feeds.as.com/mrss-s/pages/as/site/as.com/section/futbol/subsection/primera/",
    outlet: "Diario AS",
    barcaOnly: false,
  },
  {
    id: "el-pais",
    url: "https://feeds.elpais.com/mrss-s/list/ep/site/elpais.com/section/deportes/subsection/futbol",
    outlet: "El País",
    barcaOnly: false,
  },
  {
    id: "el-mundo",
    url: "https://www.elmundo.es/rss/deportes/futbol.xml",
    outlet: "El Mundo",
    barcaOnly: false,
  },
];

export const BARCA_KEYWORDS = /bar[cç]a|barcelona|blaugrana|azulgrana|cul[eé]s?\b/i;

/** Spanish football press leans by city, which is worth knowing when reading it. */
export const OUTLET_SIDES: Record<string, PressSide> = {
  "FC Barcelona": "official",
  "Mundo Deportivo": "barcelona",
  SPORT: "barcelona",
  "El Periódico": "barcelona",
  "El Nacional.cat": "barcelona",
  "Crónica Global": "barcelona",
  "La Vanguardia": "barcelona",
  RAC1: "barcelona",
  MARCA: "madrid",
  "Diario AS": "madrid",
  ABC: "madrid",
  "El Debate": "madrid",
  OkDiario: "madrid",
};

/** Sites built on recycled transfer gossip, which add noise and no reporting. */
export const BLOCKED_OUTLETS = new Set(["Fichajes.com", "Fichajes.net", "Todofichajes.com"]);

export const NEWS_USER_AGENT = "BarcaBrain/0.1 (https://github.com/ChefBoyNun00/barca-brain)";
export const NEWS_REQUEST_TIMEOUT_MS = 15_000;
export const NEWS_SNIPPET_MAX_CHARS = 500;

/** Older items are ignored, so a feed that freezes can never pass old news off as new. */
export const NEWS_MAX_AGE_DAYS = 3;
export const NEWS_KEEP_DAYS = 30;
export const NEWS_TRANSLATE_BATCH_SIZE = 15;
export const NEWS_TRANSLATE_PER_RUN = 60;
export const NEWS_RECENT_TOPICS_LIMIT = 40;

export const BRIEFING_EVERY_HOURS = 6;
export const BRIEFING_WINDOW_HOURS = 24;
export const BRIEFING_MIN_STORIES = 3;
export const BRIEFING_MAX_STORIES = 30;

export const NEWS_PAGE_LIMIT = 120;
export const HOME_STORIES_LIMIT = 3;
export const PLAYER_STORIES_LIMIT = 3;
