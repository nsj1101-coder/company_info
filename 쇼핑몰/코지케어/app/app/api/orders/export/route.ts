import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

const HEADERS = ['주문번호', '주문일', '구매자', '연락처', '구분', '상품', '결제수단', '총금액', '본인부담금', '진행상태'];

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const where: Prisma.OrderWhereInput = session.role === 'biz' ? { bizId: session.bizId } : {};
  const orders = await prisma.order.findMany({
    where,
    include: {
      buyer: { select: { name: true, phone: true } },
      biz: { select: { companyName: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5000,
  });

  const rows = orders.map((o) => {
    const first = o.items[0]?.product.name ?? '-';
    const goods = o.items.length > 1 ? `${first} 외 ${o.items.length - 1}건` : first;
    const isWelfare = (o.selfPay ?? 0) > 0 && (o.insuranceSupport ?? 0) > 0;
    return [
      o.orderNo, fmt(o.createdAt), o.buyer?.name ?? o.biz?.companyName ?? '비회원',
      o.buyer?.phone ?? '', isWelfare ? '복지용구' : '일반', goods,
      o.paymentMethod ?? '', o.totalPrice, o.selfPay ?? '', o.status,
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'orders');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="cozycare-orders.xlsx"',
    },
  });
}
