import { NextResponse } from 'next/server';
import { NotificationChannel } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = {
  name?: string;
  channel?: string;
  trigger?: string;
  content?: string;
  enabled?: boolean;
};

function toChannel(v: string | undefined): NotificationChannel | undefined {
  if (v === 'sms') return NotificationChannel.sms;
  if (v === 'email') return NotificationChannel.email;
  if (v === 'kakao') return NotificationChannel.kakao;
  return undefined;
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

  const existing = await prisma.notificationTemplate.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await prisma.notificationTemplate.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      channel: toChannel(body.channel) ?? existing.channel,
      trigger: body.trigger !== undefined ? body.trigger : existing.trigger,
      content: body.content ?? existing.content,
      enabled: body.enabled !== undefined ? body.enabled : existing.enabled,
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
  await prisma.notificationTemplate.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
