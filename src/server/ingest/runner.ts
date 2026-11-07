import type { IngestTarget } from "@/config/football";
import type { Database } from "@/server/db/client";
import {
  finishIngestRun,
  getRequestsUsedToday,
  saveRawPayload,
  startIngestRun,
} from "@/server/db/queries/ingest-runs";
import type {
  FootballProvider,
  PlayerPhotoProvider,
  ProviderHooks,
  ProviderResponseEvent,
} from "@/server/providers/types";
import type { IngestJob } from "./jobs/types";

export type JobResult =
  | { job: string; status: "success"; rows: number }
  | { job: string; status: "failed"; error: string };

export type IngestResult = {
  runId: number;
  status: "success" | "failed";
  requestsUsed: number;
  jobs: JobResult[];
};

export type IngestDeps = {
  database: Database;
  createProvider: (hooks: ProviderHooks) => FootballProvider;
  photos: PlayerPhotoProvider;
  jobs: readonly IngestJob[];
  target: IngestTarget;
  season: number;
  dailyRequestBudget: number;
};

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** Runs every job in order. One failing job rolls back alone and the others still run. */
export async function runIngest(deps: IngestDeps): Promise<IngestResult> {
  const { database, photos, jobs, target, season, dailyRequestBudget } = deps;
  let requestsUsed = 0;
  let payloads: ProviderResponseEvent[] = [];

  const provider = deps.createProvider({
    onResponse: (event) => {
      requestsUsed += 1;
      if (event.httpStatus === 200) payloads.push(event);
    },
  });

  const requestsBeforeRun = await getRequestsUsedToday(database, provider.name);
  const runId = await startIngestRun(database, provider.name);
  const results: JobResult[] = [];

  for (const job of jobs) {
    const projected = requestsBeforeRun + requestsUsed + job.requestCost(target);
    if (projected > dailyRequestBudget) {
      results.push({
        job: job.name,
        status: "failed",
        error: `Skipped: would use ${projected} of ${dailyRequestBudget} daily requests`,
      });
      continue;
    }

    try {
      const rows = await database.transaction((db) => job.run({ db, provider, photos, target, season }));
      results.push({ job: job.name, status: "success", rows });
    } catch (error) {
      results.push({ job: job.name, status: "failed", error: errorMessage(error) });
    }

    // Kept even when the job failed: the raw reply is what explains the failure.
    for (const { provider: name, endpoint, params, body } of payloads) {
      await saveRawPayload(database, { provider: name, endpoint, params, body });
    }
    payloads = [];
  }

  const failures = results.filter((result) => result.status === "failed");
  const status = failures.length === 0 ? "success" : "failed";
  await finishIngestRun(database, {
    id: runId,
    status,
    requestsUsed,
    summary: { season, jobs: results },
    error: failures.length === 0 ? null : `${failures.length} of ${results.length} jobs failed`,
  });

  return { runId, status, requestsUsed, jobs: results };
}
