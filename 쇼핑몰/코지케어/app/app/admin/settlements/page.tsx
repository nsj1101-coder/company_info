import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import SettlementsClient, { type BizSettlement } from './SettlementsClient';

export const dynamic = 'force-dynamic';

function monthRange(month: string): { start: Date; end: Date } {
  const [y, m] = month.split('-').map(Number);
  return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1) };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const sp = await searchParams;
  const now = new Date();
  const month = /^\d{4}-\d{2}$/.test(sp.month ?? '')
    ? (sp.month as string)
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const { start, end } = monthRange(month);

  // 정산 기준: 구매확정(confirmed) 주문건
  const orders = await prisma.order.findMany({
    where: { status: 'confirmed', bizId: { not: null }, createdAt: { gte: start, lt: end } },
    include: { biz: { select: { id: true, companyName: true } } },
  });

  const map = new Map<number, BizSettlement>();
  for (const o of orders) {
    const id = o.bizId as number;
    const e = map.get(id) ?? { bizId: id, company: o.biz?.companyName ?? '-', count: 0, total: 0 };
    e.count += 1;
    e.total += o.totalPrice;
    map.set(id, e);
  }
  const rows = [...map.values()].sort((a, b) => b.total - a.total);

  return <SettlementsClient month={month} rows={rows} />;
}
