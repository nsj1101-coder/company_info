import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import DashboardClient, {
  type DashboardData,
  type DashboardKpi,
  type MonthlyPoint,
  type TypeDistribution,
  type CategoryShare,
  type BestSeller,
  type ConversionMetrics,
  type ActivityItem,
} from './DashboardClient';

const CATEGORY_COLORS = ['#84c140', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'];

function monthLabel(d: Date): string {
  return `${d.getMonth() + 1}월`;
}

function relativeTime(from: Date, now: Date): string {
  const diffMs = now.getTime() - from.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day === 1) return '어제';
  return `${day}일 전`;
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  ready: '상품 준비중',
  shipping: '배송중',
  delivered: '배송 완료',
  confirmed: '구매 확정',
};

const ACTIVITY_COLOR: Record<string, string> = {
  welfare: '#ef4444',
  paid: '#84c140',
  biz: '#FF9500',
  pending: '#9CA3AF',
  delivered: '#84c140',
};

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    redirect('/admin/login');
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    todayRevenueAgg,
    newOrdersToday,
    welfareReviewPending,
    bizApprovalPending,
    totalOrders,
    totalProducts,
    totalUsers,
    monthlyOrders,
    typeOrders,
    orderItems,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { createdAt: { gte: startOfDay } },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.welfareReview.count({ where: { status: 'pending' } }),
    prisma.bizMember.count({ where: { status: 'pending' } }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.findMany({
      where: { createdAt: { gte: monthStart } },
      select: {
        createdAt: true,
        totalPrice: true,
        welfareReview: { select: { id: true } },
      },
    }),
    prisma.order.findMany({
      select: {
        bizId: true,
        welfareReview: { select: { id: true } },
      },
    }),
    prisma.orderItem.findMany({
      select: {
        qty: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            welfarePrice: true,
            category: {
              select: { name: true, parent: { select: { name: true } } },
            },
          },
        },
      },
    }),
  ]);

  const [
    statusCounts,
    welfareReviewCounts,
    recentOrders,
    recentBiz,
  ] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.welfareReview.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        status: true,
        createdAt: true,
        buyer: { select: { name: true } },
        biz: { select: { companyName: true } },
        welfareReview: { select: { id: true, status: true } },
        items: { take: 1, select: { product: { select: { name: true } } } },
      },
    }),
    prisma.bizMember.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { companyName: true, status: true, createdAt: true, approvedAt: true },
    }),
  ]);

  // Resolve top-level category name via the Category.parent self-relation.
  const topLevelName = (cat: { name: string; parent: { name: string } | null }): string =>
    cat.parent?.name ?? cat.name;

  const kpi: DashboardKpi = {
    todayRevenue: todayRevenueAgg._sum.totalPrice ?? 0,
    newOrdersToday,
    welfareReviewPending,
    bizApprovalPending,
    totalOrders,
    totalProducts,
    totalUsers,
  };

  // --- Monthly revenue trend (last 6 months, welfare vs general) ---
  const monthBuckets: MonthlyPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.push({ label: monthLabel(d), welfare: 0, general: 0 });
  }
  const baseMonth = now.getMonth() - 5;
  for (const o of monthlyOrders) {
    const idx = (o.createdAt.getFullYear() - now.getFullYear()) * 12 + o.createdAt.getMonth() - baseMonth;
    if (idx < 0 || idx > 5) continue;
    if (o.welfareReview) monthBuckets[idx].welfare += o.totalPrice;
    else monthBuckets[idx].general += o.totalPrice;
  }

  // --- Revenue type distribution (welfare / biz / general by order count) ---
  let welfareCnt = 0;
  let bizCnt = 0;
  let generalCnt = 0;
  for (const o of typeOrders) {
    if (o.welfareReview) welfareCnt++;
    else if (o.bizId !== null) bizCnt++;
    else generalCnt++;
  }
  const typeTotal = welfareCnt + bizCnt + generalCnt || 1;
  const typeDist: TypeDistribution = {
    general: Math.round((generalCnt / typeTotal) * 100),
    welfare: Math.round((welfareCnt / typeTotal) * 100),
    biz: Math.round((bizCnt / typeTotal) * 100),
  };

  // --- Category sales distribution (qty by top-level category) ---
  const catMap = new Map<string, number>();
  let catTotal = 0;
  for (const it of orderItems) {
    const name = topLevelName(it.product.category);
    catMap.set(name, (catMap.get(name) ?? 0) + it.qty);
    catTotal += it.qty;
  }
  const catSorted = [...catMap.entries()].sort((a, b) => b[1] - a[1]);
  catTotal = catTotal || 1;
  const categoryDist: CategoryShare[] = catSorted.map(([name, qty], i) => ({
    name,
    qty,
    percent: Math.round((qty / catTotal) * 100),
    color: CATEGORY_COLORS[Math.min(i, CATEGORY_COLORS.length - 1)],
  }));

  // --- Best sellers (top products by qty sold) ---
  const prodMap = new Map<
    number,
    { name: string; categoryName: string; isWelfare: boolean; price: number; qty: number }
  >();
  for (const it of orderItems) {
    const p = it.product;
    const existing = prodMap.get(p.id);
    if (existing) {
      existing.qty += it.qty;
    } else {
      prodMap.set(p.id, {
        name: p.name,
        categoryName: topLevelName(p.category),
        isWelfare: p.welfarePrice !== null,
        price: p.price,
        qty: it.qty,
      });
    }
  }
  const bestSellers: BestSeller[] = [...prodMap.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
    .map((p) => ({ name: p.name, categoryName: p.categoryName, isWelfare: p.isWelfare, price: p.price }));

  // --- Conversion metrics (derived from order + review status) ---
  const statusOf = (s: string): number => statusCounts.find((c) => c.status === s)?._count._all ?? 0;
  const readyN = statusOf('ready');
  const shippingN = statusOf('shipping');
  const deliveredN = statusOf('delivered');
  const confirmedN = statusOf('confirmed');
  const ordersAll = readyN + shippingN + deliveredN + confirmedN || 1;
  const wrApproved = welfareReviewCounts.find((c) => c.status === 'approved')?._count._all ?? 0;
  const wrTotal = welfareReviewCounts.reduce((s, c) => s + c._count._all, 0) || 1;
  const conversion: ConversionMetrics = {
    paidRate: Math.round(((ordersAll - readyN) / ordersAll) * 100),
    welfareApproveRate: Math.round((wrApproved / wrTotal) * 100),
    deliveredRate: Math.round(((deliveredN + confirmedN) / ordersAll) * 100),
  };

  // --- Recent activity feed ---
  const activity: ActivityItem[] = recentOrders.map((o) => {
    const buyer = o.biz?.companyName ?? o.buyer?.name ?? '고객';
    const product = o.items[0]?.product.name ?? '상품';
    let kind: keyof typeof ACTIVITY_COLOR;
    let title: string;
    if (o.welfareReview && o.welfareReview.status === 'pending') {
      kind = 'welfare';
      title = '복지용구 서류 검토 요청';
    } else if (o.status === 'ready') {
      kind = 'pending';
      title = '결제 대기';
    } else if (o.status === 'delivered' || o.status === 'confirmed') {
      kind = 'delivered';
      title = o.status === 'confirmed' ? '구매 확정' : '배송 완료';
    } else {
      kind = 'paid';
      title = '결제 완료';
    }
    return {
      color: ACTIVITY_COLOR[kind],
      title,
      time: relativeTime(o.createdAt, now),
      detail: `${buyer} ${product} ${ORDER_STATUS_LABEL[o.status] ?? ''}`.trim(),
    };
  });
  for (const b of recentBiz) {
    if (activity.length >= 6) break;
    if (b.status === 'pending') {
      activity.push({
        color: ACTIVITY_COLOR.biz,
        title: '사업자 신규 가입',
        time: relativeTime(b.createdAt, now),
        detail: `${b.companyName} 사업자 회원 신청`,
      });
    } else if (b.status === 'approved') {
      activity.push({
        color: ACTIVITY_COLOR.delivered,
        title: '사업자 승인 완료',
        time: relativeTime(b.approvedAt ?? b.createdAt, now),
        detail: `${b.companyName} 복지용구사업소 승인`,
      });
    }
  }

  const data: DashboardData = {
    kpi,
    monthly: monthBuckets,
    typeDist,
    categoryDist,
    bestSellers,
    conversion,
    activity: activity.slice(0, 6),
  };

  return <DashboardClient data={data} />;
}
