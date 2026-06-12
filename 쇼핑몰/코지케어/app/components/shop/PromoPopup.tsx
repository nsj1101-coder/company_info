'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'cozycare_biz_popup_hide_until';

export default function PromoPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let hideUntil = 0;
    try {
      hideUntil = Number(localStorage.getItem(STORAGE_KEY)) || 0;
    } catch {
      hideUntil = 0;
    }
    if (hideUntil <= Date.now()) setOpen(true);
  }, []);

  const close = (): void => setOpen(false);

  const hideToday = (): void => {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    try {
      localStorage.setItem(STORAGE_KEY, String(endOfToday));
    } catch {
      /* localStorage 비활성 환경은 그냥 닫기만 */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="promo-overlay" role="dialog" aria-modal="true" aria-label="입점사 모집 안내" onClick={close}>
      <div className="promo-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="promo-x" aria-label="닫기" onClick={close}>
          ✕
        </button>
        <Link href="/auth/biz-signup" className="promo-banner" aria-label="코지케어 입점 문의하기">
          <picture>
            <source media="(max-width: 719px)" srcSet="/cozycare/promo/biz-popup-mobile.png" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cozycare/promo/biz-popup-pc.png" alt="코지케어 입점사 모집 — 지금 입점 문의하기" />
          </picture>
        </Link>
        <div className="promo-actions">
          <button type="button" className="promo-btn promo-btn-today" onClick={hideToday}>
            오늘 하루 안 보기
          </button>
          <button type="button" className="promo-btn promo-btn-close" onClick={close}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
