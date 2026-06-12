'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';

export default function FindIdPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/cozycare/api/auth/find-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      if (res.ok) {
        const data: { maskedEmail?: string } = await res.json();
        setResult(data.maskedEmail ?? '__NONE__');
      } else {
        setResult('__NONE__');
      }
    } catch {
      setResult('__ERR__');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ShopHeader />
      <main className="auth-page">
        <div className="auth-wrap">
          <h1>아이디 찾기</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="name">이름</label>
              <input
                id="name"
                type="text"
                className="auth-input"
                placeholder="가입 시 입력한 이름"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="phone">전화번호</label>
              <input
                id="phone"
                type="tel"
                className="auth-input"
                placeholder="010-1234-5678"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? '확인 중...' : '확인'}
            </button>
          </form>

          {result === '__NONE__' ? (
            <div className="auth-error">입력하신 이름·전화번호와 일치하는 회원 정보가 없습니다.</div>
          ) : result === '__ERR__' ? (
            <div className="auth-error">조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</div>
          ) : result ? (
            <div className="auth-success-box">
              회원님의 아이디는 <strong>{result}</strong> 입니다.
              <br />
              개인정보 보호를 위해 일부 문자가 마스킹되어 표시됩니다.
            </div>
          ) : null}

          <div className="auth-links">
            <Link href="/login">로그인 페이지로</Link>
            <span>|</span>
            <Link href="/auth/find-password">비밀번호 찾기</Link>
          </div>

          <div className="auth-help-box">
            가입 시 입력한 이름과 전화번호가 일치해야 아이디를 확인할 수 있습니다.
            <br />
            정보가 기억나지 않는 경우 고객센터(1588-0000)로 문의해 주세요.
          </div>
        </div>
      </main>
      <ShopFooter />
    </>
  );
}
