import { FOTMOB } from "@/config/match-room";
import { ProviderError } from "../types";

export const PROVIDER_NAME = "fotmob";

export type FetchFotmob = (path: string, params: Record<string, string | number>) => Promise<unknown>;

/**
 * One GET to FotMob's unofficial API, with no retries: the job runs again in a few minutes.
 * There is no key. FotMob can change or close these addresses at any time.
 */
export const getFromFotmob: FetchFotmob = async (path, params) => {
  const url = new URL(path, FOTMOB.baseUrl);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));
  const context = { provider: PROVIDER_NAME, endpoint: path, params };

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "user-agent": FOTMOB.userAgent, accept: "application/json" },
      signal: AbortSignal.timeout(FOTMOB.requestTimeoutMs),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error";
    throw new ProviderError(`Network failure calling ${path}: ${reason}`, context);
  }

  if (response.status !== 200) {
    throw new ProviderError(`HTTP ${response.status} from ${path}`, {
      ...context,
      httpStatus: response.status,
    });
  }
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new ProviderError(`Not JSON from ${path}`, { ...context, httpStatus: response.status });
  }
};
