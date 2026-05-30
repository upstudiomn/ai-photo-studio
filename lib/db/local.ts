import "server-only";
import { Pool, types } from "pg";

types.setTypeParser(1700, (value) => Number.parseFloat(value));
types.setTypeParser(1114, (value) => new Date(`${value}Z`).toISOString());
types.setTypeParser(1184, (value) => new Date(value).toISOString());

let pool: Pool | null = null;

export function getLocalDatabaseUrl() {
  const databaseUrl = process.env.LOCAL_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Missing LOCAL_DATABASE_URL");
  }

  return databaseUrl;
}

export function getLocalPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getLocalDatabaseUrl(),
    });
  }

  return pool;
}

export async function localQuery<T>(text: string, values: unknown[] = []): Promise<{ rows: T[] }> {
  const result = await getLocalPool().query(text, values);
  return result as unknown as { rows: T[] };
}
