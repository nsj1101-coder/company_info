import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import StatisticsClient, {
  type StatisticsData,
  type DailyPoint,
  type CategoryShare,
  type HourBucket,
  type TopProduct,
} from './StatisticsClient';

const CATEGORY_COLORS = ['var(--accent)', '#4B5563', '#9CA3AF', '#D1D5DB', '#E5E7EB'];
const HOUR_COLORS = ['var(--accent)', '#4B5563', '#6B7280', '#9CA3AF', '#9CA3AF', '#9CA3AF', '#D1D5DB', '#D1D5DB'];

const HOUR_BUCKET_DEFS: { label: string; from: number; to: number }[] = [
  { label: '09–11시', from: 9, to: 11 },
  { label: '11–13시', from: 11, to: 13 },
  { label: '13–15시', from: 13, to: 15 },
  { label: '15–17시', from: 15, to: 17 },
  { label: '17–19시', from: 17, to: 19 },
  { label: '19–21시', from: 19, to: 21 },
  { label: '21–23시', from: 21, to: 23 },
  { label: '23–09시', from: 23, to: 9 },
];

function fmtEokMan(n: number): string {
  if (n >= 100000000) return `₩${(n / 100000000).toFixed(2)}억`;
  if (n >= 10000) return `₩${Math.round(n / 10000).toLocaleString('ko-KR')}만`;
  return `₩${n.toLocaleString('ko-KR')}`;
}

function fmtWon(n: number): string {
  return `₩${Math.round(n).toLocaleString('ko-KR')}`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function fmtTrend(v: number, unit: '%' | '%p'): string {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}${unit}`;
}

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    redirect('/admin/login');
  }

  const bizFilter = session.role === 'biz' ? { bizId: session.bizId } : {};

  const now = new Date();
  const startOf30 = new Date(now);
  startOf30.setDate(startOf30.getDate() - 29);
  startOf30.setHours(0, 0, 0, 0);
  const startOfPrev30 = new Date(startOf30);
  startOfPrev30.setDate(startOfPrev30.getDate() - 30);

  const [periodOrders, prevPeriodOrders, allTypeOrders, orderItems, categories, refunds, prevRefunds] =
    await Promise.all([
      prisma.order.findMany({
        where: { ...bizFilter, createdAt: { gte: startOf30 } },
        select: { createdAt: true, totalPrice: true, bizId: true, welfareReview: { select: { id: true } } },
      }),
      prisma.order.findMany({
        where: { ...bizFilter, createdAt: { gte: startOfPrev30, lt: startOf30 } },
        select: { totalPrice: true, bizId: true, welfareReview: { select: { id: true } } },
      }),
      prisma.order.findMany({
        where: bizFilter,
        select: { totalPrice: true, bizId: true, welfareReview: { select: { id: true } } },
      }),
      prisma.orderItem.findMany({
        where: { order: bizFilter },
        select: {
          qty: true,
          unitPrice: true,
          product: {
            select: {
              id: true,
              name: true,
              category: { select: { name: true, parentId: true } },
            },
          },
        },
      }),
      prisma.category.findMany({ select: { id: true, name: true, parentId: true } }),
      prisma.refund.findMany({
        where: { order: { ...bizFilter, createdAt: { gte: startOf30 } } },
        select: { amount: true },
      }),
      prisma.refund.findMany({
        where: { order: { ...bizFilter, createdAt: { gte: startOfPrev30, lt: startOf30 } } },
        select: { amount: true },
      }),
    ]);

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  // KPI cards — current 30d window
  const totalRevenue = periodOrders.reduce((s, o) => s + o.totalPrice, 0);
  const orderCount = periodOrders.length;
  const avgOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

  let welfareCnt = 0;
  let bizCnt = 0;
  for (const o of allTypeOrders) {
    if (o.welfareReview) welfareCnt++;
    if (o.bizId !== null) bizCnt++;
  }
  const typeTotal = allTypeOrders.length || 1;
  const welfareShare = (welfareCnt / typeTotal) * 100;
  const bizShare = (bizCnt / typeTotal) * 100;

  // Refund rate (current 30d) — Refund 테이블 집계
  const refundAmount = refunds.reduce((s, r) => s + r.amount, 0);
  const refundRate = totalRevenue > 0 ? (refundAmount / totalRevenue) * 100 : 0;

  // Current vs previous 30d window for 증감률 (비중/환불률은 동일 기준 %p 비교)
  const curWindowTotal = periodOrders.length || 1;
  let curWelfareCnt = 0;
  let curBizCnt = 0;
  for (const o of periodOrders) {
    if (o.welfareReview) curWelfareCnt++;
    if (o.bizId !== null) curBizCnt++;
  }
  const curWelfareShare = (curWelfareCnt / curWindowTotal) * 100;
  const curBizShare = (curBizCnt / curWindowTotal) * 100;

  const prevRevenue = prevPeriodOrders.reduce((s, o) => s + o.totalPrice, 0);
  const prevOrderCount = prevPeriodOrders.length;
  const prevAvgOrder = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;
  let prevWelfareCnt = 0;
  let prevBizCnt = 0;
  for (const o of prevPeriodOrders) {
    if (o.welfareReview) prevWelfareCnt++;
    if (o.bizId !== null) prevBizCnt++;
  }
  const prevTypeTotal = prevPeriodOrders.length || 1;
  const prevWelfareShare = (prevWelfareCnt / prevTypeTotal) * 100;
  const prevBizShare = (prevBizCnt / prevTypeTotal) * 100;
  const prevRefundAmount = prevRefunds.reduce((s, r) => s + r.amount, 0);
  const prevRefundRate = prevRevenue > 0 ? (prevRefundAmount / prevRevenue) * 100 : 0;

  const revenueTrend = pctChange(totalRevenue, prevRevenue);
  const orderTrend = pctChange(orderCount, prevOrderCount);
  const avgOrderTrend = pctChange(avgOrder, prevAvgOrder);
  const welfareTrend = Math.round((curWelfareShare - prevWelfareShare) * 10) / 10;
  const bizTrend = Math.round((curBizShare - prevBizShare) * 10) / 10;
  const refundTrend = Math.round((refundRate - prevRefundRate) * 10) / 10;

  // Daily revenue line over 30 days mapped into svg coords (x: 40..700, y: 12..135)
  const dayTotals = new Array<number>(30).fill(0);
  const hourCounts = new Array<number>(24).fill(0);
  for (const o of periodOrders) {
    const idx = Math.floor((o.createdAt.getTime() - startOf30.getTime()) / 86400000);
    if (idx >= 0 && idx < 30) dayTotals[idx] += o.totalPrice;
    hourCounts[o.createdAt.getHours()] += 1;
  }
  // sample 6 points (every 6 days) to match D-30..오늘 labels
  const sampleIdx = [0, 6, 12, 18, 24, 29];
  const sampled = sampleIdx.map((i) => dayTotals[i]);
  const maxDay = Math.max(...sampled, 1);
  const dailyLine: DailyPoint[] = sampled.map((v, i) => {
    const x = 40 + (660 / (sampleIdx.length - 1)) * i;
    const y = 135 - (v / maxDay) * 123;
    return { x: Math.round(x), y: Math.round(y) };
  });
  const dayLabels = ['D-30', 'D-24', 'D-18', 'D-12', 'D-6', '오늘'];

  // Category shares by revenue (qty * unitPrice), top-level category
  const catMap = new Map<string, number>();
  let catTotal = 0;
  for (const it of orderItems) {
    const cat = it.product.category;
    const name = cat.parentId !== null ? categoryNameById.get(cat.parentId) ?? cat.name : cat.name;
    const rev = it.qty * it.unitPrice;
    catMap.set(name, (catMap.get(name) ?? 0) + rev);
    catTotal += rev;
  }
  catTotal = catTotal || 1;
  const categoryShares: CategoryShare[] = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, rev], i) => ({
      name,
      percent: Math.round((rev / catTotal) * 100),
      color: CATEGORY_COLORS[Math.min(i, CATEGORY_COLORS.length - 1)],
    }));

  // Hour buckets
  const bucketCounts = HOUR_BUCKET_DEFS.map((def) => {
    let c = 0;
    for (let h = 0; h < 24; h++) {
      const inBucket =
        def.from < def.to ? h >= def.from && h < def.to : h >= def.from || h < def.to;
      if (inBucket) c += hourCounts[h];
    }
    return c;
  });
  const maxBucket = Math.max(...bucketCounts, 1);
  const hourBuckets: HourBucket[] = HOUR_BUCKET_DEFS.map((def, i) => ({
    label: def.label,
    count: bucketCounts[i],
    width: Math.round((bucketCounts[i] / maxBucket) * 100),
    color: HOUR_COLORS[Math.min(i, HOUR_COLORS.length - 1)],
  }));

  // Top products by revenue
  const prodMap = new Map<number, { name: string; qty: number; revenue: number }>();
  for (const it of orderItems) {
    const p = it.product;
    const e = prodMap.get(p.id);
    const rev = it.qty * it.unitPrice;
    if (e) {
      e.qty += it.qty;
      e.revenue += rev;
    } else {
      prodMap.set(p.id, { name: p.name, qty: it.qty, revenue: rev });
    }
  }
  const topProducts: TopProduct[] = [...prodMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name,
      qty: p.qty,
      revenue: fmtEokMan(p.revenue),
    }));

  const data: StatisticsData = {
    totalRevenueText: fmtEokMan(totalRevenue),
    orderCount,
    avgOrderText: fmtWon(avgOrder),
    welfareShareText: `${Math.round(welfareShare)}%`,
    bizShareText: `${Math.round(bizShare)}%`,
    refundRateText: `${Math.round(refundRate * 10) / 10}%`,
    revenueTrend: { text: fmtTrend(revenueTrend, '%'), up: revenueTrend >= 0 },
    orderTrend: { text: fmtTrend(orderTrend, '%'), up: orderTrend >= 0 },
    avgOrderTrend: { text: fmtTrend(avgOrderTrend, '%'), up: avgOrderTrend >= 0 },
    welfareTrend: { text: fmtTrend(welfareTrend, '%p'), up: welfareTrend >= 0 },
    bizTrend: { text: fmtTrend(bizTrend, '%p'), up: bizTrend >= 0 },
    refundTrend: { text: fmtTrend(refundTrend, '%p'), up: refundTrend <= 0 },
    dailyLine,
    dayLabels,
    categoryShares,
    hourBuckets,
    topProducts,
  };

  return <StatisticsClient data={data} />;
}
