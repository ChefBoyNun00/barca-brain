import {
  requireInternalId,
  upsertPlayer,
  upsertPlayerSeasonStats,
  upsertSquadMembership,
} from "@/server/db/queries/ingest-writes";
import type { IngestJob } from "./types";

export const scorersJob: IngestJob = {
  name: "scorers",
  requestCost: (target) => target.competitionIds.length,
  async run({ db, provider, target, season }) {
    const teamId = await requireInternalId(db, "team", provider.name, target.teamId);
    let written = 0;

    for (const externalCompetitionId of target.competitionIds) {
      const competitionId = await requireInternalId(
        db,
        "competition",
        provider.name,
        externalCompetitionId,
      );
      const scorers = await provider.getSeasonScorers(externalCompetitionId, season);

      for (const scorer of scorers.filter((row) => row.team.externalId === target.teamId)) {
        // A scorer who left the club is missing from the squad, so this may create them.
        const playerId = await upsertPlayer(db, provider.name, scorer.player);
        await upsertSquadMembership(db, {
          playerId,
          teamId,
          season,
          shirtNumber: scorer.player.shirtNumber,
        });
        await upsertPlayerSeasonStats(db, { playerId, teamId, competitionId, season, scorer });
        written += 1;
      }
    }
    return written;
  },
};
