import Anthropic from "@anthropic-ai/sdk";
import { streamAnswer, type AskEvent } from "@/server/ai/ask/agent";
import { AskRequestSchema, isAskAllowed, takeRequestSlot } from "@/server/ai/ask/access";
import { createAskContext } from "@/server/ai/ask/context";
import { createClaudeClient, hasClaudeKey } from "@/server/ai/client";

export const maxDuration = 60;

type WireEvent = AskEvent | { type: "error"; message: string } | { type: "done" };

const refuse = (status: number, reason: string) => Response.json({ reason }, { status });

function describeFailure(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) return "The Claude API key was rejected.";
  if (error instanceof Anthropic.RateLimitError) return "Claude is busy. Try again in a minute.";
  return "Something went wrong answering that. Try again.";
}

export async function POST(request: Request): Promise<Response> {
  const allowed = isAskAllowed(request.headers.get("x-ask-code"), {
    accessCode: process.env.ASK_ACCESS_CODE,
    isProduction: process.env.NODE_ENV === "production",
  });
  if (!allowed) return refuse(401, "code");

  const visitor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!takeRequestSlot(visitor)) return refuse(429, "limit");
  if (!hasClaudeKey()) return refuse(503, "not-configured");

  const body = AskRequestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return refuse(400, "invalid");

  let cancelled = false;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: WireEvent) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        const answer = streamAnswer(createClaudeClient(), body.data.messages, createAskContext());
        for await (const event of answer) {
          if (cancelled) return;
          send(event);
        }
        send({ type: "done" });
      } catch (error) {
        console.error("Ask failed:", error instanceof Error ? error.name : "unknown error");
        if (!cancelled) send({ type: "error", message: describeFailure(error) });
      }
      if (!cancelled) controller.close();
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
