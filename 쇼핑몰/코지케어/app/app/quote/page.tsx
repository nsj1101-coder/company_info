import Link from 'next/link';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';
import { getCurrentSession } from '@/lib/session';
import QuoteRequestClient, { type QuoteProduct } from './QuoteRequestClient';

export const metadata = {
  title: '견적 요청 — 코지워커 SHOP',
};

const QUOTE_STYLES = `
.qt-wrap{max-width:760px;margin:0 auto;}
.qt-notice{max-width:520px;margin:40px auto 0;background:#F9FAFB;border:1px solid #EEF0F3;border-radius:16px;padding:40px 28px;text-align:center;}
.qt-notice h2{font-size:18px;font-weight:700;color:#161613;margin:0 0 10px;}
.qt-notice p{color:#6B7280;font-size:14px;line-height:1.7;margin:0 0 20px;}
.qt-notice-btn{display:inline-block;padding:11px 28px;background:#84c140;color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;}
.qt-notice-btn:hover{background:#6ba530;}
.qt-form{margin-top:8px;}
.qt-field{margin-bottom:24px;}
.qt-field label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;}
.qt-input{width:100%;height:44px;padding:0 14px;border:1px solid #E0E0EA;border-radius:10px;font-size:14px;color:#161613;background:#fff;outline:none;}
.qt-input:focus{border-color:#84c140;}
.qt-lines{display:flex;flex-direction:column;gap:10px;}
.qt-line{display:flex;align-items:center;gap:10px;}
.qt-line-product{flex:1;}
.qt-line-qty{width:88px;text-align:right;}
.qt-line-amt{flex:0 0 110px;text-align:right;font-size:14px;font-weight:600;color:#374151;}
.qt-line-del{flex:0 0 auto;width:36px;height:44px;border:1px solid #E0E0EA;background:#fff;border-radius:10px;color:#9CA3AF;font-size:18px;cursor:pointer;}
.qt-line-del:hover{border-color:#FCA5A5;color:#B91C1C;}
.qt-add{margin-top:14px;padding:10px 18px;background:#fff;border:1px dashed #C7CCD4;border-radius:10px;color:#6B7280;font-size:14px;font-weight:600;cursor:pointer;}
.qt-add:hover{border-color:#84c140;color:#46782b;}
.qt-total{display:flex;justify-content:space-between;align-items:center;margin-top:28px;padding:18px 4px;border-top:2px solid #161613;font-size:16px;}
.qt-total strong{font-size:20px;color:#161613;}
.qt-total-note{color:#9CA3AF;font-size:12px;margin:8px 0 0;}
.qt-submit{width:100%;height:50px;margin-top:24px;background:#84c140;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;}
.qt-submit:hover:not(:disabled){background:#6ba530;}
.qt-submit:disabled{opacity:.5;cursor:not-allowed;}
.qt-err{background:#FEE2E2;border:1px solid #FCA5A5;color:#B91C1C;font-size:13px;padding:10px 14px;border-radius:8px;margin-bottom:16px;}
.qt-done{max-width:520px;margin:40px auto 0;text-align:center;padding:40px 24px;}
.qt-done-mark{width:64px;height:64px;margin:0 auto 18px;border-radius:50%;background:#EAF6DA;color:#46782b;font-size:32px;font-weight:800;display:flex;align-items:center;justify-content:center;}
.qt-done h2{font-size:20px;font-weight:700;color:#161613;margin:0 0 10px;}
.qt-done-no{font-size:14px;color:#374151;margin:0 0 8px;}
.qt-done-desc{color:#6B7280;font-size:14px;line-height:1.7;margin:0 0 24px;}
`;

function QuoteNotice({ title, desc, href, label }: { title: string; desc: string; href: string; label: string }) {
  return (
    <div className="qt-notice">
      <h2>{title}</h2>
      <p>{desc}</p>
      <Link href={href} className="qt-notice-btn">{label}</Link>
    </div>
  );
}

export default async function QuotePage() {
  const session = await getCurrentSession();

  let body: React.ReactNode;

  if (!session) {
    body = (
      <QuoteNotice
        title="로그인이 필요한 서비스입니다"
        desc="사업자 견적 요청은 승인된 사업자 회원만 이용하실 수 있습니다. 사업자 계정으로 로그인해주세요."
        href="/auth/biz-login"
        label="사업자 로그인"
      />
    );
  } else if (session.role !== 'biz' || !session.bizId) {
    body = (
      <QuoteNotice
        title="사업자 전용 서비스입니다"
        desc="견적 요청은 사업자 회원 전용 기능입니다. 사업자 회원가입 후 승인을 받으시면 전용 가격으로 견적을 요청하실 수 있습니다."
        href="/auth/biz-signup"
        label="사업자 회원가입"
      />
    );
  } else {
    const rows = await prisma.product.findMany({
      where: {
        status: ProductStatus.published,
        OR: [{ bizId: session.bizId }, { bizId: null }],
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, price: true },
    });
    const products: QuoteProduct[] = rows.map((p) => ({ id: p.id, name: p.name, price: p.price }));

    body =
      products.length > 0 ? (
        <QuoteRequestClient bizId={session.bizId} products={products} />
      ) : (
        <p style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 40 }}>견적 요청 가능한 상품이 없습니다.</p>
      );
  }

  return (
    <>
      <ShopHeader />
      <style>{QUOTE_STYLES}</style>
      <main className="container" style={{ padding: '64px 20px', minHeight: '50vh' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px', color: '#161613', textAlign: 'center' }}>
          사업자 견적 요청
        </h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '40px' }}>
          필요하신 상품과 수량을 선택하시면 담당자가 전용 가격으로 견적서를 회신해드립니다.
        </p>
        <div className="qt-wrap">{body}</div>
      </main>
      <ShopFooter />
    </>
  );
}
