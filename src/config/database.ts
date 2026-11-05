/** Supabase signs its database certificates with its own authority. Public, so committed. */
export const SUPABASE_CA_PATH = "supabase/certs/prod-ca-2021.crt";

/** Ingest runs one job at a time, so one connection is enough. */
export const INGEST_POOL_SIZE = 1;
