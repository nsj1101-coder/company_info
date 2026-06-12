import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';

type Row = { orderNo?: string; courier?: string; trackingNo?: string };
type Body = { rows?: Row[] };

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !Array.isArray(body.rows) || body.rows.length === 0) {
    return NextResponse.json({ error: 'rows 필수' }, { status: 400 });
  }

  const now = new Date();
  const results: Array<{ orderNo: string; ok: boolean; reason?: string }> = [];

  for (const r of body.rows) {
    const orderNo = r.orderNo?.trim();
    const trackingNo = r.trackingNo?.trim();
    const courier = r.courier?.trim() || '택배';
    if (!orderNo || !trackingNo) {
      results.push({ orderNo: orderNo ?? '(빈값)', ok: false, reason: '주문번호/송장번호 누락' });
      continue;
    }
    const order = await prisma.order.findUnique({ where: { orderNo }, include: { shipping: true } });
    if (!order) {
      results.push({ orderNo, ok: false, reason: '주문 없음' });
      continue;
    }
    if (session.role === 'biz' && order.bizId !== session.bizId) {
      results.push({ orderNo, ok: false, reason: '권한 없음' });
      continue;
    }

    await prisma.$transaction(async (tx) => {
      if (order.shipping) {
        await tx.shipping.update({
          where: { orderId: order.id },
          data: { courier, trackingNo, status: 'in_transit', shippedAt: now },
        });
      } else {
        await tx.shipping.create({
          data: { orderId: order.id, courier, trackingNo, status: 'in_transit', shippedAt: now },
        });
      }
      await tx.order.update({ where: { id: order.id }, data: { status: 'shipping' } });
      await tx.orderEvent.create({ data: { orderId: order.id, type: 'shipped', note: `일괄 송장 등록 ${courier} ${trackingNo}`, at: now } });
    });
    results.push({ orderNo, ok: true });
  }

  const success = results.filter((r) => r.ok).length;
  return NextResponse.json({ ok: true, success, failed: results.length - success, results });
}
