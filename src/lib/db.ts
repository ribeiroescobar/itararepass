import "server-only";
import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  return pool;
}

// Centralized query helper to keep server-only DB access in one place.
export async function dbQuery<T extends QueryResultRow = QueryResultRow>(text: string, params: any[] = []) {
  const result = await getPool().query<T>(text, params);
  return result;
}
