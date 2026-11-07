import { z } from "zod";

const AnswerEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("status"), label: z.string() }),
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({ type: z.literal("sources"), labels: z.array(z.string()) }),
  z.object({ type: z.literal("error"), message: z.string() }),
  z.object({ type: z.literal("done") }),
]);

export type AnswerEvent = z.infer<typeof AnswerEventSchema>;

/** Reads a stream of one-JSON-per-line events, which can arrive split at any point. */
export async function* readAnswerEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<AnswerEvent> {
  const decoder = new TextDecoder();
  const reader = body.getReader();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    buffer += value ? decoder.decode(value, { stream: true }) : "";
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) yield AnswerEventSchema.parse(JSON.parse(line));
    }
    if (done) return;
  }
}
