import { AdminShell } from '@/components/admin-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell adminEmail="admin@lumiere.com">{children}</AdminShell>;
}
