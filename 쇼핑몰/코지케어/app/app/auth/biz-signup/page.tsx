'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';
import AddressSearch from '@/components/common/AddressSearch';

type BizType = '복지용구사업소' | '인터넷 사업소' | '재가복지센터' | '기타 관련업체';

export default function BizSignupPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [bizNumber, setBizNumber] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [bizType, setBizType] = useState<BizType>('복지용구사업소');
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !agreePrivacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    try {
      const res = await fetch('/cozycare/api/biz/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName, ceoName, bizNumber, zipcode, address1, address2,
          bizPhone, managerPhone, email, password, bizType,
        }),
      });
      if (res.ok) {
        alert(`사업자 등록 신청이 접수되었습니다.\n승인 후 가입하신 이메일(${email})로 로그인하실 수 있습니다.\n(1~2 영업일 내 승인)`);
        router.push('/login');
        return;
      }
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      const msg =
        j.error === 'duplicate_bizno' ? '이미 등록된 사업자등록번호입니다.' :
        j.error === 'duplicate_email' || j.error === 'duplicate' ? '이미 등록된 이메일입니다.' :
        j.error === 'invalid_email' ? '이메일 형식이 올바르지 않습니다.' :
        j.error === 'weak_password' ? '비밀번호는 8자 이상이어야 합니다.' :
        j.error === 'missing_bizno' ? '사업자등록번호를 입력하세요.' :
        j.error === 'missing_company' ? '상호명을 입력하세요.' :
        '신청에 실패했습니다. 입력 정보를 확인해 주세요.';
      alert(msg);
    } catch {
      alert('신청 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <ShopHeader />

      <main className="biz-signup-page">
        <form className="biz-signup-card" onSubmit={handleSubmit}>
          <h1 className="biz-signup-title">사업자 회원가입</h1>
          <p className="biz-signup-sub">사업자등록증과 일치하는 정보를 입력해주세요.</p>

          <div className="biz-stepper">
            <div className="biz-step active"><span className="num">1</span><span>사업자 인증</span></div>
            <div className="biz-step"><span className="num">2</span><span>가입 정보</span></div>
            <div className="biz-step"><span className="num">3</span><span>완료</span></div>
          </div>

          <div className="biz-form-section">
            <div className="biz-form-section-title">사업자 정보</div>
            <div className="biz-form-grid">
              <div className="biz-form-group biz-full">
                <label>상호명 (회사명)<span className="req">*</span></label>
                <input type="text" className="biz-input" placeholder="㈜코지케어 파트너" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="biz-form-group">
                <label>대표자명<span className="req">*</span></label>
                <input type="text" className="biz-input" placeholder="홍길동" value={ceoName} onChange={(e) => setCeoName(e.target.value)} />
              </div>
              <div className="biz-form-group">
                <label>사업자등록번호<span className="req">*</span></label>
                <input type="text" className="biz-input" placeholder="000-00-00000" value={bizNumber} onChange={(e) => setBizNumber(e.target.value)} />
              </div>
              <div className="biz-form-group biz-full">
                <label>사업장 주소<span className="req">*</span></label>
                <div className="biz-row-inline">
                  <input type="text" className="biz-input" placeholder="우편번호" style={{ maxWidth: 140 }} readOnly value={zipcode} />
                  <AddressSearch
                    className="biz-btn-outline"
                    onComplete={({ zonecode, roadAddress, buildingName }) => {
                      setZipcode(zonecode);
                      setAddress1(buildingName ? `${roadAddress} (${buildingName})` : roadAddress);
                    }}
                  />
                </div>
                <input type="text" className="biz-input" placeholder="기본 주소" style={{ marginBottom: 8 }} readOnly value={address1} />
                <input type="text" className="biz-input" placeholder="상세 주소" value={address2} onChange={(e) => setAddress2(e.target.value)} />
              </div>
              <div className="biz-form-group">
                <label>대표 전화<span className="req">*</span></label>
                <input type="text" className="biz-input" placeholder="02-0000-0000" value={bizPhone} onChange={(e) => setBizPhone(e.target.value)} />
              </div>
              <div className="biz-form-group">
                <label>담당자 휴대전화<span className="req">*</span></label>
                <input type="text" className="biz-input" placeholder="010-0000-0000" value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="biz-form-section">
            <div className="biz-form-section-title">사업자 유형<span className="req" style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span></div>
            <div className="biz-type-list">
              <div className={`biz-type-option${bizType === '복지용구사업소' ? ' active' : ''}`} onClick={() => setBizType('복지용구사업소')}>복지용구사업소</div>
              <div className={`biz-type-option${bizType === '인터넷 사업소' ? ' active' : ''}`} onClick={() => setBizType('인터넷 사업소')}>인터넷 사업소</div>
              <div className={`biz-type-option${bizType === '재가복지센터' ? ' active' : ''}`} onClick={() => setBizType('재가복지센터')}>재가복지센터</div>
              <div className={`biz-type-option${bizType === '기타 관련업체' ? ' active' : ''}`} onClick={() => setBizType('기타 관련업체')}>기타 관련업체</div>
            </div>
          </div>

          <div className="biz-form-section">
            <div className="biz-form-section-title">로그인 계정</div>
            <div className="biz-form-grid">
              <div className="biz-form-group biz-full">
                <label>이메일 (로그인 ID)<span className="req">*</span></label>
                <input type="email" className="biz-input" placeholder="partner@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="biz-form-group">
                <label>비밀번호<span className="req">*</span></label>
                <input type="password" className="biz-input" placeholder="영문+숫자 8자 이상" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="biz-form-group">
                <label>비밀번호 확인<span className="req">*</span></label>
                <input type="password" className="biz-input" placeholder="다시 입력" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="biz-form-section">
            <div className="biz-form-section-title">사업자등록증 첨부<span className="req" style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span></div>
            <input type="file" className="biz-input" style={{ padding: '10px 14px', height: 'auto' }} accept=".jpg,.jpeg,.png,.pdf" />
            <span className="biz-help">JPG · PNG · PDF (최대 10MB) — 전체 내용이 선명하게 보이는 사진/스캔본</span>
          </div>

          <div className="biz-info-note">
            <strong>승인까지 1~2 영업일 소요됩니다.</strong> 제출하신 사업자등록증을 코지케어가 검토한 후 승인 메일을 보내드립니다. 승인 완료 후 사업자 전용 가격(공급가)과 적립 포인트 혜택을 이용하실 수 있습니다.
          </div>

          <div className="biz-agree-list">
            <label className="biz-agree-item">
              <span>
                <input type="checkbox" checked={agreeAll} onChange={(e) => handleAgreeAll(e.target.checked)} />
                <span className="req-label">[필수]</span>전체 약관에 동의합니다
              </span>
            </label>
            <label className="biz-agree-item">
              <span>
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                <span className="req-label">[필수]</span>사업자 회원 이용약관 동의
              </span>
              <a href="#" className="agree-link">보기</a>
            </label>
            <label className="biz-agree-item">
              <span>
                <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
                <span className="req-label">[필수]</span>개인정보 수집·이용 동의
              </span>
              <a href="#" className="agree-link">보기</a>
            </label>
          </div>

          <div className="biz-actions">
            <Link href="/login" className="biz-cancel">취소</Link>
            <button type="submit" className="biz-submit">사업자 등록 신청하기</button>
          </div>

          <p className="biz-bottom-link">
            이미 사업자 회원이신가요? <Link href="/login">사업자 로그인</Link>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>|</span>
            일반 회원이신가요? <Link href="/auth/signup">일반 회원가입</Link>
          </p>
        </form>
      </main>

      <ShopFooter />
    </>
  );
}
