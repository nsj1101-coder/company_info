import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import CheckoutNormalClient from './CheckoutNormalClient';

export default async function CheckoutNormalPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'user') {
    redirect('/login');
  }

  return (
    <CheckoutNormalClient
      sessionName={session.name ?? ''}
      sessionEmail={session.email ?? session.sub}
    />
  );
}
