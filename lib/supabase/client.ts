import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const hasSupabaseBrowserEnv = Boolean(supabaseUrl && supabaseAnonKey);

function getClientEnv() {
  if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function createSupabaseBrowserClient() {
  const env = getClientEnv();

  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}

export const supabaseBrowserClient = hasSupabaseBrowserEnv ? createSupabaseBrowserClient() : null;
