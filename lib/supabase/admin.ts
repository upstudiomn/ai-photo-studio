import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Do not import this file in client components.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "fake";

function getAdminEnv() {
  return { supabaseUrl, serviceRoleKey };
}

export function createSupabaseAdminClient() {
  const env = getAdminEnv();

  return createClient<Database>(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
