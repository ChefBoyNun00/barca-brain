import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { SUPABASE_CA_PATH } from "@/config/database";

/** The only database surface queries see, so tests can run them on a local Postgres. */
export type Db = {
  query(text: string, params?: unknown[]): Promise<{ rows: unknown[] }>;
};

export type Database = Db & {
  /** Commits if `work` succeeds and rolls everything back if it throws. */
  transaction<T>(work: (db: Db) => Promise<T>): Promise<T>;
  close(): Promise<void>;
};

export function createDatabase(connectionString: string, maxConnections: number): Database {
  const pool = new Pool({
    connectionString,
    max: maxConnections,
    ssl: { rejectUnauthorized: true, ca: readFileSync(SUPABASE_CA_PATH, "utf8") },
  });

  return {
    query: (text, params) => pool.query(text, params),
    async transaction(work) {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const result = await work({ query: (text, params) => client.query(text, params) });
        await client.query("commit");
        return result;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}
