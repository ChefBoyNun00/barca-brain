import { PHOTO_LOOKUPS_PER_RUN, PHOTO_RETRY_AFTER_DAYS } from "@/config/photos";
import { getPlayersNeedingPhotos, savePlayerPhoto } from "@/server/db/queries/player-photos";
import type { IngestJob } from "./types";

export const playerPhotosJob: IngestJob = {
  name: "player-photos",
  /** Wikimedia is free and separate, so this uses none of the football budget. */
  requestCost: () => 0,
  async run({ db, provider, photos, target, season }) {
    const players = await getPlayersNeedingPhotos(db, {
      provider: provider.name,
      teamExternalId: target.teamId,
      season,
      retryAfterDays: PHOTO_RETRY_AFTER_DAYS,
      limit: PHOTO_LOOKUPS_PER_RUN,
    });

    let checked = 0;
    let lastError: unknown;
    for (const player of players) {
      try {
        const photo = await photos.findPlayerPhoto(player);
        await savePlayerPhoto(db, player.id, photo);
        checked += 1;
      } catch (error) {
        // One failed lookup should not cost the others. It is retried tomorrow.
        lastError = error;
      }
    }

    if (players.length > 0 && checked === 0) throw lastError;
    return checked;
  },
};
