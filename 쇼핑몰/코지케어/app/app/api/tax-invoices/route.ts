import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Body = {
  bizId?: number;
  period?: string;
  itemName?: string;
  supplyAmount?: number;
};

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || typeof body.bizId !== 'number' || typeof body.supplyAmount !== 'number' || body.supplyAmount <= 0) {
    return NextResponse.json({ error: 'bizId, supplyAmount 필수' }, { status: 400 });
  }
  const biz = await prisma.bizMember.findUnique({ where: { id: body.bizId } });
  if (!biz) return NextResponse.json({ error: 'biz_not_found' }, { status: 404 });

  const tax = Math.round(body.supplyAmount * 0.1);
  const inv = await prisma.taxInvoice.create({
    data: {
      bizId: body.bizId,
      period: body.period || null,
      itemName: body.itemName || null,
      supplyAmount: body.supplyAmount,
      taxAmount: tax,
      totalAmount: body.supplyAmount + tax,
      status: 'requested',
    },
  });
  return NextResponse.json({ ok: true, id: inv.id });
}
