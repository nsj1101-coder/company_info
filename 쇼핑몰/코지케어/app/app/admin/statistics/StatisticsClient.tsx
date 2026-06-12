'use client';

import Link from 'next/link';
import { useState } from 'react';

type ModalId = 'unsavedModal' | 'logoutModal' | 'deleteModal' | 'successModal' | 'errorModal';

export type DailyPoint = { x: number; y: number };

export type CategoryShare = { name: string; percent: number; color: string };

export type HourBucket = { label: string; count: number; width: number; color: string };

export type TopProduct = { rank: number; name: string; qty: number; revenue: string };

export type Trend = { text: string; up: boolean };

export type StatisticsData = {
  totalRevenueText: string;
  orderCount: number;
  avgOrderText: string;
  welfareShareText: string;
  bizShareText: string;
  refundRateText: string;
  revenueTrend: Trend;
  orderTrend: Trend;
  avgOrderTrend: Trend;
  welfareTrend: Trend;
  bizTrend: Trend;
  refundTrend: Trend;
  dailyLine: DailyPoint[];
  dayLabels: string[];
  categoryShares: CategoryShare[];
  hourBuckets: HourBucket[];
  topProducts: TopProduct[];
};

type Props = { data: StatisticsData };

export default function StatisticsClient({ data }: Props) {
  const [openModals, setOpenModals] = useState<Record<ModalId, boolean>>({
    unsavedModal: false,
    logoutModal: false,
    deleteModal: false,
    successModal: false,
    errorModal: false,
  });

  const closeModal = (id: ModalId): void => {
    setOpenModals((prev) => ({ ...prev, [id]: false }));
  };

  const doLogout = (): void => {
    closeModal('logoutModal');
  };

  const linePoints = data.dailyLine.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <>
      <style>{`
        .stats-body{display:flex;gap:16px;padding:16px 24px 24px;align-items:flex-start;overflow:auto}
        .f-panel{width:220px;flex-shrink:0;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;display:flex;flex-direction:column;gap:16px;position:sticky;top:0}
        .btn-dl{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:38px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-card);font-size:13px;font-weight:600;color:var(--fg-secondary);cursor:pointer;width:100%}
        .btn-dl:hover{border-color:var(--gray-900);color:var(--gray-900)}
        .f-sec{display:flex;flex-direction:column;gap:8px}
        .f-sec-lbl{font-size:12px;font-weight:700;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.03em}
        .f-mk{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--fg-secondary);cursor:pointer}
        .f-mk .mk-box{width:16px;height:16px;border:1.5px solid var(--border);border-radius:4px;flex-shrink:0}
        .f-mk.on{color:var(--fg-primary);font-weight:500}
        .f-mk.on .mk-box{background:var(--accent);border-color:var(--accent)}
        .f-date{display:flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:13px;color:var(--fg-secondary);flex-wrap:wrap}
        .f-date input{border:none;outline:none;font:inherit;color:var(--fg-secondary);width:88px;background:transparent}
        .f-date .dash{color:var(--fg-muted)}
        .main-area{flex:1;min-width:0;display:flex;flex-direction:column;gap:16px}
        .tab-row{display:flex;gap:4px;border-bottom:1px solid var(--border)}
        .st-tab{padding:10px 16px;font-size:14px;font-weight:500;color:var(--fg-muted);border-bottom:2px solid transparent;margin-bottom:-1px}
        .st-tab.active{color:var(--accent);border-bottom-color:var(--accent);font-weight:600}
        .content{display:flex;flex-direction:column;gap:16px}
        .top-row,.bot-row{display:grid;gap:16px}
        .top-row{grid-template-columns:repeat(6,1fr)}
        .content > .top-row:nth-of-type(2){grid-template-columns:1.6fr 1fr}
        .bot-row{grid-template-columns:1.4fr 1fr}
        .stat-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px}
        .stat-card .stat-label{font-size:13px;color:var(--fg-muted)}
        .stat-card .stat-value{font-size:20px;font-weight:600;color:var(--fg-primary);margin-top:6px}
        .stat-card .stat-trend{font-size:12px;color:var(--danger);margin-top:4px}
        .stat-card .stat-trend.up{color:var(--success)}
        .chart-card,.tbl-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;min-width:0}
        .cc-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:4px}
        .cc-head h3{font-size:16px;font-weight:600;color:var(--fg-primary)}
        .cc-sub{font-size:12px;color:var(--fg-muted)}
        .donut-row{display:flex;align-items:center;gap:20px;margin-top:8px}
        .donut{width:130px;height:130px;border-radius:50%;flex-shrink:0;background:conic-gradient(#84c140 0 48%,#3b82f6 48% 70%,#f59e0b 70% 82%,#ef4444 82% 90%,#9ca3af 90% 100%);position:relative}
        .donut::after{content:'';position:absolute;inset:26px;background:var(--bg-card);border-radius:50%}
        .d-leg{flex:1;display:flex;flex-direction:column;gap:8px;min-width:0}
        .d-leg-row{display:flex;align-items:center;justify-content:space-between;font-size:14px}
        .d-name{display:flex;align-items:center;gap:8px;color:var(--fg-secondary)}
        .d-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}
        .d-val{font-weight:600;color:var(--fg-primary)}
        .bar-body{display:flex;flex-direction:column;gap:12px;margin-top:8px}
        .bar-row{display:flex;align-items:center;gap:10px}
        .bar-row .bl{width:48px;font-size:13px;color:var(--fg-muted);flex-shrink:0}
        .bar-row .bt{flex:1;height:18px;background:var(--bg-secondary);border-radius:6px;overflow:hidden}
        .bar-row .bf{height:100%;border-radius:6px}
        .bar-row .bv{width:40px;text-align:right;font-size:13px;font-weight:600;color:var(--fg-primary);flex-shrink:0}
        .tbl-title{font-size:16px;font-weight:600;color:var(--fg-primary);margin-bottom:12px}
        .st-tbl{width:100%;border-collapse:collapse}
        .st-tbl th{text-align:left;font-size:12px;font-weight:600;color:var(--fg-muted);padding:8px 6px;border-bottom:1px solid var(--border-light)}
        .st-tbl td{font-size:14px;color:var(--fg-primary);padding:10px 6px;border-bottom:1px solid var(--border-light)}
        .st-tbl td.m{font-weight:500}
        .st-tbl td.c{color:var(--accent);font-weight:600}
        .st-tbl tr.hi{background:var(--accent-light)}
        @media (max-width:1100px){.top-row{grid-template-columns:repeat(3,1fr)}.content > .top-row:nth-of-type(2),.bot-row{grid-template-columns:1fr}}
      `}</style>
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>매출 통계</h1>
          <p>기간별 매출과 카테고리·유형 분석</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon"></i><input type="text" placeholder="주문번호, 상품명 검색..." /></div>
          <div className="bell-wrapper">
            <button className="bell-btn"><i className="icon-bell" style={{ color: '#4B5563', fontSize: '18px' }}></i><span className="bell-dot"></span></button>
            <div className="noti-dropdown">
              <div className="noti-header"><span className="noti-title">알림</span><span className="noti-read-all">모두 읽음</span></div>
              <div className="noti-item unread"><div className="noti-dot" style={{ background: '#84c140' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#EEF7E2', color: '#5a9229' }}>신규 주문</span><span className="noti-time">10분 전</span><div className="noti-text">코지워커 카본로얄파인더 주문이 접수되었습니다</div></div></div>
              <div className="noti-item unread"><div className="noti-dot" style={{ background: '#34C759' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#EEFBF0', color: '#34C759' }}>정산 완료</span><span className="noti-time">1시간 전</span><div className="noti-text">㈜베스트시니어 3월 정산 완료</div></div></div>
              <div className="noti-item"><div className="noti-dot" style={{ background: '#FF9500' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#FFF8EE', color: '#FF9500' }}>서류 검토</span><span className="noti-time">3시간 전</span><div className="noti-text">복지용구 인정번호 검토 대기 3건</div></div></div>
              <Link href="/admin/shipping" className="noti-footer">알림 센터 전체 보기 →</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-body">
        <aside className="f-panel">
          <button className="btn-dl"><i className="icon-download"></i>리포트 다운로드</button>
          <div className="f-sec">
            <div className="f-sec-lbl">기간 선택</div>
            <div className="f-mk on"><span className="mk-box"></span>오늘</div>
            <div className="f-mk"><span className="mk-box"></span>최근 7일</div>
            <div className="f-mk on"><span className="mk-box"></span>최근 30일</div>
            <div className="f-mk"><span className="mk-box"></span>최근 1년</div>
            <label className="f-date"><i className="icon-calendar"></i><input type="month" defaultValue="2026-01" /><span className="dash">—</span><input type="month" defaultValue="2026-04" /></label>
          </div>
          <div className="f-sec">
            <div className="f-sec-lbl">지표 선택</div>
            <div className="f-mk on"><span className="mk-box"></span>일별 매출</div>
            <div className="f-mk on"><span className="mk-box"></span>카테고리별 비중</div>
            <div className="f-mk on"><span className="mk-box"></span>시간대별 매출</div>
            <div className="f-mk"><span className="mk-box"></span>복지용구 vs 일반</div>
            <div className="f-mk"><span className="mk-box"></span>사업자 매출</div>
          </div>
        </aside>

        <div className="main-area">
          <div className="tab-row">
            <Link href="/admin/statistics" className="st-tab active">매출 통계</Link>
            <Link href="/admin/statistics/patient" className="st-tab">회원 통계</Link>
            <Link href="/admin/statistics/revenue" className="st-tab">매출/정산</Link>
            <Link href="/admin/statistics/operations" className="st-tab">운영 통계</Link>
          </div>

          <div className="content">
            <div className="top-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '12px' }}>
              <div className="stat-card"><div className="stat-label">기간 총매출</div><div className="stat-value">{data.totalRevenueText}</div><div className={data.revenueTrend.up ? 'stat-trend up' : 'stat-trend'}>{data.revenueTrend.text}</div></div>
              <div className="stat-card"><div className="stat-label">결제 건수</div><div className="stat-value">{data.orderCount.toLocaleString('ko-KR')}건</div><div className={data.orderTrend.up ? 'stat-trend up' : 'stat-trend'}>{data.orderTrend.text}</div></div>
              <div className="stat-card"><div className="stat-label">평균 객단가</div><div className="stat-value">{data.avgOrderText}</div><div className={data.avgOrderTrend.up ? 'stat-trend up' : 'stat-trend'}>{data.avgOrderTrend.text}</div></div>
              <div className="stat-card"><div className="stat-label">복지용구 비중</div><div className="stat-value">{data.welfareShareText}</div><div className={data.welfareTrend.up ? 'stat-trend up' : 'stat-trend'}>{data.welfareTrend.text}</div></div>
              <div className="stat-card"><div className="stat-label">사업자 비중</div><div className="stat-value">{data.bizShareText}</div><div className={data.bizTrend.up ? 'stat-trend up' : 'stat-trend'}>{data.bizTrend.text}</div></div>
              <div className="stat-card"><div className="stat-label">환불률</div><div className="stat-value">{data.refundRateText}</div><div className={data.refundTrend.up ? 'stat-trend up' : 'stat-trend'}>{data.refundTrend.text}</div></div>
            </div>

            <div className="top-row">
              <div className="chart-card line-card">
                <div className="cc-head"><h3>일별 매출 추이</h3><span className="cc-sub">최근 30일 · 복지용구 · 일반 · 사업자</span></div>
                <div className="line-area">
                  <svg viewBox="0 0 740 160" style={{ width: '100%', height: '180px', display: 'block' }} preserveAspectRatio="none">
                    <line x1="0" y1="0" x2="740" y2="0" stroke="#F3F4F6" />
                    <line x1="0" y1="40" x2="740" y2="40" stroke="#F3F4F6" />
                    <line x1="0" y1="80" x2="740" y2="80" stroke="#F3F4F6" />
                    <line x1="0" y1="120" x2="740" y2="120" stroke="#F3F4F6" />
                    <line x1="0" y1="160" x2="740" y2="160" stroke="#F3F4F6" />
                    <polyline points={linePoints} fill="none" stroke="#84c140" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    {data.dailyLine.map((p, i) =>
                      i === data.dailyLine.length - 1 ? (
                        <circle key={i} cx={p.x} cy={p.y} r="5" fill="#84c140" />
                      ) : (
                        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#84c140" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      )
                    )}
                  </svg>
                </div>
                <div className="line-labels" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 30px 0', fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#9CA3AF' }}>
                  {data.dayLabels.map((lbl, i) =>
                    i === data.dayLabels.length - 1 ? (
                      <span key={i} style={{ color: '#84c140', fontWeight: 600 }}>{lbl}</span>
                    ) : (
                      <span key={i}>{lbl}</span>
                    )
                  )}
                </div>
              </div>

              <div className="chart-card donut-card">
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--fg-primary)' }}>카테고리별 매출 비중</h3>
                <div className="donut-row">
                  <div className="donut"></div>
                  <div className="d-leg">
                    {data.categoryShares.map((c, i) => (
                      <div className="d-leg-row" key={i}><div className="d-name"><span className="d-dot" style={{ background: c.color }}></span>{c.name}</div><span className="d-val">{c.percent}%</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bot-row">
              <div className="chart-card bar-card">
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--fg-primary)' }}>시간대별 결제 건수</h3>
                <div className="bar-body">
                  {data.hourBuckets.map((b, i) => (
                    <div className="bar-row" key={i}><span className="bl">{b.label}</span><div className="bt"><div className="bf" style={{ width: `${b.width}%`, background: b.color }}></div></div><span className="bv">{b.count}</span></div>
                  ))}
                </div>
              </div>

              <div className="tbl-card">
                <div className="tbl-title">인기 상품 TOP 5</div>
                <table className="st-tbl">
                  <thead>
                    <tr><th>순위</th><th>상품명</th><th>판매수</th><th>매출</th></tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((p) => (
                      <tr className={p.rank === 1 ? 'hi' : undefined} key={p.rank}><td className="m">{p.rank}</td><td className="m">{p.name}</td><td>{p.qty}</td><td className={p.rank === 1 ? 'c' : undefined}>{p.revenue}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="unsavedModal" style={{ display: openModals.unsavedModal ? 'flex' : 'none' }}><div className="modal-content" style={{ width: '400px' }}><div className="modal-icon" style={{ background: '#FFF8EE' }}><i className="icon-alert-triangle" style={{ color: '#FF9500', fontSize: '24px' }}></i></div><div className="modal-title">저장하지 않은 변경사항이 있습니다</div><div className="modal-desc">이 페이지를 떠나면 변경사항이 사라집니다.<br />정말 나가시겠습니까?</div><div className="modal-actions"><button className="btn btn-secondary" onClick={() => closeModal('unsavedModal')}>나가기</button><button className="btn btn-dark" onClick={() => closeModal('unsavedModal')}>저장 후 나가기</button></div></div></div>
      <div className="modal-overlay" id="logoutModal" style={{ display: openModals.logoutModal ? 'flex' : 'none' }}><div className="modal-content" style={{ width: '400px' }}><div className="modal-icon" style={{ background: '#F3F4F6' }}><i className="icon-log-out" style={{ color: '#4B5563', fontSize: '24px' }}></i></div><div className="modal-title">로그아웃 하시겠습니까?</div><div className="modal-desc">다시 로그인이 필요합니다.</div><div className="modal-actions"><button className="btn btn-secondary" onClick={() => closeModal('logoutModal')}>취소</button><button className="btn btn-dark" onClick={doLogout}>로그아웃</button></div></div></div>
      <div className="modal-overlay" id="deleteModal" style={{ display: openModals.deleteModal ? 'flex' : 'none' }}><div className="modal-content" style={{ width: '400px' }}><div className="modal-icon" style={{ background: '#FEE2E2' }}><i className="icon-trash-2" style={{ color: '#FF3B30', fontSize: '24px' }}></i></div><div className="modal-title">정말 삭제하시겠습니까?</div><div className="modal-desc">삭제된 데이터는 복구할 수 없습니다.</div><div className="modal-actions"><button className="btn btn-secondary" onClick={() => closeModal('deleteModal')}>취소</button><button className="btn btn-danger" onClick={() => closeModal('deleteModal')}>삭제</button></div></div></div>
      <div className="modal-overlay" id="successModal" style={{ display: openModals.successModal ? 'flex' : 'none' }}><div className="modal-content" style={{ width: '400px' }}><div className="modal-icon" style={{ background: '#EEFBF0' }}><i className="icon-check-circle" style={{ color: '#34C759', fontSize: '24px' }}></i></div><div className="modal-title">등록이 완료되었습니다</div><div className="modal-desc">목록 페이지로 이동하거나 상세보기 할 수 있습니다.</div><div className="modal-actions"><button className="btn btn-secondary" onClick={() => closeModal('successModal')}>목록으로</button><button className="btn btn-primary" onClick={() => closeModal('successModal')}>상세보기</button></div></div></div>
      <div className="modal-overlay" id="errorModal" style={{ display: openModals.errorModal ? 'flex' : 'none' }}><div className="modal-content" style={{ width: '400px' }}><div className="modal-icon" style={{ background: '#FEE2E2' }}><i className="icon-alert-circle" style={{ color: '#FF3B30', fontSize: '24px' }}></i></div><div className="modal-title">일시적인 오류가 발생했습니다</div><div className="modal-desc">서비스 이용 중 오류가 발생했습니다.<br />잠시 후 다시 시도해주세요.</div><div className="modal-actions"><button className="btn btn-secondary" onClick={() => closeModal('errorModal')}>닫기</button><button className="btn btn-danger" onClick={() => closeModal('errorModal')}>다시 시도</button></div></div></div>
    </>
  );
}
