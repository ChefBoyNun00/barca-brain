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
import {
  getLatestBriefing,
  getRecentArticles,
  getRecentMedia,
  getStoryPage,
  getStoryWriteups,
  searchArticles,
} from "@/server/db/queries/news";
import { makeDedupeKey, prepareArticles } from "@/server/news/prepare";
import { runNews } from "@/server/news/run-news";
import type { NewsAi, Translation } from "@/server/news/types";
import { mapFeedItems, toPlainText } from "@/server/providers/rss/mapper";
import { createRssProvider } from "@/server/providers/rss/provider";
import type { FeedArticle, NewsProvider } from "@/server/providers/types";
import { createEmptyDatabase } from "./helpers/ingested-database";

const now = new Date();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3_600_000);

const SPANISH = { format: "rss", kind: "article", language: "es" } as const;
const directFeed: NewsFeed = {
  ...SPANISH,
  id: "md",
  url: "https://x.test",
  outlet: "Mundo Deportivo",
  barcaOnly: true,
};
const googleFeed: NewsFeed = {
  ...SPANISH,
  id: "g",
  url: "https://y.test",
  outlet: null,
  barcaOnly: true,
};
const generalFeed: NewsFeed = {
  ...SPANISH,
  id: "as",
  url: "https://z.test",
  outlet: "Diario AS",
  barcaOnly: false,
};
const englishFeed: NewsFeed = {
  id: "gn-en",
  format: "rss",
  kind: "article",
  language: "en",
  url: "https://e.test",
  outlet: null,
  barcaOnly: true,
};
const videoFeed: NewsFeed = {
  id: "yt",
  format: "atom",
  kind: "video",
  language: "en",
  url: "https://v.test",
  outlet: "FC Barcelona",
  barcaOnly: true,
};
const fanFeed: NewsFeed = {
  id: "reddit",
  format: "atom",
  kind: "fan",
  language: "en",
  url: "https://r.test",
  outlet: "r/Barca",
  barcaOnly: true,
};

const YOUTUBE = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="y" xmlns:media="m">
<title>FC Barcelona</title>
<entry><yt:videoId>IlfT2EkHXNg</yt:videoId><title>MATCH PREVIEW &amp; more</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=IlfT2EkHXNg"/>
<published>${hoursAgo(2).toISOString()}</published>
<media:group><media:description>Training at the Ciutat Esportiva</media:description></media:group></entry>
<entry><yt:videoId>bad id"onload=x</yt:videoId><title>Broken</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=x"/><published>${hoursAgo(2).toISOString()}</published></entry>
</feed>`;

const REDDIT = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
<entry><author><name>/u/culer</name></author><title>Open Thread #45 (Nov 2026)</title>
<link href="https://www.reddit.com/r/Barca/comments/1/"/><published>${hoursAgo(3).toISOString()}</published></entry>
<entry><author><name>/u/culer</name></author><title>Flick: &quot;We focus on our players&quot;</title>
<link href="https://www.reddit.com/r/Barca/comments/2/"/><published>${hoursAgo(3).toISOString()}</published></entry>
</feed>`;

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

describe("reading Atom feeds", () => {
  it("reads club videos, and refuses a video id that is not YouTube's shape", async () => {
    const provider = createRssProvider({ fetchText: async () => YOUTUBE });
    const videos = await provider.fetchFeed(videoFeed);
    expect(videos).toHaveLength(1);
    expect(videos[0]).toMatchObject({
      videoId: "IlfT2EkHXNg",
      title: "MATCH PREVIEW & more",
      url: "https://www.youtube.com/watch?v=IlfT2EkHXNg",
      snippet: "Training at the Ciutat Esportiva",
      outlet: "FC Barcelona",
    });
  });

  it("fails loudly on an Atom feed that is not a feed", async () => {
    const provider = createRssProvider({ fetchText: async () => "<html></html>" });
    await expect(provider.fetchFeed(videoFeed)).rejects.toThrow("Unrecognised");
  });
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

  it("labels English outlets, and badges scoops from named journalists", () => {
    const kept = prepareArticles(
      [
        feedArticle({ outlet: "The Athletic", title: "Barcelona agree deal, says Ornstein" }),
        feedArticle({ outlet: "Some Blog", title: "Here we go! Barça sign a striker" }),
        feedArticle({ outlet: "Some Blog", title: "Barça train ahead of Sunday" }),
      ],
      englishFeed,
      now,
    );
    expect(kept.map((article) => article.pressSide)).toEqual(["english", "english", "english"]);
    expect(kept.map((article) => article.scoopBy)).toEqual(["ornstein", "romano", null]);
    expect(kept[0]).toMatchObject({ kind: "article", language: "en" });
    const romanoSearch = { ...englishFeed, scoopBy: "romano" } as const;
    const credited = prepareArticles([feedArticle({ title: "Barça close in" })], romanoSearch, now);
    expect(credited[0]?.scoopBy).toBe("romano");
  });

  it("drops the pinned fan threads that never change", async () => {
    const provider = createRssProvider({ fetchText: async () => REDDIT });
    const threads = prepareArticles(await provider.fetchFeed(fanFeed), fanFeed, now);
    expect(threads.map((thread) => thread.title)).toEqual(['Flick: "We focus on our players"']);
    expect(threads[0]).toMatchObject({ kind: "fan", author: "culer", scoopBy: null });
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

const writtenStory = {
  headline: "Barça win at the Metropolitano",
  standfirst: "A late goal settles it.",
  body: ["Barça won.", "Mundo Deportivo says it was deserved."],
  keyFacts: ["Final score 2-1"],
  quotes: [{ text: "We were brave", speaker: "Hansi Flick", outlet: "Mundo Deportivo" }],
  whatsNext: "The international break.",
  certainty: "news" as const,
};

const fakeAi = (changes: Partial<NewsAi> = {}): NewsAi => ({
  translate: async (articles) => articles.map((article) => translation(article.id)),
  writeBriefing: async () => ({
    headline: "A big day",
    bullets: [{ text: "Barça won.", topic: null }],
  }),
  writeStory: async () => writtenStory,
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
    await created.pg.exec("delete from news_articles; delete from news_briefings; delete from news_stories;");
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

  it("writes one full story per topic, and rewrites it only when more coverage arrives", async () => {
    const topics: string[] = [];
    const ai = fakeAi({ writeStory: async (topic) => (topics.push(topic), writtenStory) });
    const first = await run(providerOf(three), ai);
    expect(first).toMatchObject({ status: "success", storiesWritten: 1, storyErrors: [] });
    expect(topics).toEqual(["barca-win"]);

    const { writeup, articles } = await getStoryPage(created.database, "barca-win", 10);
    expect(articles).toHaveLength(3);
    expect(writeup).toMatchObject({ ...writtenStory, articleCount: 3, topic: "barca-win" });
    expect(await getStoryWriteups(created.database, ["barca-win", "missing"])).toHaveLength(1);

    expect((await run(providerOf(three), ai)).storiesWritten).toBe(0);
    const fourth = feedArticle({ url: "https://a.test/4", title: "Barça noticia 4" });
    expect((await run(providerOf([...three, fourth]), ai)).storiesWritten).toBe(1);
    expect((await getStoryPage(created.database, "barca-win", 10)).writeup?.articleCount).toBe(4);
  });

  it("never writes a story for a catch-all topic", async () => {
    const ai = fakeAi({
      translate: async (articles) =>
        articles.map((article) => translation(article.id, { topic: "other" })),
    });
    expect((await run(providerOf(three), ai)).storiesWritten).toBe(0);
  });

  it("keeps the other stories when one fails, and reports it", async () => {
    let n = 0;
    const ai = fakeAi({
      translate: async (articles) =>
        articles.map((article) => translation(article.id, { topic: `story-${n++}` })),
      writeStory: async (topic) => {
        if (topic === "story-1") throw new Error("cut off");
        return writtenStory;
      },
    });
    const result = await run(providerOf(three), ai);
    expect(result).toMatchObject({ status: "failed", storiesWritten: 2 });
    expect(result.storyErrors).toEqual(["story-1: cut off"]);
  });

  it("stores videos and fan threads apart, and never sends them to be translated", async () => {
    const sent: string[] = [];
    const ai = fakeAi({
      translate: async (articles) => {
        sent.push(...articles.map((article) => article.title));
        return articles.map((article) => translation(article.id));
      },
    });
    const provider: NewsProvider = {
      fetchFeed: async (feed) =>
        feed.kind === "video"
          ? [feedArticle({ url: "https://v.test/1", title: "Barça training", videoId: "abcdef123" })]
          : feed.kind === "fan"
            ? [feedArticle({ url: "https://r.test/1", title: "Match thread", author: "culer" })]
            : three,
    };
    const result = await run(provider, ai, [directFeed, videoFeed, fanFeed]);
    expect(result.status).toBe("success");
    expect(sent).toHaveLength(3);
    expect(await getRecentArticles(created.database, 10)).toHaveLength(3);
    expect(await getRecentMedia(created.database, "video", 10)).toMatchObject([
      { title: "Barça training", videoId: "abcdef123", outlet: "Mundo Deportivo" },
    ]);
    expect(await getRecentMedia(created.database, "fan", 10)).toMatchObject([
      { title: "Match thread", author: "culer" },
    ]);
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
    language: "es",
    scoopBy: null,
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
