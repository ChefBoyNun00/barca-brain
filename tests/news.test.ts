import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { NewsFeed } from "@/config/news";
import type { NewsArticle } from "@/domain/news";
import {
  filterStories,
  findPlayerStories,
  formatStoryAge,
  groupStories,
  pickHero,
  topicOf,
} from "@/features/news/stories";
import { getLatestBriefing, getRecentArticles, searchArticles } from "@/server/db/queries/news";
import { makeDedupeKey, prepareArticles } from "@/server/news/prepare";
import { runNews } from "@/server/news/run-news";
import type { NewsAi, Translation } from "@/server/news/types";
import { mapFeedItems, toPlainText } from "@/server/providers/rss/mapper";
import { createRssProvider } from "@/server/providers/rss/provider";
import type { FeedArticle, NewsProvider } from "@/server/providers/types";
import { createEmptyDatabase } from "./helpers/ingested-database";

const now = new Date();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3_600_000);

const directFeed: NewsFeed = {
  id: "md",
  url: "https://x.test",
  outlet: "Mundo Deportivo",
  barcaOnly: true,
};
const googleFeed: NewsFeed = { id: "g", url: "https://y.test", outlet: null, barcaOnly: true };
const generalFeed: NewsFeed = {
  id: "as",
  url: "https://z.test",
  outlet: "Diario AS",
  barcaOnly: false,
};

const RSS = `<?xml version="1.0"?><rss xmlns:content="x"><channel>
<item><title><![CDATA[Pedri vuelve &amp; marca]]></title><link>https://a.test/1</link>
<pubDate>${hoursAgo(1).toUTCString()}</pubDate><description>&lt;b&gt;Un gol&lt;/b&gt; decisivo</description>
<content:encoded>Texto completo que no se guarda</content:encoded></item>
<item><title>Sin fecha</title><link>https://a.test/2</link></item>
<item><title>Enlace malo</title><link>javascript:alert(1)</link><pubDate>${hoursAgo(1).toUTCString()}</pubDate></item>
</channel></rss>`;

describe("reading a feed", () => {
  it("keeps good items, as plain text, and skips broken ones", async () => {
    const provider = createRssProvider({ fetchText: async () => RSS });
    const articles = await provider.fetchFeed(directFeed);
    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({
      url: "https://a.test/1",
      outlet: "Mundo Deportivo",
      title: "Pedri vuelve & marca",
      snippet: "Un gol decisivo",
    });
  });

  it("never keeps the full article text", async () => {
    const provider = createRssProvider({ fetchText: async () => RSS });
    expect(JSON.stringify(await provider.fetchFeed(directFeed))).not.toContain("Texto completo");
  });

  it("refuses a link that is not a web link", () => {
    const item = { title: "T", link: "javascript:alert(1)", pubDate: now.toUTCString() };
    expect(mapFeedItems([item], directFeed)).toEqual([]);
  });

  it("takes the outlet from the item, and removes it from the headline", () => {
    const item = {
      title: "Flick habla del Atleti - SPORT",
      link: "https://news.test/1",
      pubDate: now.toUTCString(),
      description: "<a href='x'>links only</a>",
      source: { "#text": "SPORT" },
    };
    expect(mapFeedItems([item], googleFeed)[0]).toMatchObject({
      outlet: "SPORT",
      title: "Flick habla del Atleti",
      snippet: null,
    });
  });

  it("fails loudly on something that is not a feed", async () => {
    const provider = createRssProvider({ fetchText: async () => "<html>nope</html>" });
    await expect(provider.fetchFeed(directFeed)).rejects.toThrow("Unrecognised");
  });

  it("strips tags and spacing, and decodes entities", () => {
    expect(toPlainText("<p>Hola   <b>Barça</b></p>")).toBe("Hola Barça");
    expect(toPlainText("Gavi&nbsp;&amp; Pedri &#8217;26 &unknown;")).toBe(
      "Gavi & Pedri ’26 &unknown;",
    );
    expect(toPlainText("&lt;b&gt;Lamine&lt;/b&gt;")).toBe("Lamine");
  });
});

const feedArticle = (changes: Partial<FeedArticle> = {}): FeedArticle => ({
  url: "https://a.test/x",
  outlet: "Mundo Deportivo",
  title: "El Barça gana",
  snippet: null,
  publishedAt: hoursAgo(2),
  ...changes,
});

describe("choosing articles", () => {
  it("drops anything too old, so a frozen feed cannot show old news", () => {
    const stale = feedArticle({ publishedAt: hoursAgo(24 * 30) });
    expect(prepareArticles([stale], directFeed, now)).toEqual([]);
  });

  it("filters general feeds down to Barça", () => {
    const articles = [feedArticle({ title: "El Betis empata" }), feedArticle()];
    expect(prepareArticles(articles, generalFeed, now).map((a) => a.title)).toEqual([
      "El Barça gana",
    ]);
  });

  it("drops blocked outlets and labels press by city", () => {
    const articles = [feedArticle({ outlet: "Fichajes.com" }), feedArticle({ outlet: "MARCA" })];
    const kept = prepareArticles(articles, googleFeed, now);
    expect(kept).toHaveLength(1);
    expect(kept[0]?.pressSide).toBe("madrid");
  });

  it("treats accents, case and punctuation as the same headline", () => {
    expect(makeDedupeKey("¡El BARÇA, campeón!")).toBe(makeDedupeKey("el barca campeon"));
  });
});

const translation = (id: string, changes: Partial<Translation> = {}): Translation => ({
  id,
  relevant: true,
  titleEn: "Barça win",
  summaryEn: null,
  category: "match",
  certainty: "news",
  topic: "barca-win",
  players: [],
  ...changes,
});

const fakeAi = (changes: Partial<NewsAi> = {}): NewsAi => ({
  translate: async (articles) => articles.map((article) => translation(article.id)),
  writeBriefing: async () => ({
    headline: "A big day",
    bullets: [{ text: "Barça won.", topic: null }],
  }),
  ...changes,
});

const providerOf = (articles: FeedArticle[]): NewsProvider => ({ fetchFeed: async () => articles });
const three = [1, 2, 3].map((n) =>
  feedArticle({ url: `https://a.test/${n}`, title: `Barça noticia ${n}` }),
);

describe("the news job", () => {
  let created: Awaited<ReturnType<typeof createEmptyDatabase>>;

  beforeAll(async () => {
    created = await createEmptyDatabase();
  }, 30_000);
  afterAll(() => created.pg.close());
  beforeEach(async () => {
    await created.pg.exec("delete from news_articles; delete from news_briefings;");
  });

  const run = (provider: NewsProvider, ai: NewsAi | null, feeds = [directFeed]) =>
    runNews({ db: created.database, provider, ai, feeds, now });

  it("stores headlines in Spanish when there is no API key", async () => {
    const result = await run(providerOf(three), null);
    expect(result).toMatchObject({ status: "success", translated: 0, briefing: "skipped" });
    const stored = await getRecentArticles(created.database, 10);
    expect(stored).toHaveLength(3);
    expect(stored[0]?.titleEn).toBeNull();
  });

  it("does not store a story twice, even from a different link", async () => {
    await run(providerOf(three), null);
    const repeat = three.map((article) => ({ ...article, url: `${article.url}?again` }));
    const result = await run(providerOf(repeat), null);
    expect(result.feeds[0]).toMatchObject({ found: 3, added: 0 });
  });

  it("translates, then writes a briefing", async () => {
    const result = await run(providerOf(three), fakeAi());
    expect(result).toMatchObject({ status: "success", translated: 3, briefing: "written" });
    expect((await getRecentArticles(created.database, 10))[0]?.titleEn).toBe("Barça win");
    expect(await getLatestBriefing(created.database)).toMatchObject({
      headline: "A big day",
      storyCount: 3,
    });
  });

  it("does not translate the same article twice", async () => {
    await run(providerOf(three), fakeAi());
    let calls = 0;
    await run(providerOf(three), fakeAi({ translate: async () => (calls++, []) }));
    expect(calls).toBe(0);
  });

  it("does not rewrite a recent briefing", async () => {
    await run(providerOf(three), fakeAi());
    expect((await run(providerOf(three), fakeAi())).briefing).toBe("not needed");
  });

  it("ignores anything the model returns outside the batch", async () => {
    const ai = fakeAi({
      translate: async () => [translation("00000000-0000-0000-0000-000000000000")],
    });
    expect((await run(providerOf(three), ai)).translated).toBe(0);
  });

  it("hides articles judged off-topic", async () => {
    const ai = fakeAi({
      translate: async (articles) => articles.map((a) => translation(a.id, { relevant: false })),
    });
    await run(providerOf(three), ai);
    expect(await getRecentArticles(created.database, 10)).toEqual([]);
  });

  it("keeps a failed batch for the next run and reports it", async () => {
    const ai = fakeAi({
      translate: async () => {
        throw new Error("overloaded");
      },
    });
    const result = await run(providerOf(three), ai);
    expect(result).toMatchObject({ status: "failed", translationErrors: ["overloaded"] });
    expect((await run(providerOf(three), fakeAi())).translated).toBe(3);
  });

  it("carries on when one feed fails, and fails only when all do", async () => {
    const shaky: NewsProvider = {
      fetchFeed: async (feed) => {
        if (feed.id === "md") throw new Error("HTTP 500");
        return three;
      },
    };
    const partly = await run(shaky, null, [directFeed, generalFeed]);
    expect(partly.status).toBe("success");
    expect(partly.feeds[0]?.error).toBe("HTTP 500");
    expect((await run(shaky, null, [directFeed])).status).toBe("failed");
  });

  it("searches English and Spanish, and treats % as a normal character", async () => {
    await run(providerOf(three), fakeAi());
    const search = (query: string) =>
      searchArticles(created.database, { query, days: 3, limit: 10 });
    expect(await search("barça win")).toHaveLength(3);
    expect(await search("noticia 2")).toHaveLength(1);
    expect(await search("%")).toEqual([]);
  });
});

function article(id: string, changes: Partial<NewsArticle> = {}): NewsArticle {
  return {
    id,
    url: `https://a.test/${id}`,
    outlet: "SPORT",
    pressSide: "barcelona",
    titleOriginal: "Titular",
    snippetOriginal: null,
    publishedAt: hoursAgo(1),
    titleEn: "Headline",
    summaryEn: null,
    category: "transfers",
    certainty: "rumour",
    topic: "rashford",
    playerNames: [],
    ...changes,
  };
}

describe("grouping stories", () => {
  const mixed = [
    article("a"),
    article("b", {
      outlet: "MARCA",
      pressSide: "madrid",
      certainty: "reported",
      playerNames: ["Pedri"],
    }),
    article("c", { topic: "other", category: "match", publishedAt: hoursAgo(5) }),
  ];

  it("merges one story across outlets, led by the firmest report", () => {
    const [story] = groupStories(mixed);
    expect(story?.coverage).toHaveLength(2);
    expect(story?.lead.id).toBe("b");
    expect(story?.outlets).toEqual(["SPORT", "MARCA"]);
  });

  it("keeps untranslated articles apart", () => {
    const pending = [article("x", { topic: null }), article("y", { topic: null })];
    expect(groupStories(pending)).toHaveLength(2);
  });

  it("never merges stories on a catch-all topic", () => {
    const loose = [article("x", { topic: "other" }), article("y", { topic: "other" })];
    expect(groupStories(loose)).toHaveLength(2);
  });

  it("filters by topic, by press, and by both cities", () => {
    const stories = groupStories(mixed);
    expect(filterStories(stories, { category: "match", side: "all" })).toHaveLength(1);
    expect(filterStories(stories, { category: "all", side: "madrid" })).toHaveLength(1);
    expect(filterStories(stories, { category: "all", side: "both" })[0]?.id).toBe("rashford");
  });

  it("finds a player's stories", () => {
    expect(findPlayerStories(groupStories(mixed), "Pedri", 3)).toHaveLength(1);
    expect(findPlayerStories(groupStories(mixed), "Rodri", 3)).toEqual([]);
  });

  it("puts a story in the row for its category, or under other while untranslated", () => {
    const [transfers, match] = groupStories(mixed);
    expect(transfers && topicOf(transfers)).toBe("transfers");
    expect(match && topicOf(match)).toBe("match");
    const pending = groupStories([article("p", { category: null, topic: null })]);
    expect(pending[0] && topicOf(pending[0])).toBe("other");
  });

  it("picks the story most outlets are running as the top story", () => {
    expect(pickHero(groupStories(mixed))?.id).toBe("rashford");
    expect(pickHero([])).toBeNull();
  });

  it("says how old a story is", () => {
    expect(formatStoryAge(hoursAgo(0), now)).toBe("1m ago");
    expect(formatStoryAge(hoursAgo(3), now)).toBe("3h ago");
    expect(formatStoryAge(hoursAgo(50), now)).toBe("2d ago");
  });
});
