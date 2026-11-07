import Anthropic from "@anthropic-ai/sdk";
import { getEnvVars } from "@/config/env";

/** Throws a clear error naming the variable when the key is missing. */
export function createClaudeClient(): Anthropic {
  return new Anthropic({ apiKey: getEnvVars(["ANTHROPIC_API_KEY"]).ANTHROPIC_API_KEY });
}

export const hasClaudeKey = () => Boolean(process.env.ANTHROPIC_API_KEY?.trim());
