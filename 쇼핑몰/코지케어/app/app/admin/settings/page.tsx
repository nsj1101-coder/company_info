import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import SettingsHubClient, { type SettingEntry } from './SettingsHubClient';

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const rows = await prisma.setting.findMany({ orderBy: { key: 'asc' } });
  const settings: SettingEntry[] = rows.map((r) => ({
    key: r.key,
    value: r.value,
    scope: r.scope,
  }));

  return <SettingsHubClient settings={settings} />;
}
