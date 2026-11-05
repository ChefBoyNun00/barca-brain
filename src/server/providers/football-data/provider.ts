import { getEnvVars } from "@/config/env";
import { FOOTBALL_DATA } from "@/config/football";
import type { FootballProvider, ProviderHooks } from "../types";
import { mapFixtures, mapScorers, mapSquad, mapStandings } from "./mapper";
import { PROVIDER_NAME, requestValidated, type RequestDeps } from "./request";
import { ScorersSchema, StandingsSchema, TeamFixturesSchema, TeamSquadSchema } from "./schemas";

export function createFootballDataProvider(deps: RequestDeps): FootballProvider {
  return {
    name: PROVIDER_NAME,

    async getTeamFixtures({ teamId, season }) {
      const raw = await requestValidated(
        `/v4/teams/${teamId}/matches`,
        { season },
        TeamFixturesSchema,
        deps,
      );
      return mapFixtures(raw, season);
    },

    async getSquad(teamId) {
      const raw = await requestValidated(`/v4/teams/${teamId}`, {}, TeamSquadSchema, deps);
      return mapSquad(raw);
    },

    async getStandings(competitionId, season) {
      const raw = await requestValidated(
        `/v4/competitions/${competitionId}/standings`,
        { season },
        StandingsSchema,
        deps,
      );
      return mapStandings(raw);
    },

    async getSeasonScorers(competitionId, season) {
      const raw = await requestValidated(
        `/v4/competitions/${competitionId}/scorers`,
        { season, limit: FOOTBALL_DATA.scorersLimit },
        ScorersSchema,
        deps,
      );
      return mapScorers(raw);
    },
  };
}

/** Reads the token only when this provider is chosen, so others do not need it. */
export function createFootballDataProviderFromEnv(hooks: ProviderHooks): FootballProvider {
  const { FOOTBALL_DATA_KEY } = getEnvVars(["FOOTBALL_DATA_KEY"]);
  return createFootballDataProvider({ ...hooks, apiToken: FOOTBALL_DATA_KEY });
}
