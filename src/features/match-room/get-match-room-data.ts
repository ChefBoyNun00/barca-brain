import { getSeasonData } from "@/features/season/get-season-data";
import { getAppDatabase } from "@/server/db/app-database";
import { getMatchRoom } from "@/server/db/queries/match-room";

/** One match and its room. Null when the id is not one of this season's matches. */
export async function getMatchRoomData(id: string) {
  const { matches } = await getSeasonData();
  const match = matches.find((candidate) => candidate.id === id);
  if (!match) return null;
  // Only ids from our own fixtures reach the query, so a made-up id never touches the database.
  const room = await getMatchRoom(getAppDatabase(), match.id);
  return { match, room };
}
