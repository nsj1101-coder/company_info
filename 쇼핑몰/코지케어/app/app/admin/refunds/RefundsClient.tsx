'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIST_STYLES } from '@/components/admin/listStyles';

export type RefundView = {
  id: number;
  date: string;
  orderNo: string;
  buyer: string;
  phone: string;
  goods: string;
  amount: number;
  cause: string;
  reason: string;
  refundMethod: string;
  bankInfo: string;
  memo: string;
  reviewer: string;
  status: string;
  processedAt: string;
  isWelfare: boolean;
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  requested: { label: '접수', cls: 'st-amber' },
  approved: { label: '승인', cls: 'st-blue' },
  done: { label: '환불완료', cls: 'st-green' },
  rejected: { label: '반려', cls: 'st-red' },
};

const CAUSE_OPTIONS = ['공단 확인 불가', '단순 변심', '상품 불량/파손', '오배송', '서류 미비', '기타'];
const METHOD_OPTIONS = ['카드 취소', '계좌 환불', '간편결제 취소'];

function won(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}

export default function RefundsClient({ rows }: { rows: RefundView[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('전체');
  const [keyword, setKeyword] = useState<string>('');
  const [edit, setEdit] = useState<RefundView | null>(null);
  const [form, setForm] = useState<{ status: string; cause: string; refundMethod: string; bankInfo: string; reviewer: string; memo: string }>({
    status: 'requested', cause: '', refundMethod: '', bankInfo: '', reviewer: '', memo: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== '전체' && STATUS_META[r.status]?.label !== statusFilter) return false;
      if (keyword) {
        const k = keyword.toLowerCase();
        if (!`${r.orderNo} ${r.buyer} ${r.goods}`.toLowerCase().includes(k)) return false;
      }
      return true;
    });
  }, [rows, statusFilter, keyword]);

  const counts = useMemo(() => ({
    requested: rows.filter((r) => r.status === 'requested').length,
    welfare: rows.filter((r) => r.isWelfare).length,
    amount: rows.filter((r) => r.status === 'done').reduce((s, r) => s + r.amount, 0),
    total: rows.length,
  }), [rows]);

  const openEdit = (r: RefundView): void => {
    setErr('');
    setEdit(r);
    setForm({
      status: r.status,
      cause: r.cause,
      refundMethod: r.refundMethod,
      bankInfo: r.bankInfo,
      reviewer: r.reviewer,
      memo: r.memo,
    });
  };

  const save = async (): Promise<void> => {
    if (!edit) return;
    setSaving(true);
    setErr('');
    try {
      const res = await fetch(`/cozycare/api/refunds/${edit.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(j.error ?? '저장 실패');
        return;
      }
      setEdit(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{LIST_STYLES}</style>

      <div className="top-bar">
        <div className="top-bar-left">
          <h1>환불 관리</h1>
          <p>공단 확인 불가·고객 요청 환불 접수 및 처리</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon" /><input type="text" placeholder="주문번호·구매자 검색.." value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div>
        </div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="lp-grid">
          <div className="tier">
            <div className="stat-c" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
              <div className="s-ic"><i className="icon-clock" style={{ color: '#b45309' }} /></div>
              <div><span className="s-val">{counts.requested}</span><div className="s-lbl">접수 대기</div></div>
            </div>
            <div className="stat-c" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
              <div className="s-ic"><i className="icon-shield-alert" style={{ color: '#dc2626' }} /></div>
              <div><span className="s-val">{counts.welfare}</span><div className="s-lbl">복지용구 환불</div></div>
            </div>
            <div className="stat-c" style={{ background: '#EEFBF0', border: '1px solid #C8F0CE' }}>
              <div className="s-ic"><i className="icon-banknote" style={{ color: '#16a34a' }} /></div>
              <div><span className="s-val" style={{ fontSize: 18 }}>{won(counts.amount)}</span><div className="s-lbl">환불 완료액</div></div>
            </div>
            <div className="stat-c" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
              <div className="s-ic"><i className="icon-rotate-ccw" style={{ color: '#4B5563' }} /></div>
              <div><span className="s-val">{counts.total}</span><div className="s-lbl">전체 환불</div></div>
            </div>
          </div>

          <div className="filter-bar">
            <select className="f-sel" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>전체</option><option>접수</option><option>승인</option><option>환불완료</option><option>반려</option>
            </select>
            <div className="f-search"><i className="icon-search" /><input type="text" placeholder="주문번호·구매자·상품 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div>
          </div>
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">총 {filtered.length}건</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup>
                <col style={{ width: '140px' }} /><col style={{ width: '130px' }} /><col style={{ width: '110px' }} /><col /><col style={{ width: '110px' }} /><col style={{ width: '130px' }} /><col style={{ width: '100px' }} /><col style={{ width: '120px' }} />
              </colgroup>
              <thead>
                <tr><th>접수일</th><th>주문번호</th><th>구매자</th><th>상품</th><th>환불액</th><th>사유</th><th>상태</th><th>처리</th></tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="ag-date">{r.date}</td>
                    <td className="ag-order" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.orderNo}</td>
                    <td className="ag-name">{r.buyer}{r.isWelfare && <span className="st-badge st-red" style={{ marginLeft: 6, padding: '2px 6px', fontSize: 11 }}>복지</span>}</td>
                    <td className="ag-clip">{r.goods}</td>
                    <td className="ag-num">{won(r.amount)}</td>
                    <td className="ag-muted">{r.cause || '-'}</td>
                    <td><span className={`st-badge ${STATUS_META[r.status]?.cls ?? 'st-gray'}`}>{STATUS_META[r.status]?.label ?? r.status}</span></td>
                    <td><button className="btn-sm primary" onClick={() => openEdit(r)}>처리</button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="empty-row">환불 내역이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="ag-pag"><span className="pag-info">총 {filtered.length}건</span></div>
        </div>
      </div>

      {edit && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content modal-wide">
            <div className="modal-title" style={{ textAlign: 'left' }}>환불 처리 — {edit.orderNo}</div>
            <div className="dt-list" style={{ margin: '10px 0 16px' }}>
              <div className="dt-row"><span className="k">구매자</span><span className="v">{edit.buyer} {edit.phone}</span></div>
              <div className="dt-row"><span className="k">상품</span><span className="v">{edit.goods}</span></div>
              <div className="dt-row"><span className="k">환불 요청액</span><span className="v">{won(edit.amount)}</span></div>
            </div>
            <div className="mform">
              <div className="row2">
                <div className="fld">
                  <label>처리 상태</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="requested">접수</option><option value="approved">승인</option><option value="done">환불완료</option><option value="rejected">반려</option>
                  </select>
                </div>
                <div className="fld">
                  <label>환불 사유</label>
                  <select value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })}>
                    <option value="">선택</option>
                    {CAUSE_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="row2">
                <div className="fld">
                  <label>환불 수단</label>
                  <select value={form.refundMethod} onChange={(e) => setForm({ ...form, refundMethod: e.target.value })}>
                    <option value="">선택</option>
                    {METHOD_OPTIONS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="fld">
                  <label>담당자</label>
                  <input type="text" value={form.reviewer} onChange={(e) => setForm({ ...form, reviewer: e.target.value })} placeholder="처리 담당자" />
                </div>
              </div>
              <div className="fld">
                <label>환불 계좌 (계좌 환불 시)</label>
                <input type="text" value={form.bankInfo} onChange={(e) => setForm({ ...form, bankInfo: e.target.value })} placeholder="은행 / 계좌번호 / 예금주" />
              </div>
              <div className="fld">
                <label>메모</label>
                <textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="공단 확인 결과·처리 내용" />
              </div>
              {form.status === 'done' && <div className="st-badge st-green" style={{ alignSelf: 'flex-start' }}>저장 시 주문 상태가 &apos;환불&apos;로 변경됩니다</div>}
              {err && <span style={{ color: '#ef4444', fontSize: 13 }}>{err}</span>}
            </div>
            <div className="modal-actions" style={{ marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setEdit(null)}>취소</button>
              <button className="btn btn-dark" onClick={save} disabled={saving}>{saving ? '저장중...' : '저장'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
