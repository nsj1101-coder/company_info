import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import ProductQnaClient, { type QnaView } from './ProductQnaClient';

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

  const qnas = await prisma.productQna.findMany({
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 300,
  });

  const rows: QnaView[] = qnas.map((q) => ({
    id: q.id,
    date: fmt(q.createdAt),
    product: q.product.name,
    author: q.authorName,
    question: q.question,
    answer: q.answer ?? '',
    secret: q.secret,
    status: q.status,
  }));

  return <ProductQnaClient rows={rows} />;
}
