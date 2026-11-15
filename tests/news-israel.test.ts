import { describe, expect, it } from "vitest";
import { NEWS_EDITIONS, NEWS_FEEDS, PRESS_SIDES, type NewsFeed } from "@/config/news";
import { chooseNewsEdition, parseNewsEdition } from "@/features/news/news-edition";
import {
  coverageIn,
  findAbroad,
  groupStories,
  heatOf,
  notYetIn,
  rankByHeat,
  spinsOf,
} from "@/features/news/stories";
import type { NewsArticle } from "@/domain/news";
import { prepareArticles } from "@/server/news/prepare";
import { createRssProvider } from "@/server/providers/rss/provider";

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000);

const hebrewFeed: NewsFeed = {
  id: "one",
  format: "rss",
  kind: "article",
  language: "he",
  url: "https://one.test",
  outlet: "ONE",
  barcaOnly: false,
};
const podcastFeed: NewsFeed = {
  id: "pod",
  format: "rss",
  kind: "podcast",
  language: "he",
  url: "https://pod.test",
  outlet: "בארסה מאניה",
  barcaOnly: true,
};

// News feeds put a picture in <enclosure>. That must not cost the item.
const ONE = `<?xml version="1.0"?><rss><channel>
<item><title>פליק חשף: ההחלטה לגבי כוכב ברצלונה</title><link>https://one.test/1</link>
<pubDate>${daysAgo(0.1).toUTCString()}</pubDate><description>תקציר</description>
<enclosure url="https://photo.test/1.webp" type="image/webp" /></item>
<item><title>הפועל ניצחה בדרבי</title><link>https://one.test/2</link>
<pubDate>${daysAgo(0.1).toUTCString()}</pubDate></item>
</channel></rss>`;

const PODCAST = `<?xml version="1.0"?><rss><channel>
<item><title>ברצלונה חוזרת עם שישייה</title><link>https://pod.test/ep-1</link>
<pubDate>${daysAgo(10).toUTCString()}</pubDate>
<enclosure url="https://cdn.test/ep-1.mp3" type="audio/mpeg" length="1"/></item>
<item><title>פרק בלי קישור לדף</title>
<pubDate>${daysAgo(2).toUTCString()}</pubDate>
<enclosure url="https://cdn.test/ep-2.mp3" type="audio/mpeg" length="1"/></item>
<item><title>פרק ישן</title><link>https://pod.test/old</link>
<pubDate>${daysAgo(60).toUTCString()}</pubDate>
<enclosure url="https://cdn.test/old.mp3" type="audio/mpeg"/></item>
<item><title>פרק בלי שמע</title><link>https://pod.test/none</link>
<pubDate>${daysAgo(1).toUTCString()}</pubDate></item>
<item><title>שמע לא בטוח</title><link>https://pod.test/bad</link>
<pubDate>${daysAgo(1).toUTCString()}</pubDate><enclosure url="javascript:alert(1)"/></item>
</channel></rss>`;

describe("the Israeli press", () => {
  it("keeps Hebrew Barça items, files them under Israel, and survives picture enclosures", async () => {
    const provider = createRssProvider({ fetchText: async () => ONE });
    const kept = prepareArticles(await provider.fetchFeed(hebrewFeed), hebrewFeed, now);
    expect(kept).toHaveLength(1);
    expect(kept[0]).toMatchObject({ pressSide: "israel", language: "he", audioUrl: null });
  });

  it("files Hebrew outlets from Google News under Israel even when they are not listed", () => {
    const google: NewsFeed = { ...hebrewFeed, outlet: null, barcaOnly: true };
    const [article] = prepareArticles(
      [{ url: "https://x.test", outlet: "חדשות 12", title: "ברצלונה", snippet: null, publishedAt: now }],
      google,
      now,
    );
    expect(article?.pressSide).toBe("israel");
  });

  it("drops the machine-translated copies", () => {
    const google: NewsFeed = { ...hebrewFeed, outlet: null, barcaOnly: true };
    const spam = { url: "https://v.test", outlet: "Vietnam.vn", title: "ברצלונה", snippet: null, publishedAt: now };
    expect(prepareArticles([spam], google, now)).toEqual([]);
  });

  it("has Israeli article feeds and podcasts configured", () => {
    const hebrew = NEWS_FEEDS.filter((feed) => feed.language === "he");
    expect(hebrew.some((feed) => feed.kind === "article")).toBe(true);
    expect(hebrew.filter((feed) => feed.kind === "podcast").length).toBeGreaterThanOrEqual(2);
  });
});

describe("podcasts", () => {
  it("reads episodes with their audio, for three weeks, and only safe audio links", async () => {
    const provider = createRssProvider({ fetchText: async () => PODCAST });
    const kept = prepareArticles(await provider.fetchFeed(podcastFeed), podcastFeed, now);
    expect(kept.map((episode) => [episode.url, episode.audioUrl])).toEqual([
      ["https://pod.test/ep-1", "https://cdn.test/ep-1.mp3"],
      // No page of its own, so it links to the audio.
      ["https://cdn.test/ep-2.mp3", "https://cdn.test/ep-2.mp3"],
    ]);
    expect(kept.every((episode) => episode.kind === "podcast" && episode.pressSide === "israel")).toBe(true);
  });
});

describe("choosing an edition", () => {
  it("prefers the address, then the saved choice, then the world, and ignores anything else", () => {
    expect(chooseNewsEdition("israel", "world")).toBe("israel");
    expect(chooseNewsEdition(undefined, "israel")).toBe("israel");
    expect(chooseNewsEdition("mars", "'; drop table")).toBe("world");
    expect(chooseNewsEdition(["israel"], undefined)).toBe("world");
    // Choices saved by the old country picker fall back to the world.
    expect(chooseNewsEdition(undefined, "spain")).toBe("world");
    expect(parseNewsEdition("israel")).toBe("israel");
  });

  it("gives every press side to exactly one edition", () => {
    const all = Object.values(NEWS_EDITIONS).flat();
    expect([...all].sort()).toEqual([...PRESS_SIDES].sort());
    expect(NEWS_EDITIONS.israel).toEqual(["israel"]);
  });

  it("finds a story's Hebrew coverage for Hebrew readers", () => {
    const article = (id: string, language: NewsArticle["language"]): NewsArticle => ({
      id,
      url: `https://${id}.test`,
      outlet: id,
      pressSide: language === "he" ? "israel" : "barcelona",
      titleOriginal: `title ${id}`,
      snippetOriginal: null,
      publishedAt: now,
      titleEn: "Pedri is back",
      summaryEn: null,
      category: "match",
      certainty: "news",
      topic: "pedri-back",
      playerNames: [],
      language,
      scoopBy: null,
    });
    const [story] = groupStories([article("md", "es"), article("one", "he")]);
    expect(coverageIn(story!, "he")?.id).toBe("one");
    expect(coverageIn(story!, "en")).toBeNull();
  });
});

const HOUR = 3_600_000;
const make = (
  id: string,
  over: Partial<NewsArticle> & { hoursAgo?: number } = {},
): NewsArticle => ({
  id,
  url: `https://${id}.test`,
  outlet: id,
  pressSide: "barcelona",
  titleOriginal: `title ${id}`,
  snippetOriginal: null,
  publishedAt: new Date(now.getTime() - (over.hoursAgo ?? 0) * HOUR),
  titleEn: `headline ${id}`,
  summaryEn: null,
  category: "match",
  certainty: "news",
  topic: "pedri-back",
  playerNames: [],
  language: "es",
  scoopBy: null,
  ...over,
});

describe("heat", () => {
  it("halves a story's heat every half-life", () => {
    const [fresh] = groupStories([make("a"), make("b")]);
    const [old] = groupStories([make("c", { hoursAgo: 12 }), make("d", { hoursAgo: 12 })]);
    expect(heatOf(fresh!, now, 12)).toBeCloseTo(2);
    expect(heatOf(old!, now, 12)).toBeCloseTo(1);
  });

  it("puts a story everyone is running now above a bigger one from two days ago", () => {
    const stories = groupStories([
      ...["a", "b", "c", "d"].map((id) => make(id, { topic: "today" })),
      ...["e", "f", "g", "h", "i", "j", "k", "l"].map((id) =>
        make(id, { topic: "two-days-ago", hoursAgo: 48 }),
      ),
    ]);
    expect(rankByHeat(stories, now, 12).map((story) => story.id)).toEqual(["today", "two-days-ago"]);
  });
});

describe("the spin", () => {
  it("pairs each city's newest headline on stories both cities cover", () => {
    const stories = groupStories([
      make("md", { topic: "clasico", outlet: "Mundo Deportivo", titleEn: "Barça dominate" }),
      make("marca", { topic: "clasico", outlet: "MARCA", pressSide: "madrid", titleEn: "Referee scandal" }),
      make("sport", { topic: "only-barcelona", outlet: "SPORT" }),
    ]);
    const spins = spinsOf(stories, 5);
    expect(spins).toHaveLength(1);
    expect(spins[0]).toMatchObject({
      barcelona: { outlet: "Mundo Deportivo", headline: "Barça dominate" },
      madrid: { outlet: "MARCA", headline: "Referee scandal" },
    });
  });
});

describe("Israel and the world", () => {
  const world = groupStories([
    make("md", { topic: "pedri-back", playerNames: ["Pedri"] }),
    make("as", { topic: "pedri-back", playerNames: ["Pedri"] }),
    make("bbc", { topic: "yamal-contract", category: "club", playerNames: ["Lamine Yamal"] }),
    make("espn", { topic: "yamal-contract", category: "club", playerNames: ["Lamine Yamal"] }),
    make("lonely", { topic: "one-outlet-only" }),
  ]);
  const israel = groupStories([
    make("one", { topic: "pedri-back", pressSide: "israel", language: "he" }),
    // Labelled differently, but the same kind of story about the same player.
    make("sport5", {
      topic: "yamal-new-deal",
      category: "club",
      pressSide: "israel",
      language: "he",
      playerNames: ["Lamine Yamal"],
    }),
    make("walla", { topic: "israeli-angle", pressSide: "israel", language: "he" }),
  ]);
  const byId = (id: string) => israel.find((story) => story.id === id)!;

  it("finds how far an Israeli story has travelled", () => {
    expect(findAbroad(byId("pedri-back"), world)?.outlets).toHaveLength(2);
    expect(findAbroad(byId("yamal-new-deal"), world)?.id).toBe("yamal-contract");
    expect(findAbroad(byId("israeli-angle"), world)).toBeNull();
  });

  it("lists big stories abroad that Israel has not run, and skips one-outlet ones", () => {
    const missing = notYetIn(world, israel.slice(0, 1), 5).map((story) => story.id);
    expect(missing).toEqual(["yamal-contract"]);
    expect(notYetIn(world, israel, 5)).toEqual([]);
  });
});
