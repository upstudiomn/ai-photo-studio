import "server-only";

export type DatabaseMode = "supabase" | "local";
export type StorageMode = "supabase" | "local";

export function getDatabaseMode(): DatabaseMode {
  return process.env.DATABASE_MODE === "local" ? "local" : "supabase";
}

export function getStorageMode(): StorageMode {
  return process.env.STORAGE_MODE === "local" ? "local" : "supabase";
}

export function isLocalDatabaseMode() {
  return getDatabaseMode() === "local";
}

export function isLocalStorageMode() {
  return getStorageMode() === "local";
}
