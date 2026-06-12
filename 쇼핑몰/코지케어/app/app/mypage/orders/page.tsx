import Link from 'next/link';
import { redirect } from 'next/navigation';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';

export const metadata = {
  title: '주문 내역 — 코지워커 SHOP',
};

export const dynamic = 'force-dynamic';

const ORDER_STATUS_LABEL: Record<string, string> = {
  ready: '결제완료',
  shipping: '배송중',
  delivered: '배송완료',
  confirmed: '구매확정',
  cancelled: '취소',
  refunded: '환불',
};

const SHIPPING_STATUS_LABEL: Record<string, string> = {
  pending: '배송준비중',
  in_transit: '배송중',
  delivered: '배송완료',
};

function fmtPrice(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}

function fmtDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

export default async function MyOrdersPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({ where: { email: session.sub } });
  if (!user) redirect('/login');

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    include: {
      items: { include: { product: true } },
      shipping: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <ShopHeader />
      <main className="container" style={{ padding: '40px 20px', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>주문 내역</h1>
          <Link href="/mypage" style={{ fontSize: '14px', color: 'var(--gray-500, #6b7280)' }}>
            마이페이지로 →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              padding: '64px 20px',
              textAlign: 'center',
              color: 'var(--gray-500, #6b7280)',
              background: 'var(--gray-50, #f9fafb)',
              borderRadius: '12px',
              border: '1px solid var(--gray-100, #f3f4f6)',
            }}
          >
            <p style={{ marginBottom: '16px' }}>주문 내역이 없습니다.</p>
            <Link
              href="/shop/list"
              style={{
                display: 'inline-block',
                padding: '10px 22px',
                background: 'var(--green-700, #15803d)',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              쇼핑 계속하기
            </Link>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {orders.map((order) => (
              <li
                key={order.id}
                style={{
                  background: '#fff',
                  border: '1px solid var(--gray-200, #e5e7eb)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    background: 'var(--gray-50, #f9fafb)',
                    borderBottom: '1px solid var(--gray-100, #f3f4f6)',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: 'var(--gray-500, #6b7280)' }}>{fmtDate(order.createdAt)}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-800, #1f2937)' }}>
                      주문번호 {order.orderNo}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      background: 'var(--green-50, #f0fdf4)',
                      color: 'var(--green-700, #15803d)',
                    }}
                  >
                    {ORDER_STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>

                <div style={{ padding: '8px 20px' }}>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        borderBottom: '1px solid var(--gray-50, #f9fafb)',
                        gap: '12px',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-900, #111827)' }}>
                          {item.product.name}
                        </div>
                        {item.optionLabel && (
                          <div style={{ fontSize: '13px', color: 'var(--gray-500, #6b7280)', marginTop: '2px' }}>
                            {item.optionLabel}
                          </div>
                        )}
                        <div style={{ fontSize: '13px', color: 'var(--gray-500, #6b7280)', marginTop: '2px' }}>
                          {fmtPrice(item.unitPrice)} · {item.qty}개
                        </div>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {fmtPrice(item.unitPrice * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderTop: '1px solid var(--gray-100, #f3f4f6)',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontSize: '13px', color: 'var(--gray-500, #6b7280)' }}>
                    {order.shipping ? (
                      <>
                        배송 상태: <strong style={{ color: 'var(--gray-700, #374151)' }}>
                          {SHIPPING_STATUS_LABEL[order.shipping.status] ?? order.shipping.status}
                        </strong>
                        {order.shipping.courier && order.shipping.trackingNo && (
                          <span style={{ marginLeft: '8px' }}>
                            ({order.shipping.courier} {order.shipping.trackingNo})
                          </span>
                        )}
                      </>
                    ) : (
                      <>배송 정보 준비중</>
                    )}
                  </div>
                  <div style={{ fontSize: '15px' }}>
                    총 결제금액{' '}
                    <strong style={{ color: 'var(--green-700, #15803d)', fontSize: '17px' }}>
                      {fmtPrice(order.totalPrice)}
                    </strong>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <ShopFooter />
    </>
  );
}
