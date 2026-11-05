import { z } from "zod";
import type { Db } from "../client";

export type IngestRunStatus = "success" | "failed";

export async function startIngestRun(db: Db, provider: string): Promise<number> {
  const { rows } = await db.query(`insert into ingest_runs (provider) values ($1) returning id`, [
    provider,
  ]);
  const [row] = z.array(z.object({ id: z.coerce.number() })).parse(rows);
  if (!row) throw new Error("Insert returned no ingest run id");
  return row.id;
}

export async function finishIngestRun(
  db: Db,
  run: {
    id: number;
    status: IngestRunStatus;
    requestsUsed: number;
    summary: unknown;
    error: string | null;
  },
): Promise<void> {
  await db.query(
    `update ingest_runs
     set finished_at = now(), status = $1, requests_used = $2, summary = $3, error = $4
     where id = $5`,
    [run.status, run.requestsUsed, JSON.stringify(run.summary), run.error, run.id],
  );
}

/** Requests spent by earlier runs since midnight UTC. */
export async function getRequestsUsedToday(db: Db, provider: string): Promise<number> {
  const { rows } = await db.query(
    `select coalesce(sum(requests_used), 0)::int as used
     from ingest_runs
     where provider = $1 and started_at >= date_trunc('day', now() at time zone 'utc')`,
    [provider],
  );
  return z.array(z.object({ used: z.number() })).parse(rows)[0]?.used ?? 0;
}

export async function saveRawPayload(
  db: Db,
  payload: {
    provider: string;
    endpoint: string;
    params: Record<string, string | number>;
    body: unknown;
  },
): Promise<void> {
  await db.query(
    `insert into raw_payloads (provider, endpoint, params, payload) values ($1, $2, $3, $4)`,
    [
      payload.provider,
      payload.endpoint,
      JSON.stringify(payload.params),
      JSON.stringify(payload.body),
    ],
  );
}
