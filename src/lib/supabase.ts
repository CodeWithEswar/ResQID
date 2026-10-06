import { createClient } from "@supabase/supabase-js";
import { configuration, configured } from "./config";
export const supabase = configured
  ? createClient(configuration.supabaseUrl, configuration.supabaseKey, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
