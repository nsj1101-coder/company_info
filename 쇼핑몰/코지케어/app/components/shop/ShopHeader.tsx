'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { label: '보행기', value: 'walker' },
  { label: '휠체어', value: 'wheelchair' },
  { label: '목욕의자', value: 'bath-chair' },
  { label: '이동변기', value: 'portable-toilet' },
  { label: '전동침대', value: 'electric-bed' },
  { label: '미끄럼방지', value: 'anti-slip' },
  { label: '기타', value: 'etc' },
];

type Auth = 'loading' | 'guest' | 'user' | 'biz' | 'admin';

export default function ShopHeader() {
  const router = useRouter();
  const [auth, setAuth] = useState<Auth>('loading');

  useEffect(() => {
    let alive = true;
    fetch('/cozycare/api/auth/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { role?: string } | null) => {
        if (!alive) return;
        if (d && d.role === 'user') setAuth('user');
        else if (d && d.role === 'biz') setAuth('biz');
        else if (d && d.role === 'admin') setAuth('admin');
        else setAuth('guest');
      })
      .catch(() => { if (alive) setAuth('guest'); });
    return () => { alive = false; };
  }, []);

  const loggedIn = auth === 'user' || auth === 'biz' || auth === 'admin';
  // 사람 아이콘: 비로그인 → 로그인 / 일반회원 → 마이페이지 / 사업자·관리자 → 어드민
  const myHref = auth === 'user' ? '/mypage' : auth === 'biz' || auth === 'admin' ? '/admin/dashboard' : '/login';
  const myLabel = auth === 'user' ? '마이페이지' : auth === 'biz' || auth === 'admin' ? '관리자' : '로그인';

  const logout = async (): Promise<void> => {
    try {
      await fetch('/cozycare/api/auth/logout', { method: 'POST' });
    } finally {
      setAuth('guest');
      router.push('/');
      router.refresh();
    }
  };

  return (
    <>
      <div className="topbar">
        <span>
          <span className="hide-mobile">📢 </span>장기요양 인정자 <strong>15% 부담금</strong>으로 구매 가능합니다
        </span>
        <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {auth !== 'loading' && !loggedIn && <Link href="/login" className="biz-link">로그인</Link>}
          {auth !== 'loading' && !loggedIn && <Link href="/auth/signup" className="biz-link">회원가입</Link>}
          {loggedIn && (
            <button type="button" onClick={logout} className="biz-link" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit' }}>로그아웃</button>
          )}
        </span>
      </div>

      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image src="/cozycare/logo.png" width={36} height={36} className="logo-img" alt="CozyCare" />
          </Link>
          <nav className="gnb">
            <Link href="/shop/list">전체상품</Link>
            {CATEGORIES.map((c) => (
              <Link key={c.value} href={`/shop/list?category=${c.value}`}>{c.label}</Link>
            ))}
          </nav>
          <div className="header-actions">
            {auth === 'loading' ? null : auth === 'user' ? (
              <Link href="/mypage" className="biz-cta-btn">마이페이지</Link>
            ) : (
              <Link href="/login" className="biz-cta-btn">사업자<span className="hide-mobile"> 로그인</span></Link>
            )}
            <button className="icon-btn" aria-label="검색">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link href={myHref} className="icon-btn" aria-label={myLabel} title={myLabel}>
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <Link href="/shop/cart" className="icon-btn" aria-label="장바구니">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="badge">0</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
