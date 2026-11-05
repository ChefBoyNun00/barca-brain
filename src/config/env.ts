import { z } from "zod";
import { FOOTBALL_PROVIDERS } from "./football";

const requiredText = z.string().trim().min(1);

const envVars = {
  FOOTBALL_PROVIDER: z.enum(FOOTBALL_PROVIDERS),
  API_FOOTBALL_KEY: requiredText,
  FOOTBALL_DATA_KEY: requiredText,
  DATABASE_URL: requiredText,
  DATABASE_URL_INGEST: requiredText,
  ANTHROPIC_API_KEY: requiredText,
  DAILY_REQUEST_BUDGET: z.coerce.number().int().positive(),
};

export type Env = { [K in keyof typeof envVars]: z.infer<(typeof envVars)[K]> };

/**
 * Validates only the named variables, so a tool that needs one key does not
 * fail because the database is not set up yet. Errors name variables, never values.
 */
export function getEnvVars<K extends keyof Env>(
  keys: readonly K[],
  source: Record<string, string | undefined> = process.env,
): Pick<Env, K> {
  const schema = z.object(Object.fromEntries(keys.map((key) => [key, envVars[key]])));
  const result = schema.safeParse(source);
  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment variables: ${names}. Check .env.local.`);
  }
  return result.data as Pick<Env, K>;
}

// TODO(debt): nothing validates the full env at app startup yet — the database and
// Anthropic keys do not exist in Phase 0, so it would stop the empty deploy — call
// getEnvVars with every key from instrumentation.ts once Phase 1 sets them.
