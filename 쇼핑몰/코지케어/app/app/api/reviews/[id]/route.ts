import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = { reply?: string; status?: string };

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
  if (body.status && !['visible', 'hidden'].includes(body.status)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  const existing = await prisma.productReview.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await prisma.productReview.update({
    where: { id },
    data: {
      reply: body.reply !== undefined ? body.reply : existing.reply,
      repliedAt: body.reply !== undefined && body.reply.trim() ? new Date() : existing.repliedAt,
      status: body.status ?? existing.status,
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

  await prisma.productReview.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
