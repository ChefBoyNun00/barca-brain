import { z } from "zod";

// Fields are loose on purpose: one odd item is skipped later, it must not sink the feed.
export const RssItemSchema = z.object({
  title: z.union([z.string(), z.number()]).transform(String),
  link: z.string(),
  pubDate: z.string(),
  description: z.string().optional(),
  source: z.union([z.string(), z.object({ "#text": z.string() })]).optional(),
});

export const RssFeedSchema = z.object({
  rss: z.object({
    channel: z.object({ item: z.array(z.unknown()).default([]) }),
  }),
});

export type RssItem = z.infer<typeof RssItemSchema>;

// Atom, as YouTube and Reddit publish it. Attributes are kept, because Atom puts links in them.
const AtomLinkSchema = z.object({ "@_href": z.string(), "@_rel": z.string().optional() });

/** Atom text can carry a type attribute, which turns it into an object. */
const AtomTextSchema = z
  .union([z.string(), z.number(), z.object({ "#text": z.union([z.string(), z.number()]) })])
  .transform((value) => String(typeof value === "object" ? value["#text"] : value));

export const AtomEntrySchema = z.object({
  title: AtomTextSchema,
  // The summary only: the full article text in <content> is never read.
  summary: AtomTextSchema.optional(),
  link: z.union([AtomLinkSchema, z.array(AtomLinkSchema)]),
  published: z.string().optional(),
  updated: z.string().optional(),
  "yt:videoId": z.string().optional(),
  author: z.object({ name: z.string() }).optional(),
  "media:group": z
    .object({ "media:description": AtomTextSchema.optional() })
    .optional(),
});

export const AtomFeedSchema = z.object({
  feed: z.object({ entry: z.array(z.unknown()).default([]) }),
});

export type AtomEntry = z.infer<typeof AtomEntrySchema>;
