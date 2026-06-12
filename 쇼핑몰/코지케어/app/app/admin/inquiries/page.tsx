import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import InquiriesClient, { type InquiryView } from './InquiriesClient';

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

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 300,
  });

  const rows: InquiryView[] = inquiries.map((q) => ({
    id: q.id,
    date: fmt(q.createdAt),
    category: q.category,
    title: q.title,
    content: q.content,
    author: q.authorName,
    phone: q.phone ?? '',
    onBehalf: q.onBehalf,
    answer: q.answer ?? '',
    status: q.status,
  }));

  return <InquiriesClient rows={rows} />;
}
