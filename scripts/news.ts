// Entry point for `npm run news`: reads the Spanish press, translates it and stores it.
import { INGEST_POOL_SIZE } from "@/config/database";
import { getEnvVars } from "@/config/env";
import { NEWS_FEEDS } from "@/config/news";
import { createClaudeClient, hasClaudeKey } from "@/server/ai/client";
import { createNewsAi } from "@/server/ai/news-ai";
import { createDatabase } from "@/server/db/client";
import { runNews } from "@/server/news/run-news";
import { createRssProvider } from "@/server/providers/rss/provider";

async function main(): Promise<void> {
  const { DATABASE_URL_INGEST } = getEnvVars(["DATABASE_URL_INGEST"]);
  const ai = hasClaudeKey() ? createNewsAi(createClaudeClient()) : null;
  if (!ai) console.warn("No ANTHROPIC_API_KEY: storing headlines without translating them.");

  const database = createDatabase(DATABASE_URL_INGEST, INGEST_POOL_SIZE);
  try {
    const result = await runNews({
      db: database,
      provider: createRssProvider(),
      ai,
      feeds: NEWS_FEEDS,
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
