// Player photos come from Wikimedia, which publishes freely licensed images.

export const WIKIMEDIA = {
  wikidataUrl: "https://www.wikidata.org/w/api.php",
  commonsUrl: "https://commons.wikimedia.org/w/api.php",
  /** Wikimedia asks automated clients to identify themselves. */
  userAgent: "BarcaBrain/0.1 (https://github.com/ChefBoyNun00/barca-brain)",
  requestTimeoutMs: 15_000,
  searchLimit: 20,
  thumbnailWidth: 400,
  /** Pause between players, to be polite to a free public service. */
  delayBetweenLookupsMs: 200,
} as const;

/** Free licences only. "CC BY-NC" and "CC BY-ND" do not match, so they are refused. */
export const ALLOWED_PHOTO_LICENSE = /^(CC0|CC BY(-SA)? \d|Public domain)/i;

/** Lookups per nightly run. */
export const PHOTO_LOOKUPS_PER_RUN = 40;

/** How long to wait before searching again for a player with no photo. */
export const PHOTO_RETRY_AFTER_DAYS = 7;

/** Where a provider's name is not the one Wikimedia knows the player by. */
export const PLAYER_SEARCH_NAMES: Record<string, string> = {
  "Pablo Gavira": "Gavi",
};
