'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Page() {
  const router = useRouter();
  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [keepLogin, setKeepLogin] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/cozycare/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: loginId, pw: password, role: 'admin' }),
        credentials: 'include',
      });
      if (res.ok) {
        router.push('/admin/dashboard');
        return;
      }
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      setError(data?.message ?? '아이디 또는 비밀번호가 올바르지 않습니다.');
    } catch {
      setError('로그인 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        body{background:#fff;overflow:hidden}
        .login-wrap{display:flex;height:100vh}
        .login-left{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:60px}
        .login-form{width:100%;max-width:400px;display:flex;flex-direction:column;gap:24px}
        .login-form h1{font-size:28px;font-weight:700;color:var(--fg-primary)}
        .login-form .login-sub{font-size:14px;color:var(--fg-secondary);margin-top:-16px}
        .login-right{width:50%;background:var(--accent);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
        .login-right .brand-icon{color:#fff;font-size:56px}
        .login-right .brand-name{color:#fff;font-size:40px;font-weight:700}
        .login-right .brand-sub{color:rgba(255,255,255,.75);font-size:16px}
        .login-keep{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--fg-secondary)}
        .login-keep input{width:16px;height:16px;accent-color:var(--accent)}
        .login-links{display:flex;align-items:center;justify-content:space-between}
        .login-links a{font-size:13px;color:var(--accent);font-weight:500}
        .login-lang{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--fg-muted);margin-top:32px}
        .login-lang span.active{color:var(--fg-primary);font-weight:600}
        .login-error{font-size:13px;color:#dc2626;background:#fee2e2;border:1px solid #fecaca;padding:10px 12px;border-radius:8px}
      `}</style>
      <div className="login-wrap">
        <div className="login-left">
          <form className="login-form" onSubmit={handleLogin}>
            <h1>로그인</h1>
            <p className="login-sub">코지케어 어드민 계정으로 로그인하세요</p>
            <div className="form-group">
              <label className="form-label">아이디</label>
              <input
                type="text"
                className="form-input"
                placeholder="admin"
                value={loginId}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLoginId(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">비밀번호</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="login-links">
              <label className="login-keep">
                <input
                  type="checkbox"
                  checked={keepLogin}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setKeepLogin(e.target.checked)}
                />{' '}
                로그인 상태 유지
              </label>
              <a href="#">비밀번호 찾기</a>
            </div>
            {error ? <div className="login-error">{error}</div> : null}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', textAlign: 'center', padding: '14px 0', fontSize: 16 }}
            >
              {submitting ? '로그인 중...' : '로그인'}
            </button>
            <div
              className="login-foot"
              style={{ marginTop: 24, fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center' }}
            >
              주식회사 코지케어 · 어드민 콘솔
            </div>
          </form>
        </div>
        <div className="login-right">
          <Image
            src="/cozycare/logo.png?v=20260610c"
            alt="코지케어"
            width={80}
            height={80}
            style={{
              width: 80,
              height: 80,
              objectFit: 'contain',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.95)',
              padding: 8,
            }}
          />
          <div className="brand-name">코지케어</div>
          <div className="brand-sub">노인 복지용구 쇼핑몰 어드민</div>
        </div>
      </div>
    </>
  );
}
