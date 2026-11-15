import { DEFAULT_NEWS_EDITION, NEWS_EDITION_IDS, type NewsEdition } from "@/config/news";

/** Anything from a URL or a cookie is checked against the known editions, or ignored. */
export function parseNewsEdition(value: unknown): NewsEdition | null {
  return NEWS_EDITION_IDS.find((id) => id === value) ?? null;
}

/**
 * The address's ?edition= wins, so a shared link shows what was shared. Otherwise the
 * visitor's remembered choice, otherwise the world edition.
 */
export function chooseNewsEdition(fromUrl: unknown, fromCookie: unknown): NewsEdition {
  return parseNewsEdition(fromUrl) ?? parseNewsEdition(fromCookie) ?? DEFAULT_NEWS_EDITION;
}
