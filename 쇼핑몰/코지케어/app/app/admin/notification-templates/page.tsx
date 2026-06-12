import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import NotificationTemplatesClient, { type TemplateView } from './NotificationTemplatesClient';

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const templates = await prisma.notificationTemplate.findMany({ orderBy: { id: 'asc' } });

  const rows: TemplateView[] = templates.map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
    channel: t.channel,
    trigger: t.trigger ?? '',
    content: t.content,
    enabled: t.enabled,
  }));

  return <NotificationTemplatesClient rows={rows} />;
}
