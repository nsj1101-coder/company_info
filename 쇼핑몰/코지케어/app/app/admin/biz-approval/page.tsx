import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import BizApprovalClient, { type BizApplication } from './BizApprovalClient';

function fmtApplied(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${hh}:${mm} 신청`;
}

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const [pending, waitCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.bizMember.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.bizMember.count({ where: { status: 'pending' } }),
    prisma.bizMember.count({ where: { status: 'approved' } }),
    prisma.bizMember.count({ where: { status: 'rejected' } }),
  ]);

  const applications: BizApplication[] = pending.map((m) => ({
    id: m.id,
    company: m.companyName,
    bizType: '사업자',
    appliedAt: fmtApplied(m.createdAt),
    representative: m.owner,
    bizNumber: m.bizNo,
    phone: m.phone,
    fileName: `사업자등록증_${m.companyName}.pdf`,
  }));

  return (
    <BizApprovalClient
      applications={applications}
      counts={{ wait: waitCount, approved: approvedCount, rejected: rejectedCount }}
    />
  );
}
