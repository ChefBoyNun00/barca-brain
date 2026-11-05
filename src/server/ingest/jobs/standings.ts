import { requireInternalId, upsertStanding, upsertTeam } from "@/server/db/queries/ingest-writes";
import type { IngestJob } from "./types";

export const standingsJob: IngestJob = {
  name: "standings",
  requestCost: (target) => target.competitionIds.length,
  async run({ db, provider, target, season }) {
    let written = 0;

    for (const externalCompetitionId of target.competitionIds) {
      const competitionId = await requireInternalId(
        db,
        "competition",
        provider.name,
        externalCompetitionId,
      );
      const standings = await provider.getStandings(externalCompetitionId, season);

      for (const standing of standings) {
        const teamId = await upsertTeam(db, provider.name, standing.team);
        await upsertStanding(db, { competitionId, season, teamId, standing });
        written += 1;
      }
    }
    return written;
  },
};
