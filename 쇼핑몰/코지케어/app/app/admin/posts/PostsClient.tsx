'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIST_STYLES } from '@/components/admin/listStyles';

export type PostView = {
  id: number;
  type: string;
  title: string;
  content: string;
  pinned: boolean;
  visible: boolean;
  views: number;
  startAt: string;
  endAt: string;
  date: string;
};

type FormState = { id: number | null; type: string; title: string; content: string; pinned: boolean; visible: boolean; startAt: string; endAt: string };
const EMPTY: FormState = { id: null, type: 'notice', title: '', content: '', pinned: false, visible: true, startAt: '', endAt: '' };

export default function PostsClient({ rows }: { rows: PostView[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<'전체' | 'notice' | 'event'>('전체');
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const filtered = useMemo(() => rows.filter((p) => tab === '전체' || p.type === tab), [rows, tab]);

  const toggle = async (p: PostView): Promise<void> => {
    await fetch(`/cozycare/api/posts/${p.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ visible: !p.visible }) });
    router.refresh();
  };
  const del = async (id: number): Promise<void> => {
    if (!confirm('삭제할까요?')) return;
    await fetch(`/cozycare/api/posts/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  const save = async (): Promise<void> => {
    if (!form) return;
    setErr('');
    if (!form.title.trim() || !form.content.trim()) { setErr('제목·내용은 필수입니다.'); return; }
    setSaving(true);
    try {
      const isNew = form.id === null;
      const res = await fetch(`/cozycare/api/posts${isNew ? '' : `/${form.id}`}`, {
        method: isNew ? 'POST' : 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
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
        <div className="top-bar-left"><h1>공지 · 이벤트</h1><p>공지사항·이벤트 게시물 관리</p></div>
        <div className="top-bar-right"><button className="btn btn-dark" onClick={() => { setErr(''); setForm({ ...EMPTY }); }}>+ 글 작성</button></div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="lp-grid">
          <div className="toolbar">
            {(['전체', 'notice', 'event'] as const).map((t) => (
              <button key={t} className={`btn-sm${tab === t ? ' primary' : ''}`} onClick={() => setTab(t)}>{t === 'notice' ? '공지' : t === 'event' ? '이벤트' : '전체'}</button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">총 {filtered.length}건</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col style={{ width: '90px' }} /><col /><col style={{ width: '160px' }} /><col style={{ width: '80px' }} /><col style={{ width: '80px' }} /><col style={{ width: '120px' }} /></colgroup>
              <thead><tr><th>구분</th><th>제목</th><th>기간</th><th>조회</th><th>노출</th><th>처리</th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td><span className={`st-badge ${p.type === 'event' ? 'st-red' : 'st-navy'}`}>{p.type === 'event' ? '이벤트' : '공지'}</span></td>
                    <td className="ag-clip ag-name">{p.pinned && <i className="icon-pin" style={{ marginRight: 4, color: 'var(--warning)', fontSize: 12 }} />}{p.title}</td>
                    <td className="ag-date">{p.startAt ? `${p.startAt}~${p.endAt}` : p.date}</td>
                    <td className="ag-num">{p.views}</td>
                    <td><span className={`st-badge ${p.visible ? 'st-green' : 'st-gray'}`}>{p.visible ? '노출' : '숨김'}</span></td>
                    <td><div className="row-actions">
                      <button className="btn-sm primary" onClick={() => { setErr(''); setForm({ id: p.id, type: p.type, title: p.title, content: p.content, pinned: p.pinned, visible: p.visible, startAt: p.startAt, endAt: p.endAt }); }}>수정</button>
                      <button className="btn-sm" onClick={() => toggle(p)}>{p.visible ? '숨김' : '노출'}</button>
                      <button className="btn-sm red" onClick={() => del(p.id)}>삭제</button>
                    </div></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="empty-row">게시물이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="ag-pag"><span className="pag-info">총 {filtered.length}건</span></div>
        </div>
      </div>

      {form && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content modal-wide">
            <div className="modal-title" style={{ textAlign: 'left' }}>{form.id === null ? '글 작성' : '글 수정'}</div>
            <div className="mform" style={{ marginTop: 12 }}>
              <div className="row2">
                <div className="fld"><label>구분</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="notice">공지</option><option value="event">이벤트</option></select></div>
                <div className="fld"><label>상단 고정</label><select value={form.pinned ? '1' : '0'} onChange={(e) => setForm({ ...form, pinned: e.target.value === '1' })}><option value="0">미고정</option><option value="1">고정</option></select></div>
              </div>
              <div className="fld"><label>제목</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              {form.type === 'event' && (
                <div className="row2">
                  <div className="fld"><label>시작일</label><input type="date" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} /></div>
                  <div className="fld"><label>종료일</label><input type="date" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} /></div>
                </div>
              )}
              <div className="fld"><label>내용</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ minHeight: 140 }} /></div>
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
