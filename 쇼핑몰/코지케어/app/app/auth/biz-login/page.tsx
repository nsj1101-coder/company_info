'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';

type BizLoginResponse = {
  ok?: boolean;
  success?: boolean;
  role?: 'biz';
  bizId?: number;
  redirect?: string;
  error?: string;
};

export default function BizLoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [bizPw, setBizPw] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrMsg('');
    setSubmitting(true);
    try {
      const res = await fetch('/cozycare/api/auth/biz-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: loginId.trim(), pw: bizPw }),
      });
      const data = (await res.json().catch(() => ({}))) as BizLoginResponse;
      if (res.ok && (data.ok || data.success)) {
        router.push(data.redirect ?? '/admin/dashboard');
        return;
      }
      setErrMsg('사업자 ID 또는 비밀번호가 올바르지 않습니다.');
    } catch {
      setErrMsg('로그인 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ShopHeader />
      <main className="auth-page">
        <div className="auth-wrap">
          <h1>사업자 로그인</h1>

          {errMsg && <div className="auth-error">{errMsg}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="loginId">사업자 ID</label>
              <input
                id="loginId"
                type="text"
                className="auth-input"
                placeholder="사업자 로그인 ID"
                autoComplete="username"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="bizPw">비밀번호</label>
              <input
                id="bizPw"
                type="password"
                className="auth-input"
                placeholder="비밀번호 입력"
                autoComplete="current-password"
                required
                value={bizPw}
                onChange={(e) => setBizPw(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={submitting}
              style={{ background: 'var(--biz-navy, #0f172a)' }}
            >
              {submitting ? '확인 중...' : '사업자 로그인'}
            </button>
          </form>

          <div className="auth-help-box" style={{ marginTop: 16 }}>
            사업자 회원은 본사 직영 외 자사 상품·주문을 자체 관리하실 수 있습니다.
          </div>
          <div className="auth-help-box" style={{ marginTop: 8 }}>
            데모 계정: <b>biz1</b> / <b>biz1234</b>
          </div>

          <div className="auth-links" style={{ marginTop: 20 }}>
            <Link href="/auth/biz-signup">사업자 회원가입</Link>
            <span>|</span>
            <Link href="/login">일반 회원 로그인</Link>
          </div>
        </div>
      </main>
      <ShopFooter />
    </>
  );
}
