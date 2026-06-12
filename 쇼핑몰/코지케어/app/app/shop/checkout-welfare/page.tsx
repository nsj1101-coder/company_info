import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import CheckoutWelfareClient from './CheckoutWelfareClient';

export default async function CheckoutWelfarePage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'user') {
    redirect('/login');
  }

  return (
    <CheckoutWelfareClient
      sessionName={session.name ?? ''}
      sessionEmail={session.email ?? session.sub}
    />
  );
}
