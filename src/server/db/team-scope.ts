import { getEnvVars } from "@/config/env";
import { CURRENT_SEASON, INGEST_TARGETS } from "@/config/football";
import type { TeamScope } from "./queries/home";

/** Which team and season the app shows, for the configured provider. */
export function getCurrentTeamScope(): TeamScope {
  const { FOOTBALL_PROVIDER: provider } = getEnvVars(["FOOTBALL_PROVIDER"]);
  const target = INGEST_TARGETS[provider];
  if (!target) throw new Error(`No team configured for provider ${provider}`);
  return { provider, teamExternalId: target.teamId, season: CURRENT_SEASON };
}
