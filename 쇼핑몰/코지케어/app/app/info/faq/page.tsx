import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';
import { prisma } from '@/lib/prisma';
import FaqAccordion, { type FaqCat } from './FaqAccordion';

export const metadata = {
  title: '자주 묻는 질문 — 코지워커 SHOP',
};

const FAQ_STYLES = `
.faq-board{max-width:880px;margin:0 auto;}
.faq-tabs{display:flex;flex-wrap:wrap;gap:8px;border-bottom:1px solid #E5E7EB;padding-bottom:16px;margin-bottom:8px;}
.faq-tab{padding:8px 18px;border:1px solid #E0E0EA;background:#fff;border-radius:999px;font-size:14px;font-weight:600;color:#6B7280;cursor:pointer;transition:all .15s;}
.faq-tab:hover:not(.active){border-color:#84c140;color:#374151;}
.faq-tab.active{background:#84c140;border-color:#84c140;color:#fff;}
.faq-list{list-style:none;margin:0;padding:0;}
.faq-item{border-bottom:1px solid #EEF0F3;}
.faq-q{display:flex;align-items:center;gap:14px;width:100%;padding:20px 4px;background:none;border:none;text-align:left;cursor:pointer;font-size:15px;color:#161613;}
.faq-q-mark{flex:0 0 auto;width:26px;height:26px;border-radius:8px;background:#EAF6DA;color:#46782b;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;}
.faq-q-text{flex:1;font-weight:600;line-height:1.5;}
.faq-q-arrow{flex:0 0 auto;color:#9CA3AF;font-size:20px;line-height:1;}
.faq-item.open .faq-q-arrow{color:#84c140;}
.faq-a{display:flex;gap:14px;padding:0 4px 24px 4px;}
.faq-a-mark{flex:0 0 auto;width:26px;height:26px;border-radius:8px;background:#F1F3F5;color:#6B7280;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;}
.faq-a-text{flex:1;color:#4B5563;font-size:14px;line-height:1.75;}
.faq-empty{padding:48px 0;text-align:center;color:#9CA3AF;font-size:14px;}
`;

export default async function FaqPage() {
  const cats = await prisma.faqCategory.findMany({
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
    include: {
      faqs: {
        where: { visible: true },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      },
    },
  });

  const data: FaqCat[] = cats
    .filter((c) => c.faqs.length > 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      faqs: c.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
    }));

  return (
    <>
      <ShopHeader />
      <style>{FAQ_STYLES}</style>
      <main className="container" style={{ padding: '64px 20px', minHeight: '50vh' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px', color: '#161613', textAlign: 'center' }}>
          자주 묻는 질문
        </h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '40px' }}>
          구매·배송·복지용구·반품·사업자 관련 궁금증을 빠르게 확인하세요.
        </p>
        {data.length > 0 ? (
          <FaqAccordion cats={data} />
        ) : (
          <p style={{ color: '#9CA3AF', textAlign: 'center' }}>등록된 질문이 없습니다.</p>
        )}
      </main>
      <ShopFooter />
    </>
  );
}
