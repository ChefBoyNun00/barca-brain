import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { ASK_MAX_MESSAGE_CHARS, ASK_MAX_MESSAGES, ASK_REQUESTS_PER_HOUR } from "@/config/ai";

const HOUR_MS = 3_600_000;

export const AskRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(ASK_MAX_MESSAGE_CHARS),
      }),
    )
    .min(1)
    .max(ASK_MAX_MESSAGES)
    .refine((messages) => messages.at(-1)?.role === "user" && messages[0]?.role === "user"),
});

const digest = (text: string) => createHash("sha256").update(text).digest();

/**
 * Every question costs money, so a live site with no code set stays closed rather than
 * open to anyone. On a developer's own computer, no code is needed.
 */
export function isAskAllowed(
  code: string | null,
  env: { accessCode?: string; isProduction: boolean },
): boolean {
  const expected = env.accessCode?.trim();
  if (!expected) return !env.isProduction;
  return code !== null && timingSafeEqual(digest(code), digest(expected));
}

// TODO(debt): counts per server instance, so it resets on a cold start and is not global —
// the app's database login is read-only by design, so it cannot store counts — the access
// code is the real gate; use Upstash or a write-only role if the app ever opens to the public.
const recentRequests = new Map<string, number[]>();

export function takeRequestSlot(visitor: string, now = Date.now()): boolean {
  const recent = (recentRequests.get(visitor) ?? []).filter((time) => now - time < HOUR_MS);
  if (recent.length >= ASK_REQUESTS_PER_HOUR) return false;
  recentRequests.set(visitor, [...recent, now]);
  return true;
}
