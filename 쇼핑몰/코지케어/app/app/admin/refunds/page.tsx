import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import RefundsClient, { type RefundView } from './RefundsClient';

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const refunds = await prisma.refund.findMany({
    include: {
      order: {
        include: {
          buyer: { select: { name: true, phone: true } },
          biz: { select: { companyName: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 300,
  });

  const rows: RefundView[] = refunds.map((r) => {
    const first = r.order.items[0]?.product.name ?? '-';
    const extra = r.order.items.length > 1 ? ` 외 ${r.order.items.length - 1}건` : '';
    return {
      id: r.id,
      date: fmt(r.createdAt),
      orderNo: r.order.orderNo,
      buyer: r.order.buyer?.name ?? r.order.biz?.companyName ?? '비회원',
      phone: r.order.buyer?.phone ?? '',
      goods: first + extra,
      amount: r.amount,
      cause: r.cause ?? '',
      reason: r.reason ?? '',
      refundMethod: r.refundMethod ?? '',
      bankInfo: r.bankInfo ?? '',
      memo: r.memo ?? '',
      reviewer: r.reviewer ?? '',
      status: r.status,
      processedAt: r.processedAt ? fmt(r.processedAt) : '',
      isWelfare: (r.order.selfPay ?? 0) > 0 && (r.order.insuranceSupport ?? 0) > 0,
    };
  });

  return <RefundsClient rows={rows} />;
}
