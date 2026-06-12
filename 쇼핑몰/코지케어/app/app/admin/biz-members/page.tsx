import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import BizMembersClient, { type BizRow, type TypeCounts } from './BizMembersClient';

const PAGE_SIZE = 8;

function fmtDate(d: Date | null): string {
  if (!d) return '-';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const sp = await searchParams;
  const q = firstParam(sp.q).trim();
  const sort = firstParam(sp.sort) === 'recent' ? 'recent' : 'sales';
  const pageRaw = Number(firstParam(sp.page));
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const where: Prisma.BizMemberWhereInput = { status: 'approved' };
  if (q) {
    where.OR = [
      { companyName: { contains: q } },
      { bizNo: { contains: q } },
      { owner: { contains: q } },
    ];
  }

  const members = await prisma.bizMember.findMany({
    where,
    include: { orders: { select: { totalPrice: true } } },
  });

  const typeCounts: TypeCounts = { welfare_shop: 0, internet_shop: 0, home_care: 0, etc: 0 };
  for (const b of members) {
    const key = b.businessType;
    if (key === 'welfare_shop' || key === 'internet_shop' || key === 'home_care' || key === 'etc') {
      typeCounts[key] += 1;
    } else {
      typeCounts.etc += 1;
    }
  }

  const enriched = members.map((b) => ({
    biz: b,
    sales: b.orders.reduce((sum, o) => sum + o.totalPrice, 0),
  }));

  enriched.sort((a, b) => {
    if (sort === 'recent') {
      const ta = a.biz.approvedAt ? a.biz.approvedAt.getTime() : 0;
      const tb = b.biz.approvedAt ? b.biz.approvedAt.getTime() : 0;
      return tb - ta;
    }
    return b.sales - a.sales;
  });

  const total = enriched.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = enriched.slice(start, start + PAGE_SIZE);

  const rows: BizRow[] = pageItems.map(({ biz, sales }) => ({
    id: biz.id,
    name: biz.companyName,
    manager: biz.owner,
    type: '사업자',
    bizNum: biz.bizNo,
    date: fmtDate(biz.approvedAt),
    sales: `${sales.toLocaleString('ko-KR')}원`,
    point: `${biz.pointBalance.toLocaleString('ko-KR')}P`,
    status: 'on',
    statusLabel: '활성',
  }));

  const rangeStart = total === 0 ? 0 : start + 1;
  const rangeEnd = Math.min(start + PAGE_SIZE, total);

  return (
    <BizMembersClient
      members={rows}
      typeCounts={typeCounts}
      total={total}
      page={safePage}
      totalPages={totalPages}
      rangeStart={rangeStart}
      rangeEnd={rangeEnd}
      query={q}
      sort={sort}
    />
  );
}
