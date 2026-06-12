import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Body = {
  kind?: 'faq' | 'category';
  name?: string;
  categoryId?: number;
  question?: string;
  answer?: string;
  order?: number;
  visible?: boolean;
};

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  if (body.kind === 'category') {
    if (!body.name?.trim()) return NextResponse.json({ error: 'name 필수' }, { status: 400 });
    const count = await prisma.faqCategory.count();
    const cat = await prisma.faqCategory.create({ data: { name: body.name.trim(), order: count } });
    return NextResponse.json({ ok: true, id: cat.id });
  }

  if (!body.categoryId || !body.question?.trim() || !body.answer?.trim()) {
    return NextResponse.json({ error: 'categoryId, question, answer 필수' }, { status: 400 });
  }
  const faq = await prisma.faq.create({
    data: {
      categoryId: body.categoryId,
      question: body.question.trim(),
      answer: body.answer,
      order: body.order ?? 0,
      visible: body.visible ?? true,
    },
  });
  return NextResponse.json({ ok: true, id: faq.id });
}
