import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import { getCurrentSession } from '@/lib/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    return <>{children}</>;
  }

  return (
    <AdminLayoutClient role={session.role} bizName={session.bizName}>
      {children}
    </AdminLayoutClient>
  );
}
