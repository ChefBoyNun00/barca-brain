import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { NEWS_MAX_OUTPUT_TOKENS, NEWS_MODEL } from "@/config/ai";
import { NEWS_CATEGORIES, NEWS_CERTAINTIES } from "@/domain/news";
import type { NewsAi } from "@/server/news/types";
import { TRANSLATE_NEWS_PROMPT, WRITE_BRIEFING_PROMPT } from "./prompts/news.v3";
import {
  BRIEFING_TO_HEBREW_PROMPT,
  HEADLINES_TO_HEBREW_PROMPT,
  STORY_TO_HEBREW_PROMPT,
} from "./prompts/hebrew.v1";
import { WRITE_STORY_PROMPT } from "./prompts/stories.v1";

const TranslationsSchema = z.object({
  articles: z.array(
    z.object({
      id: z.string(),
      relevant: z.boolean(),
      titleEn: z.string(),
      summaryEn: z.string().nullable(),
      category: z.enum(NEWS_CATEGORIES),
      certainty: z.enum(NEWS_CERTAINTIES),
      topic: z.string(),
      players: z.array(z.string()),
    }),
  ),
});

const BriefingSchema = z.object({
  headline: z.string(),
  bullets: z.array(z.object({ text: z.string(), topic: z.string().nullable() })),
});

const StorySchema = z.object({
  headline: z.string(),
  standfirst: z.string(),
  body: z.array(z.string()),
  keyFacts: z.array(z.string()),
  quotes: z.array(z.object({ text: z.string(), speaker: z.string(), outlet: z.string() })),
  whatsNext: z.string().nullable(),
  certainty: z.enum(NEWS_CERTAINTIES),
});

const HebrewHeadlinesSchema = z.object({
  articles: z.array(z.object({ id: z.string(), titleHe: z.string(), summaryHe: z.string().nullable() })),
});

const WriteupTextSchema = z.object({
  headline: z.string(),
  standfirst: z.string(),
  body: z.array(z.string()),
  keyFacts: z.array(z.string()),
  quotes: z.array(z.object({ text: z.string(), speaker: z.string(), outlet: z.string() })),
  whatsNext: z.string().nullable(),
});

/**
 * Hebrew output may mix in Latin (outlet names such as AS or DAZN), never another alphabet.
 * The model once slipped Russian letters into a Hebrew name ("מוретו"); such text is refused,
 * so the item stays in English and is translated again next run.
 */
const FOREIGN_SCRIPT = /[\p{Script=Cyrillic}\p{Script=Greek}\p{Script=Arabic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}\p{Script=Armenian}\p{Script=Georgian}]/u;

export function assertCleanHebrew(value: unknown): void {
  const text = JSON.stringify(value);
  const found = FOREIGN_SCRIPT.exec(text);
  if (found) throw new Error(`Hebrew text contains a letter from another alphabet: "${found[0]}"`);
}

/** Structured output guarantees the shape. A refusal or cut-off leaves it empty. */
function requireParsed<T>(parsed: T | null, stopReason: string | null): T {
  if (parsed === null) throw new Error(`Claude returned no usable output (${stopReason})`);
  return parsed;
}

export function createNewsAi(client: Anthropic): NewsAi {
  return {
    async translate(articles, { squad, topics }) {
      const response = await client.messages.parse({
        model: NEWS_MODEL,
        max_tokens: NEWS_MAX_OUTPUT_TOKENS,
        system: TRANSLATE_NEWS_PROMPT,
        output_config: { effort: "low", format: zodOutputFormat(TranslationsSchema) },
        messages: [{ role: "user", content: JSON.stringify({ squad, topics, articles }) }],
      });
      const known = new Set(squad);
      return requireParsed(response.parsed_output, response.stop_reason).articles.map((item) => ({
        ...item,
        players: item.players.filter((name) => known.has(name)),
      }));
    },

    async writeBriefing(stories) {
      const response = await client.messages.parse({
        model: NEWS_MODEL,
        max_tokens: NEWS_MAX_OUTPUT_TOKENS,
        system: WRITE_BRIEFING_PROMPT,
        output_config: { effort: "low", format: zodOutputFormat(BriefingSchema) },
        messages: [{ role: "user", content: JSON.stringify({ stories }) }],
      });
      return requireParsed(response.parsed_output, response.stop_reason);
    },

    async writeStory(topic, sources) {
      const response = await client.messages.parse({
        model: NEWS_MODEL,
        max_tokens: NEWS_MAX_OUTPUT_TOKENS,
        system: WRITE_STORY_PROMPT,
        output_config: { effort: "low", format: zodOutputFormat(StorySchema) },
        messages: [{ role: "user", content: JSON.stringify({ topic, sources }) }],
      });
      const story = requireParsed(response.parsed_output, response.stop_reason);
      if (story.body.length === 0) throw new Error(`Empty story for ${topic}`);
      return story;
    },

    async headlinesToHebrew(headlines) {
      const response = await client.messages.parse({
        model: NEWS_MODEL,
        max_tokens: NEWS_MAX_OUTPUT_TOKENS,
        system: HEADLINES_TO_HEBREW_PROMPT,
        output_config: { effort: "low", format: zodOutputFormat(HebrewHeadlinesSchema) },
        messages: [{ role: "user", content: JSON.stringify({ articles: headlines }) }],
      });
      // One bad headline should not cost the batch: drop it, and it is asked for again next run.
      return requireParsed(response.parsed_output, response.stop_reason).articles.filter((headline) => {
        try {
          assertCleanHebrew(headline);
          return true;
        } catch {
          return false;
        }
      });
    },

    async storyToHebrew(story) {
      const response = await client.messages.parse({
        model: NEWS_MODEL,
        max_tokens: NEWS_MAX_OUTPUT_TOKENS,
        system: STORY_TO_HEBREW_PROMPT,
        output_config: { effort: "low", format: zodOutputFormat(WriteupTextSchema) },
        messages: [{ role: "user", content: JSON.stringify(story) }],
      });
      const hebrew = requireParsed(response.parsed_output, response.stop_reason);
      assertCleanHebrew(hebrew);
      // A translation that lost paragraphs is worse than English: refuse it, retry next run.
      if (hebrew.body.length !== story.body.length) {
        throw new Error(`Hebrew story has ${hebrew.body.length} paragraphs, English has ${story.body.length}`);
      }
      return hebrew;
    },

    async briefingToHebrew(briefing) {
      const response = await client.messages.parse({
        model: NEWS_MODEL,
        max_tokens: NEWS_MAX_OUTPUT_TOKENS,
        system: BRIEFING_TO_HEBREW_PROMPT,
        output_config: { effort: "low", format: zodOutputFormat(BriefingSchema) },
        messages: [{ role: "user", content: JSON.stringify(briefing) }],
      });
      const hebrew = requireParsed(response.parsed_output, response.stop_reason);
      assertCleanHebrew(hebrew);
      // Topics are keys that link bullets to stories: always the English ones, whatever came back.
      return {
        headline: hebrew.headline,
        bullets: hebrew.bullets.map((bullet, index) => ({
          text: bullet.text,
          topic: briefing.bullets[index]?.topic ?? null,
        })),
      };
    },
  };
}
