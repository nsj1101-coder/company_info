'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';
import AddressSearch from '@/components/common/AddressSearch';

interface SignupForm {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
  authCode: string;
  zipcode: string;
  address1: string;
  address2: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    authCode: '',
    zipcode: '',
    address1: '',
    address2: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const update = <K extends keyof SignupForm>(key: K, value: SignupForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSendCode = () => {
    if (!form.phone.trim()) {
      alert('휴대폰 번호를 입력해 주세요.');
      return;
    }
    setCodeSent(true);
    alert('인증번호가 전송되었습니다. (데모: 000000)');
  };

  const handleVerifyCode = () => {
    if (!form.authCode.trim()) {
      alert('인증번호를 입력해 주세요.');
      return;
    }
    setCodeVerified(true);
    alert('인증되었습니다.');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrMsg('');

    if (form.password.length < 8) {
      setErrMsg('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setErrMsg('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!form.agreeTerms || !form.agreePrivacy) {
      setErrMsg('필수 약관에 동의해 주세요.');
      return;
    }
    if (!codeVerified) {
      setErrMsg('휴대폰 인증이 필요합니다.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/cozycare/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert('가입이 완료되었습니다. 로그인해 주세요.');
        router.push('/login');
      } else {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        const msg =
          j.error === 'duplicate_email' ? '이미 가입된 이메일입니다.' :
          j.error === 'weak_password' ? '비밀번호는 8자 이상이어야 합니다.' :
          j.error === 'invalid_email' ? '이메일 형식이 올바르지 않습니다.' :
          j.error === 'password_mismatch' ? '비밀번호가 일치하지 않습니다.' :
          '가입에 실패했습니다. 잠시 후 다시 시도해 주세요.';
        setErrMsg(msg);
      }
    } catch {
      setErrMsg('가입 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ShopHeader />
      <main className="auth-page">
        <div className="auth-wrap">
          <h1>회원가입</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="name">이름<span className="req">*</span></label>
              <input
                id="name"
                type="text"
                className="auth-input"
                placeholder="홍길동"
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="email">이메일 (아이디로 사용)<span className="req">*</span></label>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="example@cozycare.co.kr"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">비밀번호 (8자 이상)<span className="req">*</span></label>
              <input
                id="password"
                type="password"
                className="auth-input"
                placeholder="비밀번호 입력"
                minLength={8}
                required
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="passwordConfirm">비밀번호 확인<span className="req">*</span></label>
              <input
                id="passwordConfirm"
                type="password"
                className="auth-input"
                placeholder="비밀번호 재입력"
                minLength={8}
                required
                value={form.passwordConfirm}
                onChange={(e) => update('passwordConfirm', e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="phone">휴대폰 번호<span className="req">*</span></label>
              <div className="auth-row">
                <input
                  id="phone"
                  type="tel"
                  className="auth-input"
                  placeholder="010-1234-5678"
                  required
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                />
                <button
                  type="button"
                  className="auth-btn-aside"
                  onClick={handleSendCode}
                >
                  인증번호 받기
                </button>
              </div>
            </div>

            {codeSent && (
              <div className="auth-field">
                <label htmlFor="authCode">인증번호<span className="req">*</span></label>
                <div className="auth-row">
                  <input
                    id="authCode"
                    type="text"
                    className="auth-input"
                    placeholder="6자리 숫자"
                    maxLength={6}
                    value={form.authCode}
                    onChange={(e) => update('authCode', e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-btn-aside"
                    onClick={handleVerifyCode}
                  >
                    확인
                  </button>
                </div>
                {codeVerified && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#46782b' }}>
                    인증되었습니다.
                  </div>
                )}
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="zipcode">주소<span className="req">*</span></label>
              <div className="auth-row">
                <input
                  id="zipcode"
                  type="text"
                  className="auth-input"
                  placeholder="우편번호"
                  readOnly
                  value={form.zipcode}
                />
                <AddressSearch
                  className="auth-btn-aside"
                  onComplete={({ zonecode, roadAddress, buildingName }) => {
                    setForm((prev) => ({
                      ...prev,
                      zipcode: zonecode,
                      address1: buildingName
                        ? `${roadAddress} (${buildingName})`
                        : roadAddress,
                    }));
                  }}
                />
              </div>
              <input
                type="text"
                className="auth-input"
                placeholder="기본 주소"
                style={{ marginTop: 8 }}
                readOnly
                value={form.address1}
              />
              <input
                type="text"
                className="auth-input"
                placeholder="상세 주소 (동, 호수)"
                style={{ marginTop: 8 }}
                value={form.address2}
                onChange={(e) => update('address2', e.target.value)}
              />
            </div>

            <div className="auth-agree-list">
              <label className="auth-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => update('agreeTerms', e.target.checked)}
                />
                <span>
                  <span className="req">[필수]</span> 이용약관 동의
                </span>
              </label>
              <label className="auth-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.agreePrivacy}
                  onChange={(e) => update('agreePrivacy', e.target.checked)}
                />
                <span>
                  <span className="req">[필수]</span> 개인정보처리방침 동의
                </span>
              </label>
              <label className="auth-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.agreeMarketing}
                  onChange={(e) => update('agreeMarketing', e.target.checked)}
                />
                <span>[선택] 마케팅 정보 수신 동의</span>
              </label>
            </div>

            {errMsg && (
              <div style={{ color: '#FF3B30', fontSize: 13 }}>{errMsg}</div>
            )}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? '가입 처리 중...' : '가입하기'}
            </button>
          </form>

          <div className="auth-links">
            <span>이미 계정이 있나요?</span>
            <Link href="/login">로그인</Link>
          </div>
        </div>
      </main>
      <ShopFooter />
    </>
  );
}
