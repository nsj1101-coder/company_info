import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';

export const metadata = {
  title: '복지용구 안내 — 코지워커 SHOP',
};

export default function WelfareGuidePage() {
  return (
    <>
      <ShopHeader />
      <main className="container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '50vh' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>복지용구 안내</h1>
        <p style={{ color: '#666' }}>페이지 준비 중입니다.</p>
      </main>
      <ShopFooter />
    </>
  );
}
