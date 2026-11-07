import type { z } from "zod";
import { PLAYER_SEARCH_NAMES, WIKIMEDIA } from "@/config/photos";
import { ProviderError, type PlayerPhotoProvider } from "../types";
import { findImageFile, mapPhoto } from "./mapper";
import { EntitiesSchema, ImageInfoSchema, SearchSchema } from "./schemas";

const PROVIDER_NAME = "wikimedia";

type Deps = {
  fetchJson?: (url: URL) => Promise<unknown>;
  sleep?: (ms: number) => Promise<void>;
};

async function fetchJsonFromWikimedia(url: URL): Promise<unknown> {
  const response = await fetch(url, {
    headers: { "User-Agent": WIKIMEDIA.userAgent },
    signal: AbortSignal.timeout(WIKIMEDIA.requestTimeoutMs),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function createWikimediaPhotoProvider(deps: Deps = {}): PlayerPhotoProvider {
  const fetchJson = deps.fetchJson ?? fetchJsonFromWikimedia;
  const sleep = deps.sleep ?? wait;

  async function getValidated<Schema extends z.ZodType>(
    base: string,
    params: Record<string, string | number>,
    schema: Schema,
  ): Promise<z.infer<Schema>> {
    const url = new URL(base);
    url.searchParams.set("format", "json");
    for (const [name, value] of Object.entries(params)) {
      url.searchParams.set(name, String(value));
    }
    const parsed = schema.safeParse(await fetchJson(url));
    if (parsed.success) return parsed.data;
    throw new ProviderError("Unrecognised response from Wikimedia", {
      provider: PROVIDER_NAME,
      endpoint: base,
      params,
    });
  }

  return {
    async findPlayerPhoto({ name, birthDate }) {
      await sleep(WIKIMEDIA.delayBetweenLookupsMs);

      const { search } = await getValidated(
        WIKIMEDIA.wikidataUrl,
        {
          action: "wbsearchentities",
          language: "en",
          type: "item",
          limit: WIKIMEDIA.searchLimit,
          search: PLAYER_SEARCH_NAMES[name] ?? name,
        },
        SearchSchema,
      );
      if (search.length === 0) return null;

      const { entities } = await getValidated(
        WIKIMEDIA.wikidataUrl,
        {
          action: "wbgetentities",
          props: "claims",
          ids: search.map((item) => item.id).join("|"),
        },
        EntitiesSchema,
      );
      const imageFile = findImageFile(entities, birthDate);
      if (!imageFile) return null;

      const imageInfo = await getValidated(
        WIKIMEDIA.commonsUrl,
        {
          action: "query",
          prop: "imageinfo",
          iiprop: "url|extmetadata",
          iiurlwidth: WIKIMEDIA.thumbnailWidth,
          titles: `File:${imageFile}`,
        },
        ImageInfoSchema,
      );
      return mapPhoto(imageInfo);
    },
  };
}
