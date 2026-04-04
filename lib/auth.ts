import { redirect } from 'next/navigation';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AuthenticatedAdminUser } from '@/lib/types';

const roleRank: Record<AuthenticatedAdminUser['role'], number> = {
  staff: 1,
  manager: 2,
  admin: 3,
};

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

function ensureRole(user: AuthenticatedAdminUser, minimumRole: AuthenticatedAdminUser['role']) {
  if (roleRank[user.role] < roleRank[minimumRole]) {
    throw new Error('Forbidden');
  }
}

export async function requireAdminUser(minimumRole: AuthenticatedAdminUser['role'] = 'staff') {
  const user = await getAuthenticatedAdminUser();

  if (!user) {
    redirect('/admin/login');
  }

  ensureRole(user, minimumRole);

  return user;
}

export async function requireAdminApiUser(minimumRole: AuthenticatedAdminUser['role'] = 'staff') {
  const user = await getAuthenticatedAdminUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  ensureRole(user, minimumRole);

  return user;
}
