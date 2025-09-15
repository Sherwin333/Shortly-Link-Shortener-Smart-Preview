// src/lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY"
  );
}

// Server-side Supabase client that uses the service_role key (DO NOT expose to client)
export const supabaseServer = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    // ensure fetch is available in some runtimes
    global: { fetch: fetch as any },
  }
);

// Convenience getter for code that expects a function
export function getSupabaseServer() {
  return supabaseServer;
}
