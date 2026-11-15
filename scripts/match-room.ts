// Entry point for `npm run matchday`: refreshes the Matchday Room for Barça's latest and next match.
import { INGEST_POOL_SIZE } from "@/config/database";
import { getEnvVars } from "@/config/env";
import { createDatabase } from "@/server/db/client";
import { getCurrentTeamScope } from "@/server/db/team-scope";
import { runMatchRoom } from "@/server/match-room/run-match-room";
import { createFotmobProvider } from "@/server/providers/fotmob/provider";

async function main(): Promise<void> {
  const { DATABASE_URL_INGEST } = getEnvVars(["DATABASE_URL_INGEST"]);
  const database = createDatabase(DATABASE_URL_INGEST, INGEST_POOL_SIZE);
  try {
    const result = await runMatchRoom({
      database,
      provider: createFotmobProvider(),
      scope: getCurrentTeamScope(),
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
