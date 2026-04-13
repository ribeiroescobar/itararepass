import "server-only";
import { Pool } from "pg";

// Database connection string for Postgres (required).
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Shared pool reused across requests.
const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

// Centralized query helper to keep server-only DB access in one place.
export async function dbQuery<T = any>(text: string, params: any[] = []) {
  const result = await pool.query<T>(text, params);
  return result;
}
