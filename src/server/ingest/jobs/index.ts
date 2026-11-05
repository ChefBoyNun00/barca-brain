import { fixturesJob } from "./fixtures";
import { scorersJob } from "./scorers";
import { squadJob } from "./squad";
import { standingsJob } from "./standings";
import type { IngestJob } from "./types";

/** Order matters: fixtures creates the teams and competitions the others look up. */
export const INGEST_JOBS: readonly IngestJob[] = [fixturesJob, squadJob, scorersJob, standingsJob];
