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
