import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Body = {
  userId?: number | null;
  productId?: number;
  rating?: number;
  title?: string;
  content?: string;
};

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || typeof body.productId !== 'number' || !body.content?.trim()) {
    return NextResponse.json({ error: 'productId, content 필수' }, { status: 400 });
  }
  const product = await prisma.product.findUnique({ where: { id: body.productId }, select: { id: true } });
  if (!product) return NextResponse.json({ error: 'product_not_found' }, { status: 404 });

  let authorName = '익명';
  let userId: number | null = null;
  if (typeof body.userId === 'number') {
    const u = await prisma.user.findUnique({ where: { id: body.userId }, select: { id: true, name: true } });
    if (u) { authorName = u.name; userId = u.id; }
  }
  const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));

  const created = await prisma.productReview.create({
    data: { productId: body.productId, userId, authorName, rating, title: body.title?.trim() || null, content: body.content, status: 'visible' },
  });
  return NextResponse.json({ ok: true, id: created.id });
}
