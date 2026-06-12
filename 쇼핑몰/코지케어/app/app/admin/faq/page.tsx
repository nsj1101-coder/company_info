import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import FaqClient, { type FaqView, type CatView } from './FaqClient';

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const [categories, faqs] = await Promise.all([
    prisma.faqCategory.findMany({ orderBy: { order: 'asc' } }),
    prisma.faq.findMany({ include: { category: { select: { name: true } } }, orderBy: [{ order: 'asc' }, { id: 'desc' }] }),
  ]);

  const cats: CatView[] = categories.map((c) => ({ id: c.id, name: c.name }));
  const rows: FaqView[] = faqs.map((f) => ({
    id: f.id,
    categoryId: f.categoryId,
    category: f.category.name,
    question: f.question,
    answer: f.answer,
    order: f.order,
    visible: f.visible,
  }));

  return <FaqClient cats={cats} rows={rows} />;
}
