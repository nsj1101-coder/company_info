'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

const SUBPAGE_PARENT: Record<string, string> = {
  'product-search': 'products',
  'user-add': 'users',
  'biz-register': 'biz-members',
};

// 깊은 경로 → 사이드바 slug 직접 매핑 (예: /admin/products/import → products-import)
const FULLPATH_SLUG: Record<string, string> = {
  'products/import': 'products-import',
};

function deriveActivePage(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const adminIdx = segments.indexOf('admin');
  if (adminIdx === -1 || adminIdx === segments.length - 1) return 'dashboard';
  const sub = segments.slice(adminIdx + 1).join('/');
  if (FULLPATH_SLUG[sub]) return FULLPATH_SLUG[sub];
  const seg = segments[adminIdx + 1] ?? 'dashboard';
  return SUBPAGE_PARENT[seg] ?? seg;
}

type Props = {
  children: React.ReactNode;
  role: 'admin' | 'biz';
  bizName?: string;
};

export default function AdminLayoutClient({ children, role, bizName }: Props) {
  const pathname = usePathname() ?? '/admin/dashboard';
  const activePage = deriveActivePage(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 경로 이동 시 모바일 드로어 자동 닫기
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (activePage === 'login') {
    return <>{children}</>;
  }

  return (
    <div className={`app${role === 'biz' ? ' biz-theme' : ''}${mobileOpen ? ' mobile-nav-open' : ''}`}>
      <button
        type="button"
        className="admin-mobile-toggle"
        aria-label="메뉴 열기"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className="admin-mobile-backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      <AdminSidebar activePage={activePage} role={role} bizName={bizName} />
      <div className="main-content">{children}</div>
    </div>
  );
}
