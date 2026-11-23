import { ANALYTICS_KEPT_PARAMS } from "@/config/analytics";

/**
 * Returns the address with every "?name=value" part removed except the allowed ones, and without
 * the "#section" part. If the address can't be read, it returns null so the visit isn't sent at
 * all: better to miss one count than to risk sending something private.
 */
export function scrubAnalyticsUrl(
  url: string,
  kept: readonly string[] = ANALYTICS_KEPT_PARAMS,
): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const clean = new URLSearchParams();
  for (const [name, value] of parsed.searchParams) {
    if (kept.includes(name)) clean.append(name, value);
  }
  parsed.search = clean.toString();
  parsed.hash = "";
  return parsed.toString();
}
