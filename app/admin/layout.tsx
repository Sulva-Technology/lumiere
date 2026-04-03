export const dynamic = 'force-dynamic';

import { getAuthenticatedAdminUser } from '@/lib/auth';
import { AdminShell } from '@/components/admin-shell';
import { getStoreSettings } from '@/lib/data/admin';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getAuthenticatedAdminUser(), getStoreSettings()]);

  return (
    <AdminShell adminEmail={user?.email ?? 'admin@itzlolabeauty.com'} brandName={settings?.store_name?.trim() || 'itzlolabeauty'}>

      {children}
    </AdminShell>
  );
}

