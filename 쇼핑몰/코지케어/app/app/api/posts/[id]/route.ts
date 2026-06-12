import { NextResponse } from 'next/server';
import { PostType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = {
  type?: string;
  title?: string;
  content?: string;
  pinned?: boolean;
  visible?: boolean;
  startAt?: string;
  endAt?: string;
};

function toDate(s: string | undefined): Date | null | undefined {
  if (s === undefined) return undefined;
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

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

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const start = toDate(body.startAt);
  const end = toDate(body.endAt);

  await prisma.post.update({
    where: { id },
    data: {
      type: body.type ? (body.type === 'event' ? PostType.event : PostType.notice) : existing.type,
      title: body.title ?? existing.title,
      content: body.content ?? existing.content,
      pinned: body.pinned !== undefined ? body.pinned : existing.pinned,
      visible: body.visible !== undefined ? body.visible : existing.visible,
      startAt: start === undefined ? existing.startAt : start,
      endAt: end === undefined ? existing.endAt : end,
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
  await prisma.post.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
