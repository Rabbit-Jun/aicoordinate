import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "./env";

let cached: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cached) return cached;
  const env = getPublicEnv();
  cached = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false },
  });
  return cached;
}
