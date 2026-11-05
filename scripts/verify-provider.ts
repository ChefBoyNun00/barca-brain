// Phase 1 check: does the whole adapter work against the live API? Costs 6 requests.
import { getEnvVars } from "@/config/env";
import { CURRENT_SEASON, FOOTBALL_DATA } from "@/config/football";
import { getFootballProvider } from "@/server/providers/registry";

async function main(): Promise<void> {
  const { FOOTBALL_PROVIDER } = getEnvVars(["FOOTBALL_PROVIDER"]);
  let requests = 0;
  const provider = getFootballProvider(FOOTBALL_PROVIDER, {
    onResponse: () => {
      requests += 1;
    },
  });

  const teamId = String(FOOTBALL_DATA.teamId);
  const fixtures = await provider.getTeamFixtures({ teamId, season: CURRENT_SEASON });
  const squad = await provider.getSquad(teamId);
  console.log(`${provider.name}: ${fixtures.length} fixtures, ${squad.length} squad players`);

  for (const { key, code } of FOOTBALL_DATA.competitions) {
    const standings = await provider.getStandings(code, CURRENT_SEASON);
    const scorers = await provider.getSeasonScorers(code, CURRENT_SEASON);
    const barcaRank = standings.find((row) => row.team.externalId === teamId)?.rank ?? "not listed";
    const barcaScorers = scorers.filter((row) => row.team.externalId === teamId).length;
    console.log(
      `${key}: ${standings.length} teams, Barça rank ${barcaRank}, ` +
        `${scorers.length} scorers (${barcaScorers} Barça)`,
    );
  }
  console.log(`Replies received: ${requests}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
