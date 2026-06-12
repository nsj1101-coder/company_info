import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = { status?: string };

const ALLOWED = ['pending', 'confirmed', 'paid', 'hold'];

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body || !body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  const existing = await prisma.settlement.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await prisma.settlement.update({
    where: { id },
    data: { status: body.status, settledAt: body.status === 'paid' ? new Date() : existing.settledAt },
  });
  return NextResponse.json({ ok: true });
}
