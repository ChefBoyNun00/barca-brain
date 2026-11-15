import { MATCH_ROOM_KICKOFF_TOLERANCE_HOURS } from "@/config/match-room";
import type { SeasonMatch } from "@/domain/home";
import type { FetchedMatchRoom } from "@/domain/match-room";
import type { Database } from "@/server/db/client";
import { getSeasonMatches, type TeamScope } from "@/server/db/queries/home";
import { saveMatchRoom } from "@/server/db/queries/match-room-writes";
import type { MatchRoomProvider } from "@/server/providers/types";

const HOUR_MS = 3_600_000;

/**
 * Our fixture for a provider's match: Barça on the same side, kickoffs within the tolerance,
 * closest first. Null when there is none, e.g. a cup or friendly our data does not cover.
 */
export function findFixtureFor(
  room: Pick<FetchedMatchRoom, "kickoffAt" | "barcaIsHome">,
  matches: readonly SeasonMatch[],
  toleranceHours = MATCH_ROOM_KICKOFF_TOLERANCE_HOURS,
): SeasonMatch | null {
  let best: SeasonMatch | null = null;
  let bestGap = toleranceHours * HOUR_MS;
  for (const match of matches) {
    if (match.isHome !== room.barcaIsHome) continue;
    const gap = Math.abs(match.kickoffAt.getTime() - room.kickoffAt.getTime());
    if (gap <= bestGap) {
      best = match;
      bestGap = gap;
    }
  }
  return best;
}

export type MatchRoomRunResult = {
  status: "success" | "failed";
  saved: { fixtureId: string; externalId: string }[];
  unmatched: string[];
  warnings: string[];
  error?: string;
};

export async function runMatchRoom(deps: {
  database: Database;
  provider: MatchRoomProvider;
  scope: TeamScope;
}): Promise<MatchRoomRunResult> {
  const { database, provider, scope } = deps;
  let fetched: Awaited<ReturnType<MatchRoomProvider["getBarcaMatchRooms"]>>;
  try {
    fetched = await provider.getBarcaMatchRooms();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: "failed", saved: [], unmatched: [], warnings: [], error: message };
  }

  const matches = await getSeasonMatches(database, scope);
  const saved: MatchRoomRunResult["saved"] = [];
  const unmatched: string[] = [];

  await database.transaction(async (db) => {
    for (const room of fetched.rooms) {
      const fixture = findFixtureFor(room, matches);
      if (!fixture) {
        unmatched.push(room.externalId);
        continue;
      }
      await saveMatchRoom(db, {
        fixtureId: fixture.id,
        provider: provider.name,
        externalId: room.externalId,
        details: room.details,
      });
      saved.push({ fixtureId: fixture.id, externalId: room.externalId });
    }
  });

  return { status: "success", saved, unmatched, warnings: fetched.warnings };
}
