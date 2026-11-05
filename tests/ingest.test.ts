import { readdirSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { IngestTarget } from "@/config/football";
import type { Database, Db } from "@/server/db/client";
import { INGEST_JOBS } from "@/server/ingest/jobs";
import { runIngest } from "@/server/ingest/runner";
import { createFootballDataProvider } from "@/server/providers/football-data/provider";
import type { ProviderHooks } from "@/server/providers/types";

// Real migrations and jobs on a throwaway Postgres, fed by recorded API replies.
const MIGRATIONS_DIR = "supabase/migrations";
const target: IngestTarget = { teamId: "81", competitionIds: ["PD", "CL"] };

const recorded = (name: string): unknown =>
  JSON.parse(readFileSync(`tests/fixtures/football-data/${name}.json`, "utf8"));

const RECORDED_BY_ENDPOINT: Record<string, string> = {
  "/v4/teams/81/matches": "team-matches",
  "/v4/teams/81": "team",
  "/v4/competitions/PD/standings": "standings-pd",
  "/v4/competitions/CL/standings": "standings-cl",
  "/v4/competitions/PD/scorers": "scorers-pd",
  "/v4/competitions/CL/scorers": "scorers-cl",
};

function recordedProvider(hooks: ProviderHooks, failingEndpoint?: string) {
  return createFootballDataProvider({
    ...hooks,
    apiToken: "test-token",
    fetchReply: async (endpoint) => {
      if (endpoint === failingEndpoint) {
        return { httpStatus: 404, body: { message: "nope" }, requestsLeftThisMinute: null };
      }
      const name = RECORDED_BY_ENDPOINT[endpoint];
      if (!name) throw new Error(`No recording for ${endpoint}`);
      return { httpStatus: 200, body: recorded(name), requestsLeftThisMinute: null };
    },
  });
}

let pg: PGlite;
let database: Database;

const count = async (table: string): Promise<number> => {
  const { rows } = await pg.query<{ n: number }>(`select count(*)::int as n from ${table}`);
  return rows[0]?.n ?? -1;
};

const tableCounts = async () => ({
  competitions: await count("competitions"),
  teams: await count("teams"),
  players: await count("players"),
  squad: await count("squad_memberships"),
  fixtures: await count("fixtures"),
  stats: await count("player_season_stats"),
  standings: await count("standings"),
  externalIds: await count("external_ids"),
});

const ingest = (options: { failingEndpoint?: string; dailyRequestBudget?: number } = {}) =>
  runIngest({
    database,
    createProvider: (hooks) => recordedProvider(hooks, options.failingEndpoint),
    jobs: INGEST_JOBS,
    target,
    season: 2026,
    dailyRequestBudget: options.dailyRequestBudget ?? 100,
  });

beforeEach(async () => {
  pg = new PGlite({ extensions: { pgcrypto } });
  await pg.exec("create role anon nologin; create role authenticated nologin;");
  for (const file of readdirSync(MIGRATIONS_DIR).sort()) {
    await pg.exec(readFileSync(`${MIGRATIONS_DIR}/${file}`, "utf8"));
  }
  const asDb = (client: Pick<PGlite, "query">): Db => ({
    query: (text, params) => client.query(text, params),
  });
  database = {
    ...asDb(pg),
    transaction: async (work) => {
      const result = await pg.transaction((tx) => work(asDb(tx)));
      return result as Awaited<ReturnType<typeof work>>;
    },
    close: async () => {},
  };
});

afterEach(async () => {
  await pg.close();
});

describe("runIngest", () => {
  it("stores every kind of data", async () => {
    const result = await ingest();
    expect(result.status).toBe("success");
    expect(result.requestsUsed).toBe(6);

    const counts = await tableCounts();
    expect(counts.competitions).toBe(2);
    expect(counts.fixtures).toBe(46);
    expect(counts.standings).toBe(56);
    expect(counts.stats).toBe(21);
    expect(counts.squad).toBeGreaterThanOrEqual(31);
  });

  it("produces no duplicates when run twice", async () => {
    await ingest();
    const first = await tableCounts();
    await ingest();
    expect(await tableCounts()).toEqual(first);
  });

  it("keeps blank assists as null, not zero", async () => {
    await ingest();
    const { rows } = await pg.query<{ blank: number; zero: number }>(
      `select count(*) filter (where assists is null)::int as blank,
              count(*) filter (where assists = 0)::int as zero
       from player_season_stats`,
    );
    expect(rows[0]?.blank).toBeGreaterThan(0);
    expect(rows[0]?.zero).toBe(0);
  });

  it("does not let squad rows blank out names from scorer rows", async () => {
    await ingest();
    const named = `select count(*)::int as n from players where first_name is not null`;
    const before = (await pg.query<{ n: number }>(named)).rows[0]?.n;
    expect(before).toBeGreaterThan(0);
    await ingest();
    expect((await pg.query<{ n: number }>(named)).rows[0]?.n).toBe(before);
  });

  it("logs the run and its raw replies", async () => {
    const { runId } = await ingest();
    const { rows } = await pg.query<{ status: string; requests_used: number; finished: boolean }>(
      `select status, requests_used, finished_at is not null as finished
       from ingest_runs where id = $1`,
      [runId],
    );
    expect(rows[0]).toEqual({ status: "success", requests_used: 6, finished: true });
    expect(await count("raw_payloads")).toBe(6);
  });

  it("lets other jobs finish when one fails, and logs the failure", async () => {
    const result = await ingest({ failingEndpoint: "/v4/teams/81" });
    expect(result.status).toBe("failed");
    expect(result.jobs.map((job) => [job.job, job.status])).toEqual([
      ["fixtures", "success"],
      ["squad", "failed"],
      ["scorers", "success"],
      ["standings", "success"],
    ]);
    const { rows } = await pg.query<{ status: string }>(`select status from ingest_runs`);
    expect(rows[0]?.status).toBe("failed");
  });

  it("rolls back a job that fails midway", async () => {
    const failingJob = {
      name: "half-done",
      requestCost: () => 0,
      run: async ({ db }: { db: Db }) => {
        await db.query(`insert into teams (name) values ('Half written')`);
        throw new Error("boom");
      },
    };
    const result = await runIngest({
      database,
      createProvider: (hooks) => recordedProvider(hooks),
      jobs: [failingJob],
      target,
      season: 2026,
      dailyRequestBudget: 100,
    });
    expect(result.jobs[0]).toEqual({ job: "half-done", status: "failed", error: "boom" });
    expect(await count("teams")).toBe(0);
  });

  it("skips jobs that would pass the daily budget", async () => {
    const result = await ingest({ dailyRequestBudget: 2 });
    expect(result.status).toBe("failed");
    expect(result.requestsUsed).toBe(2);
    expect(result.jobs.map((job) => job.status)).toEqual([
      "success",
      "success",
      "failed",
      "failed",
    ]);
  });

  it("counts earlier runs today against the budget", async () => {
    await ingest({ dailyRequestBudget: 10 });
    const second = await ingest({ dailyRequestBudget: 10 });
    expect(second.requestsUsed).toBe(4);
    expect(second.status).toBe("failed");
  });
});
