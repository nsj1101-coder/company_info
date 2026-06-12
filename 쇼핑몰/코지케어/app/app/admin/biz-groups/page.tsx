import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import BizGroupsClient, { type GroupView, type MemberView } from './BizGroupsClient';

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const [groups, members] = await Promise.all([
    prisma.bizGroup.findMany({ include: { _count: { select: { members: true } } }, orderBy: { id: 'asc' } }),
    prisma.bizMember.findMany({ where: { status: 'approved' }, select: { id: true, companyName: true, groupId: true }, orderBy: { companyName: 'asc' } }),
  ]);

  const groupRows: GroupView[] = groups.map((g) => ({
    id: g.id,
    code: g.code,
    name: g.name,
    discountRate: g.discountRate,
    pointRate: g.pointRate ?? 0,
    memo: g.memo ?? '',
    memberCount: g._count.members,
  }));

  const memberRows: MemberView[] = members.map((m) => ({ id: m.id, name: m.companyName, groupId: m.groupId }));

  return <BizGroupsClient groups={groupRows} members={memberRows} />;
}
