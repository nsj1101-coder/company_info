export type DemoProduct = {
  name: string;
  category: string;
  price: string;
  welfare: string;
  stock: string;
  visible: boolean;
  image: string;
  bizId: number | null;
};

export const DEMO_PRODUCTS: DemoProduct[] = [
  { name: '카본로얄파인더', category: '보행기', price: '350,000원', welfare: '52,500원', stock: '24', visible: true, image: '/cozycare/images/products/carbon-royal.jpg', bizId: null },
  { name: '와이드레드 P04', category: '보행기', price: '250,000원', welfare: '37,500원', stock: '48', visible: true, image: '/cozycare/images/products/wide-red-p04.jpg', bizId: null },
  { name: '유로라이트', category: '보행기', price: '225,000원', welfare: '33,750원', stock: '32', visible: true, image: '/cozycare/images/products/eurolight.jpg', bizId: null },
  { name: '로얄쿠션', category: '보행기', price: '270,000원', welfare: '40,500원', stock: '18', visible: true, image: '/cozycare/images/products/royal-cushion.jpg', bizId: 1 },
  { name: '로얄와이드', category: '보행기', price: '290,000원', welfare: '43,500원', stock: '27', visible: true, image: '/cozycare/images/products/royal-wide.jpg', bizId: 1 },
  { name: '환희 FR01', category: '보행기', price: '195,000원', welfare: '29,250원', stock: '64', visible: true, image: '/cozycare/images/products/red-front.jpg', bizId: 2 },
  { name: '휠체어 EZ-1', category: '휠체어', price: '450,000원', welfare: '—', stock: '12', visible: true, image: '/cozycare/images/products/product-p2-1.jpg', bizId: 2 },
  { name: '미끄럼방지 목욕의자', category: '목욕의자', price: '90,000원', welfare: '13,500원', stock: '86', visible: true, image: '/cozycare/images/products/product-p2-2.jpg', bizId: null },
];

export type DemoOrder = {
  orderNo: string;
  buyer: string;
  type: 'welfare' | 'general' | 'biz';
  product: string;
  amount: string;
  status: 'prep' | 'delivering' | 'done' | 'confirmed';
  statusLabel: string;
  date: string;
  carrier: string;
  tracking: string;
  bizId: number | null;
};

export const DEMO_ORDERS: DemoOrder[] = [
  { orderNo: 'CZ20260609-0024', buyer: '김영자', type: 'welfare', product: '카본로얄파인더', amount: '52,500원', status: 'prep', statusLabel: '상품 준비중', date: '2026.06.09 14:32', carrier: '택배사', tracking: '', bizId: null },
  { orderNo: 'CZ20260609-0023', buyer: '박정수', type: 'general', product: '휠체어 EZ-1', amount: '450,000원', status: 'delivering', statusLabel: '배송중', date: '2026.06.09 14:18', carrier: 'CJ대한통운', tracking: '6291...', bizId: 2 },
  { orderNo: 'CZ20260609-0022', buyer: '㈜이로움파트너', type: 'biz', product: '카본로얄파인더 × 12', amount: '2,160,000원', status: 'prep', statusLabel: '상품 준비중', date: '2026.06.09 13:55', carrier: '택배사', tracking: '', bizId: 1 },
  { orderNo: 'CZ20260609-0021', buyer: '이순희', type: 'welfare', product: '유로라이트', amount: '33,750원', status: 'done', statusLabel: '배송 완료', date: '2026.06.09 13:40', carrier: '롯데택배', tracking: '4710...', bizId: null },
  { orderNo: 'CZ20260609-0020', buyer: '최광호', type: 'general', product: '미끄럼방지 목욕의자', amount: '90,000원', status: 'confirmed', statusLabel: '구매 확정', date: '2026.06.09 12:12', carrier: 'CJ대한통운', tracking: '3382...', bizId: null },
  { orderNo: 'CZ20260609-0019', buyer: '정명자', type: 'welfare', product: '로얄쿠션', amount: '40,500원', status: 'delivering', statusLabel: '배송중', date: '2026.06.09 11:08', carrier: '한진택배', tracking: '5821...', bizId: 1 },
  { orderNo: 'CZ20260609-0018', buyer: '㈜가가온', type: 'biz', product: '유로라이트 × 24', amount: '3,888,000원', status: 'delivering', statusLabel: '배송중', date: '2026.06.09 10:55', carrier: 'CJ대한통운', tracking: '9023...', bizId: 2 },
  { orderNo: 'CZ20260609-0017', buyer: '임봉기', type: 'general', product: '환희 FR01', amount: '195,000원', status: 'confirmed', statusLabel: '구매 확정', date: '2026.06.09 09:30', carrier: '롯데택배', tracking: '1147...', bizId: 2 },
];

export type DemoPoint = {
  date: string;
  bizName: string;
  type: 'earn' | 'use';
  typeLabel: string;
  amount: string;
  orderNo: string;
  balance: string;
  memo: string;
  bizId: number;
};

export const DEMO_POINTS: DemoPoint[] = [
  { date: '2026-06-09 14:32', bizName: '㈜이로움파트너', type: 'earn', typeLabel: '적립', amount: '+5,000P', orderNo: '#CZ20260609-0022', balance: '38,500P', memo: '카본로얄 12개 구매', bizId: 1 },
  { date: '2026-06-09 11:15', bizName: '㈜가가온', type: 'earn', typeLabel: '적립', amount: '+12,000P', orderNo: '#CZ20260609-0018', balance: '28,800P', memo: '유로라이트 24개', bizId: 2 },
  { date: '2026-06-08 16:20', bizName: '서울케어', type: 'use', typeLabel: '사용', amount: '-10,000P', orderNo: '#CZ20260608-0011', balance: '16,200P', memo: '휠체어 EZ-1 1개', bizId: 3 },
  { date: '2026-06-08 09:42', bizName: '㈜시니어라이프', type: 'earn', typeLabel: '적립', amount: '+18,000P', orderNo: '#CZ20260608-0007', balance: '56,500P', memo: '카본로얄 5개', bizId: 4 },
  { date: '2026-06-07 17:38', bizName: '부산복지센터', type: 'earn', typeLabel: '적립', amount: '+3,200P', orderNo: '#CZ20260607-0019', balance: '9,500P', memo: '환희 FR01 4개', bizId: 5 },
  { date: '2026-06-07 14:12', bizName: '대전메디샵', type: 'use', typeLabel: '사용', amount: '-5,400P', orderNo: '#CZ20260607-0014', balance: '20,400P', memo: '적립금 사용', bizId: 6 },
  { date: '2026-06-06 11:55', bizName: '㈜케어매니아', type: 'earn', typeLabel: '적립', amount: '+6,800P', orderNo: '#CZ20260606-0021', balance: '21,500P', memo: '로얄쿠션 3개', bizId: 7 },
  { date: '2026-06-06 10:30', bizName: '광주실버몰', type: 'earn', typeLabel: '적립', amount: '+2,100P', orderNo: '#CZ20260606-0017', balance: '6,400P', memo: '환희 FR01 2개', bizId: 8 },
  { date: '2026-06-05 15:48', bizName: '㈜이로움파트너', type: 'earn', typeLabel: '적립', amount: '+8,500P', orderNo: '#CZ20260605-0024', balance: '33,500P', memo: '로얄와이드 4개', bizId: 1 },
  { date: '2026-06-05 12:20', bizName: '㈜가가온', type: 'use', typeLabel: '사용', amount: '-15,000P', orderNo: '#CZ20260605-0013', balance: '16,800P', memo: '적립금 사용', bizId: 2 },
];

export function filterProductsByRole(role: 'admin' | 'biz', bizId?: number): DemoProduct[] {
  if (role === 'admin') return DEMO_PRODUCTS;
  return DEMO_PRODUCTS.filter((p) => p.bizId === null || p.bizId === bizId);
}

export function filterOrdersByRole(role: 'admin' | 'biz', bizId?: number): DemoOrder[] {
  if (role === 'admin') return DEMO_ORDERS;
  return DEMO_ORDERS.filter((o) => o.bizId === bizId);
}

export function filterPointsByRole(role: 'admin' | 'biz', bizId?: number): DemoPoint[] {
  if (role === 'admin') return DEMO_POINTS;
  return DEMO_POINTS.filter((p) => p.bizId === bizId);
}
