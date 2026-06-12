import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import PointsClient, { type PointView, type BizOption } from './PointsClient';
import type { Prisma } from '@prisma/client';

const TYPE_LABEL: Record<'earn' | 'use' | 'expire', string> = {
  earn: '적립',
  use: '사용',
  expire: '소멸',
};

function fmtDateTime(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    redirect('/admin/login');
  }

  const where: Prisma.PointLogWhereInput =
    session.role === 'biz' ? { bizId: session.bizId } : {};

  const [logs, bizList] = await Promise.all([
    prisma.pointLog.findMany({
      where,
      include: { biz: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    session.role === 'admin'
      ? prisma.bizMember.findMany({
          where: { status: 'approved' },
          select: { id: true, companyName: true, pointBalance: true },
          orderBy: { companyName: 'asc' },
        })
      : Promise.resolve([]),
  ]);

  const points: PointView[] = logs.map((p) => ({
    id: p.id,
    date: fmtDateTime(p.createdAt),
    bizName: p.biz?.companyName ?? '-',
    type: p.type === 'earn' ? 'earn' : 'use',
    typeLabel: TYPE_LABEL[p.type],
    amount: `${p.type === 'earn' ? '+' : '-'}${Math.abs(p.amount).toLocaleString('ko-KR')}P`,
    orderNo: p.memo?.startsWith('#') ? p.memo : '',
    balance: `${p.balance.toLocaleString('ko-KR')}P`,
    memo: p.memo ?? '',
    bizId: p.bizId,
  }));

  const bizOptions: BizOption[] = bizList.map((b) => ({
    id: b.id,
    name: b.companyName,
    balance: b.pointBalance,
  }));

  return (
    <PointsClient
      points={points}
      role={session.role}
      bizName={session.bizName}
      bizOptions={bizOptions}
    />
  );
}
