// Entry point for `npm run ingest`: fetches football data and writes it to Supabase.
import { INGEST_POOL_SIZE } from "@/config/database";
import { getEnvVars } from "@/config/env";
import { CURRENT_SEASON, INGEST_TARGETS } from "@/config/football";
import { createDatabase } from "@/server/db/client";
import { INGEST_JOBS } from "@/server/ingest/jobs";
import { runIngest } from "@/server/ingest/runner";
import { getFootballProvider } from "@/server/providers/registry";

async function main(): Promise<void> {
  const { FOOTBALL_PROVIDER, DATABASE_URL_INGEST, DAILY_REQUEST_BUDGET } = getEnvVars([
    "FOOTBALL_PROVIDER",
    "DATABASE_URL_INGEST",
    "DAILY_REQUEST_BUDGET",
  ]);
  const target = INGEST_TARGETS[FOOTBALL_PROVIDER];
  if (!target) throw new Error(`No ingest target configured for ${FOOTBALL_PROVIDER}`);

  const database = createDatabase(DATABASE_URL_INGEST, INGEST_POOL_SIZE);
  try {
    const result = await runIngest({
      database,
      createProvider: (hooks) => getFootballProvider(FOOTBALL_PROVIDER, hooks),
      jobs: INGEST_JOBS,
      target,
      season: CURRENT_SEASON,
      dailyRequestBudget: DAILY_REQUEST_BUDGET,
    });
    console.log(JSON.stringify(result, null, 2));
    if (result.status === "failed") process.exitCode = 1;
  } finally {
    await database.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
