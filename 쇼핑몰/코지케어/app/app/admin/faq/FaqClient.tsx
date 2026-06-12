'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIST_STYLES } from '@/components/admin/listStyles';

export type CatView = { id: number; name: string };
export type FaqView = {
  id: number;
  categoryId: number;
  category: string;
  question: string;
  answer: string;
  order: number;
  visible: boolean;
};

type FormState = { id: number | null; categoryId: number; question: string; answer: string; order: number; visible: boolean };

export default function FaqClient({ cats, rows }: { cats: CatView[]; rows: FaqView[] }) {
  const router = useRouter();
  const [catFilter, setCatFilter] = useState<number | '전체'>('전체');
  const [form, setForm] = useState<FormState | null>(null);
  const [newCat, setNewCat] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const filtered = useMemo(() => rows.filter((f) => catFilter === '전체' || f.categoryId === catFilter), [rows, catFilter]);

  const addCategory = async (): Promise<void> => {
    if (!newCat.trim()) return;
    await fetch('/cozycare/api/faq', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'category', name: newCat.trim() }) });
    setNewCat('');
    router.refresh();
  };

  const delCategory = async (id: number): Promise<void> => {
    if (!confirm('이 분류와 하위 FAQ가 모두 삭제됩니다.')) return;
    await fetch(`/cozycare/api/faq/category/${id}`, { method: 'DELETE' });
    if (catFilter === id) setCatFilter('전체');
    router.refresh();
  };

  const toggle = async (f: FaqView): Promise<void> => {
    await fetch(`/cozycare/api/faq/${f.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ visible: !f.visible }) });
    router.refresh();
  };

  const del = async (id: number): Promise<void> => {
    if (!confirm('이 FAQ를 삭제할까요?')) return;
    await fetch(`/cozycare/api/faq/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  const openNew = (): void => {
    if (cats.length === 0) { setErr('먼저 분류를 추가하세요.'); return; }
    setErr('');
    setForm({ id: null, categoryId: cats[0].id, question: '', answer: '', order: 0, visible: true });
  };

  const save = async (): Promise<void> => {
    if (!form) return;
    setErr('');
    if (!form.question.trim() || !form.answer.trim()) { setErr('질문·답변은 필수입니다.'); return; }
    setSaving(true);
    try {
      const isNew = form.id === null;
      const res = await fetch(`/cozycare/api/faq${isNew ? '' : `/${form.id}`}`, {
        method: isNew ? 'POST' : 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: 'faq', categoryId: form.categoryId, question: form.question, answer: form.answer, order: form.order, visible: form.visible }),
      });
      if (!res.ok) { const j = (await res.json().catch(() => ({}))) as { error?: string }; setErr(j.error ?? '저장 실패'); return; }
      setForm(null);
      router.refresh();
    } finally { setSaving(false); }
  };

  return (
    <>
      <style>{LIST_STYLES}</style>
      <div className="top-bar">
        <div className="top-bar-left"><h1>FAQ 관리</h1><p>자주 묻는 질문 분류·등록 (구매·배송·복지용구·반품·사업자)</p></div>
        <div className="top-bar-right"><button className="btn btn-dark" onClick={openNew}>+ FAQ 추가</button></div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="lp-grid">
          <div className="toolbar">
            <button className={`btn-sm${catFilter === '전체' ? ' primary' : ''}`} onClick={() => setCatFilter('전체')}>전체</button>
            {cats.map((c) => (
              <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <button className={`btn-sm${catFilter === c.id ? ' primary' : ''}`} onClick={() => setCatFilter(c.id)}>{c.name}</button>
                <button className="btn-sm" title="분류 삭제" onClick={() => delCategory(c.id)} style={{ padding: '0 6px' }}>×</button>
              </span>
            ))}
            <input type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="새 분류명" style={{ height: 32, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, width: 120 }} />
            <button className="btn-sm" onClick={addCategory}>분류 추가</button>
          </div>
          {err && !form && <div style={{ padding: '0 24px', color: '#ef4444', fontSize: 13 }}>{err}</div>}
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">총 {filtered.length}건</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col style={{ width: '120px' }} /><col style={{ width: '30%' }} /><col /><col style={{ width: '80px' }} /><col style={{ width: '120px' }} /></colgroup>
              <thead><tr><th>분류</th><th>질문</th><th>답변</th><th>노출</th><th>처리</th></tr></thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id}>
                    <td><span className="st-badge st-navy">{f.category}</span></td>
                    <td className="ag-clip ag-name">{f.question}</td>
                    <td className="ag-clip ag-muted">{f.answer}</td>
                    <td><span className={`st-badge ${f.visible ? 'st-green' : 'st-gray'}`}>{f.visible ? '노출' : '숨김'}</span></td>
                    <td><div className="row-actions">
                      <button className="btn-sm primary" onClick={() => { setErr(''); setForm({ id: f.id, categoryId: f.categoryId, question: f.question, answer: f.answer, order: f.order, visible: f.visible }); }}>수정</button>
                      <button className="btn-sm" onClick={() => toggle(f)}>{f.visible ? '숨김' : '노출'}</button>
                      <button className="btn-sm red" onClick={() => del(f.id)}>삭제</button>
                    </div></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="empty-row">FAQ가 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="ag-pag"><span className="pag-info">총 {filtered.length}건</span></div>
        </div>
      </div>

      {form && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content modal-wide">
            <div className="modal-title" style={{ textAlign: 'left' }}>{form.id === null ? 'FAQ 추가' : 'FAQ 수정'}</div>
            <div className="mform" style={{ marginTop: 12 }}>
              <div className="row2">
                <div className="fld"><label>분류</label><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="fld"><label>정렬 순서</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
              </div>
              <div className="fld"><label>질문</label><input type="text" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="장기요양 인정번호는 어디서 확인하나요?" /></div>
              <div className="fld"><label>답변</label><textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} style={{ minHeight: 120 }} /></div>
              {err && <span style={{ color: '#ef4444', fontSize: 13 }}>{err}</span>}
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setForm(null)}>취소</button>
              <button className="btn btn-dark" onClick={save} disabled={saving}>{saving ? '저장중...' : '저장'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
