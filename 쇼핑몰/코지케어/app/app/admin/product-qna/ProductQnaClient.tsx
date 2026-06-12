'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIST_STYLES } from '@/components/admin/listStyles';

export type QnaView = {
  id: number;
  date: string;
  product: string;
  author: string;
  question: string;
  answer: string;
  secret: boolean;
  status: string;
};

export default function ProductQnaClient({ rows }: { rows: QnaView[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<'전체' | '미답변' | '답변완료'>('전체');
  const [keyword, setKeyword] = useState('');
  const [edit, setEdit] = useState<QnaView | null>(null);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => rows.filter((q) => {
    if (tab === '미답변' && q.status !== 'pending') return false;
    if (tab === '답변완료' && q.status !== 'answered') return false;
    if (keyword && !`${q.product} ${q.author} ${q.question}`.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  }), [rows, tab, keyword]);

  const pending = rows.filter((q) => q.status === 'pending').length;

  const saveAnswer = async (): Promise<void> => {
    if (!edit) return;
    setSaving(true);
    try {
      await fetch(`/cozycare/api/product-qna/${edit.id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answer }),
      });
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
          <h1>상품 Q&A</h1>
          <p>상품 문의 응대 — &quot;내가 대상자인지&quot; 문의·보호자 대리문의 포함</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon" /><input type="text" placeholder="상품·작성자 검색.." value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div>
        </div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="lp-grid">
          <div className="tier">
            <div className="stat-c" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
              <div className="s-ic"><i className="icon-message-circle" style={{ color: '#dc2626' }} /></div>
              <div><span className="s-val">{pending}</span><div className="s-lbl">미답변</div></div>
            </div>
            <div className="stat-c" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
              <div className="s-ic"><i className="icon-messages-square" style={{ color: '#4B5563' }} /></div>
              <div><span className="s-val">{rows.length}</span><div className="s-lbl">전체 문의</div></div>
            </div>
          </div>
          <div className="filter-bar">
            {(['전체', '미답변', '답변완료'] as const).map((t) => (
              <button key={t} className={`btn-sm${tab === t ? ' primary' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
            <div className="f-search"><i className="icon-search" /><input type="text" placeholder="상품·작성자·내용 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div>
          </div>
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">총 {filtered.length}건</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col style={{ width: '100px' }} /><col style={{ width: '18%' }} /><col style={{ width: '110px' }} /><col /><col style={{ width: '100px' }} /><col style={{ width: '90px' }} /></colgroup>
              <thead><tr><th>작성일</th><th>상품</th><th>작성자</th><th>문의 내용</th><th>상태</th><th>처리</th></tr></thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id}>
                    <td className="ag-date">{q.date}</td>
                    <td className="ag-clip ag-name">{q.product}</td>
                    <td>{q.author}{q.secret && <i className="icon-lock" style={{ marginLeft: 4, fontSize: 12, color: 'var(--fg-muted)' }} />}</td>
                    <td className="ag-clip">{q.question}</td>
                    <td><span className={`st-badge ${q.status === 'answered' ? 'st-green' : 'st-amber'}`}>{q.status === 'answered' ? '답변완료' : '미답변'}</span></td>
                    <td><button className="btn-sm primary" onClick={() => { setEdit(q); setAnswer(q.answer); }}>답변</button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="empty-row">문의가 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="ag-pag"><span className="pag-info">총 {filtered.length}건</span></div>
        </div>
      </div>

      {edit && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content modal-wide">
            <div className="modal-title" style={{ textAlign: 'left' }}>Q&A 답변 — {edit.product}</div>
            <div className="dt-list" style={{ margin: '10px 0 14px' }}>
              <div className="dt-row"><span className="k">{edit.author}</span><span className="v">{edit.date}</span></div>
              <div className="dt-row" style={{ borderBottom: 'none' }}><span className="v" style={{ textAlign: 'left', fontWeight: 400 }}>{edit.question}</span></div>
            </div>
            <div className="mform">
              <div className="fld"><label>답변</label><textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="문의에 대한 답변을 입력하세요" /></div>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setEdit(null)}>취소</button>
              <button className="btn btn-dark" onClick={saveAnswer} disabled={saving}>{saving ? '저장중...' : '답변 등록'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
