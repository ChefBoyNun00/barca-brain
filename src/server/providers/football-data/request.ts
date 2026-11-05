import type { z } from "zod";
import { FOOTBALL_DATA } from "@/config/football";
import { ProviderError, type ProviderHooks } from "../types";
import { getFromFootballData, type FootballDataReply } from "./client";

export const PROVIDER_NAME = "football-data";

export type RequestDeps = ProviderHooks & {
  apiToken: string;
  fetchReply?: typeof getFromFootballData;
  sleep?: (ms: number) => Promise<void>;
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const isRetryable = (httpStatus: number) => httpStatus === 429 || httpStatus >= 500;

/**
 * GETs and validates one endpoint. Retries rate limits, server errors and network
 * failures with growing waits; other 4xx replies will not improve, so they fail at once.
 */
export async function requestValidated<Schema extends z.ZodType>(
  endpoint: string,
  params: Record<string, string | number>,
  schema: Schema,
  deps: RequestDeps,
): Promise<z.infer<Schema>> {
  const fetchReply = deps.fetchReply ?? getFromFootballData;
  const sleep = deps.sleep ?? wait;
  const context = { provider: PROVIDER_NAME, endpoint, params };

  for (let attempt = 0; ; attempt += 1) {
    const isLastAttempt = attempt >= FOOTBALL_DATA.maxRetries;
    let reply: FootballDataReply;

    try {
      reply = await fetchReply(endpoint, params, deps.apiToken);
    } catch (error) {
      if (isLastAttempt) {
        const reason = error instanceof Error ? error.message : "unknown error";
        throw new ProviderError(`Network failure calling ${endpoint}: ${reason}`, context);
      }
      await sleep(FOOTBALL_DATA.retryBaseDelayMs * 2 ** attempt);
      continue;
    }

    const { httpStatus, body } = reply;
    deps.onResponse?.({ ...context, httpStatus, body });

    if (httpStatus === 200) {
      const parsed = schema.safeParse(body);
      if (parsed.success) return parsed.data;
      throw new ProviderError(`Unrecognised response shape from ${endpoint}`, {
        ...context,
        httpStatus,
      });
    }

    if (!isRetryable(httpStatus) || isLastAttempt) {
      throw new ProviderError(`HTTP ${httpStatus} from ${endpoint}`, { ...context, httpStatus });
    }
    await sleep(FOOTBALL_DATA.retryBaseDelayMs * 2 ** attempt);
  }
}
