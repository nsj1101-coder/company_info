'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIST_STYLES } from '@/components/admin/listStyles';

export type BizOpt = { id: number; name: string };
export type ProductOpt = { id: number; name: string; price: number };
export type QuoteItemView = { name: string; qty: number; unitPrice: number };
export type QuoteView = {
  id: number;
  quoteNo: string;
  date: string;
  company: string;
  title: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  items: QuoteItemView[];
};

type Line = { productId: number | null; productName: string; qty: number; unitPrice: number };

const STATUS_META: Record<string, { label: string; cls: string }> = {
  requested: { label: '견적요청', cls: 'st-amber' },
  quoted: { label: '견적발행', cls: 'st-blue' },
  ordered: { label: '주문전환', cls: 'st-green' },
  rejected: { label: '반려', cls: 'st-red' },
};

function won(n: number): string { return `${n.toLocaleString('ko-KR')}원`; }

export default function QuotesClient({ rows, bizOpts, productOpts }: { rows: QuoteView[]; bizOpts: BizOpt[]; productOpts: ProductOpt[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('전체');
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<QuoteView | null>(null);
  const [bizId, setBizId] = useState('');
  const [title, setTitle] = useState('');
  const [lines, setLines] = useState<Line[]>([{ productId: null, productName: '', qty: 1, unitPrice: 0 }]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const filtered = useMemo(() => rows.filter((q) => statusFilter === '전체' || STATUS_META[q.status]?.label === statusFilter), [rows, statusFilter]);
  const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);

  const setLine = (i: number, patch: Partial<Line>): void => setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const pickProduct = (i: number, pid: string): void => {
    const p = productOpts.find((x) => String(x.id) === pid);
    if (p) setLine(i, { productId: p.id, productName: p.name, unitPrice: p.price });
    else setLine(i, { productId: null });
  };

  const create = async (): Promise<void> => {
    setErr('');
    const items = lines.filter((l) => l.productName.trim() && l.qty > 0);
    if (!bizId || items.length === 0) { setErr('사업자와 품목을 입력하세요.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/cozycare/api/quotes', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bizId: Number(bizId), title, items }),
      });
      if (!res.ok) { const j = (await res.json().catch(() => ({}))) as { error?: string }; setErr(j.error ?? '실패'); return; }
      setOpen(false); setBizId(''); setTitle(''); setLines([{ productId: null, productName: '', qty: 1, unitPrice: 0 }]);
      router.refresh();
    } finally { setSaving(false); }
  };

  const setStatus = async (id: number, status: string): Promise<void> => {
    await fetch(`/cozycare/api/quotes/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
    setDetail(null);
    router.refresh();
  };

  return (
    <>
      <style>{LIST_STYLES}</style>
      <div className="top-bar">
        <div className="top-bar-left"><h1>견적 · 대량주문</h1><p>복지용구사업소 묶음 발주 견적·주문서 관리</p></div>
        <div className="top-bar-right"><button className="btn btn-dark" onClick={() => { setErr(''); setOpen(true); }}>+ 견적 작성</button></div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="lp-grid">
          <div className="filter-bar">
            <select className="f-sel" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>전체</option><option>견적요청</option><option>견적발행</option><option>주문전환</option><option>반려</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">총 {filtered.length}건</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col style={{ width: '140px' }} /><col style={{ width: '100px' }} /><col style={{ width: '18%' }} /><col /><col style={{ width: '80px' }} /><col style={{ width: '130px' }} /><col style={{ width: '100px' }} /></colgroup>
              <thead><tr><th>견적번호</th><th>요청일</th><th>사업자</th><th>제목</th><th>품목수</th><th>합계</th><th>상태</th></tr></thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(q)}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{q.quoteNo}</td>
                    <td className="ag-date">{q.date}</td>
                    <td className="ag-name ag-clip">{q.company}</td>
                    <td className="ag-clip ag-muted">{q.title || '-'}</td>
                    <td className="ag-num">{q.itemCount}</td>
                    <td className="ag-num">{won(q.totalAmount)}</td>
                    <td><span className={`st-badge ${STATUS_META[q.status]?.cls ?? 'st-gray'}`}>{STATUS_META[q.status]?.label ?? q.status}</span></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="empty-row">견적이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="ag-pag"><span className="pag-info">총 {filtered.length}건</span></div>
        </div>
      </div>

      {open && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content modal-wide" style={{ width: 640 }}>
            <div className="modal-title" style={{ textAlign: 'left' }}>견적 작성</div>
            <div className="mform" style={{ marginTop: 12 }}>
              <div className="row2">
                <div className="fld"><label>사업자</label><select value={bizId} onChange={(e) => setBizId(e.target.value)}><option value="">사업자 선택</option>{bizOpts.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                <div className="fld"><label>제목</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="6월 정기 발주" /></div>
              </div>
              <div className="fld">
                <label>품목</label>
                {lines.map((l, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <select value={l.productId ?? ''} onChange={(e) => pickProduct(i, e.target.value)} style={{ flex: 2, height: 38, border: '1px solid var(--border)', borderRadius: 6, padding: '0 8px' }}>
                      <option value="">상품 선택</option>
                      {productOpts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" value={l.qty} min={1} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} style={{ width: 70, height: 38, border: '1px solid var(--border)', borderRadius: 6, padding: '0 8px' }} />
                    <input type="number" value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: Number(e.target.value) })} style={{ width: 110, height: 38, border: '1px solid var(--border)', borderRadius: 6, padding: '0 8px' }} />
                    <button className="btn-sm red" type="button" onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}>×</button>
                  </div>
                ))}
                <button className="btn-sm" type="button" onClick={() => setLines((prev) => [...prev, { productId: null, productName: '', qty: 1, unitPrice: 0 }])}>+ 품목 추가</button>
              </div>
              <div className="dt-list"><div className="dt-row" style={{ borderBottom: 'none' }}><span className="k">합계</span><span className="v" style={{ fontWeight: 700 }}>{won(total)}</span></div></div>
              {err && <span style={{ color: '#ef4444', fontSize: 13 }}>{err}</span>}
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>취소</button>
              <button className="btn btn-dark" onClick={create} disabled={saving}>{saving ? '처리중...' : '견적 등록'}</button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content modal-wide">
            <div className="modal-title" style={{ textAlign: 'left' }}>{detail.quoteNo} — {detail.company}</div>
            <div className="dt-list" style={{ margin: '10px 0' }}>
              {detail.items.map((it, i) => (
                <div key={i} className="dt-row"><span className="k">{it.name} × {it.qty}</span><span className="v">{won(it.qty * it.unitPrice)}</span></div>
              ))}
              <div className="dt-row" style={{ borderBottom: 'none' }}><span className="k">합계</span><span className="v" style={{ fontWeight: 700 }}>{won(detail.totalAmount)}</span></div>
            </div>
            <div className="modal-actions" style={{ marginTop: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => setDetail(null)}>닫기</button>
              {detail.status === 'requested' && <button className="btn btn-outline" onClick={() => setStatus(detail.id, 'quoted')}>견적 발행</button>}
              {(detail.status === 'requested' || detail.status === 'quoted') && <button className="btn btn-dark" onClick={() => setStatus(detail.id, 'ordered')}>주문 전환</button>}
              {detail.status !== 'ordered' && detail.status !== 'rejected' && <button className="btn btn-accent" onClick={() => setStatus(detail.id, 'rejected')}>반려</button>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
