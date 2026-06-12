'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Role = 'admin' | 'biz';

type NavItem = {
  slug: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
  badgeVariant?: 'brand' | 'default';
  visibleFor: Role[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const BOTH: Role[] = ['admin', 'biz'];
const ADMIN_ONLY: Role[] = ['admin'];

const NAV_GROUPS: NavGroup[] = [
  {
    label: '개요',
    items: [
      { slug: 'dashboard', label: '대시보드', href: '/admin/dashboard', icon: 'icon-layout-dashboard', visibleFor: BOTH },
    ],
  },
  {
    label: '상품',
    items: [
      { slug: 'products', label: '상품 목록', href: '/admin/products', icon: 'icon-package', badge: '248', badgeVariant: 'brand', visibleFor: BOTH },
      { slug: 'product-register', label: '상품 등록', href: '/admin/product-register', icon: 'icon-plus', visibleFor: BOTH },
      { slug: 'products-import', label: '엑셀 업로드', href: '/admin/products/import', icon: 'icon-upload', visibleFor: BOTH },
      { slug: 'categories', label: '카테고리', href: '/admin/categories', icon: 'icon-folder', visibleFor: BOTH },
    ],
  },
  {
    label: '주문 · 결제',
    items: [
      { slug: 'orders', label: '주문 관리', href: '/admin/orders', icon: 'icon-shopping-cart', badge: '24', visibleFor: BOTH },
      { slug: 'invoice-bulk', label: '일괄 송장 등록', href: '/admin/invoice-bulk', icon: 'icon-upload', visibleFor: BOTH },
      { slug: 'refunds', label: '환불 관리', href: '/admin/refunds', icon: 'icon-rotate-ccw', visibleFor: ADMIN_ONLY },
      { slug: 'points', label: '포인트 이력', href: '/admin/points', icon: 'icon-coins', visibleFor: BOTH },
      { slug: 'settlements', label: '정산 관리', href: '/admin/settlements', icon: 'icon-calculator', visibleFor: ADMIN_ONLY },
    ],
  },
  {
    label: '고객 · CS',
    items: [
      { slug: 'reviews', label: '상품평 관리', href: '/admin/reviews', icon: 'icon-star', visibleFor: ADMIN_ONLY },
      { slug: 'product-qna', label: '상품 Q&A', href: '/admin/product-qna', icon: 'icon-message-circle', visibleFor: ADMIN_ONLY },
      { slug: 'inquiries', label: '1:1 문의', href: '/admin/inquiries', icon: 'icon-headphones', visibleFor: ADMIN_ONLY },
      { slug: 'faq', label: 'FAQ 관리', href: '/admin/faq', icon: 'icon-circle-help', visibleFor: ADMIN_ONLY },
      { slug: 'posts', label: '공지 · 이벤트', href: '/admin/posts', icon: 'icon-megaphone', visibleFor: ADMIN_ONLY },
      { slug: 'notification-templates', label: '알림톡 템플릿', href: '/admin/notification-templates', icon: 'icon-bell', visibleFor: ADMIN_ONLY },
    ],
  },
  {
    label: '회원 · 사업자',
    items: [
      { slug: 'users', label: '일반 회원', href: '/admin/users', icon: 'icon-users', badge: '156', visibleFor: ADMIN_ONLY },
      { slug: 'biz-members', label: '사업자 관리', href: '/admin/biz-members', icon: 'icon-handshake', visibleFor: ADMIN_ONLY },
      { slug: 'biz-groups', label: '사업자 그룹·공급가', href: '/admin/biz-groups', icon: 'icon-tags', visibleFor: ADMIN_ONLY },
      { slug: 'welfare-review', label: '복지용구 서류 검토', href: '/admin/welfare-review', icon: 'icon-shield-check', badge: '7', visibleFor: ADMIN_ONLY },
      { slug: 'biz-approval', label: '사업자 가입 승인', href: '/admin/biz-approval', icon: 'icon-user-check', badge: '3', visibleFor: ADMIN_ONLY },
      { slug: 'quotes', label: '견적 · 대량주문', href: '/admin/quotes', icon: 'icon-clipboard-list', visibleFor: ADMIN_ONLY },
      { slug: 'tax-invoices', label: '세금계산서', href: '/admin/tax-invoices', icon: 'icon-file-text', visibleFor: ADMIN_ONLY },
    ],
  },
  {
    label: '통계',
    items: [
      { slug: 'statistics', label: '매출 통계', href: '/admin/statistics', icon: 'icon-chart-bar', visibleFor: BOTH },
    ],
  },
  {
    label: '설정',
    items: [
      { slug: 'settings', label: '사이트 설정', href: '/admin/settings', icon: 'icon-settings', visibleFor: ADMIN_ONLY },
      { slug: 'shipping-fees', label: '배송비 정책', href: '/admin/shipping-fees', icon: 'icon-map-pin', visibleFor: ADMIN_ONLY },
      { slug: 'my-info', label: '내 정보', href: '/admin/my-info', icon: 'icon-user', visibleFor: ADMIN_ONLY },
    ],
  },
];

type Props = {
  activePage: string;
  role?: Role;
  bizName?: string;
};

export default function AdminSidebar({ activePage, role = 'admin', bizName }: Props) {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('/cozycare/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.visibleFor.includes(role)),
  })).filter((g) => g.items.length > 0);

  const userName = role === 'biz' ? bizName ?? '사업자' : '관리자';
  const userEmail = role === 'biz' ? `${bizName ?? 'biz'}@입점사` : 'admin@코지케어.co.kr';

  return (
    <aside className="sidebar" id="sidebar">
      <Link href="/admin/dashboard" className="sidebar-logo">
        <Image src="/cozycare/logo.png" width={120} height={30} className="logo-image" alt="코지케어" style={{ height: 30, width: 'auto', objectFit: 'contain' }} />
      </Link>

      <div className="sidebar-toggle">
        <button id="sidebarToggle" type="button">
          <i className="icon-panel-left-close" />
        </button>
      </div>

      <Link href={role === 'biz' ? '/admin/dashboard' : '/admin/my-info'} className="sidebar-user">
        <div className="su-av"><i className="icon-user" style={{ fontSize: 18 }} /></div>
        <div className="user-info">
          <div className="su-name-row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="su-name">{userName}</span>
          </div>
          <div className="su-mail">{userEmail}</div>
        </div>
      </Link>

      <nav className="sidebar-nav">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="sidebar-section">
              <span className="sidebar-section-label">{group.label}</span>
            </div>
            {group.items.map((item) => {
              const isActive = activePage === item.slug;
              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  className={`nav-item${isActive ? ' active' : ''}`}
                  data-page={item.slug}
                >
                  <i className={`${item.icon} nav-icon`} />
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className={`nav-badge${item.badgeVariant === 'brand' ? ' brand' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <button type="button" className="sidebar-logout" onClick={handleLogout}>
        <i className="icon-log-out logout-icon" />
        <span className="logout-label">로그아웃</span>
      </button>
    </aside>
  );
}
