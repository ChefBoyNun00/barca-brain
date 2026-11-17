import type { PressSide, ScoopJournalist } from "@/config/news";
import type {
  BriefingBullet,
  BriefingText,
  NewsCategory,
  NewsCertainty,
  StoryWriteup,
  WriteupText,
} from "@/domain/news";

export type ArticleToTranslate = {
  id: string;
  outlet: string;
  title: string;
  snippet: string | null;
};

export type Translation = {
  id: string;
  relevant: boolean;
  titleEn: string;
  summaryEn: string | null;
  category: NewsCategory;
  certainty: NewsCertainty;
  topic: string;
  /** Only names from the squad list given to the model. */
  players: string[];
};

export type StoryForBriefing = {
  topic: string | null;
  title: string;
  summary: string | null;
  outlet: string;
  certainty: string | null;
};

/** One outlet's coverage of a story, as the story writer sees it. */
export type StorySource = {
  outlet: string;
  pressSide: PressSide;
  publishedAt: string;
  headline: string;
  summary: string | null;
  originalHeadline: string;
  originalSnippet: string | null;
  certainty: string | null;
  scoopBy: ScoopJournalist | null;
};

export type WrittenStory = Omit<StoryWriteup, "topic" | "articleCount" | "writtenAt" | "hebrew">;

/** An article's English headline and summary, to be put into Hebrew. */
export type HeadlineToTranslate = { id: string; title: string; summary: string | null };

export type HebrewHeadline = { id: string; titleHe: string; summaryHe: string | null };

export type GeneratedBriefing = { headline: string; bullets: BriefingBullet[] };

/** What the news job needs from a language model. Faked in tests. */
export interface NewsAi {
  translate(
    articles: ArticleToTranslate[],
    context: { squad: string[]; topics: string[] },
  ): Promise<Translation[]>;
  writeBriefing(stories: StoryForBriefing[]): Promise<GeneratedBriefing>;
  writeStory(topic: string, sources: StorySource[]): Promise<WrittenStory>;
  /** Hebrew for readers in Israel: our own English text, put into Israeli sports-press Hebrew. */
  headlinesToHebrew(headlines: HeadlineToTranslate[]): Promise<HebrewHeadline[]>;
  storyToHebrew(story: WriteupText): Promise<WriteupText>;
  briefingToHebrew(briefing: BriefingText): Promise<BriefingText>;
}
