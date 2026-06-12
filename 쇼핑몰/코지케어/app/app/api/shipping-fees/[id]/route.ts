import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = { name?: string; baseFee?: number; freeThreshold?: number; jejuFee?: number; islandFee?: number; isDefault?: boolean };

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

  const existing = await prisma.shippingFeePolicy.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (body.isDefault === true) {
    await prisma.$transaction([
      prisma.shippingFeePolicy.updateMany({ data: { isDefault: false } }),
      prisma.shippingFeePolicy.update({ where: { id }, data: { isDefault: true } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  await prisma.shippingFeePolicy.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      baseFee: body.baseFee !== undefined ? Number(body.baseFee) : existing.baseFee,
      freeThreshold: body.freeThreshold !== undefined ? (Number(body.freeThreshold) || null) : existing.freeThreshold,
      jejuFee: body.jejuFee !== undefined ? Number(body.jejuFee) : existing.jejuFee,
      islandFee: body.islandFee !== undefined ? Number(body.islandFee) : existing.islandFee,
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

  const existing = await prisma.shippingFeePolicy.findUnique({ where: { id } });
  if (existing?.isDefault) return NextResponse.json({ error: '기본 정책은 삭제할 수 없습니다.' }, { status: 400 });

  await prisma.shippingFeePolicy.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
