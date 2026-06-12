import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import UsersClient, { type UserRow } from './UsersClient';

const PAGE_SIZE = 10;

type TabKey = 'all' | 'on' | 'off';

function fmtJoined(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function fmtLastLogin(d: Date | null): string {
  if (!d) return '-';
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function statusLabel(status: string): string {
  if (status === 'dormant') return '휴면';
  if (status === 'withdrawn') return '탈퇴';
  return '활성';
}

function statusVariant(status: string): UserRow['statusVariant'] {
  if (status === 'dormant') return 'dormant';
  if (status === 'withdrawn') return 'withdrawn';
  return 'active';
}

function normalizeTab(value: string | undefined): TabKey {
  if (value === 'on' || value === 'off') return value;
  return 'all';
}

function normalizePage(value: string | undefined): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return 1;
  return n;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string; page?: string; status?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const tab = normalizeTab(sp.tab);
  const page = normalizePage(sp.page);
  const status = ['active', 'dormant', 'withdrawn'].includes(sp.status ?? '') ? (sp.status as string) : 'all';

  const where: Prisma.UserWhereInput = { role: 'user' };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
    ];
  }
  if (tab === 'on') {
    where.orders = { some: {} };
  } else if (tab === 'off') {
    where.orders = { none: {} };
  }
  if (status !== 'all') {
    where.status = status;
  }

  const total = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const users = await prisma.user.findMany({
    where,
    include: {
      orders: {
        select: { totalPrice: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const rows: UserRow[] = users.map((u) => {
    const orderTotal = u.orders.reduce((sum, o) => sum + o.totalPrice, 0);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? '-',
      joined: fmtJoined(u.createdAt),
      orders: String(u.orders.length),
      total: `${orderTotal.toLocaleString('ko-KR')}원`,
      lastLogin: fmtLastLogin(u.lastLoginAt),
      statusLabel: statusLabel(u.status),
      statusVariant: statusVariant(u.status),
    };
  });

  const rangeStart = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = (safePage - 1) * PAGE_SIZE + rows.length;

  return (
    <UsersClient
      users={rows}
      total={total}
      query={q}
      tab={tab}
      status={status}
      page={safePage}
      totalPages={totalPages}
      rangeStart={rangeStart}
      rangeEnd={rangeEnd}
    />
  );
}
