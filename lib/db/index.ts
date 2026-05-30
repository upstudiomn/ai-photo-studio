import "server-only";

export {
  getDatabaseMode,
  getStorageMode,
  isLocalDatabaseMode,
  isLocalStorageMode,
  type DatabaseMode,
  type StorageMode,
} from "@/lib/db/mode";
export { getLocalDatabaseUrl, getLocalPool, localQuery } from "@/lib/db/local";
