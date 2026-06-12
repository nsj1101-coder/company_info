import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = {
  status?: string;
  cause?: string;
  refundMethod?: string;
  bankInfo?: string;
  reviewer?: string;
  memo?: string;
};

const ALLOWED = ['requested', 'approved', 'done', 'rejected'];

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body || (body.status && !ALLOWED.includes(body.status))) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const refund = await prisma.refund.findUnique({ where: { id }, include: { order: true } });
  if (!refund) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const now = new Date();
  const isDone = body.status === 'done';

  await prisma.$transaction(async (tx) => {
    await tx.refund.update({
      where: { id },
      data: {
        status: body.status ?? refund.status,
        cause: body.cause ?? refund.cause,
        refundMethod: body.refundMethod ?? refund.refundMethod,
        bankInfo: body.bankInfo ?? refund.bankInfo,
        reviewer: body.reviewer ?? refund.reviewer,
        memo: body.memo ?? refund.memo,
        processedAt: isDone ? now : refund.processedAt,
      },
    });

    if (isDone && refund.order.status !== 'refunded') {
      await tx.order.update({ where: { id: refund.orderId }, data: { status: 'refunded' } });
      await tx.orderEvent.create({
        data: { orderId: refund.orderId, type: 'refunded', note: `환불 완료${body.cause ? ` (${body.cause})` : ''}`, at: now },
      });
    } else if (body.status === 'rejected') {
      await tx.orderEvent.create({
        data: { orderId: refund.orderId, type: 'refund_rejected', note: `환불 반려${body.memo ? `: ${body.memo}` : ''}`, at: now },
      });
    }
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
