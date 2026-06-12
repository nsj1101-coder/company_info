'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';

type TabKey = 'user' | 'biz';
type Role = 'user' | 'biz' | 'admin';

type LoginResponse = {
  ok?: boolean;
  success?: boolean;
  role?: Role;
  redirect?: string;
  error?: string;
};

const ADMIN_ID = 'cozycare';
const ADMIN_PW = 'cozycare1!';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('user');

  const [email, setEmail] = useState('');
  const [userPw, setUserPw] = useState('');

  const [loginId, setLoginId] = useState('');
  const [bizPw, setBizPw] = useState('');

  const [errMsg, setErrMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const postLogin = async (id: string, pw: string, role: Role) => {
    const res = await fetch('/cozycare/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, pw, role }),
    });
    const data = (await res.json().catch(() => ({}))) as LoginResponse;
    return { ok: res.ok, data };
  };

  const handleUserSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrMsg('');
    setSubmitting(true);

    const id = email.trim();
    const pw = userPw;
    const role: Role = id === ADMIN_ID && pw === ADMIN_PW ? 'admin' : 'user';

    try {
      const { ok, data } = await postLogin(id, pw, role);
      if (ok) {
        router.push(data.redirect ?? (role === 'admin' ? '/admin/dashboard' : '/mypage'));
        return;
      }
      setErrMsg('아이디 또는 비밀번호가 올바르지 않습니다.');
    } catch {
      setErrMsg('로그인 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBizSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrMsg('');
    setSubmitting(true);

    try {
      const { ok, data } = await postLogin(loginId.trim(), bizPw, 'biz');
      if (ok) {
        router.push(data.redirect ?? '/admin/dashboard');
        return;
      }
      if (data.error === 'biz_pending') {
        setErrMsg('승인 대기 중인 사업자 계정입니다. 관리자 승인 후 로그인할 수 있습니다.');
      } else if (data.error === 'biz_rejected') {
        setErrMsg('가입이 반려된 사업자 계정입니다. 고객센터로 문의해 주세요.');
      } else {
        setErrMsg('사업자 ID(또는 이메일) 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch {
      setErrMsg('로그인 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKakao = () => {
    alert('카카오 간편 로그인 (데모)');
  };

  const switchTab = (next: TabKey) => {
    if (next === tab) return;
    setTab(next);
    setErrMsg('');
  };

  return (
    <>
      <ShopHeader />
      <main className="auth-page">
        <div className="auth-wrap">
          <h1>로그인</h1>

          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'user'}
              className={`auth-tab${tab === 'user' ? ' active' : ''}`}
              onClick={() => switchTab('user')}
            >
              일반 회원 로그인
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'biz'}
              className={`auth-tab${tab === 'biz' ? ' active' : ''}`}
              onClick={() => switchTab('biz')}
            >
              사업자 로그인
            </button>
          </div>

          {errMsg && <div className="auth-error">{errMsg}</div>}

          {tab === 'user' ? (
            <>
              <form className="auth-form" onSubmit={handleUserSubmit}>
                <div className="auth-field">
                  <label htmlFor="email">아이디(이메일)</label>
                  <input
                    id="email"
                    type="text"
                    className="auth-input"
                    placeholder="example@cozycare.co.kr"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="password">비밀번호</label>
                  <input
                    id="password"
                    type="password"
                    className="auth-input"
                    placeholder="비밀번호 입력"
                    autoComplete="current-password"
                    required
                    value={userPw}
                    onChange={(e) => setUserPw(e.target.value)}
                  />
                </div>

                <button type="submit" className="auth-submit" disabled={submitting}>
                  {submitting ? '확인 중...' : '로그인'}
                </button>
              </form>

              <button type="button" className="kakao-btn" onClick={handleKakao} style={{ marginTop: 12 }}>
                <svg viewBox="0 0 18 18" fill="currentColor">
                  <path d="M9 0.563C4.03 0.563 0 3.68 0 7.523c0 2.498 1.717 4.692 4.286 5.904l-1.097 4.024c-.097.356.305.638.612.43L8.61 14.92c.13.008.26.012.39.012 4.97 0 9-3.117 9-6.96S13.97.563 9 .563z" />
                </svg>
                카카오 간편 로그인
              </button>

              <div className="auth-links">
                <Link href="/auth/find-id">아이디 찾기</Link>
                <span>|</span>
                <Link href="/auth/find-password">비밀번호 찾기</Link>
                <span>|</span>
                <Link href="/auth/signup">회원가입</Link>
              </div>
            </>
          ) : (
            <>
              <form className="auth-form" onSubmit={handleBizSubmit}>
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
              </div>
            </>
          )}

        </div>
      </main>
      <ShopFooter />
    </>
  );
}
