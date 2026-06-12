import type { OrderStatus } from '@prisma/client';

// 주문 진행 체인 (서류 검토 → 배송 → 확정)
export const ORDER_CHAIN: OrderStatus[] = [
  'doc_review',
  'doc_approved',
  'ready',
  'shipping',
  'delivered',
  'confirmed',
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  doc_review: '서류 검토중',
  doc_approved: '서류 검토 완료',
  ready: '상품 준비중',
  shipping: '배송중',
  delivered: '배송 완료',
  confirmed: '구매 확정',
  cancelled: '주문 취소',
  refunded: '환불 완료',
};

// CSS badge 클래스 키 (.badge-status.<key>)
export const STATUS_BADGE: Record<OrderStatus, string> = {
  doc_review: 'doc-review',
  doc_approved: 'doc-approved',
  ready: 'prep',
  shipping: 'delivering',
  delivered: 'done',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  refunded: 'refunded',
};

export const LABEL_TO_STATUS: Record<string, OrderStatus> = Object.fromEntries(
  (Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => [STATUS_LABEL[s], s]),
) as Record<string, OrderStatus>;

const READY_INDEX = ORDER_CHAIN.indexOf('ready');

export function chainIndex(s: OrderStatus): number {
  return ORDER_CHAIN.indexOf(s);
}

// 다음 단계 (체인 끝이면 null)
export function nextStatus(s: OrderStatus): OrderStatus | null {
  const i = ORDER_CHAIN.indexOf(s);
  return i >= 0 && i < ORDER_CHAIN.length - 1 ? ORDER_CHAIN[i + 1] : null;
}

// 이전 단계 (복지용구 서류가 없는 주문은 ready가 바닥)
export function prevStatus(s: OrderStatus, hasWelfare: boolean): OrderStatus | null {
  const floor = hasWelfare ? 0 : READY_INDEX;
  const i = ORDER_CHAIN.indexOf(s);
  return i > floor ? ORDER_CHAIN[i - 1] : null;
}
