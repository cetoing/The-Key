import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createSupabaseRouteClient(accessToken: string) {
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey),
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export function createSupabaseAdminClient() {
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY', supabaseServiceRoleKey),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
