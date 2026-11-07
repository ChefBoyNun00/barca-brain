import { NEWS_SNIPPET_MAX_CHARS, type NewsFeed } from "@/config/news";
import type { FeedArticle } from "../types";
import { AtomEntrySchema, RssItemSchema, type AtomEntry, type RssItem } from "./schemas";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/** The XML parser leaves text inside CDATA blocks undecoded, and feeds use both forms. */
function decodeEntities(text: string): string {
  return text.replace(/&(?:#(\d+)|#x([\da-f]+)|(\w+));/gi, (match, decimal, hex, name) => {
    if (decimal) return String.fromCodePoint(Number(decimal));
    if (hex) return String.fromCodePoint(Number.parseInt(hex, 16));
    return NAMED_ENTITIES[String(name).toLowerCase()] ?? match;
  });
}

/** Feed text is untrusted and often holds HTML. It is only ever kept as plain text. */
export function toPlainText(html: string): string {
  return decodeEntities(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A link from a feed ends up in an href, so anything but web links is refused. */
function toWebUrl(link: string): string | null {
  try {
    const url = new URL(link.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

const sourceName = (source: RssItem["source"]) =>
  typeof source === "string" ? source : source?.["#text"];

function trimSnippet(text: string): string | null {
  if (!text) return null;
  if (text.length <= NEWS_SNIPPET_MAX_CHARS) return text;
  return `${text.slice(0, NEWS_SNIPPET_MAX_CHARS).trimEnd()}…`;
}

function mapItem(raw: unknown, feed: NewsFeed): FeedArticle | null {
  const parsed = RssItemSchema.safeParse(raw);
  if (!parsed.success) return null;
  const item = parsed.data;

  const url = toWebUrl(item.link);
  const outlet = feed.outlet ?? sourceName(item.source)?.trim();
  const publishedAt = new Date(item.pubDate);
  if (!url || !outlet || Number.isNaN(publishedAt.getTime())) return null;

  // Google News puts the outlet on the end of the headline, and its description is just links.
  const title = toPlainText(item.title).replace(` - ${outlet}`, "");
  const snippet = feed.outlet && item.description ? trimSnippet(toPlainText(item.description)) : null;
  if (!title) return null;

  return { url, outlet, title, snippet, publishedAt };
}

export function mapFeedItems(items: unknown[], feed: NewsFeed): FeedArticle[] {
  return items.flatMap((item) => mapItem(item, feed) ?? []);
}

const alternateLink = (link: AtomEntry["link"]) => {
  const links = Array.isArray(link) ? link : [link];
  return (links.find((item) => !item["@_rel"] || item["@_rel"] === "alternate") ?? links[0])?.[
    "@_href"
  ];
};

/** A video id goes into an embed address, so only YouTube's own id shape is accepted. */
const toVideoId = (id: string | undefined) => (id && /^[\w-]{6,20}$/.test(id) ? id : null);

function mapEntry(raw: unknown, feed: NewsFeed): FeedArticle | null {
  const parsed = AtomEntrySchema.safeParse(raw);
  if (!parsed.success || !feed.outlet) return null;
  const entry = parsed.data;

  const link = alternateLink(entry.link);
  const url = link ? toWebUrl(link) : null;
  const publishedAt = new Date(entry.published ?? entry.updated ?? "");
  const title = toPlainText(entry.title);
  if (!url || !title || Number.isNaN(publishedAt.getTime())) return null;

  const description = entry.summary ?? entry["media:group"]?.["media:description"];
  const videoId = toVideoId(entry["yt:videoId"]);
  if (feed.kind === "video" && !videoId) return null;

  return {
    url,
    outlet: feed.outlet,
    title,
    snippet: description ? trimSnippet(toPlainText(description)) : null,
    publishedAt,
    videoId,
    author: entry.author?.name.replace(/^\/u\//, "") ?? null,
  };
}

export function mapAtomEntries(entries: unknown[], feed: NewsFeed): FeedArticle[] {
  return entries.flatMap((entry) => mapEntry(entry, feed) ?? []);
}
