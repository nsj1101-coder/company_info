'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIST_STYLES } from '@/components/admin/listStyles';

export type BizOpt = { id: number; name: string; bizNo: string };
export type TaxView = {
  id: number;
  date: string;
  company: string;
  bizNo: string;
  period: string;
  itemName: string;
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  ntsNo: string;
  issuedAt: string;
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  requested: { label: '발행대기', cls: 'st-amber' },
  issued: { label: '발행완료', cls: 'st-green' },
  cancelled: { label: '취소', cls: 'st-gray' },
};

function won(n: number): string { return `${n.toLocaleString('ko-KR')}원`; }

export default function TaxInvoicesClient({ rows, bizOpts }: { rows: TaxView[]; bizOpts: BizOpt[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('전체');
  const [open, setOpen] = useState(false);
  const [bizId, setBizId] = useState('');
  const [period, setPeriod] = useState('');
  const [itemName, setItemName] = useState('');
  const [supply, setSupply] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const filtered = useMemo(() => rows.filter((t) => statusFilter === '전체' || STATUS_META[t.status]?.label === statusFilter), [rows, statusFilter]);
  const supplyNum = Number(supply) || 0;
  const taxNum = Math.round(supplyNum * 0.1);

  const issuedTotal = rows.filter((t) => t.status === 'issued').reduce((s, t) => s + t.totalAmount, 0);
  const pending = rows.filter((t) => t.status === 'requested').length;

  const create = async (): Promise<void> => {
    setErr('');
    if (!bizId || supplyNum <= 0) { setErr('사업자와 공급가액을 입력하세요.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/cozycare/api/tax-invoices', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bizId: Number(bizId), period, itemName, supplyAmount: supplyNum }),
      });
      if (!res.ok) { const j = (await res.json().catch(() => ({}))) as { error?: string }; setErr(j.error ?? '실패'); return; }
      setOpen(false); setBizId(''); setPeriod(''); setItemName(''); setSupply('');
      router.refresh();
    } finally { setSaving(false); }
  };

  const setStatus = async (id: number, status: string): Promise<void> => {
    await fetch(`/cozycare/api/tax-invoices/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
    router.refresh();
  };

  return (
    <>
      <style>{LIST_STYLES}</style>
      <div className="top-bar">
        <div className="top-bar-left"><h1>세금계산서</h1><p>사업자 거래 세금계산서 발행·관리</p></div>
        <div className="top-bar-right"><button className="btn btn-dark" onClick={() => { setErr(''); setOpen(true); }}>+ 계산서 발행</button></div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="lp-grid">
          <div className="tier">
            <div className="stat-c" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
              <div className="s-ic"><i className="icon-file-text" style={{ color: '#b45309' }} /></div>
              <div><span className="s-val">{pending}</span><div className="s-lbl">발행 대기</div></div>
            </div>
            <div className="stat-c" style={{ background: '#EEFBF0', border: '1px solid #C8F0CE' }}>
              <div className="s-ic"><i className="icon-banknote" style={{ color: '#16a34a' }} /></div>
              <div><span className="s-val" style={{ fontSize: 18 }}>{won(issuedTotal)}</span><div className="s-lbl">발행 합계</div></div>
            </div>
            <div className="stat-c" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
              <div className="s-ic"><i className="icon-receipt" style={{ color: '#4B5563' }} /></div>
              <div><span className="s-val">{rows.length}</span><div className="s-lbl">전체 발행</div></div>
            </div>
          </div>
          <div className="filter-bar">
            <select className="f-sel" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>전체</option><option>발행대기</option><option>발행완료</option><option>취소</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">총 {filtered.length}건</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col style={{ width: '100px' }} /><col style={{ width: '18%' }} /><col style={{ width: '110px' }} /><col /><col style={{ width: '120px' }} /><col style={{ width: '100px' }} /><col style={{ width: '150px' }} /></colgroup>
              <thead><tr><th>요청일</th><th>사업자</th><th>기간</th><th>품목</th><th>합계(공급+세액)</th><th>상태</th><th>처리</th></tr></thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td className="ag-date">{t.date}</td>
                    <td className="ag-name ag-clip">{t.company}<div className="ag-muted" style={{ fontSize: 12 }}>{t.bizNo}</div></td>
                    <td className="ag-muted">{t.period || '-'}</td>
                    <td className="ag-clip">{t.itemName || '-'}</td>
                    <td className="ag-num">{won(t.totalAmount)}<div className="ag-muted" style={{ fontSize: 12 }}>공급 {won(t.supplyAmount)}</div></td>
                    <td><span className={`st-badge ${STATUS_META[t.status]?.cls ?? 'st-gray'}`}>{STATUS_META[t.status]?.label ?? t.status}</span></td>
                    <td><div className="row-actions">
                      {t.status === 'requested' && <button className="btn-sm green" onClick={() => setStatus(t.id, 'issued')}>발행</button>}
                      {t.status !== 'cancelled' && <button className="btn-sm red" onClick={() => setStatus(t.id, 'cancelled')}>취소</button>}
                    </div></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="empty-row">발행 내역이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="ag-pag"><span className="pag-info">총 {filtered.length}건</span></div>
        </div>
      </div>

      {open && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content modal-wide">
            <div className="modal-title" style={{ textAlign: 'left' }}>세금계산서 발행</div>
            <div className="mform" style={{ marginTop: 12 }}>
              <div className="fld"><label>공급받는자 (사업자)</label>
                <select value={bizId} onChange={(e) => setBizId(e.target.value)}>
                  <option value="">사업자 선택</option>
                  {bizOpts.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.bizNo})</option>)}
                </select>
              </div>
              <div className="row2">
                <div className="fld"><label>작성 기간</label><input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2026-06" /></div>
                <div className="fld"><label>품목</label><input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="복지용구 외" /></div>
              </div>
              <div className="fld"><label>공급가액</label><input type="number" value={supply} onChange={(e) => setSupply(e.target.value)} placeholder="0" /></div>
              <div className="dt-list">
                <div className="dt-row"><span className="k">세액 (10%)</span><span className="v">{won(taxNum)}</span></div>
                <div className="dt-row" style={{ borderBottom: 'none' }}><span className="k">합계</span><span className="v" style={{ fontWeight: 700 }}>{won(supplyNum + taxNum)}</span></div>
              </div>
              {err && <span style={{ color: '#ef4444', fontSize: 13 }}>{err}</span>}
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>취소</button>
              <button className="btn btn-dark" onClick={create} disabled={saving}>{saving ? '처리중...' : '발행 등록'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
