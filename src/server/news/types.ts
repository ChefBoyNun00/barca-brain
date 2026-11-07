import type { BriefingBullet, NewsCategory, NewsCertainty } from "@/domain/news";

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

export type GeneratedBriefing = { headline: string; bullets: BriefingBullet[] };

/** What the news job needs from a language model. Faked in tests. */
export interface NewsAi {
  translate(
    articles: ArticleToTranslate[],
    context: { squad: string[]; topics: string[] },
  ): Promise<Translation[]>;
  writeBriefing(stories: StoryForBriefing[]): Promise<GeneratedBriefing>;
}
