import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import type { LeagueRow, SeasonMatch, SquadPlayer } from "@/domain/home";
import type { NewsArticle } from "@/domain/news";

/** What tools can read. Every part goes through query functions, and none of it writes. */
export type AskContext = {
  now: Date;
  matches: () => Promise<SeasonMatch[]>;
  squad: () => Promise<SquadPlayer[]>;
  table: () => Promise<LeagueRow[]>;
  searchNews: (query: string, days: number) => Promise<NewsArticle[]>;
};

type ToolSpec<Schema extends z.ZodObject, Result> = {
  name: string;
  /** Shown to the viewer while the tool runs. */
  label: string;
  description: string;
  inputSchema: Schema;
  run: (input: z.infer<Schema>, context: AskContext) => Promise<Result>;
};

export function defineTool<Schema extends z.ZodObject, Result>(spec: ToolSpec<Schema, Result>) {
  return {
    ...spec,
    build: (context: AskContext, onUse: (name: string) => void) =>
      betaZodTool({
        name: spec.name,
        description: spec.description,
        inputSchema: spec.inputSchema,
        run: async (input) => {
          try {
            const result = await spec.run(input as z.infer<Schema>, context);
            onUse(spec.name);
            return JSON.stringify(result);
          } catch {
            // Returned, not thrown, so Claude can tell the viewer instead of the request dying.
            return JSON.stringify({ error: "That data could not be read just now." });
          }
        },
      }),
  };
}
