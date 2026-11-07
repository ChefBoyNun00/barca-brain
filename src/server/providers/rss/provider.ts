import { XMLParser } from "fast-xml-parser";
import { NEWS_REQUEST_TIMEOUT_MS, NEWS_USER_AGENT, type NewsFeed } from "@/config/news";
import { ProviderError, type NewsProvider } from "../types";
import { mapAtomEntries, mapFeedItems } from "./mapper";
import { AtomFeedSchema, RssFeedSchema } from "./schemas";

const PROVIDER_NAME = "rss";

const parser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  htmlEntities: true,
  isArray: (name) => name === "item",
});

const atomParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
  htmlEntities: true,
  isArray: (name) => name === "entry",
});

type Deps = { fetchText?: (url: string) => Promise<string> };

async function fetchTextFromFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": NEWS_USER_AGENT },
    signal: AbortSignal.timeout(NEWS_REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

export function createRssProvider(deps: Deps = {}): NewsProvider {
  const fetchText = deps.fetchText ?? fetchTextFromFeed;

  return {
    async fetchFeed(feed: NewsFeed) {
      const text = await fetchText(feed.url);
      const unrecognised = () =>
        new ProviderError("Unrecognised response shape", {
          provider: PROVIDER_NAME,
          endpoint: feed.id,
          params: {},
        });

      if (feed.format === "atom") {
        const parsed = AtomFeedSchema.safeParse(atomParser.parse(text));
        if (!parsed.success) throw unrecognised();
        return mapAtomEntries(parsed.data.feed.entry, feed);
      }
      const parsed = RssFeedSchema.safeParse(parser.parse(text));
      if (!parsed.success) throw unrecognised();
      return mapFeedItems(parsed.data.rss.channel.item, feed);
    },
  };
}
