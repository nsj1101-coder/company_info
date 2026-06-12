import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import PatientClient, {
  type PatientData,
  type BizTypeRow,
  type RegionRow,
} from './PatientClient';

const REGION_COLORS = ['var(--accent)', '#4B5563', '#6B7280', '#9CA3AF', '#B0BEC5', '#CFD8DC'];
const REGION_PREFIX_MAP: { test: RegExp; label: string }[] = [
  { test: /^서울/, label: '서울' },
  { test: /^경기/, label: '경기' },
  { test: /^인천/, label: '인천' },
  { test: /^부산/, label: '부산' },
  { test: /^대전/, label: '대전' },
];

// 사업자 유형 분포: BizMember.businessType 실집계
const BIZ_TYPE_DEFS: { code: string; name: string; color: string }[] = [
  { code: 'welfare_shop', name: '복지용구사업소', color: 'var(--accent)' },
  { code: 'internet_shop', name: '인터넷 사업소', color: '#4B5563' },
  { code: 'home_care', name: '재가복지센터', color: '#6B7280' },
  { code: 'etc', name: '기타 관련업체', color: '#9CA3AF' },
];
const BIZ_TYPE_ETC = BIZ_TYPE_DEFS[BIZ_TYPE_DEFS.length - 1];

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function fmtTrend(v: number): string {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    redirect('/admin/login');
  }

  const now = new Date();
  const d7 = new Date(now);
  d7.setDate(d7.getDate() - 7);
  const d14 = new Date(now);
  d14.setDate(d14.getDate() - 14);
  const d30 = new Date(now);
  d30.setDate(d30.getDate() - 30);
  const d60 = new Date(now);
  d60.setDate(d60.getDate() - 60);

  const [
    totalUsers,
    newMembers7,
    newMembers30,
    prevNewMembers7,
    prevNewMembers30,
    withdrawnCount,
    approvedBiz,
    orderAgg,
    usersWithOrderCounts,
    users,
    pointAgg,
    bizTypeGroups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: d7 } } }),
    prisma.user.count({ where: { createdAt: { gte: d30 } } }),
    prisma.user.count({ where: { createdAt: { gte: d14, lt: d7 } } }),
    prisma.user.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
    prisma.user.count({ where: { status: 'withdrawn' } }),
    prisma.bizMember.count({ where: { status: 'approved' } }),
    prisma.order.aggregate({ _avg: { totalPrice: true } }),
    prisma.order.groupBy({ by: ['buyerId'], _count: { _all: true }, where: { buyerId: { not: null } } }),
    prisma.user.findMany({ select: { roadAddress: true } }),
    prisma.bizMember.aggregate({ _avg: { pointBalance: true }, where: { status: 'approved' } }),
    prisma.bizMember.groupBy({ by: ['businessType'], _count: { _all: true } }),
  ]);

  const buyersTotal = usersWithOrderCounts.length || 1;
  const repeatBuyers = usersWithOrderCounts.filter((g) => g._count._all > 1).length;
  const repurchaseRate = Math.round((repeatBuyers / buyersTotal) * 1000) / 10;

  const memberTotal = totalUsers + approvedBiz || 1;
  const bizRatio = Math.round((approvedBiz / memberTotal) * 1000) / 10;

  // Region distribution from user road addresses
  const regionMap = new Map<string, number>();
  for (const u of users) {
    const addr = u.roadAddress ?? '';
    let label = '기타 지역';
    for (const def of REGION_PREFIX_MAP) {
      if (def.test.test(addr)) {
        label = def.label;
        break;
      }
    }
    regionMap.set(label, (regionMap.get(label) ?? 0) + 1);
  }
  const regionTotal = users.length || 1;
  const orderedRegions = ['서울', '경기', '인천', '부산', '대전', '기타 지역'];
  const regionEntries = orderedRegions
    .map((name) => ({ name, count: regionMap.get(name) ?? 0 }))
    .filter((r) => r.count > 0);
  const maxRegion = Math.max(...regionEntries.map((r) => r.count), 1);
  const regions: RegionRow[] = regionEntries.map((r, i) => ({
    name: r.name,
    count: r.count,
    percent: Math.round((r.count / regionTotal) * 1000) / 10,
    width: Math.round((r.count / maxRegion) * 90),
    color: REGION_COLORS[Math.min(i, REGION_COLORS.length - 1)],
  }));

  // Biz type distribution — BizMember.businessType 실집계
  const bizTypeCounts = new Map<string, number>();
  for (const g of bizTypeGroups) {
    const known = BIZ_TYPE_DEFS.some((d) => d.code === g.businessType);
    const code = g.businessType && known ? g.businessType : BIZ_TYPE_ETC.code;
    bizTypeCounts.set(code, (bizTypeCounts.get(code) ?? 0) + g._count._all);
  }
  const bizTypeTotal = [...bizTypeCounts.values()].reduce((s, c) => s + c, 0) || 1;
  const maxBizType = Math.max(...BIZ_TYPE_DEFS.map((d) => bizTypeCounts.get(d.code) ?? 0), 1);
  const bizTypes: BizTypeRow[] = BIZ_TYPE_DEFS.map((d) => {
    const count = bizTypeCounts.get(d.code) ?? 0;
    return {
      name: d.name,
      count,
      percent: Math.round((count / bizTypeTotal) * 100),
      width: Math.round((count / maxBizType) * 100),
      color: d.color,
    };
  });

  // 탈퇴율 — User.status=withdrawn 비율
  const churnRate = totalUsers > 0 ? Math.round((withdrawnCount / totalUsers) * 1000) / 10 : 0;

  // 증감률 (vs 직전 동기간)
  const newMembers7Trend = pctChange(newMembers7, prevNewMembers7);
  const newMembers30Trend = pctChange(newMembers30, prevNewMembers30);

  const avgOrder = orderAgg._avg.totalPrice ?? 0;
  const avgPoint = pointAgg._avg.pointBalance ?? 0;

  const data: PatientData = {
    newMembers7Text: `${newMembers7.toLocaleString('ko-KR')}명`,
    newMembers30Text: `${newMembers30.toLocaleString('ko-KR')}명`,
    activeMembersText: `${totalUsers.toLocaleString('ko-KR')}명`,
    bizRatioText: `${bizRatio}%`,
    avgOrderText: `₩${Math.round(avgOrder).toLocaleString('ko-KR')}`,
    repurchaseText: `${repurchaseRate}%`,
    avgPointText: `₩${Math.round(avgPoint).toLocaleString('ko-KR')}`,
    churnText: `${churnRate}%`,
    newMembers7Trend: { text: fmtTrend(newMembers7Trend), up: newMembers7Trend >= 0 },
    newMembers30Trend: { text: fmtTrend(newMembers30Trend), up: newMembers30Trend >= 0 },
    bizTypes,
    regions,
  };

  return <PatientClient data={data} />;
}
