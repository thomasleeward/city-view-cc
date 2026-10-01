import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

export function createAdminClient() {
  if (process.env.PROOFADMIN_ENABLED === "true" || process.env.VERCEL_ENV === "preview") return null;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
