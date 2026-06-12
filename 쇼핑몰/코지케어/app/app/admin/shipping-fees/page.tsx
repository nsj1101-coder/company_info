import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import ShippingFeesClient, { type PolicyView, type RemoteView } from './ShippingFeesClient';

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const [policies, remotes] = await Promise.all([
    prisma.shippingFeePolicy.findMany({ orderBy: [{ isDefault: 'desc' }, { id: 'asc' }] }),
    prisma.remoteArea.findMany({ orderBy: { id: 'asc' } }),
  ]);

  const policyRows: PolicyView[] = policies.map((p) => ({
    id: p.id,
    name: p.name,
    baseFee: p.baseFee,
    freeThreshold: p.freeThreshold ?? 0,
    jejuFee: p.jejuFee,
    islandFee: p.islandFee,
    isDefault: p.isDefault,
  }));
  const remoteRows: RemoteView[] = remotes.map((r) => ({ id: r.id, zipFrom: r.zipFrom, zipTo: r.zipTo, region: r.region, extraFee: r.extraFee }));

  return <ShippingFeesClient policies={policyRows} remotes={remoteRows} />;
}
