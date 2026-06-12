import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import TaxInvoicesClient, { type TaxView, type BizOpt } from './TaxInvoicesClient';

function fmt(d: Date | null): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const [invoices, bizList] = await Promise.all([
    prisma.taxInvoice.findMany({ include: { biz: { select: { companyName: true, bizNo: true } } }, orderBy: { createdAt: 'desc' }, take: 300 }),
    prisma.bizMember.findMany({ where: { status: 'approved' }, select: { id: true, companyName: true, bizNo: true }, orderBy: { companyName: 'asc' } }),
  ]);

  const rows: TaxView[] = invoices.map((t) => ({
    id: t.id,
    date: fmt(t.createdAt),
    company: t.biz.companyName,
    bizNo: t.biz.bizNo,
    period: t.period ?? '',
    itemName: t.itemName ?? '',
    supplyAmount: t.supplyAmount,
    taxAmount: t.taxAmount,
    totalAmount: t.totalAmount,
    status: t.status,
    ntsNo: t.ntsNo ?? '',
    issuedAt: fmt(t.issuedAt),
  }));

  const bizOpts: BizOpt[] = bizList.map((b) => ({ id: b.id, name: b.companyName, bizNo: b.bizNo }));

  return <TaxInvoicesClient rows={rows} bizOpts={bizOpts} />;
}
