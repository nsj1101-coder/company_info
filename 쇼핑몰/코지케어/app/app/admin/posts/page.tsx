import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import PostsClient, { type PostView } from './PostsClient';

function fmt(d: Date | null): string {
  if (!d) return '';
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

  const posts = await prisma.post.findMany({ orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }], take: 300 });

  const rows: PostView[] = posts.map((p) => ({
    id: p.id,
    type: p.type,
    title: p.title,
    content: p.content,
    pinned: p.pinned,
    visible: p.visible,
    views: p.views,
    startAt: fmt(p.startAt),
    endAt: fmt(p.endAt),
    date: fmt(p.createdAt),
  }));

  return <PostsClient rows={rows} />;
}
