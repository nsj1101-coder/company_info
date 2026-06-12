'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  phone: string;
  zonecode: string;
  roadAddress: string;
  detailAddress: string;
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 24,
};
const label: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#4b5563', marginBottom: 6, display: 'block' };
const input: React.CSSProperties = { width: '100%', height: 44, padding: '0 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 15, background: '#fff' };
const btnDark: React.CSSProperties = { height: 46, padding: '0 22px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' };

export default function AccountPanel({ phone, zonecode, roadAddress, detailAddress }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<'none' | 'pw' | 'profile'>('none');

  // 비밀번호
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // 프로필
  const [ph, setPh] = useState(phone);
  const [zc, setZc] = useState(zonecode);
  const [road, setRoad] = useState(roadAddress);
  const [detail, setDetail] = useState(detailAddress);
  const [pfMsg, setPfMsg] = useState('');
  const [pfSaving, setPfSaving] = useState(false);

  const changePw = async (): Promise<void> => {
    setPwMsg(''); setPwErr(false);
    if (!cur || !next) { setPwErr(true); setPwMsg('현재/새 비밀번호를 입력하세요.'); return; }
    if (next.length < 4) { setPwErr(true); setPwMsg('새 비밀번호는 4자 이상이어야 합니다.'); return; }
    if (next !== confirm) { setPwErr(true); setPwMsg('새 비밀번호 확인이 일치하지 않습니다.'); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/cozycare/api/me/password', {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ currentPassword: cur, newPassword: next }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setPwErr(true);
        setPwMsg(j.error === 'invalid_current_password' ? '현재 비밀번호가 올바르지 않습니다.' : '변경에 실패했습니다.');
        return;
      }
      setCur(''); setNext(''); setConfirm('');
      setPwErr(false); setPwMsg('비밀번호가 변경되었습니다.');
    } finally { setPwSaving(false); }
  };

  const saveProfile = async (): Promise<void> => {
    setPfMsg('');
    setPfSaving(true);
    try {
      const res = await fetch('/cozycare/api/me/profile', {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone: ph, zonecode: zc, roadAddress: road, detailAddress: detail }),
      });
      if (!res.ok) { setPfMsg('저장에 실패했습니다.'); return; }
      setPfMsg('저장되었습니다.');
      router.refresh();
    } finally { setPfSaving(false); }
  };

  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>계정 관리</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={() => setOpen(open === 'profile' ? 'none' : 'profile')} style={{ ...btnDark, background: open === 'profile' ? '#111' : '#fff', color: open === 'profile' ? '#fff' : '#111', border: '1px solid #e5e7eb' }}>정보 수정</button>
        <button onClick={() => setOpen(open === 'pw' ? 'none' : 'pw')} style={{ ...btnDark, background: open === 'pw' ? '#111' : '#fff', color: open === 'pw' ? '#fff' : '#111', border: '1px solid #e5e7eb' }}>비밀번호 변경</button>
      </div>

      {open === 'profile' && (
        <div style={card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={label}>연락처</label>
              <input style={input} value={ph} onChange={(e) => setPh(e.target.value)} placeholder="010-0000-0000" />
            </div>
            <div>
              <label style={label}>우편번호</label>
              <input style={input} value={zc} onChange={(e) => setZc(e.target.value)} placeholder="우편번호" />
            </div>
            <div>
              <label style={label}>도로명 주소</label>
              <input style={input} value={road} onChange={(e) => setRoad(e.target.value)} placeholder="도로명 주소" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={label}>상세 주소</label>
              <input style={input} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="상세 주소" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18 }}>
            <button style={btnDark} onClick={saveProfile} disabled={pfSaving}>{pfSaving ? '저장 중...' : '저장'}</button>
            {pfMsg && <span style={{ fontSize: 14, color: '#15803d' }}>{pfMsg}</span>}
          </div>
        </div>
      )}

      {open === 'pw' && (
        <div style={card}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
            <div>
              <label style={label}>현재 비밀번호</label>
              <input style={input} type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
            </div>
            <div>
              <label style={label}>새 비밀번호</label>
              <input style={input} type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <label style={label}>새 비밀번호 확인</label>
              <input style={input} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18 }}>
            <button style={btnDark} onClick={changePw} disabled={pwSaving}>{pwSaving ? '변경 중...' : '비밀번호 변경'}</button>
            {pwMsg && <span style={{ fontSize: 14, color: pwErr ? '#dc2626' : '#15803d' }}>{pwMsg}</span>}
          </div>
        </div>
      )}
    </section>
  );
}
