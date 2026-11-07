import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { NEWS_MAX_OUTPUT_TOKENS, NEWS_MODEL } from "@/config/ai";
import { NEWS_CATEGORIES, NEWS_CERTAINTIES } from "@/domain/news";
import type { NewsAi } from "@/server/news/types";
import { TRANSLATE_NEWS_PROMPT, WRITE_BRIEFING_PROMPT } from "./prompts/news.v2";

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
  };
}
