import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  try {
    // Polyfill WebSocket in Node.js runtime if missing (required by @supabase/supabase-js realtime client)
    if (typeof globalThis !== "undefined" && !globalThis.WebSocket) {
      globalThis.WebSocket = class {} as any;
    }

    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error) {
    console.error("Failed to initialize Supabase admin client:", error);
    return null;
  }
}
