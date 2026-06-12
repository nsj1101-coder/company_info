'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type PointView = {
  id: number;
  date: string;
  bizName: string;
  type: 'earn' | 'use';
  typeLabel: string;
  amount: string;
  orderNo: string;
  balance: string;
  memo: string;
  bizId: number;
};

export type BizOption = {
  id: number;
  name: string;
  balance: number;
};

type ModalId = 'unsavedModal' | 'logoutModal' | 'deleteModal' | 'successModal' | 'errorModal';

const styles = `
.sidebar-user .su-av{width:36px;height:36px;border-radius:50%;background:var(--fg-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;flex-shrink:0}
.su-name-row{display:flex;align-items:center;gap:6px}
.su-name{font-size:13px;font-weight:600;color:var(--fg-primary)}
.su-tag{background:var(--accent-light);color:var(--accent);font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px}
.su-mail{font-size:12px;color:var(--fg-muted);margin-top:2px}
.pt-grid{display:flex;flex-direction:column;gap:16px;padding:16px 24px 0}
.tier{display:flex;gap:16px}
.stat-c{flex:1;min-width:0;border-radius:var(--radius-lg);padding:16px 20px;display:flex;align-items:center;gap:14px}
.stat-c .s-ic{width:40px;height:40px;border-radius:9999px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.stat-c .s-val{font-family:var(--font-mono);font-size:22px;font-weight:700;color:var(--fg-primary)}
.stat-c .s-chg{font-size:14px;font-weight:500;margin-left:8px}
.stat-c .s-lbl{font-size:14px;color:var(--fg-muted);margin-top:2px}
.filter-bar{display:flex;gap:10px;align-items:center;padding:0 24px;flex-wrap:wrap}
.filter-bar .f-sel{height:38px;padding:0 32px 0 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-card);font-size:14px;color:var(--fg-primary);appearance:none;cursor:pointer}
.filter-bar .f-date{display:flex;align-items:center;gap:6px;padding:0 12px;height:38px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;color:var(--fg-secondary);font-family:var(--font-mono)}
.filter-bar .f-date i{color:var(--fg-muted);font-size:14px}
.filter-bar .f-date input{border:none;outline:none;background:transparent;font:inherit;color:var(--fg-secondary);padding:0;width:120px}
.filter-bar .f-date .dash{color:var(--fg-muted)}
.filter-bar .f-search{flex:1;min-width:180px;display:flex;align-items:center;gap:8px;height:38px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-card)}
.filter-bar .f-search i{color:var(--fg-muted);font-size:16px}
.filter-bar .f-search input{flex:1;border:none;outline:none;background:transparent;font-size:14px;color:var(--fg-primary)}
.table-wrap{flex:1;min-width:0;background:var(--bg-card);display:flex;flex-direction:column;margin:0 24px 24px;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
.info-bar{display:flex;align-items:center;justify-content:space-between;padding:10px 20px;border-bottom:1px solid var(--border-light)}
.info-bar .info-txt{font-size:14px;color:var(--fg-muted)}
.sort-frame{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-card);font-size:14px;font-weight:500;color:var(--fg-secondary);cursor:pointer}
.sort-frame i{font-size:14px}
.ag-table-scroll{flex:1;overflow-y:auto}
.ag-table{width:100%;border-collapse:collapse;table-layout:fixed}
.ag-table thead th{background:var(--bg-secondary);height:44px;padding:0 0 0 12px;font-size:14px;font-weight:600;color:var(--fg-muted);text-align:left;border-bottom:1px solid var(--border-light);white-space:nowrap}
.ag-table thead th:first-child{padding-left:24px}
.ag-table thead th:last-child{padding-right:24px}
.ag-table tbody td{height:52px;padding:0 0 0 12px;font-size:14px;color:var(--fg-primary);border-bottom:1px solid var(--border-light);vertical-align:middle}
.ag-table tbody td:first-child{padding-left:24px}
.ag-table tbody td:last-child{padding-right:24px}
.ag-date{font-family:var(--font-mono);color:var(--fg-muted)}
.ag-name{font-weight:500}
.ag-badge{display:inline-flex;align-items:center;padding:4px 10px;border-radius:9999px;font-size:14px;font-weight:500}
.ag-badge.earn{background:var(--accent-light);color:var(--accent)}
.ag-badge.use{background:#FFEBEE;color:var(--danger)}
.ag-num{font-family:var(--font-mono);font-weight:600}
.ag-num.earn{color:var(--accent)}
.ag-num.use{color:var(--danger)}
.ag-num.bal{color:var(--fg-primary);font-weight:500}
.ag-order{font-family:var(--font-mono);font-size:13px;color:var(--fg-secondary)}
.ag-memo{color:var(--fg-secondary)}
.ag-pag{display:flex;align-items:center;justify-content:center;position:relative;height:48px;padding:0 24px;border-top:1px solid var(--border-light);flex-shrink:0}
.ag-pag .pag-info{position:absolute;left:24px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--fg-muted)}
.ag-pag .pag-btns{display:flex;align-items:center;gap:4px}
.ag-pag .pb{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:var(--radius-sm);font-size:14px;color:var(--fg-secondary);border:none;background:none;cursor:pointer}
.ag-pag .pb.bd{border:1px solid var(--border)}
.ag-pag .pb.active{background:var(--accent);color:#fff;font-weight:600}
.ag-pag .pb i{font-size:16px;color:var(--fg-muted)}
`;

type Props = {
  points: PointView[];
  role: 'admin' | 'biz';
  bizName?: string;
  bizOptions: BizOption[];
};

export default function PointsClient({ points, role, bizName, bizOptions }: Props) {
  const router = useRouter();
  const [openModals, setOpenModals] = useState<Record<ModalId, boolean>>({
    unsavedModal: false,
    logoutModal: false,
    deleteModal: false,
    successModal: false,
    errorModal: false,
  });
  const [formBizId, setFormBizId] = useState<string>('');
  const [formType, setFormType] = useState<'earn' | 'use'>('earn');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formMemo, setFormMemo] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const submit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    const bizId = Number(formBizId);
    const amount = Number(formAmount);
    if (!Number.isInteger(bizId) || bizId <= 0 || !Number.isFinite(amount) || amount <= 0) {
      setError('사업자와 금액을 정확히 입력하세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/cozycare/api/points', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bizId, type: formType, amount, memo: formMemo || null }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? '실패했습니다.');
        return;
      }
      setFormAmount('');
      setFormMemo('');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = (id: ModalId): void => {
    setOpenModals((prev) => ({ ...prev, [id]: false }));
  };

  const doLogout = (): void => closeModal('logoutModal');

  const earnTotal = points
    .filter((p) => p.type === 'earn')
    .reduce((sum, p) => sum + Math.abs(parseInt(p.amount.replace(/[^0-9]/g, ''), 10) || 0), 0);
  const useTotal = points
    .filter((p) => p.type === 'use')
    .reduce((sum, p) => sum + Math.abs(parseInt(p.amount.replace(/[^0-9]/g, ''), 10) || 0), 0);

  const fmtP = (n: number): string => `${n.toLocaleString('ko-KR')}P`;

  const uniqueBizNames = Array.from(new Set(points.map((p) => p.bizName)));

  return (
    <>
      <style>{styles}</style>

      <div className="top-bar">
        <div className="top-bar-left">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            포인트 이력
            {role === 'biz' && (
              <span style={{ background: '#DCFCE7', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                {bizName ?? '사업자'} 전용 뷰
              </span>
            )}
          </h1>
          <p>
            {role === 'biz'
              ? '본인 적립·사용 내역만 표시됩니다.'
              : '사업자 적립·사용 내역 통합 관리'}
          </p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon"></i><input type="text" placeholder="사업자·주문번호 검색.." /></div>
        </div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="pt-grid">
          <div className="tier">
            <div className="stat-c" style={{ background: '#EEFBF0', border: '1px solid #C8F0CE' }}>
              <div className="s-ic"><i className="icon-coins" style={{ color: 'var(--accent)', fontSize: '18px' }}></i></div>
              <div><div><span className="s-val">{fmtP(earnTotal)}</span></div><div className="s-lbl">누적 적립</div></div>
            </div>
            <div className="stat-c" style={{ background: '#F4FBE8', border: '1px solid #D8EFB8' }}>
              <div className="s-ic"><i className="icon-trending-up" style={{ color: 'var(--accent)', fontSize: '18px' }}></i></div>
              <div><div><span className="s-val">{fmtP(earnTotal)}</span><span className="s-chg" style={{ color: 'var(--success)' }}>↑이번 달</span></div><div className="s-lbl">이번 달 적립</div></div>
            </div>
            <div className="stat-c" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
              <div className="s-ic"><i className="icon-trending-down" style={{ color: '#ef4444', fontSize: '18px' }}></i></div>
              <div><div><span className="s-val">{fmtP(useTotal)}</span><span className="s-chg" style={{ color: '#ef4444' }}>사용</span></div><div className="s-lbl">이번 달 사용</div></div>
            </div>
            <div className="stat-c" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
              <div className="s-ic"><i className="icon-wallet" style={{ color: '#4B5563', fontSize: '18px' }}></i></div>
              <div><div><span className="s-val">{fmtP(Math.max(earnTotal - useTotal, 0))}</span></div><div className="s-lbl">잔여 포인트</div></div>
            </div>
          </div>

          <div className="filter-bar">
            <label className="f-date"><i className="icon-calendar"></i><input type="date" defaultValue="2026-06-01" /><span className="dash">—</span><input type="date" defaultValue="2026-06-09" /></label>
            {role === 'admin' && (
              <select className="f-sel" defaultValue="전체 사업자">
                <option>전체 사업자</option>
                {uniqueBizNames.map((n) => <option key={n}>{n}</option>)}
              </select>
            )}
            <select className="f-sel" defaultValue="전체 구분">
              <option>전체 구분</option>
              <option>적립</option>
              <option>사용</option>
            </select>
            <div className="f-search"><i className="icon-search"></i><input type="text" placeholder="사업자명·주문번호 검색" /></div>
          </div>

          {role === 'admin' && (
            <form
              onSubmit={submit}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: '12px 24px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                margin: '0 24px',
                flexWrap: 'wrap',
              }}
            >
              <select
                className="f-sel"
                value={formBizId}
                onChange={(e) => setFormBizId(e.target.value)}
                required
              >
                <option value="">사업자 선택</option>
                {bizOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.balance.toLocaleString('ko-KR')}P)
                  </option>
                ))}
              </select>
              <select
                className="f-sel"
                value={formType}
                onChange={(e) => setFormType(e.target.value === 'use' ? 'use' : 'earn')}
              >
                <option value="earn">적립</option>
                <option value="use">사용</option>
              </select>
              <input
                type="number"
                min={1}
                step={1}
                placeholder="금액"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                style={{ height: 38, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 6, width: 140 }}
                required
              />
              <input
                type="text"
                placeholder="메모"
                value={formMemo}
                onChange={(e) => setFormMemo(e.target.value)}
                style={{ height: 38, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 6, flex: 1, minWidth: 140 }}
              />
              <button type="submit" className="btn btn-dark" disabled={submitting}>
                {submitting ? '처리중...' : '기록'}
              </button>
              {error && <span style={{ color: '#ef4444', fontSize: 13 }}>{error}</span>}
            </form>
          )}
        </div>

        <div className="table-wrap">
          <div className="info-bar">
            <span className="info-txt">총 {points.length}건</span>
            <button className="sort-frame"><i className="icon-arrow-up-down"></i>최신순</button>
          </div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup>
                <col style={{ width: '160px' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '90px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '170px' }} />
                <col style={{ width: '110px' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>일시</th>
                  <th>사업자명</th>
                  <th>구분</th>
                  <th>금액</th>
                  <th>관련 주문</th>
                  <th>잔액</th>
                  <th>메모</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p, idx) => (
                  <tr key={`${p.orderNo}-${idx}`}>
                    <td className="ag-date">{p.date}</td>
                    <td className="ag-name">{p.bizName}</td>
                    <td><span className={`ag-badge ${p.type}`}>{p.typeLabel}</span></td>
                    <td className={`ag-num ${p.type}`}>{p.amount}</td>
                    <td className="ag-order">{p.orderNo}</td>
                    <td className="ag-num bal">{p.balance}</td>
                    <td className="ag-memo">{p.memo}</td>
                  </tr>
                ))}
                {points.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--fg-muted)' }}>
                      표시할 포인트 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="ag-pag">
            <span className="pag-info">1-{points.length} / {points.length}</span>
            <div className="pag-btns">
              <button className="pb bd"><i className="icon-chevron-left"></i></button>
              <button className="pb active">1</button>
              <button className="pb bd"><i className="icon-chevron-right"></i></button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="logoutModal" style={{ display: openModals.logoutModal ? 'flex' : 'none' }}>
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
    </>
  );
}
