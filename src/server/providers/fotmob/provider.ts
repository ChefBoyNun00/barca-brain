import type { z } from "zod";
import { FOTMOB } from "@/config/match-room";
import type { FetchedMatchRoom } from "@/domain/match-room";
import { ProviderError, type MatchRoomProvider } from "../types";
import { getFromFotmob, PROVIDER_NAME, type FetchFotmob } from "./client";
import { mapMatchDetails } from "./mapper";
import { MatchDetailsSchema, TeamSchema } from "./schemas";

async function getValidated<Schema extends z.ZodType>(
  fetchFotmob: FetchFotmob,
  path: string,
  params: Record<string, string | number>,
  schema: Schema,
): Promise<z.infer<Schema>> {
  const parsed = schema.safeParse(await fetchFotmob(path, params));
  if (parsed.success) return parsed.data;
  throw new ProviderError(`Unrecognised response shape from ${path}`, {
    provider: PROVIDER_NAME,
    endpoint: path,
    params,
  });
}

/** Barça's most recent and next match, three requests in all. */
export function createFotmobProvider(fetchFotmob: FetchFotmob = getFromFotmob): MatchRoomProvider {
  return {
    name: PROVIDER_NAME,

    async getBarcaMatchRooms() {
      const team = await getValidated(
        fetchFotmob,
        "/api/data/teams",
        { id: FOTMOB.teamId, ccode3: FOTMOB.countryCode },
        TeamSchema,
      );
      const { lastMatch, nextMatch } = team.fixtures.allFixtures;
      const matchIds = [...new Set([lastMatch?.id, nextMatch?.id])].filter(
        (id): id is number => typeof id === "number",
      );

      const rooms: FetchedMatchRoom[] = [];
      const warnings: string[] = [];
      for (const matchId of matchIds) {
        const details = await getValidated(
          fetchFotmob,
          "/api/data/matchDetails",
          { matchId, ccode3: FOTMOB.countryCode },
          MatchDetailsSchema,
        );
        rooms.push(mapMatchDetails(details, warnings));
      }
      return { rooms, warnings };
    },
  };
}
