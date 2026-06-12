import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import PermissionClient, { type AdminRow } from './PermissionClient';
import { rolesToMatrix } from './permissionMatrix';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${hh}:${mm}`;
}

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const [adminUsers, roles] = await Promise.all([
    prisma.user.findMany({ where: { role: 'admin' }, orderBy: { id: 'asc' } }),
    prisma.adminRole.findMany({ orderBy: { id: 'asc' } }),
  ]);

  const admins: AdminRow[] = adminUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    lastLoginAt: u.lastLoginAt ? formatDate(u.lastLoginAt) : '-',
  }));

  const matrix = rolesToMatrix(roles);
  const otpRequired = roles.some((r) => r.otpRequired);

  return <PermissionClient admins={admins} matrix={matrix} otpRequired={otpRequired} />;
}
