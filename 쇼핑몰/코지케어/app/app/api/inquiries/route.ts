import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';

type CreateInquiryBody = {
  title?: string;
  content?: string;
  category?: string;
  phone?: string;
};

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'user') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.sub } });
  if (!user) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const inquiries = await prisma.inquiry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ inquiries }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'user') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.sub } });
  if (!user) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as CreateInquiryBody | null;
  const title = body?.title?.trim() ?? '';
  const content = body?.content?.trim() ?? '';
  if (!title || !content) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      userId: user.id,
      authorName: user.name,
      phone: body?.phone?.trim() || user.phone || null,
      category: body?.category?.trim() || '일반',
      title,
      content,
      status: 'open',
    },
  });

  return NextResponse.json({ inquiry }, { status: 201 });
}
