'use client';

import { useEffect } from 'react';

export type DashboardKpi = {
  todayRevenue: number;
  newOrdersToday: number;
  welfareReviewPending: number;
  bizApprovalPending: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
};

export type MonthlyPoint = {
  label: string;
  welfare: number;
  general: number;
};

export type TypeDistribution = {
  general: number;
  welfare: number;
  biz: number;
};

export type CategoryShare = {
  name: string;
  qty: number;
  percent: number;
  color: string;
};

export type BestSeller = {
  name: string;
  categoryName: string;
  isWelfare: boolean;
  price: number;
};

export type ConversionMetrics = {
  paidRate: number;
  welfareApproveRate: number;
  deliveredRate: number;
};

export type ActivityItem = {
  color: string;
  title: string;
  time: string;
  detail: string;
};

export type DashboardData = {
  kpi: DashboardKpi;
  monthly: MonthlyPoint[];
  typeDist: TypeDistribution;
  categoryDist: CategoryShare[];
  bestSellers: BestSeller[];
  conversion: ConversionMetrics;
  activity: ActivityItem[];
};

type Props = { data: DashboardData };

const fmt = (n: number): string => n.toLocaleString('ko-KR');

const BUBBLE_LAYOUT = [
  { left: 11, top: 25, size: 88, font: 20, bg: '#84c140', color: '#fff' },
  { left: 105, top: 3, size: 66, font: 18, bg: '#4B5563', color: '#fff' },
  { left: 110, top: 71, size: 51, font: 16, bg: '#6B7280', color: '#fff' },
  { left: 176, top: 36, size: 40, font: 14, bg: '#9CA3AF', color: '#fff' },
  { left: 176, top: 80, size: 34, font: 12, bg: '#D1D5DB', color: 'var(--fg-secondary)' },
];

const LEGEND_DOT = [
  { size: 10, bg: '#84c140' },
  { size: 8, bg: '#4B5563' },
  { size: 7, bg: '#6B7280' },
  { size: 6, bg: '#9CA3AF' },
  { size: 6, bg: '#D1D5DB' },
];

const BAR_COLORS = ['#84c140', '#4B5563', '#9CA3AF', '#D1D5DB', '#D1D5DB', '#D1D5DB', '#D1D5DB'];

const BAR_X = [22, 142, 262, 382, 502, 622];
const CHART_BASE = 180;
const CHART_MAX_H = 172;

export default function DashboardClient({ data }: Props) {
  useEffect(() => {
    const update = (): void => {
      document.querySelectorAll('.fade-scroll').forEach((el) => {
        const body = el.querySelector('.fs-body');
        if (!body) return;
        el.classList.toggle('has-overflow', body.scrollHeight > el.clientHeight + 1);
      });
    };
    update();
    window.addEventListener('resize', update);
    let ro: ResizeObserver | null = null;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      ro = new ResizeObserver(update);
      document.querySelectorAll('.fade-scroll').forEach((el) => ro!.observe(el));
    }
    return () => {
      window.removeEventListener('resize', update);
      if (ro) ro.disconnect();
    };
  }, []);

  const { kpi } = data;

  const maxMonthTotal = Math.max(1, ...data.monthly.map((m) => m.welfare + m.general));
  const lastMonthIdx = data.monthly.length - 1;

  const maxCatQty = Math.max(1, ...data.categoryDist.map((c) => c.qty));

  return (
    <>
      <style>{`
        .dash-grid{display:flex;flex-direction:column;gap:24px;padding:32px 40px;flex:1;min-height:0;overflow-y:auto}
        .tier{display:flex;gap:20px}
        .stat-c{flex:1;min-width:0;border-radius:var(--radius-lg);padding:16px 20px;display:flex;align-items:center;gap:14px}
        .stat-c .s-ic{width:40px;height:40px;border-radius:9999px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .stat-c .s-val{font-family:var(--font-mono);font-size:22px;font-weight:700;color:var(--fg-primary)}
        .stat-c .s-chg{font-size:14px;font-weight:500;margin-left:8px}
        .stat-c .s-lbl{font-size:14px;color:var(--fg-muted);margin-top:2px}
        .panel{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg)}
        .panel-h{padding:14px 16px;font-size:14px;font-weight:600;color:var(--fg-primary)}
        .panel-hr{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 10px;font-size:14px}
        .panel-hr .ph-t{font-weight:600;color:var(--fg-primary)}
        .panel-hr .ph-s{color:var(--fg-muted)}
        .donut-wrap{display:flex;align-items:center;gap:16px;padding:0 16px 16px;justify-content:center;flex:1}
        .donut{width:165px;height:165px;border-radius:50%;position:relative;flex-shrink:0}
        .donut::after{content:'';position:absolute;inset:17.5%;background:var(--bg-card);border-radius:50%}
        .donut-lg{display:flex;flex-direction:column;gap:8px;min-width:120px}
        .donut-lg .dl-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:14px;color:var(--fg-primary)}
        .donut-lg .dl-row .dl-l{display:flex;align-items:center;gap:6px}
        .donut-lg .dl-d{width:8px;height:8px;border-radius:2px;flex-shrink:0}
        .donut-lg .dl-v{font-family:var(--font-mono);font-weight:600}
        .bubbles{position:relative;width:273px;height:140px;flex-shrink:0}
        .bubble{position:absolute;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--font-mono);font-weight:600}
        .conv-row{display:flex;align-items:center;justify-content:space-between;font-size:14px;margin-bottom:4px}
        .conv-row .cv-l{color:var(--fg-secondary)}
        .conv-row .cv-v{font-family:var(--font-mono);font-size:18px;font-weight:700}
        .dept-row{display:flex;align-items:center;gap:8px;font-size:14px}
        .dept-row .dr-l{width:60px;color:var(--fg-secondary);flex-shrink:0}
        .dept-row .dr-bar{flex:1;height:6px;background:var(--border-light);border-radius:3px;overflow:hidden}
        .dept-row .dr-fill{height:100%;border-radius:3px}
        .dept-row .dr-v{width:28px;text-align:right;font-family:var(--font-mono);font-weight:600;color:var(--fg-primary);flex-shrink:0}
        .hosp-row{display:flex;align-items:center;gap:10px;padding:8px 16px}
        .hosp-logo{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px}
        .hosp-body{flex:1;display:flex;flex-direction:column;gap:6px;min-width:0}
        .hosp-n{font-size:14px;font-weight:500;color:var(--fg-primary)}
        .hosp-tags{display:flex;gap:4px}
        .tag{padding:2px 8px;border-radius:4px;font-size:12px;font-weight:500}
        .hosp-d{font-family:var(--font-mono);font-size:13px;color:var(--fg-muted);flex-shrink:0}
        .tl-item{display:flex;gap:14px;min-height:58px}
        .tl-col{width:12px;display:flex;flex-direction:column;align-items:center;flex-shrink:0}
        .tl-dot{width:10px;height:10px;border-radius:50%}
        .tl-bar{width:2px;flex:1;background:var(--border);margin-top:2px}
        .tl-body{flex:1;display:flex;flex-direction:column;gap:3px}
        .tl-top{display:flex;justify-content:space-between;align-items:center}
        .tl-t{font-size:14px;font-weight:600;color:var(--fg-primary)}
        .tl-tm{font-family:var(--font-mono);font-size:13px;color:var(--fg-muted)}
        .tl-s{font-size:13px;color:var(--fg-muted)}
        .sidebar-user .su-av{width:36px;height:36px;border-radius:50%;background:var(--fg-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;flex-shrink:0}
        .su-name-row{display:flex;align-items:center;gap:6px}
        .su-name{font-size:13px;font-weight:600;color:var(--fg-primary)}
        .su-tag{background:var(--accent-light);color:var(--accent);font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px}
        .su-mail{font-size:12px;color:var(--fg-muted);margin-top:2px}
        .fade-scroll{position:relative;flex:1;min-height:0;overflow:hidden}
        .fade-scroll .fs-body{display:flex;flex-direction:column}
        .fade-scroll.has-overflow::after{content:'더보기';position:absolute;left:0;right:0;bottom:0;height:48px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;font-size:14px;font-weight:500;color:var(--fg-muted);background:linear-gradient(to bottom,rgba(255,255,255,0) 0%,#ffffff 60%);pointer-events:none}
        .tier-3{align-items:stretch}
        .tier-3 > .panel,.tier-3 .conv-panel,.tier-3 .dept-panel{display:flex;flex-direction:column;min-height:0}
      `}</style>

      <div className="dash-grid">

        {/* Tier 1: Stat cards */}
        <div className="tier">
          <div className="stat-c" style={{ background: '#EEFBF0', border: '1px solid #C8F0CE' }}>
            <div className="s-ic"><i className="icon-wallet" style={{ color: 'var(--accent)', fontSize: 18 }}></i></div>
            <div><div><span className="s-val">{fmt(kpi.todayRevenue)}원</span></div><div className="s-lbl">오늘 매출</div></div>
          </div>
          <div className="stat-c" style={{ background: '#F4FBE8', border: '1px solid #D8EFB8' }}>
            <div className="s-ic"><i className="icon-shopping-cart" style={{ color: 'var(--accent)', fontSize: 18 }}></i></div>
            <div><div><span className="s-val">{fmt(kpi.newOrdersToday)}건</span></div><div className="s-lbl">신규 주문 (오늘)</div></div>
          </div>
          <div className="stat-c" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
            <div className="s-ic"><i className="icon-shield-check" style={{ color: '#ef4444', fontSize: 18 }}></i></div>
            <div><div><span className="s-val">{fmt(kpi.welfareReviewPending)}건</span><span className="s-chg" style={{ color: '#ef4444' }}>대기중</span></div><div className="s-lbl">복지용구 검토 대기</div></div>
          </div>
          <div className="stat-c" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
            <div className="s-ic"><i className="icon-user-check" style={{ color: '#ef4444', fontSize: 18 }}></i></div>
            <div><div><span className="s-val">{fmt(kpi.bizApprovalPending)}건</span><span className="s-chg" style={{ color: '#ef4444' }}>승인 필요</span></div><div className="s-lbl">사업자 승인 대기</div></div>
          </div>
        </div>

        {/* Tier 2: Stacked bar chart + donut */}
        <div className="tier">
          <div className="panel" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="panel-hr"><span className="ph-t">월별 매출 추이</span><span className="ph-s">복지용구 + 일반 (최근 6개월)</span></div>
            <div style={{ padding: '0 24px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <svg viewBox="0 0 740 180" style={{ width: '100%', height: 200, display: 'block' }} preserveAspectRatio="none">
                <line x1="0" y1="0" x2="740" y2="0" stroke="#F3F4F6" />
                <line x1="0" y1="45" x2="740" y2="45" stroke="#F3F4F6" />
                <line x1="0" y1="90" x2="740" y2="90" stroke="#F3F4F6" />
                <line x1="0" y1="135" x2="740" y2="135" stroke="#F3F4F6" />
                <line x1="0" y1="180" x2="740" y2="180" stroke="#F3F4F6" />
                {data.monthly.map((m, i) => {
                  const generalH = Math.round((m.general / maxMonthTotal) * CHART_MAX_H);
                  const welfareH = Math.round((m.welfare / maxMonthTotal) * CHART_MAX_H);
                  const generalY = CHART_BASE - generalH;
                  const welfareY = generalY - welfareH;
                  return (
                    <g key={m.label}>
                      <rect x={BAR_X[i]} y={generalY} width="60" height={generalH} fill="#84c140" />
                      <rect x={BAR_X[i]} y={welfareY} width="60" height={welfareH} fill="#ef4444" />
                    </g>
                  );
                })}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 30px 0', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#9CA3AF' }}>
                {data.monthly.map((m, i) => (
                  <span key={m.label} style={i === lastMonthIdx ? { color: '#84c140', fontWeight: 600 } : undefined}>{m.label}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, padding: '12px 30px 0', fontSize: 13, color: 'var(--fg-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444' }}></span>복지용구</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#84c140' }}></span>일반</div>
              </div>
            </div>
          </div>
          <div className="panel" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="panel-h">매출 유형 분포</div>
            <div className="donut-wrap">
              <div className="donut" style={{ background: `conic-gradient(#84c140 0 ${data.typeDist.general}%,#ef4444 ${data.typeDist.general}% ${data.typeDist.general + data.typeDist.welfare}%,#6B7280 ${data.typeDist.general + data.typeDist.welfare}% 100%)` }}></div>
              <div className="donut-lg">
                <div className="dl-row"><div className="dl-l"><span className="dl-d" style={{ background: '#84c140' }}></span>일반</div><span className="dl-v">{data.typeDist.general}%</span></div>
                <div className="dl-row"><div className="dl-l"><span className="dl-d" style={{ background: '#ef4444' }}></span>복지용구</div><span className="dl-v">{data.typeDist.welfare}%</span></div>
                <div className="dl-row"><div className="dl-l"><span className="dl-d" style={{ background: '#6B7280' }}></span>사업자</div><span className="dl-v">{data.typeDist.biz}%</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 3: left col (category bubble + dept) | right col (activity feed) */}
        <div className="tier" style={{ alignItems: 'stretch' }}>
          {/* Left column */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Category bubble */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-h">카테고리별 판매 분포</div>
              <div style={{ display: 'flex', gap: 12, padding: '0 16px 12px', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <div className="bubbles">
                  {data.categoryDist.slice(0, 5).map((c, i) => {
                    const b = BUBBLE_LAYOUT[i];
                    return (
                      <div key={c.name} className="bubble" style={{ left: b.left, top: b.top, width: b.size, height: b.size, background: b.bg, color: b.color, fontSize: b.font }}>{c.percent}%</div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: 'var(--fg-secondary)' }}>
                  {data.categoryDist.slice(0, 5).map((c, i) => {
                    const d = LEGEND_DOT[i];
                    return (
                      <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: d.size, height: d.size, borderRadius: '50%', background: d.bg }}></span>{c.name}</div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Conversion + Category bars */}
            <div style={{ display: 'flex', gap: 20 }}>
              <div className="panel" style={{ flex: 1, minWidth: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>이달 주문 전환</div>
                <div className="fade-scroll"><div className="fs-body" style={{ gap: 10 }}>
                  <div>
                    <div className="conv-row"><span className="cv-l">주문 → 결제</span><span className="cv-v" style={{ color: '#84c140' }}>{data.conversion.paidRate}%</span></div>
                    <div className="progress-bar" style={{ height: 4 }}><div className="progress-fill" style={{ width: `${data.conversion.paidRate}%`, background: '#84c140' }}></div></div>
                  </div>
                  <div>
                    <div className="conv-row"><span className="cv-l">복지용구 서류 → 승인</span><span className="cv-v" style={{ color: '#ef4444' }}>{data.conversion.welfareApproveRate}%</span></div>
                    <div className="progress-bar" style={{ height: 4 }}><div className="progress-fill" style={{ width: `${data.conversion.welfareApproveRate}%`, background: '#ef4444' }}></div></div>
                  </div>
                  <div>
                    <div className="conv-row"><span className="cv-l">결제 → 배송완료</span><span className="cv-v" style={{ color: 'var(--warning)' }}>{data.conversion.deliveredRate}%</span></div>
                    <div className="progress-bar" style={{ height: 4 }}><div className="progress-fill" style={{ width: `${data.conversion.deliveredRate}%`, background: 'var(--warning)' }}></div></div>
                  </div>
                </div></div>
              </div>
              <div className="panel" style={{ flex: 1, minWidth: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>카테고리별 분포</div>
                <div className="fade-scroll"><div className="fs-body" style={{ gap: 10 }}>
                  {data.categoryDist.map((c, i) => (
                    <div key={c.name} className="dept-row"><span className="dr-l">{c.name}</span><div className="dr-bar"><div className="dr-fill" style={{ width: `${Math.round((c.qty / maxCatQty) * 100)}%`, background: BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)] }}></div></div><span className="dr-v">{c.qty}</span></div>
                  ))}
                </div></div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 20 }}>
            {/* Recent products */}
            <div className="panel" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="panel-h">베스트 판매 상품</div>
              <div className="fade-scroll"><div className="fs-body" style={{ gap: 8, padding: '0 0 8px' }}>
                {data.bestSellers.map((p) => (
                  <div key={p.name} className="hosp-row">
                    <div className="hosp-logo" style={{ background: 'var(--accent-light)' }}><i className="icon-package" style={{ color: 'var(--accent)' }}></i></div>
                    <div className="hosp-body"><div className="hosp-n">{p.name}</div><div className="hosp-tags"><span className="tag" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>{p.categoryName}</span>{p.isWelfare && <span className="tag" style={{ background: '#FEE2E2', color: '#ef4444' }}>복지용구</span>}</div></div>
                    <span className="hosp-d">{fmt(p.price)}</span>
                  </div>
                ))}
              </div></div>
            </div>
            {/* Activity feed */}
            <div className="panel" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="panel-h" style={{ padding: '14px 16px 14px 12px' }}>최근 활동</div>
              <div className="fade-scroll"><div className="fs-body" style={{ padding: '0 16px 0 24px' }}>
                {data.activity.map((a, i) => (
                  <div key={i} className="tl-item">
                    <div className="tl-col"><div className="tl-dot" style={{ background: a.color }}></div>{i < data.activity.length - 1 && <div className="tl-bar"></div>}</div>
                    <div className="tl-body"><div className="tl-top"><span className="tl-t">{a.title}</span><span className="tl-tm">{a.time}</span></div><span className="tl-s">{a.detail}</span></div>
                  </div>
                ))}
              </div></div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
