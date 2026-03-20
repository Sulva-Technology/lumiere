import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getPublicEnv } from '@/lib/env';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(getPublicEnv('NEXT_PUBLIC_SUPABASE_URL'), getPublicEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(items) {
        items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}

