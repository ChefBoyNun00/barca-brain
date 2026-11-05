// Phase 0 check: can this football-data.org token read the current season? Costs 1 request.
import { getEnvVars } from "@/config/env";
import { CURRENT_SEASON, FOOTBALL_DATA } from "@/config/football";
import { checkSeasonAccess } from "@/server/providers/football-data/season-access";

async function main(): Promise<void> {
  const { FOOTBALL_DATA_KEY } = getEnvVars(["FOOTBALL_DATA_KEY"]);
  console.log(`GET /v4/teams/${FOOTBALL_DATA.teamId}/matches?season=${CURRENT_SEASON}`);

  const { access, requestsLeftThisMinute } = await checkSeasonAccess(FOOTBALL_DATA_KEY);
  console.log(JSON.stringify(access, null, 2));
  console.log(`Requests left this minute: ${requestsLeftThisMinute ?? "not reported"}`);

  if (access.kind !== "ok") {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
