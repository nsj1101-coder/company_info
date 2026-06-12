import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopFooter from '@/components/shop/ShopFooter';
import { prisma } from '@/lib/prisma';
import { PostType } from '@prisma/client';

export const metadata = {
  title: '공지·이벤트 — 코지워커 SHOP',
};

const DETAIL_STYLES = `
.nt-detail{max-width:880px;margin:0 auto;}
.nt-d-head{border-bottom:2px solid #161613;padding-bottom:20px;margin-bottom:8px;}
.nt-d-meta{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
.nt-badge{font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;}
.nt-badge.notice{background:#EAF6DA;color:#46782b;}
.nt-badge.event{background:#FFF1E0;color:#B45309;}
.nt-d-title{font-size:22px;font-weight:700;color:#161613;line-height:1.4;}
.nt-d-sub{display:flex;gap:16px;color:#9CA3AF;font-size:13px;margin-top:12px;}
.nt-d-body{padding:32px 6px;color:#374151;font-size:15px;line-height:1.85;}
.nt-d-body p{margin:0 0 12px;}
.nt-d-foot{border-top:1px solid #EEF0F3;padding-top:24px;text-align:center;}
.nt-back{display:inline-block;padding:11px 28px;background:#161613;color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;}
.nt-back:hover{background:#000;}
`;

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const post = await prisma.post.findFirst({ where: { id: postId, visible: true } });
  if (!post) notFound();

  await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });

  return (
    <>
      <ShopHeader />
      <style>{DETAIL_STYLES}</style>
      <main className="container" style={{ padding: '64px 20px', minHeight: '50vh' }}>
        <article className="nt-detail">
          <div className="nt-d-head">
            <div className="nt-d-meta">
              <span className={`nt-badge ${post.type === PostType.event ? 'event' : 'notice'}`}>
                {post.type === PostType.event ? '이벤트' : '공지'}
              </span>
            </div>
            <h1 className="nt-d-title">{post.title}</h1>
            <div className="nt-d-sub">
              <span>{fmtDate(post.createdAt)}</span>
              <span>조회 {post.views + 1}</span>
            </div>
          </div>

          <div className="nt-d-body">
            {post.content.split('\n').map((line, i) => (
              <p key={i}>{line === '' ? ' ' : line}</p>
            ))}
          </div>

          <div className="nt-d-foot">
            <Link href="/notice" className="nt-back">목록으로</Link>
          </div>
        </article>
      </main>
      <ShopFooter />
    </>
  );
}
