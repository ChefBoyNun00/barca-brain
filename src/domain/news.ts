// The translated press, independent of the database and any feed.

import type { NewsLanguage, PressSide, ScoopJournalist } from "@/config/news";

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
  /** Null until the Hebrew pass reaches it. Israeli outlets' own Hebrew, else a translation. */
  titleHe: string | null;
  summaryHe: string | null;
  category: NewsCategory | null;
  certainty: NewsCertainty | null;
  topic: string | null;
  playerNames: string[];
  language: NewsLanguage;
  /** Set when the story comes from a named journalist, such as Fabrizio Romano. */
  scoopBy: ScoopJournalist | null;
  /** The outlet's own photo for the article, from its feed. Credited to the outlet on the page. */
  imageUrl: string | null;
};

/** A club video, a fan thread or a podcast episode: shown as it is, never translated or grouped. */
export type NewsMedia = {
  id: string;
  url: string;
  outlet: string;
  pressSide: PressSide;
  title: string;
  publishedAt: Date;
  videoId: string | null;
  author: string | null;
  /** Podcasts only: the episode's audio file, played on the page. */
  audioUrl: string | null;
};

export type BriefingBullet = { text: string; topic: string | null };

export type BriefingText = { headline: string; bullets: BriefingBullet[] };

export type NewsBriefing = BriefingText & {
  createdAt: Date;
  storyCount: number;
  /** The same briefing in Hebrew; null until translated. */
  hebrew: BriefingText | null;
};

export type StoryQuote = { text: string; speaker: string; outlet: string };

/** The words of a write-up, in one language. */
export type WriteupText = {
  headline: string;
  standfirst: string;
  body: string[];
  keyFacts: string[];
  quotes: StoryQuote[];
  whatsNext: string | null;
};

/** The full story, written in our own words from every outlet's coverage. */
export type StoryWriteup = WriteupText & {
  topic: string;
  certainty: NewsCertainty;
  articleCount: number;
  writtenAt: Date;
  /** The same write-up in Hebrew; null until translated. */
  hebrew: WriteupText | null;
};
