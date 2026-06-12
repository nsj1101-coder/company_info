'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type CreateUserPayload = {
  email: string;
  password: string;
  name: string;
  phone: string | null;
  zonecode: string | null;
  roadAddress: string | null;
  detailAddress: string | null;
  userType: string | null;
  birthDate: string | null;
  memo: string | null;
};

function genTempPassword(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `cz${rand}!`;
}

export default function Page() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [userType, setUserType] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [zonecode, setZonecode] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const goToUsers = (): void => {
    router.push('/admin/users');
  };

  const handleRegister = async (): Promise<void> => {
    if (submitting) return;
    if (!name.trim() || !email.trim()) {
      alert('이름과 이메일은 필수입니다');
      return;
    }
    setSubmitting(true);
    const payload: CreateUserPayload = {
      email: email.trim(),
      password: genTempPassword(),
      name: name.trim(),
      phone: phone.trim() || null,
      zonecode: zonecode.trim() || null,
      roadAddress: roadAddress.trim() || null,
      detailAddress: detailAddress.trim() || null,
      userType: userType || null,
      birthDate: birthDate || null,
      memo: memo.trim() || null,
    };
    try {
      const res = await fetch('/cozycare/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 409) {
        alert('이미 등록된 이메일입니다');
        return;
      }
      if (!res.ok) {
        alert('회원 등록에 실패했습니다');
        return;
      }
      alert('회원이 등록되었습니다');
      router.push('/admin/users');
    } catch {
      alert('회원 등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        body{background:var(--bg-primary)}
        .reg-wrap{display:flex;flex-direction:column;min-height:100vh}
        .reg-header{display:flex;align-items:center;justify-content:space-between;padding:20px 28px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg-card)}
        .reg-header .back-link{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:var(--fg-primary);cursor:pointer;text-decoration:none}
        .reg-header .cancel-btn{font-size:14px;color:var(--fg-muted);cursor:pointer;font-weight:500}
        .reg-top{padding:24px 28px;background:var(--bg-card);border-bottom:1px solid var(--border)}
        .reg-top h1{font-size:22px;font-weight:700;color:var(--fg-primary);margin:0}
        .reg-top p{font-size:14px;color:var(--fg-muted);margin:6px 0 0}
        .reg-body{flex:1;display:flex;flex-direction:column;align-items:center;padding:32px 20px;overflow-y:auto}
        .reg-form{width:100%;max-width:560px;display:flex;flex-direction:column;gap:20px}
        .reg-footer-split{display:flex;justify-content:center;gap:16px;padding:24px}
        .reg-footer-split .btn{min-width:160px;padding:14px 0;font-size:16px}
      `}</style>
      <div className="reg-wrap">
        <div className="reg-header">
          <Link href="/admin/users" className="back-link"><i className="icon-chevron-left" style={{ fontSize: '18px' }}></i> 회원 목록으로</Link>
          <span className="cancel-btn" onClick={goToUsers}>취소</span>
        </div>

        <div className="reg-top">
          <h1>회원 추가</h1>
          <p>관리자가 직접 회원을 추가합니다</p>
        </div>

        <div className="reg-body">
          <div className="reg-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">이름 <span className="required">*</span></label>
                <input className="form-input" placeholder="예: 김영자" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">사용자 구분 <span className="required">*</span></label>
                <select className="form-select" value={userType} onChange={(e) => setUserType(e.target.value)}>
                  <option value="">선택</option>
                  <option>본인</option>
                  <option>보호자</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">이메일 <span className="required">*</span></label>
                <input className="form-input" type="email" placeholder="example@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">연락처 <span className="required">*</span></label>
                <input className="form-input" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">생년월일</label>
                <input className="form-input" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">우편번호</label>
                <input className="form-input" placeholder="00000" value={zonecode} onChange={(e) => setZonecode(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">주소</label>
              <input className="form-input" placeholder="기본 주소" value={roadAddress} onChange={(e) => setRoadAddress(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">상세 주소</label>
              <input className="form-input" placeholder="동·호수 등 상세 주소" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">메모</label>
              <textarea className="form-textarea" placeholder="관리용 메모를 입력하세요 (구매 성향, 특이사항 등)" value={memo} onChange={(e) => setMemo(e.target.value)}></textarea>
            </div>
          </div>
        </div>

        <div className="reg-footer-split">
          <button className="btn btn-secondary" onClick={goToUsers}>취소</button>
          <button className="btn btn-primary" onClick={handleRegister} disabled={submitting}><i className="icon-check" style={{ fontSize: '16px' }}></i> 등록</button>
        </div>
      </div>
    </>
  );
}
