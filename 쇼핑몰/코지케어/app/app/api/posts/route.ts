import { NextResponse } from 'next/server';
import { PostType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Body = {
  type?: string;
  title?: string;
  content?: string;
  pinned?: boolean;
  visible?: boolean;
  startAt?: string;
  endAt?: string;
};

function toDate(s: string | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'title, content 필수' }, { status: 400 });
  }
  const post = await prisma.post.create({
    data: {
      type: body.type === 'event' ? PostType.event : PostType.notice,
      title: body.title.trim(),
      content: body.content,
      pinned: body.pinned ?? false,
      visible: body.visible ?? true,
      startAt: toDate(body.startAt),
      endAt: toDate(body.endAt),
    },
  });
  return NextResponse.json({ ok: true, id: post.id });
}
