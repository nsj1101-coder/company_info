import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import MyInfoClient, { type MyInfo, type LoginHistoryEntry } from './MyInfoClient';

const roleLabel: Record<Role, string> = {
  admin: '최고 관리자 (Super Admin)',
  biz: '입점사 (Business)',
  user: '일반 회원 (User)',
};

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const numericId = Number(session.sub);
  const user =
    Number.isInteger(numericId) && numericId > 0
      ? await prisma.user.findUnique({ where: { id: numericId } })
      : await prisma.user.findUnique({ where: { email: session.email ?? session.sub } });

  if (!user) {
    redirect('/admin/login');
  }

  const logs = await prisma.loginLog.findMany({
    where: { userId: user.id },
    orderBy: { at: 'desc' },
    take: 5,
    select: { id: true, ip: true, at: true },
  });

  const loginLogs: LoginHistoryEntry[] = logs.map((log) => ({
    id: log.id,
    ip: log.ip,
    at: log.at.toISOString(),
  }));

  const info: MyInfo = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    role: user.role,
    roleLabel: roleLabel[user.role],
  };

  return <MyInfoClient info={info} loginLogs={loginLogs} />;
}
