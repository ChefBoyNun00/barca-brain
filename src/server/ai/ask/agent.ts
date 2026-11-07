import type Anthropic from "@anthropic-ai/sdk";
import { ASK_MAX_OUTPUT_TOKENS, ASK_MAX_TOOL_ROUNDS, ASK_MODEL } from "@/config/ai";
import { ASK_BLAUGRANA_PROMPT } from "../prompts/ask-blaugrana.v2";
import type { AskContext } from "./tools/define";
import { ASK_TOOLS } from "./tools/registry";

export type AskMessage = { role: "user" | "assistant"; content: string };

export type AskEvent =
  | { type: "status"; label: string }
  | { type: "text"; text: string }
  | { type: "sources"; labels: string[] };

const labelFor = (toolName: string) =>
  ASK_TOOLS.find((tool) => tool.name === toolName)?.label ?? "Looking that up";

/** Claude decides which tools to call, and the SDK's runner loops until it has an answer. */
export async function* streamAnswer(
  client: Anthropic,
  messages: AskMessage[],
  context: AskContext,
): AsyncGenerator<AskEvent> {
  const used = new Set<string>();
  const runner = client.beta.messages.toolRunner({
    model: ASK_MODEL,
    max_tokens: ASK_MAX_OUTPUT_TOKENS,
    max_iterations: ASK_MAX_TOOL_ROUNDS,
    output_config: { effort: "medium" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      { type: "text", text: ASK_BLAUGRANA_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    tools: ASK_TOOLS.map((tool) => tool.build(context, (name) => used.add(name))),
    messages,
    stream: true,
  });

  let hasText = false;
  for await (const messageStream of runner) {
    let textThisRound = false;
    for await (const event of messageStream) {
      if (event.type === "content_block_start" && event.content_block.type === "tool_use") {
        yield { type: "status", label: labelFor(event.content_block.name) };
      }
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        // Text from an earlier round and this one would otherwise run together.
        if (hasText && !textThisRound) yield { type: "text", text: "\n\n" };
        textThisRound = true;
        hasText = true;
        yield { type: "text", text: event.delta.text };
      }
    }
    const message = await messageStream.finalMessage();
    if (message.stop_reason === "refusal") {
      yield { type: "text", text: "I can't help with that one." };
      break;
    }
    const hasToolUse = message.content.some((block) => block.type === "tool_use");
    if (message.stop_reason === "max_tokens" && hasToolUse) break;
  }

  yield { type: "sources", labels: [...used].map(labelFor) };
}
