import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import ShippingClient, { type ShippingRow } from './ShippingClient';
import type { Prisma } from '@prisma/client';

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    redirect('/admin/login');
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const where: Prisma.OrderWhereInput =
    session.role === 'biz' ? { bizId: session.bizId, status: 'ready' } : { status: 'ready' };

  const [readyOrders, shippedToday] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        buyer: true,
        items: { include: { product: true }, take: 1 },
        shipping: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    }),
    prisma.shipping.count({
      where: { status: 'in_transit', shippedAt: { gte: startOfDay } },
    }),
  ]);

  const rows: ShippingRow[] = readyOrders.map((o) => {
    const firstItem = o.items[0];
    return {
      shippingId: o.shipping?.id ?? null,
      orderId: o.id,
      orderNo: o.orderNo,
      buyer: o.buyer?.name ?? '비회원',
      product: firstItem?.product?.name ?? '-',
      phone: o.buyer?.phone ?? '-',
      carrier: o.shipping?.courier ?? 'CJ대한통운',
      trackingNo: o.shipping?.trackingNo ?? '',
    };
  });

  return (
    <ShippingClient
      rows={rows}
      pendingCount={readyOrders.length}
      shippedTodayCount={shippedToday}
    />
  );
}
