'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIST_STYLES } from '@/components/admin/listStyles';

export type PolicyView = { id: number; name: string; baseFee: number; freeThreshold: number; jejuFee: number; islandFee: number; isDefault: boolean };
export type RemoteView = { id: number; zipFrom: string; zipTo: string; region: string; extraFee: number };

type PForm = { id: number | null; name: string; baseFee: number; freeThreshold: number; jejuFee: number; islandFee: number };
const P_EMPTY: PForm = { id: null, name: '', baseFee: 3000, freeThreshold: 50000, jejuFee: 3000, islandFee: 5000 };

function won(n: number): string { return `${n.toLocaleString('ko-KR')}원`; }

export default function ShippingFeesClient({ policies, remotes }: { policies: PolicyView[]; remotes: RemoteView[] }) {
  const router = useRouter();
  const [form, setForm] = useState<PForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [rf, setRf] = useState({ zipFrom: '', zipTo: '', region: '', extraFee: '' });

  const savePolicy = async (): Promise<void> => {
    if (!form) return;
    setErr('');
    if (!form.name.trim()) { setErr('정책명을 입력하세요.'); return; }
    setSaving(true);
    try {
      const isNew = form.id === null;
      const res = await fetch(`/cozycare/api/shipping-fees${isNew ? '' : `/${form.id}`}`, {
        method: isNew ? 'POST' : 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form),
      });
      if (!res.ok) { const j = (await res.json().catch(() => ({}))) as { error?: string }; setErr(j.error ?? '저장 실패'); return; }
      setForm(null);
      router.refresh();
    } finally { setSaving(false); }
  };

  const setDefault = async (id: number): Promise<void> => {
    await fetch(`/cozycare/api/shipping-fees/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ isDefault: true }) });
    router.refresh();
  };
  const delPolicy = async (id: number): Promise<void> => {
    if (!confirm('정책을 삭제할까요?')) return;
    await fetch(`/cozycare/api/shipping-fees/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  const addRemote = async (): Promise<void> => {
    if (!rf.zipFrom.trim() || !rf.zipTo.trim() || !rf.region.trim()) return;
    await fetch('/cozycare/api/shipping-fees/remote', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ zipFrom: rf.zipFrom, zipTo: rf.zipTo, region: rf.region, extraFee: Number(rf.extraFee) || 0 }),
    });
    setRf({ zipFrom: '', zipTo: '', region: '', extraFee: '' });
    router.refresh();
  };
  const delRemote = async (id: number): Promise<void> => {
    await fetch(`/cozycare/api/shipping-fees/remote/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <>
      <style>{LIST_STYLES}</style>
      <div className="top-bar">
        <div className="top-bar-left"><h1>배송비 정책</h1><p>기본 배송비·무료배송 기준·제주/도서산간 추가 배송비</p></div>
        <div className="top-bar-right"><button className="btn btn-dark" onClick={() => { setErr(''); setForm({ ...P_EMPTY }); }}>+ 정책 추가</button></div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="table-wrap" style={{ marginBottom: 16 }}>
          <div className="info-bar"><span className="info-txt">배송비 정책 {policies.length}개</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col /><col style={{ width: '110px' }} /><col style={{ width: '130px' }} /><col style={{ width: '110px' }} /><col style={{ width: '120px' }} /><col style={{ width: '90px' }} /><col style={{ width: '160px' }} /></colgroup>
              <thead><tr><th>정책명</th><th>기본배송비</th><th>무료배송 기준</th><th>제주 추가</th><th>도서산간 추가</th><th>기본</th><th>처리</th></tr></thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.id}>
                    <td className="ag-name">{p.name}</td>
                    <td className="ag-num">{won(p.baseFee)}</td>
                    <td className="ag-num">{p.freeThreshold ? `${won(p.freeThreshold)}~` : '없음'}</td>
                    <td className="ag-num">+{won(p.jejuFee)}</td>
                    <td className="ag-num">+{won(p.islandFee)}</td>
                    <td>{p.isDefault ? <span className="st-badge st-green">기본</span> : <button className="btn-sm" onClick={() => setDefault(p.id)}>지정</button>}</td>
                    <td><div className="row-actions">
                      <button className="btn-sm primary" onClick={() => { setErr(''); setForm({ id: p.id, name: p.name, baseFee: p.baseFee, freeThreshold: p.freeThreshold, jejuFee: p.jejuFee, islandFee: p.islandFee }); }}>수정</button>
                      {!p.isDefault && <button className="btn-sm red" onClick={() => delPolicy(p.id)}>삭제</button>}
                    </div></td>
                  </tr>
                ))}
                {policies.length === 0 && <tr><td colSpan={7} className="empty-row">정책이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">도서산간 우편번호 {remotes.length}건</span></div>
          <div style={{ padding: '10px 24px', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
            <input placeholder="시작 우편번호" value={rf.zipFrom} onChange={(e) => setRf({ ...rf, zipFrom: e.target.value })} style={{ height: 34, width: 120, border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px' }} />
            <span className="ag-muted">~</span>
            <input placeholder="끝 우편번호" value={rf.zipTo} onChange={(e) => setRf({ ...rf, zipTo: e.target.value })} style={{ height: 34, width: 120, border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px' }} />
            <input placeholder="지역명 (예: 울릉도)" value={rf.region} onChange={(e) => setRf({ ...rf, region: e.target.value })} style={{ height: 34, width: 160, border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px' }} />
            <input placeholder="추가배송비" value={rf.extraFee} onChange={(e) => setRf({ ...rf, extraFee: e.target.value })} style={{ height: 34, width: 110, border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px' }} />
            <button className="btn-sm primary" onClick={addRemote}>추가</button>
          </div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col style={{ width: '160px' }} /><col /><col style={{ width: '130px' }} /><col style={{ width: '90px' }} /></colgroup>
              <thead><tr><th>우편번호 범위</th><th>지역</th><th>추가 배송비</th><th>삭제</th></tr></thead>
              <tbody>
                {remotes.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.zipFrom} ~ {r.zipTo}</td>
                    <td>{r.region}</td>
                    <td className="ag-num">+{won(r.extraFee)}</td>
                    <td><button className="btn-sm red" onClick={() => delRemote(r.id)}>삭제</button></td>
                  </tr>
                ))}
                {remotes.length === 0 && <tr><td colSpan={4} className="empty-row">등록된 도서산간 지역이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {form && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content modal-wide">
            <div className="modal-title" style={{ textAlign: 'left' }}>{form.id === null ? '배송비 정책 추가' : '정책 수정'}</div>
            <div className="mform" style={{ marginTop: 12 }}>
              <div className="fld"><label>정책명</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="기본 배송정책" /></div>
              <div className="row2">
                <div className="fld"><label>기본 배송비</label><input type="number" value={form.baseFee} onChange={(e) => setForm({ ...form, baseFee: Number(e.target.value) })} /></div>
                <div className="fld"><label>무료배송 기준액 (0=없음)</label><input type="number" value={form.freeThreshold} onChange={(e) => setForm({ ...form, freeThreshold: Number(e.target.value) })} /></div>
              </div>
              <div className="row2">
                <div className="fld"><label>제주 추가배송비</label><input type="number" value={form.jejuFee} onChange={(e) => setForm({ ...form, jejuFee: Number(e.target.value) })} /></div>
                <div className="fld"><label>도서산간 추가배송비</label><input type="number" value={form.islandFee} onChange={(e) => setForm({ ...form, islandFee: Number(e.target.value) })} /></div>
              </div>
              {err && <span style={{ color: '#ef4444', fontSize: 13 }}>{err}</span>}
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setForm(null)}>취소</button>
              <button className="btn btn-dark" onClick={savePolicy} disabled={saving}>{saving ? '저장중...' : '저장'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
