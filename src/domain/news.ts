// The translated press, independent of the database and any feed.

import type { PressSide } from "@/config/news";

export const NEWS_CATEGORIES = ["transfers", "injuries", "match", "club", "other"] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

/** How solid a story is, judged from how the press itself words it. */
export const NEWS_CERTAINTIES = ["official", "reported", "rumour", "opinion", "news"] as const;
export type NewsCertainty = (typeof NEWS_CERTAINTIES)[number];

export type NewsArticle = {
  id: string;
  url: string;
  outlet: string;
  pressSide: PressSide;
  titleOriginal: string;
  snippetOriginal: string | null;
  publishedAt: Date;
  /** Null until translated. The page then shows the Spanish and says so. */
  titleEn: string | null;
  summaryEn: string | null;
  category: NewsCategory | null;
  certainty: NewsCertainty | null;
  topic: string | null;
  playerNames: string[];
};

export type BriefingBullet = { text: string; topic: string | null };

export type NewsBriefing = {
  createdAt: Date;
  headline: string;
  bullets: BriefingBullet[];
  storyCount: number;
};
