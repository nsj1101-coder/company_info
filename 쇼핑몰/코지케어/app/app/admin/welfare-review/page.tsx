import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import type { ReviewStatus } from '@prisma/client';
import WelfareReviewClient, { type WelfareReviewView, type TabKey } from './WelfareReviewClient';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const TAB_TO_STATUS: Record<TabKey, ReviewStatus> = {
  wait: 'pending',
  gov: 'gov',
  done: 'approved',
  ng: 'rejected',
};

const STATUS_TO_TAB: Record<ReviewStatus, TabKey> = {
  pending: 'wait',
  gov: 'gov',
  approved: 'done',
  rejected: 'ng',
};

function resolveTab(raw: string | string[] | undefined): TabKey {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'pending' || value === 'gov' || value === 'approved' || value === 'rejected') {
    return STATUS_TO_TAB[value];
  }
  return 'wait';
}

function fmtTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm} 접수`;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const sp = await searchParams;
  const activeTab = resolveTab(sp.status);
  const activeStatus = TAB_TO_STATUS[activeTab];

  const [list, waitCount, govCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.welfareReview.findMany({
      where: { status: activeStatus },
      include: {
        buyer: true,
        order: {
          include: {
            items: { include: { product: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.welfareReview.count({ where: { status: 'pending' } }),
    prisma.welfareReview.count({ where: { status: 'gov' } }),
    prisma.welfareReview.count({ where: { status: 'approved' } }),
    prisma.welfareReview.count({ where: { status: 'rejected' } }),
  ]);

  const reviews: WelfareReviewView[] = list.map((r) => {
    const firstItem = r.order.items[0];
    return {
      id: r.id,
      orderId: r.orderId,
      orderNo: r.order.orderNo,
      buyerName: r.buyer?.name ?? '비회원',
      buyerLabel: '본인',
      productName: firstItem?.product?.name ?? '-',
      amount: `${r.order.totalPrice.toLocaleString('ko-KR')}원`,
      docUrl: r.docUrl,
      grade: r.grade,
      certNo: r.certNo,
      note: r.note,
      status: r.status,
      receivedAt: fmtTime(r.createdAt),
    };
  });

  return (
    <WelfareReviewClient
      reviews={reviews}
      activeTab={activeTab}
      counts={{
        wait: waitCount,
        gov: govCount,
        done: approvedCount,
        ng: rejectedCount,
      }}
    />
  );
}
