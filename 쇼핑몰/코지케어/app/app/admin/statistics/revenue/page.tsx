import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import RevenueClient, {
  type RevenueData,
  type RevenueBar,
  type SettlementRow,
} from './RevenueClient';

const HALF_LABELS = ['상', '하'];

function fmtEok(n: number): string {
  if (n >= 100000000) return `₩${(n / 100000000).toFixed(2)}억`;
  if (n >= 10000) return `₩${Math.round(n / 10000).toLocaleString('ko-KR')}만`;
  return `₩${n.toLocaleString('ko-KR')}`;
}

function halfYearLabel(d: Date, current: boolean): string {
  const yy = String(d.getFullYear() % 100).padStart(2, '0');
  if (current) return `'${yy} ${Math.floor(d.getMonth() / 3) + 1}Q`;
  const half = d.getMonth() < 6 ? HALF_LABELS[0] : HALF_LABELS[1];
  return `'${yy} ${half}`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function fmtTrend(v: number): string {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

const SETTLE_STATUS_LABEL: Record<string, string> = {
  done: '완료',
  processing: '진행',
  pending: '대기',
};

const SETTLE_STATUS_COLOR: Record<string, string> = {
  done: 'var(--accent)',
  processing: '#FF9500',
  pending: '#EF4444',
};

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    redirect('/admin/login');
  }

  const bizFilter = session.role === 'biz' ? { bizId: session.bizId } : {};

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const trendStart = new Date(now.getFullYear() - 2, 0, 1);
  const settleBizFilter = session.role === 'biz' && session.bizId != null ? { bizId: session.bizId } : {};

  const [monthOrders, prevMonthOrders, trendOrders, settlements, monthRefunds, prevMonthRefunds] =
    await Promise.all([
      prisma.order.findMany({
        where: { ...bizFilter, createdAt: { gte: monthStart } },
        select: { totalPrice: true, bizId: true, welfareReview: { select: { id: true } } },
      }),
      prisma.order.findMany({
        where: { ...bizFilter, createdAt: { gte: prevMonthStart, lt: monthStart } },
        select: { totalPrice: true, bizId: true, welfareReview: { select: { id: true } } },
      }),
      prisma.order.findMany({
        where: { ...bizFilter, createdAt: { gte: trendStart } },
        select: { createdAt: true, totalPrice: true, welfareReview: { select: { id: true } } },
      }),
      prisma.settlement.findMany({
        where: settleBizFilter,
        select: { period: true, amount: true, status: true },
        orderBy: { period: 'desc' },
      }),
      prisma.refund.findMany({
        where: { order: { ...bizFilter, createdAt: { gte: monthStart } } },
        select: { amount: true },
      }),
      prisma.refund.findMany({
        where: { order: { ...bizFilter, createdAt: { gte: prevMonthStart, lt: monthStart } } },
        select: { amount: true },
      }),
    ]);

  // KPI: this month
  const monthRevenue = monthOrders.reduce((s, o) => s + o.totalPrice, 0);
  const welfareSettle = monthOrders.filter((o) => o.welfareReview).reduce((s, o) => s + o.totalPrice, 0);
  const bizWholesale = monthOrders.filter((o) => o.bizId !== null).reduce((s, o) => s + o.totalPrice, 0);
  const refundTotal = monthRefunds.reduce((s, r) => s + r.amount, 0);

  // 증감률 (vs 지난 달)
  const prevMonthRevenue = prevMonthOrders.reduce((s, o) => s + o.totalPrice, 0);
  const prevWelfareSettle = prevMonthOrders.filter((o) => o.welfareReview).reduce((s, o) => s + o.totalPrice, 0);
  const prevBizWholesale = prevMonthOrders.filter((o) => o.bizId !== null).reduce((s, o) => s + o.totalPrice, 0);
  const prevRefundTotal = prevMonthRefunds.reduce((s, r) => s + r.amount, 0);

  const monthRevenueTrend = pctChange(monthRevenue, prevMonthRevenue);
  const welfareSettleTrend = pctChange(welfareSettle, prevWelfareSettle);
  const bizWholesaleTrend = pctChange(bizWholesale, prevBizWholesale);
  const refundTrend = pctChange(refundTotal, prevRefundTotal);

  // Trend bars: half-year buckets (5 historical + 1 current quarter)
  const bucketDefs: { start: Date; current: boolean; label: string }[] = [];
  for (let i = 5; i >= 1; i--) {
    const half = i % 2 === 1 ? 1 : 0;
    const yearsBack = Math.ceil(i / 2);
    const d = new Date(now.getFullYear() - yearsBack, half === 0 ? 0 : 6, 1);
    bucketDefs.push({ start: d, current: false, label: halfYearLabel(d, false) });
  }
  bucketDefs.push({ start: monthStart, current: true, label: halfYearLabel(now, true) });

  const bucketTotals = bucketDefs.map((def, idx) => {
    const end = idx < bucketDefs.length - 1 ? bucketDefs[idx + 1].start : new Date(now.getTime() + 86400000);
    return trendOrders
      .filter((o) => o.createdAt >= def.start && o.createdAt < end)
      .reduce((s, o) => s + o.totalPrice, 0);
  });
  const maxBucket = Math.max(...bucketTotals, 1);
  const bars: RevenueBar[] = bucketDefs.map((def, i) => ({
    label: def.label,
    height: Math.max(8, Math.round((bucketTotals[i] / maxBucket) * 170)),
    current: def.current,
  }));

  // Settlement panel: Settlement.status 집계 — 최근 정산 기간별 + 완료/진행 카운트
  const monthRows: SettlementRow[] = [];
  const rankColors = ['var(--accent)', '#4B5563', '#6B7280'];

  type PeriodAgg = { amount: number; statuses: string[] };
  const periodMap = new Map<string, PeriodAgg>();
  for (const s of settlements) {
    const e = periodMap.get(s.period);
    if (e) {
      e.amount += s.amount;
      e.statuses.push(s.status);
    } else {
      periodMap.set(s.period, { amount: s.amount, statuses: [s.status] });
    }
  }
  const sortedPeriods = [...periodMap.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  const maxPeriodAmount = Math.max(...sortedPeriods.map(([, v]) => v.amount), 1);

  function periodStatus(statuses: string[]): string {
    if (statuses.some((s) => s === 'pending')) return 'pending';
    if (statuses.some((s) => s === 'processing')) return 'processing';
    return 'done';
  }

  sortedPeriods.slice(0, 4).forEach(([period, agg], i) => {
    const [yy, mm] = period.split('-');
    const st = periodStatus(agg.statuses);
    const label = SETTLE_STATUS_LABEL[st] ?? st;
    const color = SETTLE_STATUS_COLOR[st] ?? 'var(--fg-secondary)';
    monthRows.push({
      rank: String(i + 1),
      rankColor: rankColors[Math.min(i, rankColors.length - 1)],
      rankText: false,
      name: `${yy}년 ${mm}월`,
      fillWidth: Math.max(8, Math.round((agg.amount / maxPeriodAmount) * 100)),
      fillColor: color,
      valText: label,
      valColor: color,
      valBold: i === 0 ? 700 : 600,
    });
  });

  let doneCnt = 0;
  let processingCnt = 0;
  let pendingCnt = 0;
  for (const s of settlements) {
    if (s.status === 'done') doneCnt++;
    else if (s.status === 'processing') processingCnt++;
    else pendingCnt++;
  }
  const totalSettle = settlements.length || 1;
  const ongoingCnt = processingCnt + pendingCnt;

  monthRows.push({
    rank: '진행',
    rankText: true,
    name: '정산 진행 건수',
    fillWidth: Math.round((ongoingCnt / totalSettle) * 100),
    fillColor: '#FF9500',
    valText: `${ongoingCnt}건`,
    valColor: '#FF9500',
    valBold: 700,
  });
  monthRows.push({
    rank: '완료',
    rankText: true,
    name: '정산 완료 건수',
    fillWidth: Math.round((doneCnt / totalSettle) * 100),
    fillColor: '#84c140',
    valText: `${doneCnt}건`,
    valColor: '#5a9229',
    valBold: 700,
  });

  const data: RevenueData = {
    monthRevenueText: fmtEok(monthRevenue),
    welfareSettleText: fmtEok(welfareSettle),
    bizWholesaleText: fmtEok(bizWholesale),
    refundText: fmtEok(refundTotal),
    monthRevenueTrend: { text: fmtTrend(monthRevenueTrend), up: monthRevenueTrend >= 0 },
    welfareSettleTrend: { text: fmtTrend(welfareSettleTrend), up: welfareSettleTrend >= 0 },
    bizWholesaleTrend: { text: fmtTrend(bizWholesaleTrend), up: bizWholesaleTrend >= 0 },
    refundTrend: { text: fmtTrend(refundTrend), up: refundTrend <= 0 },
    bars,
    settlements: monthRows,
  };

  return <RevenueClient data={data} />;
}
