'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { LIST_STYLES } from '@/components/admin/listStyles';

export type ReviewView = {
  id: number;
  date: string;
  product: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  imageUrl: string;
  reply: string;
  status: string;
};
export type UserOpt = { id: number; name: string; email: string };
export type ProductOpt = { id: number; code: string; name: string };

function Stars({ n }: { n: number }) {
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className="icon-star" style={{ fontSize: 13, color: i <= n ? 'var(--warning)' : 'var(--border)' }} />
      ))}
    </span>
  );
}

type BulkRow = { code: string; author: string; rating: number; title: string; content: string };

export default function ReviewsClient({ rows, users, products }: { rows: ReviewView[]; users: UserOpt[]; products: ProductOpt[] }) {
  const router = useRouter();
  const [ratingFilter, setRatingFilter] = useState<string>('전체');
  const [keyword, setKeyword] = useState('');
  const [edit, setEdit] = useState<ReviewView | null>(null);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);

  // 수기 등록
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ userId: '', productId: '', rating: 5, title: '', content: '' });
  const [addErr, setAddErr] = useState('');

  // 대량 업로드
  const [bulk, setBulk] = useState<BulkRow[] | null>(null);
  const [bulkMsg, setBulkMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => rows.filter((r) => {
    if (ratingFilter !== '전체' && String(r.rating) !== ratingFilter) return false;
    if (keyword && !`${r.product} ${r.author} ${r.title} ${r.content}`.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  }), [rows, ratingFilter, keyword]);

  const avg = rows.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1) : '0.0';
  const noReply = rows.filter((r) => !r.reply).length;

  const patch = async (id: number, data: Record<string, unknown>): Promise<void> => {
    await fetch(`/cozycare/api/reviews/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    router.refresh();
  };
  const del = async (id: number): Promise<void> => {
    if (!confirm('이 리뷰를 삭제할까요?')) return;
    await fetch(`/cozycare/api/reviews/${id}`, { method: 'DELETE' });
    router.refresh();
  };
  const saveReply = async (): Promise<void> => {
    if (!edit) return;
    setSaving(true);
    try { await patch(edit.id, { reply }); setEdit(null); } finally { setSaving(false); }
  };

  const submitAdd = async (): Promise<void> => {
    setAddErr('');
    if (!form.productId || !form.content.trim()) { setAddErr('상품과 내용을 입력하세요.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/cozycare/api/reviews/manual', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: form.userId ? Number(form.userId) : null, productId: Number(form.productId), rating: form.rating, title: form.title, content: form.content }),
      });
      if (!res.ok) { const j = (await res.json().catch(() => ({}))) as { error?: string }; setAddErr(j.error ?? '등록 실패'); return; }
      setAddOpen(false);
      setForm({ userId: '', productId: '', rating: 5, title: '', content: '' });
      router.refresh();
    } finally { setSaving(false); }
  };

  const onBulkFile = async (file: File | null): Promise<void> => {
    if (!file) return;
    setBulkMsg('');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const aoa = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, blankrows: false });
    const parsed: BulkRow[] = aoa
      .filter((r, i) => i > 0 && (r[0] != null && String(r[0]).trim()))
      .map((r) => ({
        code: String(r[0] ?? '').trim(),
        author: String(r[1] ?? '').trim() || '익명',
        rating: Math.min(5, Math.max(1, Number(r[2]) || 5)),
        title: String(r[3] ?? '').trim(),
        content: String(r[4] ?? '').trim(),
      }))
      .filter((r) => r.code && r.content);
    setBulk(parsed);
  };

  const submitBulk = async (): Promise<void> => {
    if (!bulk || bulk.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch('/cozycare/api/reviews/bulk', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rows: bulk }) });
      const j = (await res.json().catch(() => ({}))) as { created?: number; skipped?: number; error?: string };
      if (!res.ok) { setBulkMsg(j.error ?? '실패'); return; }
      setBulkMsg(`등록 ${j.created ?? 0}건 / 건너뜀 ${j.skipped ?? 0}건`);
      setBulk(null);
      router.refresh();
    } finally { setSaving(false); }
  };

  return (
    <>
      <style>{LIST_STYLES}</style>
      <div className="top-bar">
        <div className="top-bar-left"><h1>상품평 관리</h1><p>고객 리뷰 답변·노출 + 수기 등록·대량 업로드</p></div>
        <div className="top-bar-right" style={{ gap: 8 }}>
          <a className="btn btn-outline" href="/cozycare/api/reviews/template"><i className="icon-download" style={{ marginRight: 4 }} />양식</a>
          <button className="btn btn-outline" onClick={() => fileRef.current?.click()}><i className="icon-upload" style={{ marginRight: 4 }} />엑셀 업로드</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={(e) => { onBulkFile(e.target.files?.[0] ?? null); e.target.value = ''; }} />
          <button className="btn btn-dark" onClick={() => { setAddErr(''); setAddOpen(true); }}><i className="icon-plus" style={{ marginRight: 4 }} />리뷰 등록</button>
        </div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="lp-grid">
          <div className="tier">
            <div className="stat-c" style={{ background: '#FEF9C3', border: '1px solid #FDE68A' }}><div className="s-ic"><i className="icon-star" style={{ color: '#ca8a04' }} /></div><div><span className="s-val">{avg}</span><div className="s-lbl">평균 별점</div></div></div>
            <div className="stat-c" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}><div className="s-ic"><i className="icon-message-circle" style={{ color: '#dc2626' }} /></div><div><span className="s-val">{noReply}</span><div className="s-lbl">미답변</div></div></div>
            <div className="stat-c" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}><div className="s-ic"><i className="icon-star" style={{ color: '#4B5563' }} /></div><div><span className="s-val">{rows.length}</span><div className="s-lbl">전체 리뷰</div></div></div>
          </div>
          <div className="filter-bar">
            <select className="f-sel" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}><option>전체</option><option value="5">★5</option><option value="4">★4</option><option value="3">★3</option><option value="2">★2</option><option value="1">★1</option></select>
            <div className="f-search"><i className="icon-search" /><input type="text" placeholder="상품·작성자·내용 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div>
          </div>
          {bulk && (
            <div className="toolbar" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 8, padding: '10px 14px', margin: '0 20px' }}>
              <span style={{ fontWeight: 600 }}>업로드 미리보기 {bulk.length}건</span>
              <button className="btn-sm primary" onClick={submitBulk} disabled={saving}>{saving ? '저장중...' : '일괄 등록'}</button>
              <button className="btn-sm" onClick={() => setBulk(null)}>취소</button>
            </div>
          )}
          {bulkMsg && <div style={{ padding: '0 20px', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{bulkMsg}</div>}
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">총 {filtered.length}건</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col style={{ width: '92px' }} /><col style={{ width: '16%' }} /><col style={{ width: '96px' }} /><col style={{ width: '88px' }} /><col /><col style={{ width: '74px' }} /><col style={{ width: '152px' }} /></colgroup>
              <thead><tr><th>작성일</th><th>상품</th><th>작성자</th><th>별점</th><th>내용</th><th>상태</th><th>처리</th></tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="ag-date">{r.date}</td>
                    <td className="ag-clip ag-name">{r.product}</td>
                    <td className="ag-clip">{r.author}</td>
                    <td><Stars n={r.rating} /></td>
                    <td className="ag-clip">{r.title ? `[${r.title}] ` : ''}{r.content}{r.reply && <span className="st-badge st-green" style={{ marginLeft: 6, fontSize: 11, padding: '1px 6px' }}>답변</span>}</td>
                    <td><span className={`st-badge ${r.status === 'hidden' ? 'st-gray' : 'st-green'}`}>{r.status === 'hidden' ? '숨김' : '노출'}</span></td>
                    <td><div className="row-actions" style={{ flexWrap: 'nowrap' }}>
                      <button className="btn-sm primary" style={{ padding: '0 8px' }} onClick={() => { setEdit(r); setReply(r.reply); }}>답변</button>
                      <button className="btn-sm" style={{ padding: '0 8px' }} onClick={() => patch(r.id, { status: r.status === 'hidden' ? 'visible' : 'hidden' })}>{r.status === 'hidden' ? '노출' : '숨김'}</button>
                      <button className="btn-sm red" style={{ padding: '0 8px' }} onClick={() => del(r.id)}>삭제</button>
                    </div></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="empty-row">리뷰가 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="ag-pag"><span className="pag-info">총 {filtered.length}건</span></div>
        </div>
      </div>

      {edit && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content modal-wide">
            <div className="modal-title" style={{ textAlign: 'left' }}>리뷰 답변</div>
            <div className="dt-list" style={{ margin: '10px 0 14px' }}>
              <div className="dt-row"><span className="k">{edit.product}</span><span className="v"><Stars n={edit.rating} /></span></div>
              <div className="dt-row" style={{ borderBottom: 'none' }}><span className="v" style={{ textAlign: 'left', fontWeight: 400 }}>{edit.title ? `[${edit.title}] ` : ''}{edit.content}</span></div>
            </div>
            <div className="mform"><div className="fld"><label>관리자 답변</label><textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="고객 리뷰에 대한 답변" /></div></div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setEdit(null)}>취소</button>
              <button className="btn btn-dark" onClick={saveReply} disabled={saving}>{saving ? '저장중...' : '답변 저장'}</button>
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content modal-wide">
            <div className="modal-title" style={{ textAlign: 'left' }}>리뷰 수기 등록</div>
            <div className="mform" style={{ marginTop: 12 }}>
              <div className="row2">
                <div className="fld"><label>작성자 (회원)</label>
                  <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
                    <option value="">비회원(익명)</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
                <div className="fld"><label>상품</label>
                  <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                    <option value="">상품 선택</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                  </select>
                </div>
              </div>
              <div className="fld"><label>별점</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} type="button" onClick={() => setForm({ ...form, rating: i })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <i className="icon-star" style={{ fontSize: 24, color: i <= form.rating ? 'var(--warning)' : 'var(--border)' }} />
                    </button>
                  ))}
                  <span style={{ marginLeft: 8, color: 'var(--fg-muted)', alignSelf: 'center' }}>{form.rating}점</span>
                </div>
              </div>
              <div className="fld"><label>제목</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="리뷰 제목" /></div>
              <div className="fld"><label>내용</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="리뷰 내용" /></div>
              {addErr && <span style={{ color: '#ef4444', fontSize: 13 }}>{addErr}</span>}
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setAddOpen(false)}>취소</button>
              <button className="btn btn-dark" onClick={submitAdd} disabled={saving}>{saving ? '등록중...' : '리뷰 등록'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
