import { APP_POOL_SIZE } from "@/config/database";
import { getEnvVars } from "@/config/env";
import { createDatabase, type Database } from "./client";

let database: Database | undefined;

/** The web app's connection. DATABASE_URL is the read-only role, so it cannot write. */
export function getAppDatabase(): Database {
  database ??= createDatabase(getEnvVars(["DATABASE_URL"]).DATABASE_URL, APP_POOL_SIZE);
  return database;
}
