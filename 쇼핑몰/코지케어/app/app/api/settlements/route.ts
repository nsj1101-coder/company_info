import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Body = { bizId?: number; period?: string; amount?: number };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || typeof body.bizId !== 'number' || !body.period?.trim() || typeof body.amount !== 'number' || body.amount <= 0) {
    return NextResponse.json({ error: 'bizId, period, amount 필수' }, { status: 400 });
  }
  const biz = await prisma.bizMember.findUnique({ where: { id: body.bizId } });
  if (!biz) return NextResponse.json({ error: 'biz_not_found' }, { status: 404 });

  const s = await prisma.settlement.create({
    data: { bizId: body.bizId, period: body.period.trim(), amount: body.amount, status: 'pending' },
  });
  return NextResponse.json({ ok: true, id: s.id });
}
