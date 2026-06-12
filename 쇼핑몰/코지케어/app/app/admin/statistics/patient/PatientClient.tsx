'use client';

import Link from 'next/link';
import { MouseEvent, useState } from 'react';

type ModalId =
  | 'unsavedModal'
  | 'logoutModal'
  | 'deleteModal'
  | 'successModal'
  | 'errorModal'
  | null;

type RangeKey = 'today' | '7d' | '30d' | '1y';
type MetricKey = 'signup' | 'bizType' | 'region' | 'aov' | 'repurchase';

export type BizTypeRow = { name: string; count: number; percent: number; width: number; color: string };
export type RegionRow = { name: string; count: number; percent: number; width: number; color: string };
export type Trend = { text: string; up: boolean };

export type PatientData = {
  newMembers7Text: string;
  newMembers30Text: string;
  activeMembersText: string;
  bizRatioText: string;
  avgOrderText: string;
  repurchaseText: string;
  avgPointText: string;
  churnText: string;
  newMembers7Trend: Trend;
  newMembers30Trend: Trend;
  bizTypes: BizTypeRow[];
  regions: RegionRow[];
};

const pageStyles = `
.sidebar-user .su-av{width:36px;height:36px;border-radius:50%;background:var(--fg-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;flex-shrink:0}
.su-name-row{display:flex;align-items:center;gap:6px}
.su-name{font-size:13px;font-weight:600;color:var(--fg-primary)}
.su-tag{background:var(--accent-light);color:var(--accent);font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px}
.su-mail{font-size:12px;color:var(--fg-muted);margin-top:2px}

.stats-body{display:flex;flex:1;min-height:0;overflow:hidden}

.f-panel{width:240px;flex-shrink:0;background:var(--bg-card);border-right:1px solid var(--border);padding:20px;display:flex;flex-direction:column;gap:20px;overflow-y:auto}
.f-panel .btn-dl{width:100%;background:#111827;color:#fff;border-radius:var(--radius-sm);padding:12px 20px;display:flex;align-items:center;justify-content:center;gap:8px;border:none;font-size:14px;font-weight:600;cursor:pointer}
.f-sec{display:flex;flex-direction:column;gap:10px}
.f-sec-lbl{font-size:14px;font-weight:600;color:var(--fg-muted)}
.f-date{display:flex;align-items:center;gap:6px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--fg-secondary);font-size:13px;font-family:var(--font-mono)}
.f-date i{color:var(--fg-muted);font-size:14px;flex-shrink:0}
.f-date input[type="month"]{border:none;outline:none;background:transparent;font:inherit;color:var(--fg-secondary);padding:0;width:100%;min-width:0}
.f-date .dash{color:var(--fg-muted)}
.f-mk{display:flex;align-items:center;gap:8px;height:24px;font-size:14px;color:var(--fg-primary);cursor:pointer}
.f-mk .mk-box{width:16px;height:16px;border-radius:3px;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.f-mk.on .mk-box{background:var(--accent);border-color:var(--accent);color:#fff}
.f-mk.on .mk-box::after{content:'';width:8px;height:4px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg) translateY(-1px)}

.main-area{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
.tab-row{display:flex;height:44px;background:var(--bg-card);border-bottom:1px solid var(--border);flex-shrink:0}
.st-tab{padding:0 24px;display:flex;align-items:center;font-size:14px;color:var(--fg-muted);cursor:pointer;text-decoration:none}
.st-tab.active{color:var(--accent);font-weight:600;box-shadow:inset 0 -2px 0 var(--accent)}

.content{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px}
.pt-top-row{display:flex;gap:16px;flex:1;min-height:0}
.chart-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;display:flex;flex-direction:column;gap:12px}
.chart-card h3{font-size:16px;font-weight:600;color:var(--fg-primary)}

.funnel-card{flex:1;min-width:0;height:260px}
.fn-body{flex:1;display:flex;flex-direction:column;gap:10px;justify-content:center}
.fn-row{display:flex;align-items:center;gap:10px}
.fn-row .fl{width:40px;flex-shrink:0;font-size:14px;color:var(--fg-secondary)}
.fn-row .ft{flex:1;height:22px;background:var(--border-light);border-radius:4px;overflow:hidden}
.fn-row .ff{height:100%;border-radius:4px}
.fn-row .fv{width:80px;text-align:right;font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--fg-primary)}

.agency-card{flex:1;min-width:0}
.ag-row{display:flex;flex-direction:column;gap:6px}
.ag-head{display:flex;justify-content:space-between;align-items:center}
.ag-name{font-size:14px;font-weight:500;color:var(--fg-primary)}
.ag-val{font-family:var(--font-mono);font-size:11px;color:var(--fg-muted)}
.ag-bar{width:100%;height:6px;background:var(--border-light);border-radius:3px;overflow:hidden}
.ag-fill{height:100%;border-radius:3px}
`;

type Props = { data: PatientData };

export default function PatientClient({ data }: Props) {
  const [openModalId, setOpenModalId] = useState<ModalId>(null);
  const [ranges, setRanges] = useState<Record<RangeKey, boolean>>({
    today: false,
    '7d': true,
    '30d': true,
    '1y': false,
  });
  const [metrics, setMetrics] = useState<Record<MetricKey, boolean>>({
    signup: true,
    bizType: true,
    region: true,
    aov: false,
    repurchase: false,
  });

  const closeModal = (_id: Exclude<ModalId, null>): void => {
    setOpenModalId(null);
  };

  const doLogout = (): void => {
    setOpenModalId(null);
  };

  const stop = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
  };

  const toggleRange = (key: RangeKey): void => {
    setRanges((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleMetric = (key: MetricKey): void => {
    setMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="top-bar">
        <div className="top-bar-left">
          <h1>회원 통계</h1>
          <p>회원 가입·활동·구매 분석</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon"></i><input type="text" placeholder="회원명, 사업자명 검색..." /></div>
          <div className="bell-wrapper">
            <button className="bell-btn"><i className="icon-bell" style={{ color: '#4B5563', fontSize: 18 }}></i><span className="bell-dot"></span></button>
            <div className="noti-dropdown">
              <div className="noti-header"><span className="noti-title">알림</span><span className="noti-read-all">모두 읽음</span></div>
              <div className="noti-item unread"><div className="noti-dot" style={{ background: '#84c140' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#EEF7E2', color: '#5a9229' }}>사업자 승인 대기</span><span className="noti-time">10분 전</span><div className="noti-text">신규 복지용구사업소 가입 요청 3건</div></div></div>
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
            <div className={`f-mk${ranges.today ? ' on' : ''}`} onClick={() => toggleRange('today')}><span className="mk-box"></span>오늘</div>
            <div className={`f-mk${ranges['7d'] ? ' on' : ''}`} onClick={() => toggleRange('7d')}><span className="mk-box"></span>최근 7일</div>
            <div className={`f-mk${ranges['30d'] ? ' on' : ''}`} onClick={() => toggleRange('30d')}><span className="mk-box"></span>최근 30일</div>
            <div className={`f-mk${ranges['1y'] ? ' on' : ''}`} onClick={() => toggleRange('1y')}><span className="mk-box"></span>최근 1년</div>
            <label className="f-date"><i className="icon-calendar"></i><input type="month" defaultValue="2026-01" /><span className="dash">—</span><input type="month" defaultValue="2026-04" /></label>
          </div>
          <div className="f-sec">
            <div className="f-sec-lbl">지표 선택</div>
            <div className={`f-mk${metrics.signup ? ' on' : ''}`} onClick={() => toggleMetric('signup')}><span className="mk-box"></span>신규 가입 추이</div>
            <div className={`f-mk${metrics.bizType ? ' on' : ''}`} onClick={() => toggleMetric('bizType')}><span className="mk-box"></span>사업자 유형 분포</div>
            <div className={`f-mk${metrics.region ? ' on' : ''}`} onClick={() => toggleMetric('region')}><span className="mk-box"></span>지역별 분포</div>
            <div className={`f-mk${metrics.aov ? ' on' : ''}`} onClick={() => toggleMetric('aov')}><span className="mk-box"></span>객단가</div>
            <div className={`f-mk${metrics.repurchase ? ' on' : ''}`} onClick={() => toggleMetric('repurchase')}><span className="mk-box"></span>재구매율</div>
          </div>
        </aside>

        <div className="main-area">
          <div className="tab-row">
            <Link href="/admin/statistics" className="st-tab">매출 통계</Link>
            <div className="st-tab active">회원 통계</div>
            <Link href="/admin/statistics/revenue" className="st-tab">매출/정산</Link>
            <Link href="/admin/statistics/operations" className="st-tab">운영 통계</Link>
          </div>

          <div className="content">
            <div className="top-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              <div className="stat-card"><div className="stat-label">신규 회원 (7일)</div><div className="stat-value">{data.newMembers7Text}</div><div className={data.newMembers7Trend.up ? 'stat-trend up' : 'stat-trend'}>{data.newMembers7Trend.text}</div></div>
              <div className="stat-card"><div className="stat-label">신규 회원 (30일)</div><div className="stat-value">{data.newMembers30Text}</div><div className={data.newMembers30Trend.up ? 'stat-trend up' : 'stat-trend'}>{data.newMembers30Trend.text}</div></div>
              <div className="stat-card"><div className="stat-label">활성 회원</div><div className="stat-value">{data.activeMembersText}</div><div className="stat-trend up">+6.1%</div></div>
              <div className="stat-card"><div className="stat-label">사업자 비율</div><div className="stat-value">{data.bizRatioText}</div><div className="stat-trend up">+1.8%p</div></div>
              <div className="stat-card"><div className="stat-label">평균 객단가</div><div className="stat-value">{data.avgOrderText}</div><div className="stat-trend up">+5.4%</div></div>
              <div className="stat-card"><div className="stat-label">재구매율</div><div className="stat-value">{data.repurchaseText}</div><div className="stat-trend">-0.2%p</div></div>
              <div className="stat-card"><div className="stat-label">평균 보유 포인트</div><div className="stat-value">{data.avgPointText}</div><div className="stat-trend up">+3.1%</div></div>
              <div className="stat-card"><div className="stat-label">탈퇴율</div><div className="stat-value">{data.churnText}</div><div className="stat-trend up">-0.1%p</div></div>
            </div>

            <div className="pt-top-row">
              <div className="chart-card funnel-card">
                <h3>사업자 유형 분포</h3>
                <div className="fn-body">
                  {data.bizTypes.map((b, i) => (
                    <div className="fn-row" key={i}><span className="fl">{b.name}</span><div className="ft"><div className="ff" style={{ width: `${b.width}%`, background: b.color }}></div></div><span className="fv">{b.count} ({b.percent}%)</span></div>
                  ))}
                </div>
              </div>

              <div className="chart-card agency-card">
                <h3>지역별 회원 분포</h3>
                {data.regions.map((r, i) => (
                  <div className="ag-row" key={i}>
                    <div className="ag-head"><span className="ag-name">{r.name}</span><span className="ag-val">{r.count}명 · {r.percent}%</span></div>
                    <div className="ag-bar"><div className="ag-fill" style={{ width: `${r.width}%`, background: r.color }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`modal-overlay${openModalId === 'unsavedModal' ? ' active' : ''}`}
        id="unsavedModal"
        style={{ display: openModalId === 'unsavedModal' ? 'flex' : 'none' }}
        onClick={() => closeModal('unsavedModal')}
      >
        <div className="modal-content" style={{ width: 400 }} onClick={stop}>
          <div className="modal-icon" style={{ background: '#FFF8EE' }}><i className="icon-alert-triangle" style={{ color: '#FF9500', fontSize: 24 }}></i></div>
          <div className="modal-title">저장하지 않은 변경사항이 있습니다</div>
          <div className="modal-desc">이 페이지를 떠나면 변경사항이 사라집니다.<br />정말 나가시겠습니까?</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('unsavedModal')}>나가기</button>
            <button className="btn btn-dark" onClick={() => closeModal('unsavedModal')}>저장 후 나가기</button>
          </div>
        </div>
      </div>

      <div
        className={`modal-overlay${openModalId === 'logoutModal' ? ' active' : ''}`}
        id="logoutModal"
        style={{ display: openModalId === 'logoutModal' ? 'flex' : 'none' }}
        onClick={() => closeModal('logoutModal')}
      >
        <div className="modal-content" style={{ width: 400 }} onClick={stop}>
          <div className="modal-icon" style={{ background: '#F3F4F6' }}><i className="icon-log-out" style={{ color: '#4B5563', fontSize: 24 }}></i></div>
          <div className="modal-title">로그아웃 하시겠습니까?</div>
          <div className="modal-desc">다시 로그인이 필요합니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('logoutModal')}>취소</button>
            <button className="btn btn-dark" onClick={doLogout}>로그아웃</button>
          </div>
        </div>
      </div>

      <div
        className={`modal-overlay${openModalId === 'deleteModal' ? ' active' : ''}`}
        id="deleteModal"
        style={{ display: openModalId === 'deleteModal' ? 'flex' : 'none' }}
        onClick={() => closeModal('deleteModal')}
      >
        <div className="modal-content" style={{ width: 400 }} onClick={stop}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}><i className="icon-trash-2" style={{ color: '#FF3B30', fontSize: 24 }}></i></div>
          <div className="modal-title">정말 삭제하시겠습니까?</div>
          <div className="modal-desc">삭제된 데이터는 복구할 수 없습니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('deleteModal')}>취소</button>
            <button className="btn btn-danger" onClick={() => closeModal('deleteModal')}>삭제</button>
          </div>
        </div>
      </div>

      <div
        className={`modal-overlay${openModalId === 'successModal' ? ' active' : ''}`}
        id="successModal"
        style={{ display: openModalId === 'successModal' ? 'flex' : 'none' }}
        onClick={() => closeModal('successModal')}
      >
        <div className="modal-content" style={{ width: 400 }} onClick={stop}>
          <div className="modal-icon" style={{ background: '#EEFBF0' }}><i className="icon-check-circle" style={{ color: '#34C759', fontSize: 24 }}></i></div>
          <div className="modal-title">등록이 완료되었습니다</div>
          <div className="modal-desc">목록 페이지로 이동하거나 상세보기 할 수 있습니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('successModal')}>목록으로</button>
            <button className="btn btn-primary" onClick={() => closeModal('successModal')}>상세보기</button>
          </div>
        </div>
      </div>

      <div
        className={`modal-overlay${openModalId === 'errorModal' ? ' active' : ''}`}
        id="errorModal"
        style={{ display: openModalId === 'errorModal' ? 'flex' : 'none' }}
        onClick={() => closeModal('errorModal')}
      >
        <div className="modal-content" style={{ width: 400 }} onClick={stop}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}><i className="icon-alert-circle" style={{ color: '#FF3B30', fontSize: 24 }}></i></div>
          <div className="modal-title">일시적인 오류가 발생했습니다</div>
          <div className="modal-desc">서비스 이용 중 오류가 발생했습니다.<br />잠시 후 다시 시도해주세요.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('errorModal')}>닫기</button>
            <button className="btn btn-danger" onClick={() => closeModal('errorModal')}>다시 시도</button>
          </div>
        </div>
      </div>
    </>
  );
}
