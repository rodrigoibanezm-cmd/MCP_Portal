import pg from "pg";

const { Pool } = pg;
let pool;
export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!pool) pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
    max: 3,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000
  });
  return pool;
}
