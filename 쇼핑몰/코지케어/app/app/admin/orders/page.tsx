import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import OrdersClient, { type OrderView, type OrdersFilter } from './OrdersClient';
import type { OrderStatus, Prisma } from '@prisma/client';
import { STATUS_LABEL, STATUS_BADGE, LABEL_TO_STATUS } from '@/lib/orderStatus';

const PERIOD_OPTIONS = ['전체 기간', '오늘', '최근 7일', '최근 30일', '이번 달'];
const PAGE_SIZE = 20;

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${hh}:${mm}`;
}

function pickParam(raw: string | string[] | undefined): string {
  if (Array.isArray(raw)) return raw[0] ?? '';
  return raw ?? '';
}

function periodStart(period: string): Date | null {
  const now = new Date();
  if (period === '오늘') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === '최근 7일') {
    return new Date(now.getTime() - 7 * 24 * 3600_000);
  }
  if (period === '최근 30일') {
    return new Date(now.getTime() - 30 * 24 * 3600_000);
  }
  if (period === '이번 달') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return null;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    redirect('/admin/login');
  }

  const sp = await searchParams;
  const period = PERIOD_OPTIONS.includes(pickParam(sp.period)) ? pickParam(sp.period) : '전체 기간';
  const statusLabel = pickParam(sp.status);
  const category = pickParam(sp.category);
  const q = pickParam(sp.q).trim();
  const pageRaw = Number(pickParam(sp.page));
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const scope: Prisma.OrderWhereInput =
    session.role === 'biz' ? { bizId: session.bizId } : {};

  // 상태 필터를 제외한 기본 조건 (기간/카테고리/검색)
  const andBase: Prisma.OrderWhereInput[] = [];

  const start = periodStart(period);
  if (start) andBase.push({ createdAt: { gte: start } });

  if (category && category !== '전체 카테고리') {
    andBase.push({ items: { some: { product: { category: { name: category } } } } });
  }

  if (q) {
    andBase.push({
      OR: [
        { orderNo: { contains: q } },
        { buyer: { name: { contains: q } } },
        { biz: { companyName: { contains: q } } },
        { items: { some: { product: { name: { contains: q } } } } },
      ],
    });
  }

  // 상태별 건수 (기간/카테고리/검색은 반영, 상태 필터 자체는 제외)
  const whereCounts: Prisma.OrderWhereInput = { ...scope };
  if (andBase.length > 0) whereCounts.AND = andBase;
  const grouped = await prisma.order.groupBy({
    by: ['status'],
    where: whereCounts,
    _count: { _all: true },
  });
  const cnt = (s: OrderStatus): number => grouped.find((g) => g.status === s)?._count._all ?? 0;
  const statusCounts = {
    all: grouped.reduce((sum, g) => sum + g._count._all, 0),
    docReview: cnt('doc_review'),
    docApproved: cnt('doc_approved'),
    ready: cnt('ready'),
    shipping: cnt('shipping'),
    delivered: cnt('delivered'),
    confirmed: cnt('confirmed'),
  };

  const where: Prisma.OrderWhereInput = { ...scope };
  const and = [...andBase];
  const status = LABEL_TO_STATUS[statusLabel];
  if (status) and.push({ status });
  if (and.length > 0) where.AND = and;

  const total = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const rows = await prisma.order.findMany({
    where,
    include: {
      buyer: true,
      biz: true,
      items: { include: { product: true }, take: 1 },
      shipping: true,
      welfareReview: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const orders: OrderView[] = rows.map((o) => {
    const firstItem = o.items[0];
    const productName = firstItem?.product?.name ?? '-';
    const itemCount = o.items.length;
    const productLabel = itemCount > 1 ? `${productName} × ${itemCount}` : productName;
    const buyerName = o.biz?.companyName ?? o.buyer?.name ?? '비회원';
    const type: 'welfare' | 'general' | 'biz' = o.welfareReview
      ? 'welfare'
      : o.bizId
        ? 'biz'
        : 'general';
    return {
      id: o.id,
      orderNo: o.orderNo,
      buyer: buyerName,
      type,
      product: productLabel,
      amount: `${o.totalPrice.toLocaleString('ko-KR')}원`,
      status: STATUS_BADGE[o.status],
      rawStatus: o.status,
      statusLabel: STATUS_LABEL[o.status],
      hasWelfare: Boolean(o.welfareReview),
      docUrl: o.welfareReview?.docUrl ? `/cozycare${o.welfareReview.docUrl}` : null,
      date: fmtDate(o.createdAt),
      carrier: o.shipping?.courier ?? '택배사',
      tracking: o.shipping?.trackingNo ?? '',
      shippingId: o.shipping?.id ?? null,
      bizId: o.bizId,
    };
  });

  const rangeStart = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = (safePage - 1) * PAGE_SIZE + orders.length;

  const filter: OrdersFilter = {
    period,
    status: statusLabel,
    category: category || '전체 카테고리',
    q,
    page: safePage,
    totalPages,
    total,
    rangeStart,
    rangeEnd,
  };

  return (
    <OrdersClient
      orders={orders}
      role={session.role}
      bizName={session.bizName}
      filter={filter}
      statusCounts={statusCounts}
    />
  );
}
