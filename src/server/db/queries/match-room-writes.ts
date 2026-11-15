import type { MatchRoomDetails } from "@/domain/match-room";
import type { Db } from "../client";

/** Replaces the room for a fixture as a whole, so a refresh never leaves old and new mixed. */
export async function saveMatchRoom(
  db: Db,
  room: { fixtureId: string; provider: string; externalId: string; details: MatchRoomDetails },
): Promise<void> {
  await db.query(
    `insert into match_rooms (fixture_id, provider, external_id, details, updated_at)
     values ($1, $2, $3, $4::jsonb, now())
     on conflict (fixture_id) do update set
       provider = excluded.provider,
       external_id = excluded.external_id,
       details = excluded.details,
       updated_at = excluded.updated_at`,
    [room.fixtureId, room.provider, room.externalId, JSON.stringify(room.details)],
  );
}
