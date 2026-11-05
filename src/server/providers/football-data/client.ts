import { FOOTBALL_DATA } from "@/config/football";

export type FootballDataReply = {
  httpStatus: number;
  body: unknown;
  requestsLeftThisMinute: string | null;
};

/** One GET with no retries. The free plan allows 10 requests per minute. */
export async function getFromFootballData(
  path: string,
  params: Record<string, string | number>,
  apiToken: string,
): Promise<FootballDataReply> {
  const url = new URL(path, FOOTBALL_DATA.baseUrl);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, String(value));
  }

  const response = await fetch(url, {
    headers: { [FOOTBALL_DATA.authHeader]: apiToken },
    signal: AbortSignal.timeout(FOOTBALL_DATA.requestTimeoutMs),
  });

  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Not JSON (e.g. a gateway error page): classifySeasonAccess reports it as unexpected.
  }

  return {
    httpStatus: response.status,
    body,
    requestsLeftThisMinute: response.headers.get("x-requests-available-minute"),
  };
}
