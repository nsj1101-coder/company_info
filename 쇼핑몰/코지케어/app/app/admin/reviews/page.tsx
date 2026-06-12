import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import ReviewsClient, { type ReviewView, type UserOpt, type ProductOpt } from './ReviewsClient';

export const dynamic = 'force-dynamic';

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const [reviews, userList, productList] = await Promise.all([
    prisma.productReview.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 300,
    }),
    prisma.user.findMany({ where: { role: 'user' }, select: { id: true, name: true, email: true }, orderBy: { name: 'asc' }, take: 500 }),
    prisma.product.findMany({ select: { id: true, code: true, name: true }, orderBy: { name: 'asc' }, take: 1000 }),
  ]);

  const rows: ReviewView[] = reviews.map((r) => ({
    id: r.id,
    date: fmt(r.createdAt),
    product: r.product.name,
    author: r.authorName,
    rating: r.rating,
    title: r.title ?? '',
    content: r.content,
    imageUrl: r.imageUrl ?? '',
    reply: r.reply ?? '',
    status: r.status,
  }));

  const users: UserOpt[] = userList.map((u) => ({ id: u.id, name: u.name, email: u.email }));
  const products: ProductOpt[] = productList.map((p) => ({ id: p.id, code: p.code, name: p.name }));

  return <ReviewsClient rows={rows} users={users} products={products} />;
}
