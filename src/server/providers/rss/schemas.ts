import { z } from "zod";

// Fields are loose on purpose: one odd item is skipped later, it must not sink the feed.
/** With attributes kept, a tag that carries one (title type="html") arrives as an object. */
const RssTextSchema = z
  .union([z.string(), z.number(), z.object({ "#text": z.union([z.string(), z.number()]) })])
  .transform((value) => String(typeof value === "object" ? value["#text"] : value));

export const RssItemSchema = z.object({
  title: RssTextSchema,
  link: z.string().optional(),
  pubDate: z.string(),
  description: RssTextSchema.optional(),
  source: z.union([z.string(), z.object({ "#text": z.string() })]).optional(),
  /**
   * Podcasts: the audio file. News feeds use it for a picture, and without attributes it arrives
   * as an empty string, so anything that is not an address is read as no enclosure.
   */
  enclosure: z
    .unknown()
    .optional()
    .transform((value) => {
      const parsed = z.object({ "@_url": z.string() }).safeParse(value);
      return parsed.success ? parsed.data["@_url"] : null;
    }),
  /** Media RSS photos (AS, El País, the Guardian, the BBC). One tag or several. */
  "media:content": z.unknown().optional(),
  "media:thumbnail": z.unknown().optional(),
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
  // The summary is the only text kept. <content> is read for one thing only: its first photo.
  summary: AtomTextSchema.optional(),
  content: AtomTextSchema.optional(),
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
