import type { DomainTeam } from "@/domain/football";
import { upsertCompetition, upsertFixture, upsertTeam } from "@/server/db/queries/ingest-writes";
import type { IngestJob } from "./types";

export const fixturesJob: IngestJob = {
  name: "fixtures",
  requestCost: () => 1,
  async run({ db, provider, target, season }) {
    const fixtures = await provider.getTeamFixtures({ teamId: target.teamId, season });
    const competitionIds = new Map<string, string>();
    const teamIds = new Map<string, string>();

    // Barça appears in every fixture, so each team and competition is written once.
    const storeTeam = async (team: DomainTeam | null): Promise<string | null> => {
      if (team === null) return null;
      const known = teamIds.get(team.externalId);
      if (known) return known;
      const id = await upsertTeam(db, provider.name, team);
      teamIds.set(team.externalId, id);
      return id;
    };

    for (const fixture of fixtures) {
      const { competition } = fixture;
      const competitionId =
        competitionIds.get(competition.externalId) ??
        (await upsertCompetition(db, provider.name, competition));
      competitionIds.set(competition.externalId, competitionId);

      await upsertFixture(db, provider.name, fixture, {
        competitionId,
        homeTeamId: await storeTeam(fixture.homeTeam),
        awayTeamId: await storeTeam(fixture.awayTeam),
      });
    }
    return fixtures.length;
  },
};
