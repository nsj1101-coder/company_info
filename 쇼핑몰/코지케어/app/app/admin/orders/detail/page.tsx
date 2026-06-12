import { redirect, notFound } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import OrderDetailClient, {
  type OrderDetailView,
  type DetailItem,
  type TimelineEntry,
} from './OrderDetailClient';
import type { ReviewStatus } from '@prisma/client';
import { STATUS_LABEL, ORDER_CHAIN, chainIndex } from '@/lib/orderStatus';

const REVIEW_LABEL: Record<ReviewStatus, string> = {
  pending: '심사 대기',
  gov: '공단 확인 중',
  approved: '공단 확인 완료',
  rejected: '반려',
};

const REVIEW_BADGE: Record<ReviewStatus, string> = {
  pending: 'badge-warning',
  gov: 'badge-info',
  approved: 'badge-success',
  rejected: 'badge-inactive',
};

const ORDER_TYPE_LABEL: Record<'welfare' | 'general' | 'biz', string> = {
  welfare: '복지용구',
  general: '일반',
  biz: '사업자',
};

const ORDER_TYPE_BADGE: Record<'welfare' | 'general' | 'biz', string> = {
  welfare: 'welfare',
  general: 'general',
  biz: 'biz',
};

const EVENT_LABEL: Record<string, string> = {
  order_placed: '주문 접수',
  paid: '결제 완료',
  shipped: '배송 시작',
  delivered: '배송 완료',
  confirmed: '구매 확정',
  refunded: '환불 처리',
  refund_requested: '환불 요청',
};

function fmtDateTime(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

function fmtTimeline(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${m}-${day} ${hh}:${mm}:${ss}`;
}

function won(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}

function fmtAddress(zonecode: string | null, road: string | null, detail: string | null): string {
  const parts: string[] = [];
  if (zonecode) parts.push(`(${zonecode})`);
  const line = [road, detail].filter(Boolean).join(', ');
  if (line) parts.push(line);
  const out = parts.join(' ');
  return out || '-';
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    redirect('/admin/login');
  }

  const sp = await searchParams;
  const raw = sp.id;
  const idStr = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      buyer: true,
      biz: true,
      items: { include: { product: true } },
      shipping: true,
      welfareReview: true,
      events: { orderBy: { at: 'asc' } },
      refund: true,
    },
  });
  if (!order) notFound();

  if (session.role === 'biz' && order.bizId !== session.bizId) {
    redirect('/admin/orders');
  }

  const firstItem = order.items[0];
  const orderType: 'welfare' | 'general' | 'biz' = order.welfareReview
    ? 'welfare'
    : order.bizId
      ? 'biz'
      : 'general';

  const items: DetailItem[] = order.items.map((it) => ({
    id: it.id,
    name: it.product?.name ?? '-',
    option: it.optionLabel ?? '',
    qty: it.qty,
    unitPrice: won(it.unitPrice),
    sum: won(it.unitPrice * it.qty),
  }));

  const ship = order.shipping;
  const review = order.welfareReview;
  const refund = order.refund;

  const listPrice = order.listPrice ?? order.totalPrice;
  const insuranceSupport = order.insuranceSupport ?? 0;
  const selfPay = order.selfPay ?? order.totalPrice;
  const supportRate = listPrice > 0 ? Math.round((insuranceSupport / listPrice) * 100) : 0;
  const selfRate = listPrice > 0 ? Math.round((selfPay / listPrice) * 100) : 0;

  const lower = (review?.docUrl ?? '').toLowerCase();
  const docs: { name: string; type: 'pdf' | 'image'; url: string }[] = review?.docUrl
    ? [{
        name: review.docUrl.split('/').pop() ?? '첨부서류.pdf',
        type: lower.endsWith('.jpg') || lower.endsWith('.png') || lower.endsWith('.svg') ? 'image' : 'pdf',
        url: `/cozycare${review.docUrl}`,
      }]
    : [];

  const timeline: TimelineEntry[] = order.events.map((ev) => ({
    title: ev.note ?? EVENT_LABEL[ev.type] ?? ev.type,
    time: fmtTimeline(ev.at),
    done: true,
  }));

  // 현재 단계 이후의 체인 단계를 '예정'으로 추가
  const idx = chainIndex(order.status);
  if (idx >= 0) {
    for (let i = idx + 1; i < ORDER_CHAIN.length; i++) {
      timeline.push({ title: STATUS_LABEL[ORDER_CHAIN[i]], time: '예정', done: false });
    }
  }

  const view: OrderDetailView = {
    id: order.id,
    orderNo: order.orderNo,
    createdAt: fmtDateTime(order.createdAt),
    totalPrice: won(order.totalPrice),
    buyerName: order.biz?.companyName ?? order.buyer?.name ?? '비회원',
    buyerPhone: order.buyer?.phone ?? '-',
    productName: firstItem?.product?.name ?? '-',
    carrier: ship?.courier ?? 'CJ대한통운',
    trackingNo: ship?.trackingNo ?? '',
    shippingId: ship?.id ?? null,
    statusLabel: STATUS_LABEL[order.status],
    rawStatus: order.status,
    hasWelfare: Boolean(review),
    docUrl: review?.docUrl ? `/cozycare${review.docUrl}` : null,
    orderTypeLabel: ORDER_TYPE_LABEL[orderType],
    orderTypeBadge: ORDER_TYPE_BADGE[orderType],
    items,
    shipping: {
      recipient: ship?.recipient ?? order.buyer?.name ?? '-',
      phone: ship?.phone ?? order.buyer?.phone ?? '-',
      address: ship
        ? fmtAddress(ship.zonecode, ship.roadAddress, ship.detailAddress)
        : fmtAddress(order.buyer?.zonecode ?? null, order.buyer?.roadAddress ?? null, order.buyer?.detailAddress ?? null),
      request: ship?.request ?? '-',
    },
    payment: {
      listPrice: won(listPrice),
      supportRate,
      insuranceSupport: `-${won(insuranceSupport)}`,
      selfRate,
      selfPay: won(selfPay),
      method: order.cardInfo
        ? `${order.paymentMethod ?? '신용카드'} (${order.cardInfo})`
        : order.paymentMethod ?? '-',
      paidAt: order.paidAt ? fmtDateTime(order.paidAt) : '미결제',
      finalAmount: won(selfPay),
    },
    welfare: review
      ? {
          present: true,
          statusLabel: REVIEW_LABEL[review.status],
          statusBadge: REVIEW_BADGE[review.status],
          certNo: review.certNo ?? '-',
          grade: review.grade ?? '-',
          docs,
          reviewer: review.reviewer ?? '',
          note: review.note ?? '',
          reviewedAt: review.reviewedAt ? fmtDateTime(review.reviewedAt) : '',
        }
      : { present: false, statusLabel: '', statusBadge: '', certNo: '', grade: '', docs: [], reviewer: '', note: '', reviewedAt: '' },
    refund: refund
      ? {
          present: true,
          amount: won(refund.amount),
          reason: refund.reason ?? '-',
          status: refund.status,
          createdAt: fmtDateTime(refund.createdAt),
        }
      : { present: false, amount: '', reason: '', status: '', createdAt: '' },
    memo: order.memo ?? '',
    timeline,
  };

  return <OrderDetailClient order={view} />;
}
