// Where the news comes from and how it is handled. Change these here, never in logic.

export const PRESS_SIDES = ["barcelona", "madrid", "national", "english", "israel", "official"] as const;
export type PressSide = (typeof PRESS_SIDES)[number];

/**
 * The news page has two editions, each its own section: the world's press, and Israel's own.
 * The club's own news belongs to the world edition. Add an edition here and give it a tab label.
 */
export const NEWS_EDITIONS = {
  world: ["barcelona", "madrid", "national", "english", "official"],
  israel: ["israel"],
} as const satisfies Record<string, readonly PressSide[]>;
export type NewsEdition = keyof typeof NEWS_EDITIONS;
export const NEWS_EDITION_IDS = Object.keys(NEWS_EDITIONS) as NewsEdition[];
export const DEFAULT_NEWS_EDITION: NewsEdition = "world";

/** Remembers the visitor's edition between visits. Read by the server, so it is a cookie. */
export const NEWS_EDITION_COOKIE = "barca-brain-news-edition";
export const NEWS_EDITION_COOKIE_DAYS = 365;

export type NewsLanguage = "es" | "en" | "he";

/**
 * Articles are translated and grouped into stories. Videos, fan threads and podcast episodes
 * are shown as they are.
 */
export type FeedKind = "article" | "video" | "fan" | "podcast";

export type NewsFeed = {
  id: string;
  url: string;
  /** RSS for news sites and podcasts; Atom for YouTube and Reddit. */
  format: "rss" | "atom";
  kind: FeedKind;
  language: NewsLanguage;
  /** Null when each item names its own outlet, as Google News does. */
  outlet: string | null;
  /** False for general football feeds, whose items are filtered by BARCA_KEYWORDS. */
  barcaOnly: boolean;
  /** Set on a search for one journalist's reporting: every item it finds credits them. */
  scoopBy?: ScoopJournalist;
};

// Marca's own feed is left out on purpose: it stopped updating in June 2025.
// Sport's refuses feed readers. Both still arrive through Google News.
export const NEWS_FEEDS: NewsFeed[] = [
  {
    id: "mundo-deportivo",
    format: "rss",
    kind: "article",
    language: "es",
    url: "https://www.mundodeportivo.com/rss/futbol/fc-barcelona.xml",
    outlet: "Mundo Deportivo",
    barcaOnly: true,
  },
  {
    id: "google-news-es",
    format: "rss",
    kind: "article",
    language: "es",
    url: "https://news.google.com/rss/search?q=%22FC+Barcelona%22+OR+Bar%C3%A7a+when:2d&hl=es&gl=ES&ceid=ES:es",
    outlet: null,
    barcaOnly: true,
  },
  {
    id: "as",
    format: "rss",
    kind: "article",
    language: "es",
    url: "https://feeds.as.com/mrss-s/pages/as/site/as.com/section/futbol/subsection/primera/",
    outlet: "Diario AS",
    barcaOnly: false,
  },
  {
    id: "el-pais",
    format: "rss",
    kind: "article",
    language: "es",
    url: "https://feeds.elpais.com/mrss-s/list/ep/site/elpais.com/section/deportes/subsection/futbol",
    outlet: "El País",
    barcaOnly: false,
  },
  {
    id: "el-mundo",
    format: "rss",
    kind: "article",
    language: "es",
    url: "https://www.elmundo.es/rss/deportes/futbol.xml",
    outlet: "El Mundo",
    barcaOnly: false,
  },
  // English-language press. General football feeds are filtered down to Barça.
  {
    id: "guardian",
    format: "rss",
    kind: "article",
    language: "en",
    url: "https://www.theguardian.com/football/barcelona/rss",
    outlet: "The Guardian",
    barcaOnly: true,
  },
  {
    id: "bbc",
    format: "rss",
    kind: "article",
    language: "en",
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
    outlet: "BBC Sport",
    barcaOnly: false,
  },
  {
    id: "espn",
    format: "rss",
    kind: "article",
    language: "en",
    url: "https://www.espn.com/espn/rss/soccer/news",
    outlet: "ESPN",
    barcaOnly: false,
  },
  {
    id: "barca-blaugranes",
    format: "atom",
    kind: "article",
    language: "en",
    url: "https://www.barcablaugranes.com/rss/index.xml",
    outlet: "Barça Blaugranes",
    barcaOnly: true,
  },
  {
    id: "barca-universal",
    format: "rss",
    kind: "article",
    language: "en",
    url: "https://barcauniversal.com/feed/",
    outlet: "Barça Universal",
    barcaOnly: true,
  },
  {
    id: "google-news-en",
    format: "rss",
    kind: "article",
    language: "en",
    url: "https://news.google.com/rss/search?q=%22FC+Barcelona%22+when:2d&hl=en-GB&gl=GB&ceid=GB:en",
    outlet: null,
    barcaOnly: true,
  },
  // X is paid, so the big transfer journalists arrive through the outlets reporting their posts.
  // Their searches also return other clubs' stories, so these are filtered down to Barça.
  {
    id: "google-news-romano",
    format: "rss",
    kind: "article",
    language: "en",
    url: "https://news.google.com/rss/search?q=Barcelona+%22Fabrizio+Romano%22+when:3d&hl=en-GB&gl=GB&ceid=GB:en",
    outlet: null,
    barcaOnly: false,
    scoopBy: "romano",
  },
  {
    id: "google-news-ornstein",
    format: "rss",
    kind: "article",
    language: "en",
    url: "https://news.google.com/rss/search?q=Barcelona+Ornstein+when:3d&hl=en-GB&gl=GB&ceid=GB:en",
    outlet: null,
    barcaOnly: false,
    scoopBy: "ornstein",
  },
  // The Israeli press, in Hebrew. Sport5, Sport1 (ספורט 1), Israel Hayom and Maariv have no
  // working feed of their own, so they arrive through Google News. Walla's feed is its Spanish
  // league section; ONE and ynet are whole sports sections, filtered down to Barça.
  {
    id: "google-news-he",
    format: "rss",
    kind: "article",
    language: "he",
    url: "https://news.google.com/rss/search?q=%D7%91%D7%A8%D7%A6%D7%9C%D7%95%D7%A0%D7%94+when:2d&hl=iw&gl=IL&ceid=IL:iw",
    outlet: null,
    barcaOnly: false,
  },
  {
    id: "one",
    format: "rss",
    kind: "article",
    language: "he",
    url: "https://www.one.co.il/rss/",
    outlet: "ONE",
    barcaOnly: false,
  },
  {
    id: "walla-spain",
    format: "rss",
    kind: "article",
    language: "he",
    url: "https://rss.walla.co.il/feed/162",
    outlet: "וואלה ספורט",
    barcaOnly: false,
  },
  {
    id: "ynet-sport",
    format: "rss",
    kind: "article",
    language: "he",
    url: "https://www.ynet.co.il/Integration/StoryRss3.xml",
    outlet: "ynet",
    barcaOnly: false,
  },
  // Israeli Barça podcasts, played on the page. Both post about once a week.
  {
    id: "barcamania",
    format: "rss",
    kind: "podcast",
    language: "he",
    url: "https://feeds.castos.com/wxwzr",
    outlet: "בארסה מאניה",
    barcaOnly: true,
  },
  {
    id: "one-podcast-barcelona",
    format: "rss",
    kind: "podcast",
    language: "he",
    url: "https://www.omnycontent.com/d/playlist/ae6ed7c5-9419-4a64-8b67-ae6e00cf868a/eaeeac36-e9fb-4b90-8a29-ae7b0066b1d3/13614d0f-cd49-4322-b5e0-ae7b00671433/podcast.rss",
    outlet: "ONE Podcasts",
    barcaOnly: true,
  },
  // The club's own videos, played on the page through YouTube's embed.
  {
    id: "fcb-youtube",
    format: "atom",
    kind: "video",
    language: "en",
    url: "https://www.youtube.com/feeds/videos.xml?user=fcbarcelona",
    outlet: "FC Barcelona",
    barcaOnly: true,
  },
  // What the fans are talking about.
  {
    id: "reddit-barca",
    format: "atom",
    kind: "fan",
    language: "en",
    url: "https://www.reddit.com/r/Barca/hot/.rss",
    outlet: "r/Barca",
    barcaOnly: true,
  },
];

export const BARCA_KEYWORDS =
  /bar[cç]a|barcelona|blaugrana|azulgrana|cul[eé]s?\b|ברצלונה|בארסה|ברסה|בלאוגרנה|קאמפ נואו/i;

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
  "The Guardian": "english",
  "BBC Sport": "english",
  "BBC": "english",
  ESPN: "english",
  "Barça Blaugranes": "english",
  "Barça Universal": "english",
  "The Athletic": "english",
  "The New York Times": "english",
  "Sky Sports": "english",
  "The Independent": "english",
  "The Telegraph": "english",
  "Daily Mail": "english",
  "GOAL": "english",
  "Football España": "english",
  "Football Italia": "english",
  "OneFootball": "english",
  ONE: "israel",
  "ONE Podcasts": "israel",
  "בארסה מאניה": "israel",
  "ספורט 1": "israel",
  Sport5: "israel",
  "ערוץ הספורט": "israel",
  "וואלה ספורט": "israel",
  "וואלה": "israel",
  ynet: "israel",
  "היום": "israel",
  "ישראל היום": "israel",
  "מעריב": "israel",
  "הארץ": "israel",
  "כאן": "israel",
};

/** Journalists whose scoops get their own badge. Matched in the headline and summary. */
export const SCOOP_JOURNALISTS = [
  { id: "romano", name: "Fabrizio Romano", pattern: /fabrizio romano|\bromano\b|here we go/i },
  { id: "ornstein", name: "David Ornstein", pattern: /ornstein/i },
] as const;
export type ScoopJournalist = (typeof SCOOP_JOURNALISTS)[number]["id"];

/** Pinned fan threads that are always there and say nothing new. */
export const FAN_THREAD_SKIP = /open thread|daily discussion|weekly|megathread|rules/i;

/** Sites built on recycled transfer gossip, which add noise and no reporting. */
export const BLOCKED_OUTLETS = new Set([
  "Fichajes.com",
  "Fichajes.net",
  "Todofichajes.com",
  // Machine-translated copies of other outlets' stories, found in the Hebrew results.
  "Vietnam.vn",
]);

export const NEWS_USER_AGENT = "BarcaBrain/0.1 (https://github.com/ChefBoyNun00/barca-brain)";
export const NEWS_REQUEST_TIMEOUT_MS = 15_000;
export const NEWS_SNIPPET_MAX_CHARS = 500;

/** Older items are ignored, so a feed that freezes can never pass old news off as new. */
export const NEWS_MAX_AGE_DAYS = 3;
/** Podcasts post weekly, so an episode stays worth hearing for longer than a headline. */
export const PODCAST_MAX_AGE_DAYS = 21;
export const NEWS_KEEP_DAYS = 30;
export const NEWS_TRANSLATE_BATCH_SIZE = 15;
// English feeds roughly double what each run reads.
export const NEWS_TRANSLATE_PER_RUN = 90;
export const NEWS_RECENT_TOPICS_LIMIT = 40;

/** Labels the model can still reach for, which must never merge unrelated stories. */
export const NEWS_CATCH_ALL_TOPICS = ["other", "general", "news", "misc"];

/** Full write-ups per run, biggest stories first, so cost stays bounded. */
export const NEWS_STORIES_PER_RUN = 12;
/** The most coverage one write-up is written from. */
export const NEWS_STORY_SOURCES_LIMIT = 25;

export const BRIEFING_EVERY_HOURS = 6;
export const BRIEFING_WINDOW_HOURS = 24;
export const BRIEFING_MIN_STORIES = 3;
export const BRIEFING_MAX_STORIES = 30;

export const NEWS_PAGE_LIMIT = 120;
export const HOME_STORIES_LIMIT = 3;

/**
 * Heat is how many outlets are running a story, halved for every this-many hours since the
 * latest of them. So a story everyone is still writing about beats a big one from yesterday.
 */
export const NEWS_HEAT_HALF_LIFE_HOURS = 12;
/** Stories on the heat chart under the lead. Only the biggest make the page. */
export const NEWS_HEAT_CHART_LIMIT = 5;
/** Stories both cities' press are telling, shown side by side. */
export const NEWS_SPIN_LIMIT = 2;
/** Big stories abroad the Israeli press has not picked up yet. */
export const NEWS_NOT_IN_ISRAEL_LIMIT = 3;
export const NEWS_RELATED_LIMIT = 4;
export const STORY_PAGE_SOURCES_LIMIT = 40;
export const NEWS_PODCASTS_LIMIT = 4;
export const PLAYER_STORIES_LIMIT = 3;
