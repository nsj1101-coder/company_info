import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = { name?: string; discountRate?: number; pointRate?: number; memo?: string };

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const existing = await prisma.bizGroup.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await prisma.bizGroup.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      discountRate: Number.isFinite(body.discountRate) ? Number(body.discountRate) : existing.discountRate,
      pointRate: body.pointRate !== undefined ? Number(body.pointRate) : existing.pointRate,
      memo: body.memo !== undefined ? body.memo : existing.memo,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  await prisma.bizMember.updateMany({ where: { groupId: id }, data: { groupId: null } });
  await prisma.bizGroup.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
