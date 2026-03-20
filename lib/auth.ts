import { redirect } from 'next/navigation';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AuthenticatedAdminUser } from '@/lib/types';

export async function getAuthenticatedAdminUser(): Promise<AuthenticatedAdminUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from('staff_users')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: data.role,
  };
}

export async function requireAdminUser() {
  const user = await getAuthenticatedAdminUser();

  if (!user) {
    redirect('/admin/login');
  }

  return user;
}

export async function requireAdminApiUser() {
  const user = await getAuthenticatedAdminUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
