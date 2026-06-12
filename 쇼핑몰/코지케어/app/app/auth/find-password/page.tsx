'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';

export default function FindPasswordPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSent(false);
    setNotFound(false);
    try {
      const res = await fetch('/cozycare/api/auth/find-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      if (res.ok) setSent(true);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ShopHeader />
      <main className="auth-page">
        <div className="auth-wrap">
          <h1>비밀번호 찾기</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">아이디(이메일)</label>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="example@cozycare.co.kr"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="name">가입 시 입력한 이름</label>
              <input
                id="name"
                type="text"
                className="auth-input"
                placeholder="홍길동"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? '확인 중...' : '확인'}
            </button>
          </form>

          {sent && (
            <div className="auth-success-box">
              등록된 이메일(<strong>{email}</strong>)로 비밀번호 재설정 안내를 전송했습니다.
              <br />
              메일을 확인하시고 링크를 통해 새 비밀번호를 설정해 주세요.
            </div>
          )}
          {notFound && (
            <div className="auth-error">입력하신 정보와 일치하는 계정이 없습니다. 이메일·이름을 확인해 주세요.</div>
          )}

          <div className="auth-links">
            <Link href="/login">로그인 페이지로</Link>
            <span>|</span>
            <Link href="/auth/find-id">아이디 찾기</Link>
          </div>

          <div className="auth-help-box">
            이메일이 도착하지 않으면 스팸함을 확인해 주세요.
            <br />
            그래도 받지 못하셨다면 고객센터(1588-0000)로 문의해 주세요.
          </div>
        </div>
      </main>
      <ShopFooter />
    </>
  );
}
