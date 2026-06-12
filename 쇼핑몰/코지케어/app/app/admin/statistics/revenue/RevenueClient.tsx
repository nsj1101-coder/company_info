'use client';

import { useState } from 'react';
import Link from 'next/link';

type ModalId = 'unsavedModal' | 'logoutModal' | 'deleteModal' | 'successModal' | 'errorModal';

export type RevenueBar = { label: string; height: number; current: boolean };

export type SettlementRow = {
  rank: string;
  rankColor?: string;
  rankText: boolean;
  name: string;
  fillWidth: number;
  fillColor: string;
  valText: string;
  valColor: string;
  valBold: number;
};

export type Trend = { text: string; up: boolean };

export type RevenueData = {
  monthRevenueText: string;
  welfareSettleText: string;
  bizWholesaleText: string;
  refundText: string;
  monthRevenueTrend: Trend;
  welfareSettleTrend: Trend;
  bizWholesaleTrend: Trend;
  refundTrend: Trend;
  bars: RevenueBar[];
  settlements: SettlementRow[];
};

type Props = { data: RevenueData };

export default function RevenueClient({ data }: Props) {
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

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>매출/정산</h1>
          <p>매출·복지용구 위탁(베스트시니어) 정산 추적</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box">
            <i className="icon-search search-icon"></i>
            <input type="text" placeholder="정산번호, 주문번호 검색..." />
          </div>
          <div className="bell-wrapper">
            <button className="bell-btn">
              <i className="icon-bell" style={{ color: '#4B5563', fontSize: '18px' }}></i>
              <span className="bell-dot"></span>
            </button>
            <div className="noti-dropdown">
              <div className="noti-header">
                <span className="noti-title">알림</span>
                <span className="noti-read-all">모두 읽음</span>
              </div>
              <div className="noti-item unread">
                <div className="noti-dot" style={{ background: '#84c140' }}></div>
                <div className="noti-body">
                  <span className="noti-badge" style={{ background: '#EEF7E2', color: '#5a9229' }}>신규 주문</span>
                  <span className="noti-time">10분 전</span>
                  <div className="noti-text">복지용구 결제 위탁 건 접수</div>
                </div>
              </div>
              <div className="noti-item unread">
                <div className="noti-dot" style={{ background: '#34C759' }}></div>
                <div className="noti-body">
                  <span className="noti-badge" style={{ background: '#EEFBF0', color: '#34C759' }}>정산 완료</span>
                  <span className="noti-time">1시간 전</span>
                  <div className="noti-text">㈜베스트시니어 3월 정산 완료</div>
                </div>
              </div>
              <div className="noti-item">
                <div className="noti-dot" style={{ background: '#FF9500' }}></div>
                <div className="noti-body">
                  <span className="noti-badge" style={{ background: '#FFF8EE', color: '#FF9500' }}>서류 검토</span>
                  <span className="noti-time">3시간 전</span>
                  <div className="noti-text">복지용구 인정번호 검토 대기 3건</div>
                </div>
              </div>
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
            <div className="f-mk"><span className="mk-box"></span>오늘</div>
            <div className="f-mk"><span className="mk-box"></span>최근 7일</div>
            <div className="f-mk on"><span className="mk-box"></span>최근 30일</div>
            <div className="f-mk on"><span className="mk-box"></span>최근 1년</div>
            <label className="f-date">
              <i className="icon-calendar"></i>
              <input type="month" defaultValue="2026-01" />
              <span className="dash">—</span>
              <input type="month" defaultValue="2026-04" />
            </label>
          </div>
          <div className="f-sec">
            <div className="f-sec-lbl">지표 선택</div>
            <div className="f-mk on"><span className="mk-box"></span>월별 매출</div>
            <div className="f-mk on"><span className="mk-box"></span>베스트시니어 위탁</div>
            <div className="f-mk on"><span className="mk-box"></span>사업자 도매</div>
            <div className="f-mk"><span className="mk-box"></span>환불 금액</div>
            <div className="f-mk"><span className="mk-box"></span>포인트 사용액</div>
          </div>
        </aside>

        <div className="main-area">
          <div className="tab-row">
            <Link href="/admin/statistics" className="st-tab">매출 통계</Link>
            <Link href="/admin/statistics/patient" className="st-tab">회원 통계</Link>
            <Link href="/admin/statistics/revenue" className="st-tab active">매출/정산</Link>
            <Link href="/admin/statistics/operations" className="st-tab">운영 통계</Link>
          </div>

          <div className="content">
            <div className="rv-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', flex: 'none' }}>
              <div className="stat-card"><div className="stat-label">이번 달 매출</div><div className="stat-value">{data.monthRevenueText}</div><div className={data.monthRevenueTrend.up ? 'stat-trend up' : 'stat-trend'}>{data.monthRevenueTrend.text}</div></div>
              <div className="stat-card"><div className="stat-label">베스트시니어 정산 대상</div><div className="stat-value">{data.welfareSettleText}</div><div className={data.welfareSettleTrend.up ? 'stat-trend up' : 'stat-trend'}>{data.welfareSettleTrend.text}</div></div>
              <div className="stat-card"><div className="stat-label">사업자 도매 매출</div><div className="stat-value">{data.bizWholesaleText}</div><div className={data.bizWholesaleTrend.up ? 'stat-trend up' : 'stat-trend'}>{data.bizWholesaleTrend.text}</div></div>
              <div className="stat-card"><div className="stat-label">환불 금액</div><div className="stat-value">{data.refundText}</div><div className={data.refundTrend.up ? 'stat-trend up' : 'stat-trend'}>{data.refundTrend.text}</div></div>
            </div>

            <div className="rv-row">
              <div className="chart-card">
                <div className="rv-head"><h3>월별 매출 추이</h3><span className="rv-sub">최근 36개월 · 단위: 백만원</span></div>
                <div className="rv-bars">
                  {data.bars.map((b, i) => (
                    <div className="rv-col" key={i}>
                      <div className="rv-group">
                        <div className="rv-bar actual" style={{ height: `${b.height}px` }}></div>
                      </div>
                      <div className={`rv-label${b.current ? ' cur' : ''}`}>{b.label}</div>
                    </div>
                  ))}
                </div>
                <div className="rv-leg">
                  <div className="rv-leg-item"><span className="rv-leg-dot" style={{ background: 'var(--accent)' }}></span>전체 매출</div>
                  <div className="rv-leg-item"><span className="rv-leg-dot" style={{ background: '#D1D5DB' }}></span>베스트시니어 위탁분</div>
                </div>
              </div>

              <div className="hs-card">
                <h3>베스트시니어 위탁 정산 현황</h3>
                {data.settlements.map((s, i) => (
                  <div className="hs-row" key={i}>
                    {s.rankText ? (
                      <div className="hs-rank-txt">{s.rank}</div>
                    ) : (
                      <div className="hs-rank" style={{ background: s.rankColor }}>{s.rank}</div>
                    )}
                    <div className="hs-name">{s.name}</div>
                    <div className="hs-track"><div className="hs-fill" style={{ width: `${s.fillWidth}%`, background: s.fillColor }}></div></div>
                    <div className="hs-val" style={{ color: s.valColor, fontWeight: s.valBold }}>{s.valText}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`modal-overlay${openModals.unsavedModal ? ' active' : ''}`} id="unsavedModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#FFF8EE' }}><i className="icon-alert-triangle" style={{ color: '#FF9500', fontSize: '24px' }}></i></div>
          <div className="modal-title">저장하지 않은 변경사항이 있습니다</div>
          <div className="modal-desc">이 페이지를 떠나면 변경사항이 사라집니다.<br />정말 나가시겠습니까?</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('unsavedModal')}>나가기</button>
            <button className="btn btn-dark" onClick={() => closeModal('unsavedModal')}>저장 후 나가기</button>
          </div>
        </div>
      </div>
      <div className={`modal-overlay${openModals.logoutModal ? ' active' : ''}`} id="logoutModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#F3F4F6' }}><i className="icon-log-out" style={{ color: '#4B5563', fontSize: '24px' }}></i></div>
          <div className="modal-title">로그아웃 하시겠습니까?</div>
          <div className="modal-desc">다시 로그인이 필요합니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('logoutModal')}>취소</button>
            <button className="btn btn-dark" onClick={doLogout}>로그아웃</button>
          </div>
        </div>
      </div>
      <div className={`modal-overlay${openModals.deleteModal ? ' active' : ''}`} id="deleteModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}><i className="icon-trash-2" style={{ color: '#FF3B30', fontSize: '24px' }}></i></div>
          <div className="modal-title">정말 삭제하시겠습니까?</div>
          <div className="modal-desc">삭제된 데이터는 복구할 수 없습니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('deleteModal')}>취소</button>
            <button className="btn btn-danger" onClick={() => closeModal('deleteModal')}>삭제</button>
          </div>
        </div>
      </div>
      <div className={`modal-overlay${openModals.successModal ? ' active' : ''}`} id="successModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#EEFBF0' }}><i className="icon-check-circle" style={{ color: '#34C759', fontSize: '24px' }}></i></div>
          <div className="modal-title">등록이 완료되었습니다</div>
          <div className="modal-desc">목록 페이지로 이동하거나 상세보기 할 수 있습니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('successModal')}>목록으로</button>
            <button className="btn btn-primary" onClick={() => closeModal('successModal')}>상세보기</button>
          </div>
        </div>
      </div>
      <div className={`modal-overlay${openModals.errorModal ? ' active' : ''}`} id="errorModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}><i className="icon-alert-circle" style={{ color: '#FF3B30', fontSize: '24px' }}></i></div>
          <div className="modal-title">일시적인 오류가 발생했습니다</div>
          <div className="modal-desc">서비스 이용 중 오류가 발생했습니다.<br />잠시 후 다시 시도해주세요.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('errorModal')}>닫기</button>
            <button className="btn btn-danger" onClick={() => closeModal('errorModal')}>다시 시도</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-body{display:flex;flex:1;min-height:0;overflow:hidden}
        .f-panel{width:240px;flex-shrink:0;background:var(--bg-card);border-right:1px solid var(--border);padding:20px;display:flex;flex-direction:column;gap:20px;overflow-y:auto}
        .f-panel :global(.btn-dl){width:100%;background:#111827;color:#fff;border-radius:var(--radius-sm);padding:12px 20px;display:flex;align-items:center;justify-content:center;gap:8px;border:none;font-size:14px;font-weight:600;cursor:pointer}
        .f-sec{display:flex;flex-direction:column;gap:10px}
        .f-sec-lbl{font-size:14px;font-weight:600;color:var(--fg-muted)}
        .f-date{display:flex;align-items:center;gap:6px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--fg-secondary);font-size:13px;font-family:var(--font-mono)}
        .f-date :global(i){color:var(--fg-muted);font-size:14px;flex-shrink:0}
        .f-date :global(input[type="month"]){border:none;outline:none;background:transparent;font:inherit;color:var(--fg-secondary);padding:0;width:100%;min-width:0}
        .f-date :global(.dash){color:var(--fg-muted)}
        .f-mk{display:flex;align-items:center;gap:8px;height:24px;font-size:14px;color:var(--fg-primary);cursor:pointer}
        .f-mk :global(.mk-box){width:16px;height:16px;border-radius:3px;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .f-mk.on :global(.mk-box){background:var(--accent);border-color:var(--accent);color:#fff}
        .f-mk.on :global(.mk-box::after){content:'';width:8px;height:4px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg) translateY(-1px)}
        .main-area{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
        .tab-row{display:flex;height:44px;background:var(--bg-card);border-bottom:1px solid var(--border);flex-shrink:0}
        .st-tab{padding:0 24px;display:flex;align-items:center;font-size:14px;color:var(--fg-muted);cursor:pointer;text-decoration:none}
        .st-tab.active{color:var(--accent);font-weight:600;box-shadow:inset 0 -2px 0 var(--accent)}
        .content{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px}
        .rv-row{display:flex;gap:16px;flex:1;min-height:0}
        .chart-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;display:flex;flex-direction:column;gap:10px;flex:1;min-width:0;height:320px}
        .rv-head{display:flex;align-items:center;justify-content:space-between}
        .rv-head :global(h3){font-size:16px;font-weight:600;color:var(--fg-primary)}
        .rv-head :global(.rv-sub){font-size:14px;color:var(--fg-muted);font-family:var(--font-mono)}
        .rv-bars{flex:1;display:flex;align-items:flex-end;justify-content:space-around;gap:16px;padding-bottom:24px}
        .rv-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end}
        .rv-group{display:flex;align-items:flex-end;gap:4px;justify-content:center}
        .rv-bar{width:24px;border-radius:4px 4px 0 0}
        .rv-bar.actual{background:var(--accent)}
        .rv-bar.expected{background:#D1D5DB}
        .rv-label{font-family:var(--font-mono);font-size:14px;color:var(--fg-muted)}
        .rv-label.cur{color:var(--accent);font-weight:600}
        .rv-leg{display:flex;justify-content:center;gap:16px}
        .rv-leg-item{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--fg-secondary)}
        .rv-leg-dot{width:10px;height:10px;border-radius:2px}
        .hs-card{flex:1;min-width:0;height:320px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;display:flex;flex-direction:column;gap:12px;overflow:hidden}
        .hs-card :global(h3){font-size:16px;font-weight:600;color:var(--fg-primary)}
        .hs-row{display:flex;align-items:center;gap:10px}
        .hs-rank{width:24px;height:24px;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--font-mono);font-size:11px;font-weight:700;flex-shrink:0}
        .hs-rank-txt{width:24px;text-align:center;color:var(--fg-muted);font-family:var(--font-mono);font-size:14px;flex-shrink:0}
        .hs-name{width:100px;flex-shrink:0;font-size:14px;font-weight:500;color:var(--fg-primary)}
        .hs-track{flex:1;height:8px;background:var(--border-light);border-radius:3px;overflow:hidden}
        .hs-fill{height:100%;border-radius:3px}
        .hs-val{font-family:var(--font-mono);font-size:14px;width:42px;text-align:right}
      `}</style>
    </>
  );
}
