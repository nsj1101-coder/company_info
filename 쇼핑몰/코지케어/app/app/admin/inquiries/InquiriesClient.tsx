'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIST_STYLES } from '@/components/admin/listStyles';

export type InquiryView = {
  id: number;
  date: string;
  category: string;
  title: string;
  content: string;
  author: string;
  phone: string;
  onBehalf: boolean;
  answer: string;
  status: string;
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  open: { label: '대기', cls: 'st-amber' },
  answered: { label: '답변완료', cls: 'st-green' },
  closed: { label: '종료', cls: 'st-gray' },
};
const CATEGORIES = ['전체', '구매', '배송', '복지용구', '반품/교환', '사업자', '일반'];

export default function InquiriesClient({ rows }: { rows: InquiryView[] }) {
  const router = useRouter();
  const [cat, setCat] = useState('전체');
  const [keyword, setKeyword] = useState('');
  const [edit, setEdit] = useState<InquiryView | null>(null);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => rows.filter((q) => {
    if (cat !== '전체' && q.category !== cat) return false;
    if (keyword && !`${q.title} ${q.content} ${q.author}`.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  }), [rows, cat, keyword]);

  const open = rows.filter((q) => q.status === 'open').length;

  const saveAnswer = async (close = false): Promise<void> => {
    if (!edit) return;
    setSaving(true);
    try {
      await fetch(`/cozycare/api/inquiries/${edit.id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answer, close }),
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
        <div className="top-bar-left"><h1>1:1 문의</h1><p>고객·보호자 1:1 문의 응대</p></div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon" /><input type="text" placeholder="제목·작성자 검색.." value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div>
        </div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="lp-grid">
          <div className="tier">
            <div className="stat-c" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
              <div className="s-ic"><i className="icon-headphones" style={{ color: '#b45309' }} /></div>
              <div><span className="s-val">{open}</span><div className="s-lbl">답변 대기</div></div>
            </div>
            <div className="stat-c" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
              <div className="s-ic"><i className="icon-message-square" style={{ color: '#4B5563' }} /></div>
              <div><span className="s-val">{rows.length}</span><div className="s-lbl">전체 문의</div></div>
            </div>
          </div>
          <div className="filter-bar">
            <select className="f-sel" value={cat} onChange={(e) => setCat(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            <div className="f-search"><i className="icon-search" /><input type="text" placeholder="제목·내용·작성자 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div>
          </div>
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">총 {filtered.length}건</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col style={{ width: '100px' }} /><col style={{ width: '110px' }} /><col /><col style={{ width: '120px' }} /><col style={{ width: '100px' }} /><col style={{ width: '90px' }} /></colgroup>
              <thead><tr><th>작성일</th><th>분류</th><th>제목</th><th>작성자</th><th>상태</th><th>처리</th></tr></thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id}>
                    <td className="ag-date">{q.date}</td>
                    <td><span className="st-badge st-navy">{q.category}</span></td>
                    <td className="ag-clip ag-name">{q.title}</td>
                    <td>{q.author}{q.onBehalf && <span className="st-badge st-blue" style={{ marginLeft: 6, fontSize: 11, padding: '2px 6px' }}>대리</span>}</td>
                    <td><span className={`st-badge ${STATUS_META[q.status]?.cls ?? 'st-gray'}`}>{STATUS_META[q.status]?.label ?? q.status}</span></td>
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
            <div className="modal-title" style={{ textAlign: 'left' }}>1:1 문의 답변</div>
            <div className="dt-list" style={{ margin: '10px 0 14px' }}>
              <div className="dt-row"><span className="k">{edit.category} · {edit.author} {edit.phone}</span><span className="v">{edit.date}</span></div>
              <div className="dt-row"><span className="v" style={{ textAlign: 'left' }}>{edit.title}</span></div>
              <div className="dt-row" style={{ borderBottom: 'none' }}><span className="v" style={{ textAlign: 'left', fontWeight: 400 }}>{edit.content}</span></div>
            </div>
            <div className="mform"><div className="fld"><label>답변</label><textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="문의에 대한 답변" /></div></div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setEdit(null)}>취소</button>
              <button className="btn btn-outline" onClick={() => saveAnswer(true)} disabled={saving}>답변 후 종료</button>
              <button className="btn btn-dark" onClick={() => saveAnswer(false)} disabled={saving}>{saving ? '저장중...' : '답변 등록'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
