import Link from 'next/link';
import { redirect } from 'next/navigation';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import InquiryForm from './InquiryForm';

export const metadata = {
  title: '1:1 문의 — 코지워커 SHOP',
};

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  open: '접수',
  answered: '답변완료',
  closed: '종료',
};

function fmtDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

export default async function MyInquiriesPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({ where: { email: session.sub } });
  if (!user) redirect('/login');

  const inquiries = await prisma.inquiry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <ShopHeader />
      <main className="container" style={{ padding: '40px 20px', maxWidth: '880px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>1:1 문의</h1>
          <Link href="/mypage" style={{ fontSize: '14px', color: 'var(--gray-500, #6b7280)' }}>
            마이페이지로 →
          </Link>
        </div>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>새 문의 작성</h2>
          <InquiryForm defaultPhone={user.phone ?? ''} />
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>
            내 문의 내역 <span style={{ color: 'var(--green-700, #15803d)' }}>{inquiries.length}</span>건
          </h2>

          {inquiries.length === 0 ? (
            <div
              style={{
                padding: '48px 20px',
                textAlign: 'center',
                color: 'var(--gray-500, #6b7280)',
                background: 'var(--gray-50, #f9fafb)',
                borderRadius: '12px',
                border: '1px solid var(--gray-100, #f3f4f6)',
              }}
            >
              등록된 1:1 문의가 없습니다.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {inquiries.map((q) => (
                <li
                  key={q.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--gray-200, #e5e7eb)',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: q.status === 'answered' ? 'var(--green-50, #f0fdf4)' : 'var(--gray-100, #f3f4f6)',
                        color: q.status === 'answered' ? 'var(--green-700, #15803d)' : 'var(--gray-600, #4b5563)',
                      }}
                    >
                      {STATUS_LABEL[q.status] ?? q.status}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--gray-400, #9ca3af)' }}>{q.category}</span>
                    <span style={{ fontSize: '12px', color: 'var(--gray-400, #9ca3af)', marginLeft: 'auto' }}>
                      {fmtDate(q.createdAt)}
                    </span>
                  </div>

                  <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{q.title}</div>
                  <p style={{ fontSize: '14px', color: 'var(--gray-700, #374151)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {q.content}
                  </p>

                  {q.answer && (
                    <div
                      style={{
                        marginTop: '14px',
                        padding: '14px 16px',
                        background: 'var(--gray-50, #f9fafb)',
                        borderRadius: '10px',
                        borderLeft: '3px solid var(--green-700, #15803d)',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green-700, #15803d)', marginBottom: '4px' }}>
                        답변
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--gray-700, #374151)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {q.answer}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <ShopFooter />
    </>
  );
}
