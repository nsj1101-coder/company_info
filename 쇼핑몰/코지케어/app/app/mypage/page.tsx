import Link from 'next/link';
import { redirect } from 'next/navigation';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import InquiryForm from './inquiries/InquiryForm';
import AccountPanel from './AccountPanel';
import LogoutButton from './LogoutButton';

export const metadata = {
  title: '마이페이지 — 코지워커 SHOP',
};

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = { open: '접수', answered: '답변완료', closed: '종료' };

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}
function won(n: number): string { return `${n.toLocaleString('ko-KR')}원`; }

const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 24 };

// 주문 처리 단계 (무신사 스타일 스텝퍼)
const STEPS: Array<{ key: string; label: string }> = [
  { key: 'ready', label: '결제완료' },
  { key: 'shipping', label: '배송중' },
  { key: 'delivered', label: '배송완료' },
  { key: 'confirmed', label: '구매확정' },
];

function gradeOf(total: number): string {
  if (total >= 2000000) return 'VIP';
  if (total >= 500000) return 'GOLD';
  if (total >= 100000) return 'SILVER';
  return 'WELCOME';
}

export default async function MyPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'user') redirect('/login');

  const user = await prisma.user.findUnique({ where: { email: session.sub } });
  if (!user) redirect('/login');

  const [grouped, orders, reviews, inquiries] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], where: { buyerId: user.id }, _count: { _all: true } }),
    prisma.order.findMany({
      where: { buyerId: user.id },
      include: { items: { include: { product: { select: { name: true, thumbnail: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.productReview.findMany({ where: { userId: user.id }, include: { product: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.inquiry.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 3 }),
  ]);

  const countBy = (s: string): number => grouped.find((g) => g.status === s)?._count._all ?? 0;
  const orderCount = grouped.reduce((sum, g) => sum + g._count._all, 0);
  const claimCount = countBy('cancelled') + countBy('refunded');

  const allOrders = await prisma.order.findMany({ where: { buyerId: user.id }, select: { totalPrice: true } });
  const lifetime = allOrders.reduce((s, o) => s + o.totalPrice, 0);
  const grade = gradeOf(lifetime);

  const fullAddress = [user.roadAddress, user.detailAddress].filter(Boolean).join(' ');

  return (
    <>
      <ShopHeader />
      <main className="container" style={{ padding: '32px 20px 60px', maxWidth: 980, margin: '0 auto' }}>

        {/* 인사 + 등급/적립금 배너 */}
        <section style={{ ...card, padding: 28, marginBottom: 20, background: 'linear-gradient(135deg,#111 0%,#2b2b2b 100%)', border: 'none', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 24, fontWeight: 800 }}>{user.name}님</span>
                <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: '#84c140', color: '#fff' }}>{grade}</span>
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>{user.email}</div>
              <LogoutButton />
            </div>
            <div style={{ display: 'flex', gap: 28, textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#a4e063' }}>{user.points.toLocaleString('ko-KR')}<span style={{ fontSize: 16 }}>P</span></div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>보유 적립금</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,.15)' }} />
              <div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{won(lifetime)}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>총 구매금액</div>
              </div>
            </div>
          </div>
        </section>

        {/* 주문 처리 현황 스텝퍼 */}
        <section style={{ ...card, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800 }}>주문 처리 현황</h2>
            <Link href="/mypage/orders" style={{ fontSize: 13, color: '#6b7280' }}>전체 주문내역 →</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {STEPS.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Link href="/mypage/orders" style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 30, fontWeight: 800, color: countBy(s.key) > 0 ? '#111' : '#d1d5db' }}>{countBy(s.key)}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
                </Link>
                {i < STEPS.length - 1 && <span style={{ color: '#d1d5db', fontSize: 20, padding: '0 4px' }}>›</span>}
              </div>
            ))}
          </div>
          {claimCount > 0 && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f3f4f6', fontSize: 13, color: '#6b7280' }}>
              취소 · 환불 <strong style={{ color: '#dc2626' }}>{claimCount}</strong>건
            </div>
          )}
        </section>

        {/* 빠른 메뉴 */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { href: '/mypage/orders', label: '주문 내역', sub: `${orderCount}건` },
            { href: '/mypage/inquiries', label: '1:1 문의', sub: `${inquiries.length}건` },
            { href: '/shop/cart', label: '장바구니', sub: '' },
            { href: '/info/welfare-guide', label: '복지용구 안내', sub: '' },
          ].map((m) => (
            <Link key={m.href} href={m.href} style={{ ...card, padding: '22px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>{m.label}</div>
              {m.sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{m.sub}</div>}
            </Link>
          ))}
        </section>

        {/* 최근 주문 */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>최근 주문</h2>
          {orders.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', color: '#6b7280', padding: '36px 20px' }}>주문 내역이 없습니다.</div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map((o) => {
                const first = o.items[0];
                const more = o.items.length > 1 ? ` 외 ${o.items.length - 1}건` : '';
                return (
                  <li key={o.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 10, background: '#f3f4f6', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {first?.product.thumbnail ? <img src={first.product.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 22 }}>📦</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'monospace' }}>{o.orderNo} · {fmtDate(o.createdAt)}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{first?.product.name ?? '상품'}{more}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800 }}>{won(o.totalPrice)}</div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>
                        {STEPS.find((s) => s.key === o.status)?.label ?? (o.status === 'refunded' ? '환불' : o.status === 'cancelled' ? '취소' : o.status)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 계정 관리 (정보 수정 + 비밀번호 변경) */}
        <AccountPanel
          phone={user.phone ?? ''}
          zonecode={user.zonecode ?? ''}
          roadAddress={user.roadAddress ?? ''}
          detailAddress={user.detailAddress ?? ''}
        />

        {/* 회원 정보 요약 */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>회원 정보</h2>
          <div style={card}>
            <dl style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}><dt style={{ width: 80, color: '#9ca3af' }}>이름</dt><dd style={{ color: '#374151', fontWeight: 600 }}>{user.name}</dd></div>
              <div style={{ display: 'flex', gap: 12 }}><dt style={{ width: 80, color: '#9ca3af' }}>이메일</dt><dd style={{ color: '#374151' }}>{user.email}</dd></div>
              <div style={{ display: 'flex', gap: 12 }}><dt style={{ width: 80, color: '#9ca3af' }}>연락처</dt><dd style={{ color: '#374151' }}>{user.phone ?? '미등록'}</dd></div>
              <div style={{ display: 'flex', gap: 12 }}><dt style={{ width: 80, color: '#9ca3af' }}>주소</dt><dd style={{ color: '#374151' }}>{fullAddress ? `(${user.zonecode ?? ''}) ${fullAddress}` : '미등록'}</dd></div>
              <div style={{ display: 'flex', gap: 12 }}><dt style={{ width: 80, color: '#9ca3af' }}>가입일</dt><dd style={{ color: '#374151' }}>{fmtDate(user.createdAt)}</dd></div>
            </dl>
          </div>
        </section>

        {/* 내 리뷰 */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>내 상품 리뷰</h2>
          {reviews.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', color: '#6b7280', padding: '36px 20px' }}>작성한 리뷰가 없습니다.</div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map((r) => (
                <li key={r.id} style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>{'★'.repeat(r.rating)}<span style={{ color: '#e5e7eb' }}>{'★'.repeat(5 - r.rating)}</span></span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{r.product.name}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>{fmtDate(r.createdAt)}</span>
                  </div>
                  {r.title && <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>}
                  <p style={{ fontSize: 14, color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{r.content}</p>
                  {r.reply && (
                    <div style={{ marginTop: 12, padding: '12px 14px', background: '#f9fafb', borderRadius: 10, borderLeft: '3px solid #15803d', fontSize: 14, color: '#374151' }}>
                      <strong style={{ color: '#15803d' }}>판매자 답변</strong> {r.reply}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 내 1:1 문의 */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>내 1:1 문의</h2>
            <Link href="/mypage/inquiries" style={{ fontSize: 14, color: '#6b7280' }}>전체보기 →</Link>
          </div>
          {inquiries.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', color: '#6b7280', padding: '36px 20px' }}>등록한 문의가 없습니다.</div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {inquiries.map((q) => (
                <li key={q.id} style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: q.status === 'answered' ? '#f0fdf4' : '#f3f4f6', color: q.status === 'answered' ? '#15803d' : '#4b5563' }}>{STATUS_LABEL[q.status] ?? q.status}</span>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{q.title}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>{fmtDate(q.createdAt)}</span>
                  </div>
                  {q.answer && <p style={{ fontSize: 14, color: '#4b5563', marginTop: 4 }}><strong style={{ color: '#15803d' }}>답변</strong> {q.answer}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 1:1 문의 작성 */}
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>1:1 문의하기</h2>
          <InquiryForm defaultPhone={user.phone ?? ''} />
        </section>
      </main>
      <ShopFooter />
    </>
  );
}
