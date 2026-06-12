'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIST_STYLES } from '@/components/admin/listStyles';

export type GroupView = { id: number; code: string; name: string; discountRate: number; pointRate: number; memo: string; memberCount: number };
export type MemberView = { id: number; name: string; groupId: number | null };

type FormState = { id: number | null; code: string; name: string; discountRate: number; pointRate: number; memo: string };
const EMPTY: FormState = { id: null, code: '', name: '', discountRate: 0, pointRate: 0, memo: '' };

export default function BizGroupsClient({ groups, members }: { groups: GroupView[]; members: MemberView[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async (): Promise<void> => {
    if (!form) return;
    setErr('');
    if (!form.code.trim() || !form.name.trim()) { setErr('코드·이름은 필수입니다.'); return; }
    setSaving(true);
    try {
      const isNew = form.id === null;
      const res = await fetch(`/cozycare/api/biz-groups${isNew ? '' : `/${form.id}`}`, {
        method: isNew ? 'POST' : 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: form.code, name: form.name, discountRate: form.discountRate, pointRate: form.pointRate, memo: form.memo }),
      });
      if (!res.ok) { const j = (await res.json().catch(() => ({}))) as { error?: string }; setErr(j.error ?? '저장 실패'); return; }
      setForm(null);
      router.refresh();
    } finally { setSaving(false); }
  };

  const del = async (id: number): Promise<void> => {
    if (!confirm('그룹을 삭제할까요? (소속 사업자는 미지정으로 변경)')) return;
    await fetch(`/cozycare/api/biz-groups/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  const assign = async (bizId: number, groupId: string): Promise<void> => {
    await fetch('/cozycare/api/biz-groups/assign', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bizId, groupId: groupId ? Number(groupId) : null }),
    });
    router.refresh();
  };

  return (
    <>
      <style>{LIST_STYLES}</style>
      <div className="top-bar">
        <div className="top-bar-left"><h1>사업자 그룹·공급가</h1><p>거래량별 등급 그룹과 등급별 공급가(할인율) 설정</p></div>
        <div className="top-bar-right"><button className="btn btn-dark" onClick={() => { setErr(''); setForm({ ...EMPTY }); }}>+ 그룹 추가</button></div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="table-wrap" style={{ marginBottom: 16 }}>
          <div className="info-bar"><span className="info-txt">등급 그룹 {groups.length}개</span><span className="ag-muted" style={{ fontSize: 13 }}>공급가 = 기본 도매가 × (1 − 할인율%)</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col style={{ width: '120px' }} /><col /><col style={{ width: '110px' }} /><col style={{ width: '110px' }} /><col style={{ width: '90px' }} /><col style={{ width: '120px' }} /></colgroup>
              <thead><tr><th>코드</th><th>그룹명</th><th>추가 할인율</th><th>포인트 적립률</th><th>소속</th><th>처리</th></tr></thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{g.code}</td>
                    <td className="ag-name">{g.name}{g.memo && <div className="ag-muted" style={{ fontSize: 12 }}>{g.memo}</div>}</td>
                    <td className="ag-num">{g.discountRate}%</td>
                    <td className="ag-num">{g.pointRate}%</td>
                    <td className="ag-num">{g.memberCount}곳</td>
                    <td><div className="row-actions">
                      <button className="btn-sm primary" onClick={() => { setErr(''); setForm({ id: g.id, code: g.code, name: g.name, discountRate: g.discountRate, pointRate: g.pointRate, memo: g.memo }); }}>수정</button>
                      <button className="btn-sm red" onClick={() => del(g.id)}>삭제</button>
                    </div></td>
                  </tr>
                ))}
                {groups.length === 0 && <tr><td colSpan={6} className="empty-row">등급 그룹이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">사업자 그룹 배정 ({members.length}곳)</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col /><col style={{ width: '220px' }} /></colgroup>
              <thead><tr><th>사업자</th><th>소속 그룹</th></tr></thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="ag-name">{m.name}</td>
                    <td>
                      <select className="f-sel" defaultValue={m.groupId ?? ''} onChange={(e) => assign(m.id, e.target.value)} style={{ width: 200 }}>
                        <option value="">미지정</option>
                        {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && <tr><td colSpan={2} className="empty-row">승인된 사업자가 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {form && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content modal-wide">
            <div className="modal-title" style={{ textAlign: 'left' }}>{form.id === null ? '그룹 추가' : '그룹 수정'}</div>
            <div className="mform" style={{ marginTop: 12 }}>
              <div className="row2">
                <div className="fld"><label>코드</label><input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="vip" disabled={form.id !== null} /></div>
                <div className="fld"><label>그룹명</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VIP 사업소" /></div>
              </div>
              <div className="row2">
                <div className="fld"><label>추가 할인율 (%)</label><input type="number" value={form.discountRate} onChange={(e) => setForm({ ...form, discountRate: Number(e.target.value) })} /></div>
                <div className="fld"><label>포인트 적립률 (%)</label><input type="number" value={form.pointRate} onChange={(e) => setForm({ ...form, pointRate: Number(e.target.value) })} /></div>
              </div>
              <div className="fld"><label>메모</label><input type="text" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="월 1천만원 이상 거래처" /></div>
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
