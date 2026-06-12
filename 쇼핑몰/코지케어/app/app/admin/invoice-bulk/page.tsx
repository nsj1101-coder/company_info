import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import InvoiceBulkClient from './InvoiceBulkClient';

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    redirect('/admin/login');
  }
  return <InvoiceBulkClient />;
}
