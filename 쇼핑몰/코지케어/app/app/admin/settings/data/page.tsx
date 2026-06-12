import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import DataClient, { type BackupConfig } from './DataClient';

function formatLastBackup(iso: string | undefined): string {
  if (!iso) return '2026.06.08 03:00 (정상)';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '2026.06.08 03:00 (정상)';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${hh}:${mm} (정상)`;
}

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const rows = await prisma.setting.findMany({
    where: {
      key: {
        in: ['data.backupCycle', 'data.backupRetention', 'data.autoBackupEnabled', 'data.lastBackupAt'],
      },
    },
  });
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  const config: BackupConfig = {
    cycle: byKey.get('data.backupCycle') ?? '매일 03:00',
    retention: byKey.get('data.backupRetention') ?? '12개월',
    enabled: byKey.has('data.autoBackupEnabled') ? byKey.get('data.autoBackupEnabled') === 'true' : true,
    lastBackupAt: formatLastBackup(byKey.get('data.lastBackupAt')),
  };

  return <DataClient config={config} />;
}
