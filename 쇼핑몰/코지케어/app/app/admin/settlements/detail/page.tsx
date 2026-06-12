import { redirect, notFound } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import SettlementDetailClient, { type DetailOrder } from './SettlementDetailClient';

export const dynamic = 'force-dynamic';

function monthRange(month: string): { start: Date; end: Date } {
  const [y, m] = month.split('-').map(Number);
  return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1) };
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ bizId?: string; month?: string }> }) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const sp = await searchParams;
  const bizId = Number(sp.bizId);
  if (!Number.isInteger(bizId) || bizId <= 0) notFound();

  const now = new Date();
  const month = /^\d{4}-\d{2}$/.test(sp.month ?? '')
    ? (sp.month as string)
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const { start, end } = monthRange(month);

  const biz = await prisma.bizMember.findUnique({ where: { id: bizId }, select: { companyName: true } });
  if (!biz) notFound();

  const orders = await prisma.order.findMany({
    where: { bizId, createdAt: { gte: start, lt: end } },
    include: {
      buyer: { select: { name: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const rows: DetailOrder[] = orders.map((o) => {
    const first = o.items[0]?.product.name ?? '-';
    const more = o.items.length > 1 ? ` 외 ${o.items.length - 1}건` : '';
    return {
      id: o.id,
      orderNo: o.orderNo,
      date: fmt(o.createdAt),
      buyer: o.buyer?.name ?? '비회원',
      goods: first + more,
      amount: o.totalPrice,
      status: o.status,
    };
  });

  return <SettlementDetailClient month={month} company={biz.companyName} rows={rows} />;
}
