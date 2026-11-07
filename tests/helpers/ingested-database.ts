import { readdirSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import type { Database, Db } from "@/server/db/client";
import { INGEST_JOBS } from "@/server/ingest/jobs";
import { runIngest } from "@/server/ingest/runner";
import { createFootballDataProvider } from "@/server/providers/football-data/provider";

const MIGRATIONS_DIR = "supabase/migrations";

const RECORDED_BY_ENDPOINT: Record<string, string> = {
  "/v4/teams/81/matches": "team-matches",
  "/v4/teams/81": "team",
  "/v4/competitions/PD/standings": "standings-pd",
  "/v4/competitions/CL/standings": "standings-cl",
  "/v4/competitions/PD/scorers": "scorers-pd",
  "/v4/competitions/CL/scorers": "scorers-cl",
};

/** A throwaway Postgres with the real migrations and no data. */
export async function createEmptyDatabase(): Promise<{ pg: PGlite; database: Database }> {
  const pg = new PGlite({ extensions: { pgcrypto } });
  await pg.exec("create role anon nologin; create role authenticated nologin;");
  for (const file of readdirSync(MIGRATIONS_DIR).sort()) {
    await pg.exec(readFileSync(`${MIGRATIONS_DIR}/${file}`, "utf8"));
  }
  const asDb = (client: Pick<PGlite, "query">): Db => ({
    query: (text, params) => client.query(text, params),
  });
  const database: Database = {
    ...asDb(pg),
    transaction: async (work) => {
      const result = await pg.transaction((tx) => work(asDb(tx)));
      return result as Awaited<ReturnType<typeof work>>;
    },
    close: async () => {},
  };
  return { pg, database };
}

/** The same database after a real ingest of the recorded API replies. */
export async function createIngestedDatabase() {
  const created = await createEmptyDatabase();
  await runIngest({
    database: created.database,
    createProvider: (hooks) =>
      createFootballDataProvider({
        ...hooks,
        apiToken: "test-token",
        fetchReply: async (endpoint) => ({
          httpStatus: 200,
          body: JSON.parse(
            readFileSync(
              `tests/fixtures/football-data/${RECORDED_BY_ENDPOINT[endpoint]}.json`,
              "utf8",
            ),
          ),
          requestsLeftThisMinute: null,
        }),
      }),
    photos: { findPlayerPhoto: async () => null },
    jobs: INGEST_JOBS,
    target: { teamId: "81", competitionIds: ["PD", "CL"] },
    season: 2026,
    dailyRequestBudget: 100,
  });
  return created;
}
