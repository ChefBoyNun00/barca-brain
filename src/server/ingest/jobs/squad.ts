import {
  requireInternalId,
  upsertPlayer,
  upsertSquadMembership,
} from "@/server/db/queries/ingest-writes";
import type { IngestJob } from "./types";

export const squadJob: IngestJob = {
  name: "squad",
  requestCost: () => 1,
  async run({ db, provider, target, season }) {
    const squad = await provider.getSquad(target.teamId);
    const teamId = await requireInternalId(db, "team", provider.name, target.teamId);

    for (const player of squad) {
      const playerId = await upsertPlayer(db, provider.name, player);
      await upsertSquadMembership(db, {
        playerId,
        teamId,
        season,
        shirtNumber: player.shirtNumber,
      });
    }
    return squad.length;
  },
};
