import { createClient } from '@supabase/supabase-js';
import { getOptionalEnv, getRequiredEnv } from '@/lib/env';

export function createSupabaseAdminClient() {
  return createClient(getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'), getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'x-application-name': getOptionalEnv('APP_NAME', 'lumiere-store'),
      },
    },
  });
}

