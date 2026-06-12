import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = { answer?: string; close?: boolean };

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body || typeof body.answer !== 'string') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const existing = await prisma.inquiry.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const answered = body.answer.trim().length > 0;
  const status = body.close ? 'closed' : answered ? 'answered' : 'open';

  await prisma.inquiry.update({
    where: { id },
    data: {
      answer: body.answer,
      answeredBy: answered ? session.sub : null,
      answeredAt: answered ? new Date() : null,
      status,
    },
  });
  return NextResponse.json({ ok: true });
}
