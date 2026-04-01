import { getAuthenticatedAdminUser } from '@/lib/auth';
import { AdminShell } from '@/components/admin-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedAdminUser();

  return <AdminShell adminEmail={user?.email ?? 'admin@lumiere.com'}>{children}</AdminShell>;
}
