import type { IngestTarget } from "@/config/football";
import type { Db } from "@/server/db/client";
import type { FootballProvider, PlayerPhotoProvider } from "@/server/providers/types";

export type JobContext = {
  db: Db;
  provider: FootballProvider;
  photos: PlayerPhotoProvider;
  target: IngestTarget;
  season: number;
};

export type IngestJob = {
  name: string;
  /** Requests a normal run costs, checked against the budget before the job starts. */
  requestCost(target: IngestTarget): number;
  /** Returns how many rows it wrote. */
  run(context: JobContext): Promise<number>;
};
