import Link from 'next/link';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';
import { prisma } from '@/lib/prisma';
import { PostType } from '@prisma/client';

export const metadata = {
  title: '공지·이벤트 — 코지워커 SHOP',
};

const NOTICE_STYLES = `
.nt-board{max-width:880px;margin:0 auto;}
.nt-row{display:flex;align-items:center;gap:14px;padding:18px 6px;border-bottom:1px solid #EEF0F3;text-decoration:none;color:#161613;transition:background .12s;}
.nt-row:hover{background:#FAFBF7;}
.nt-badge{flex:0 0 auto;font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;}
.nt-badge.notice{background:#EAF6DA;color:#46782b;}
.nt-badge.event{background:#FFF1E0;color:#B45309;}
.nt-pin{flex:0 0 auto;font-size:12px;font-weight:700;color:#84c140;}
.nt-title{flex:1;font-size:15px;font-weight:600;line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.nt-date{flex:0 0 auto;font-size:13px;color:#9CA3AF;}
.nt-empty{padding:64px 0;text-align:center;color:#9CA3AF;font-size:14px;}
`;

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export default async function NoticeListPage() {
  const now = new Date();
  const posts = await prisma.post.findMany({
    where: {
      visible: true,
      AND: [
        { OR: [{ startAt: null }, { startAt: { lte: now } }] },
        { OR: [{ endAt: null }, { endAt: { gte: now } }] },
      ],
    },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <>
      <ShopHeader />
      <style>{NOTICE_STYLES}</style>
      <main className="container" style={{ padding: '64px 20px', minHeight: '50vh' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px', color: '#161613', textAlign: 'center' }}>
          공지·이벤트
        </h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '40px' }}>
          코지워커 SHOP의 새로운 소식과 진행 중인 혜택을 확인하세요.
        </p>

        <div className="nt-board">
          {posts.map((p) => (
            <Link key={p.id} href={`/notice/${p.id}`} className="nt-row">
              <span className={`nt-badge ${p.type === PostType.event ? 'event' : 'notice'}`}>
                {p.type === PostType.event ? '이벤트' : '공지'}
              </span>
              {p.pinned && <span className="nt-pin">중요</span>}
              <span className="nt-title">{p.title}</span>
              <span className="nt-date">{fmtDate(p.createdAt)}</span>
            </Link>
          ))}
          {posts.length === 0 && <div className="nt-empty">등록된 게시물이 없습니다.</div>}
        </div>
      </main>
      <ShopFooter />
    </>
  );
}
