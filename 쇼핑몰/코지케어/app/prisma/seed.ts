import {
  PrismaClient,
  NotificationChannel,
  PostType,
  QnaStatus,
  InquiryStatus,
  TaxInvoiceStatus,
  QuoteStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hash = (s: string) => bcrypt.hashSync(s, 8);

// 최근 N개월 범위에서 i/total 비율로 분산된 날짜 (오늘 기준 역산)
const SEED_NOW = new Date(2026, 5, 10, 12, 0, 0); // 2026-06-10
function spreadDate(index: number, total: number, months = 6): Date {
  const start = new Date(SEED_NOW);
  start.setMonth(start.getMonth() - months);
  const span = SEED_NOW.getTime() - start.getTime();
  // 균등 분산 + index 기반 시/분 흔들기로 같은 날 뭉침 방지
  const frac = (index + 0.5) / total;
  const jitterMs = ((index * 37) % 24) * 3600_000 + ((index * 53) % 60) * 60_000;
  return new Date(start.getTime() + Math.floor(span * frac) + jitterMs);
}

async function main() {
  // 0) clean (자식 → 부모 순서)
  await prisma.notification.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.adminRole.deleteMany();
  await prisma.pointLog.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.loginLog.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.orderEvent.deleteMany();
  await prisma.welfareReview.deleteMany();
  await prisma.shipping.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  // --- 운영 확장 모델 clean (자식 → 부모) ---
  await prisma.productReview.deleteMany();
  await prisma.productQna.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.taxInvoice.deleteMany();
  await prisma.productGroupPrice.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.faqCategory.deleteMany();
  await prisma.post.deleteMany();
  await prisma.notificationTemplate.deleteMany();
  await prisma.remoteArea.deleteMany();
  await prisma.shippingFeePolicy.deleteMany();
  // bizGroup 은 bizMember.groupId 가 참조 → bizMember 보다 먼저 비우되,
  // 참조 무결성 위해 먼저 자식(productGroupPrice) 제거 후 그룹 참조 해제
  await prisma.bizMember.updateMany({ where: { groupId: { not: null } }, data: { groupId: null } });
  await prisma.bizGroup.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.bizApproval.deleteMany();
  await prisma.bizMember.deleteMany();
  await prisma.user.deleteMany();

  // 1) Users (10건)
  const userSeeds: Array<{
    email: string;
    name: string;
    role: 'admin' | 'user';
    loginId?: string;
    phone?: string;
    zonecode?: string;
    roadAddress?: string;
    detailAddress?: string;
    status?: string;
    userType?: string | null;
    birthDate?: string | null;
    lastLoginAt?: Date | null;
    dormantAt?: Date | null;
    withdrawnAt?: Date | null;
    withdrawReason?: string | null;
  }> = [
    {
      email: 'admin@cozycare.co.kr',
      name: '관리자',
      role: 'admin',
      loginId: 'admin',
      status: 'active',
      userType: 'self',
      lastLoginAt: new Date(SEED_NOW.getTime() - 2 * 3600_000),
    },
    ...['김지은', '박순영', '이호민', '정수미', '최용석', '홍길동', '오현주', '임소영', '한지수', '윤서연']
      .slice(0, 9)
      .map((n, i) => {
        // 대부분 active, 6번 idx dormant, 8번 idx withdrawn
        const status = i === 5 ? 'dormant' : i === 7 ? 'withdrawn' : 'active';
        // 보호자/본인 분배, 일부만 생년월일
        const userType = i % 3 === 0 ? 'guardian' : 'self';
        const birthDate = i % 2 === 0 ? `19${45 + i * 4}-0${1 + (i % 9)}-1${i % 9}` : null;
        // 탈퇴/휴면이 아니면 최근 N일 내 로그인
        const lastLoginAt =
          status === 'withdrawn'
            ? null
            : new Date(SEED_NOW.getTime() - (status === 'dormant' ? 95 : 1 + i) * 24 * 3600_000);
        // 휴면/탈퇴 상태에 맞춰 부가 필드 채움
        const dormantAt =
          status === 'dormant' ? new Date(SEED_NOW.getTime() - 5 * 24 * 3600_000) : null;
        const withdrawnAt =
          status === 'withdrawn' ? new Date(SEED_NOW.getTime() - 20 * 24 * 3600_000) : null;
        const withdrawReason = status === 'withdrawn' ? '서비스 미이용' : null;
        return {
          email: `user${i + 1}@example.com`,
          name: n,
          role: 'user' as const,
          phone: `010-${1000 + i * 111}-${2000 + i * 111}`,
          zonecode: `145${20 + i}`,
          roadAddress: `경기도 부천시 양지로 ${100 + i * 10}`,
          detailAddress: `${i + 1}동 ${100 + i}호`,
          status,
          userType,
          birthDate,
          lastLoginAt,
          dormantAt,
          withdrawnAt,
          withdrawReason,
        };
      }),
  ];

  const users = [];
  for (const u of userSeeds) {
    const created = await prisma.user.create({
      data: { ...u, password: hash(u.role === 'admin' ? 'a00000' : 'user1234') },
    });
    users.push(created);
  }

  // 1b) LoginLog (회원별 최근 로그인 이력 2~5건)
  const uaPool = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
    'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36',
  ];
  let loginLogCount = 0;
  for (const u of users) {
    if (u.status === 'withdrawn') continue;
    const n = 2 + (u.id % 4); // 2~5건
    for (let k = 0; k < n; k++) {
      await prisma.loginLog.create({
        data: {
          userId: u.id,
          ip: `211.${40 + (u.id % 60)}.${100 + k * 7}.${1 + (u.id * 3 + k) % 250}`,
          userAgent: uaPool[(u.id + k) % uaPool.length],
          at: new Date(SEED_NOW.getTime() - (k * 6 + (u.id % 5)) * 24 * 3600_000 - k * 1700_000),
        },
      });
      loginLogCount++;
    }
  }

  // 2) BizMembers (4건)
  const bizSeeds = [
    { loginId: 'biz1', companyName: '(주)이로움파트너', bizNo: '127-07-32131', owner: '정혜정', phone: '1551-1612', email: 'iroum@example.com', status: 'approved' as const, businessType: 'welfare_shop', memo: '복지용구 전문 판매점, 거래 우수' },
    { loginId: 'biz2', companyName: '(주)가가온', bizNo: '214-22-11023', owner: '김가온', phone: '02-5050-1122', email: 'gagaon@example.com', status: 'approved' as const, businessType: 'internet_shop', memo: '온라인 입점몰' },
    { loginId: 'biz3', companyName: '(주)편한복지', bizNo: '310-15-87651', owner: '박편한', phone: '031-7070-3344', email: 'phw@example.com', status: 'pending' as const, businessType: 'home_care', memo: '재가요양기관, 서류 검토 대기' },
    { loginId: 'biz4', companyName: '(주)실버홈', bizNo: '420-30-55012', owner: '최실버', phone: '02-9090-5566', email: 'silver@example.com', status: 'rejected' as const, businessType: 'etc', memo: '사업자등록증 사본 미제출' },
  ];
  const bizs = [];
  for (const b of bizSeeds) {
    const created = await prisma.bizMember.create({
      data: {
        ...b,
        password: hash('biz1234'),
        zonecode: '14520',
        roadAddress: '경기도 부천시 ○○로 ○○',
        detailAddress: '○○빌딩 ○층',
        licenseUrl: `/uploads/biz/license-${b.loginId}.pdf`,
        approvedAt: b.status === 'approved' ? new Date(2025, 5, 1) : null,
        rejectReason: b.status === 'rejected' ? '제출 서류 미비' : null,
        pointBalance: b.status === 'approved' ? 100000 + b.loginId.charCodeAt(3) * 1000 : 0,
      },
    });
    bizs.push(created);
  }

  // 2b) BizApproval (step 이력)
  const approvalRows: Array<{ bizId: number; step: 'submit' | 'review' | 'approve' | 'reject'; reviewer: string; note: string; at: Date }> = [];
  bizs.forEach((b) => {
    approvalRows.push({ bizId: b.id, step: 'submit', reviewer: b.companyName, note: '가입 신청', at: new Date(2025, 5, 1) });
    if (b.status !== 'pending') {
      approvalRows.push({ bizId: b.id, step: 'review', reviewer: '관리자', note: '서류 검토', at: new Date(2025, 5, 2) });
      approvalRows.push({
        bizId: b.id,
        step: b.status === 'approved' ? 'approve' : 'reject',
        reviewer: '관리자',
        note: b.status === 'approved' ? '적합' : '서류 미비',
        at: new Date(2025, 5, 3),
      });
    }
  });
  await prisma.bizApproval.createMany({ data: approvalRows });

  // 2c) Settlement (승인 사업자별 최근 3개월 정산)
  const settlementStatuses = ['done', 'done', 'processing', 'pending'];
  let settlementCount = 0;
  for (const b of bizs) {
    if (b.status !== 'approved') continue;
    for (let m = 0; m < 3; m++) {
      // 최근 3개월: 이번 달(가장 최근)이 m=0
      const d = new Date(SEED_NOW);
      d.setMonth(d.getMonth() - m);
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      // 최근 달은 진행/대기, 지난 달은 완료
      const status = m === 0 ? 'pending' : m === 1 ? settlementStatuses[2] : 'done';
      const amount = 1_200_000 + ((b.id * 7 + m * 3) % 9) * 350_000;
      await prisma.settlement.create({
        data: {
          bizId: b.id,
          period,
          amount,
          status,
          settledAt: status === 'done' ? new Date(d.getFullYear(), d.getMonth(), 25) : null,
        },
      });
      settlementCount++;
    }
  }

  // 3) Categories (7 부모 + 14 서브)
  const parents = ['보행기', '휠체어', '목욕의자', '이동변기', '전동침대', '미끄럼방지', '기타'];
  const slugs = ['walker', 'wheelchair', 'bath-chair', 'portable-toilet', 'electric-bed', 'anti-slip', 'etc'];
  const subs: Record<string, string[]> = {
    walker: ['일반보행기', '어깨형보행기'],
    wheelchair: ['수동휠체어', '전동휠체어'],
    'bath-chair': ['고정형', '회전형'],
    'portable-toilet': ['좌변기', '휴대용'],
    'electric-bed': ['1모터', '2모터'],
    'anti-slip': ['매트', '테이프'],
    etc: ['지팡이', '기타용품'],
  };
  const cats = [];
  for (let i = 0; i < parents.length; i++) {
    const p = await prisma.category.create({ data: { slug: slugs[i], name: parents[i], order: i, visible: true } });
    cats.push(p);
    let so = 0;
    for (const sn of subs[slugs[i]]) {
      await prisma.category.create({ data: { slug: `${slugs[i]}-${so}`, name: sn, parentId: p.id, order: so, visible: true } });
      so++;
    }
  }

  // 4) Products (20건)
  const images = [
    '/cozycare/images/products/eurolight.jpg',
    '/cozycare/images/products/carbon-royal.jpg',
    '/cozycare/images/products/wide-red-p04.jpg',
    '/cozycare/images/products/royal-cushion.jpg',
    '/cozycare/images/products/royal-wide.jpg',
    '/cozycare/images/products/red-front.jpg',
    '/cozycare/images/products/product-p2-1.jpg',
    '/cozycare/images/products/product-p2-2.jpg',
    '/cozycare/images/products/product-p2-3.jpg',
    '/cozycare/images/products/product-p2-4.jpg',
  ];
  const owners: (number | null)[] = [
    null, null, null, null, null,
    bizs[0].id, bizs[0].id, bizs[0].id, bizs[0].id, bizs[0].id,
    bizs[1].id, bizs[1].id, bizs[1].id, bizs[1].id,
    bizs[2].id, bizs[2].id, bizs[2].id, bizs[2].id,
    bizs[3].id, bizs[3].id,
  ];
  const prodNames = [
    '코지워커 P01', 'EZ-1 휠체어', '목욕 회전 의자', '이동식 좌변기', '전동 2모터 침대',
    '욕실 미끄럼방지 매트', '코지스틱 지팡이', '카본 보행기', '와이드 보행기', '컴팩트 휠체어',
  ];
  const managers = ['김상품', '이엠디', '박운영', null];
  const optionPresets: Array<Array<{ name: string; value: string }>> = [
    [
      { name: '색상', value: '레드' },
      { name: '색상', value: '블루' },
      { name: '색상', value: '실버' },
    ],
    [
      { name: '사이즈', value: 'S' },
      { name: '사이즈', value: 'M' },
      { name: '사이즈', value: 'L' },
    ],
    [
      { name: '좌폭', value: '40cm' },
      { name: '좌폭', value: '46cm' },
    ],
  ];
  let productOptionCount = 0;
  const prods: Awaited<ReturnType<typeof prisma.product.create>>[] = [];
  for (let i = 0; i < 20; i++) {
    const price = 50000 + (i * 17000) % 450000;
    const status: 'draft' | 'hidden' | 'published' = i % 9 === 0 ? 'draft' : i % 11 === 0 ? 'hidden' : 'published';
    const p = await prisma.product.create({
      data: {
        code: 'CZ-' + String(1001 + i).padStart(4, '0'),
        name: prodNames[i % 10],
        categoryId: cats[i % cats.length].id,
        bizId: owners[i],
        bizOnly: owners[i] !== null && i % 4 === 0,
        price,
        welfarePrice: Math.round(price * 0.15),
        supplierPrice: Math.round(price * 0.62),
        pointRate: [1, 2, 3, 5][i % 4],
        manager: managers[i % managers.length],
        stock: 30 + (i * 7) % 70,
        status,
        thumbnail: images[i % images.length],
        description: '본사 직영 또는 사업자 등록 복지용구. 알루미늄 경량 / KC 인증 완료.',
        kcCert: i % 3 === 0 ? `B201H007-${6000 + i}` : null,
      },
    });
    await prisma.productImage.createMany({
      data: [
        { productId: p.id, url: images[i % images.length], order: 0 },
        { productId: p.id, url: images[(i + 1) % images.length], order: 1 },
        { productId: p.id, url: images[(i + 2) % images.length], order: 2 },
      ],
    });
    // 일부 상품(약 절반)에 옵션 2~3개 부여
    if (i % 2 === 0) {
      const preset = optionPresets[i % optionPresets.length];
      await prisma.productOption.createMany({
        data: preset.map((o) => ({ productId: p.id, name: o.name, value: o.value })),
      });
      productOptionCount += preset.length;
    }
    prods.push(p);
  }

  // 5) Orders (30건) — createdAt 을 최근 6개월에 고르게 분산
  const ORDER_COUNT = 30;
  const couriers = ['CJ대한통운', '한진택배', '롯데택배'];
  const reviewStatuses: ('pending' | 'gov' | 'approved' | 'rejected')[] = ['pending', 'gov', 'approved', 'rejected'];
  const grades = ['1등급', '2등급', '3등급', '4등급', '5등급', '인지지원등급'];
  const requestPool = ['부재 시 경비실에 맡겨주세요', '배송 전 연락 바랍니다', '문 앞에 두고 벨 눌러주세요', '파손주의 상품입니다', null];
  const cardIssuers = ['신한', '국민', '삼성', '현대', '롯데'];
  const refundReasons = ['단순 변심', '제품 불량(좌측 바퀴 소음)', '사이즈 상이'];

  // 상태 분포: ready/shipping/delivered/confirmed 순환 + 2건은 refunded 로 덮어씀
  const baseStatuses: ('ready' | 'shipping' | 'delivered' | 'confirmed')[] = ['ready', 'shipping', 'delivered', 'confirmed'];
  const refundOrderIdx = new Set([6, 17, 25]); // 3건 환불

  let orderEventCount = 0;
  let shippingCount = 0;
  let welfareReviewCount = 0;
  let refundCount = 0;

  for (let i = 0; i < ORDER_COUNT; i++) {
    const buyer = users[1 + (i % 9)];
    const prod = prods[i % prods.length];
    const qty = 1 + (i % 3);
    const total = prod.price * qty;
    const orderBizId = prod.bizId;

    // 결제 상세: 정가 → 공단지원(복지수가 85%) → 본인부담
    const listPrice = total;
    const insuranceSupport = Math.round(total * 0.85);
    const selfPay = total - insuranceSupport;

    const isRefunded = refundOrderIdx.has(i);
    const flowStatus = baseStatuses[i % 4];
    const status: 'ready' | 'shipping' | 'delivered' | 'confirmed' | 'refunded' = isRefunded ? 'refunded' : flowStatus;

    const createdAt = spreadDate(i, ORDER_COUNT, 6);
    const paymentMethod = i % 3 === 0 ? '카카오페이' : '카드';
    const isCard = paymentMethod === '카드';
    // 결제일은 생성 후 수 분~수 시간 이내
    const paidAt = status === 'ready' && i % 5 === 0 ? null : new Date(createdAt.getTime() + (10 + (i % 50)) * 60_000);

    const order = await prisma.order.create({
      data: {
        orderNo: 'OD-' + String(20260000 + i + 1).padStart(8, '0'),
        buyerId: buyer.id,
        bizId: orderBizId,
        status,
        totalPrice: total,
        listPrice,
        insuranceSupport,
        selfPay,
        paymentMethod,
        cardInfo: isCard ? `${cardIssuers[i % cardIssuers.length]}카드 **** **** **** ${String(1000 + (i * 13) % 9000)}` : null,
        paidAt,
        memo: i % 4 === 0 ? '복지용구 급여 적용 주문' : i % 7 === 0 ? '본인부담금 카드 결제' : null,
        createdAt,
      },
    });
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: prod.id,
        qty,
        unitPrice: prod.price,
        optionLabel: i % 2 === 0 ? '색상: 실버' : '단일',
      },
    });

    // 5a) Shipping (배송지) — 구매자 정보 기반, ready 외 모든 상태(환불 포함)
    if (status !== 'ready') {
      const shipStatus: 'pending' | 'in_transit' | 'delivered' =
        status === 'shipping' ? 'in_transit' : 'delivered';
      const shippedAt = new Date(createdAt.getTime() + (1 + (i % 3)) * 24 * 3600_000);
      const deliveredAt =
        status === 'shipping' ? null : new Date(shippedAt.getTime() + (1 + (i % 2)) * 24 * 3600_000);
      await prisma.shipping.create({
        data: {
          orderId: order.id,
          recipient: buyer.name,
          phone: buyer.phone ?? '010-0000-0000',
          zonecode: buyer.zonecode ?? '14520',
          roadAddress: buyer.roadAddress ?? '경기도 부천시 양지로 100',
          detailAddress: buyer.detailAddress ?? '101동 101호',
          request: requestPool[i % requestPool.length],
          courier: couriers[i % 3],
          trackingNo: '4011' + String(1000 + i).padStart(6, '0'),
          status: shipStatus,
          shippedAt,
          deliveredAt,
        },
      });
      shippingCount++;
    }

    // 5b) OrderEvent — 상태 흐름 타임라인 (주문→결제→배송→배송완료→구매확정)
    const events: Array<{ type: string; note: string; at: Date }> = [];
    events.push({ type: 'order_placed', note: '주문 접수', at: createdAt });
    if (paidAt) events.push({ type: 'paid', note: `${paymentMethod} 결제 완료`, at: paidAt });
    // 환불이 아닌 흐름 순서대로
    const rank = { ready: 0, shipping: 1, delivered: 2, confirmed: 3, refunded: 4 } as const;
    const r = rank[status];
    const base = paidAt ?? createdAt;
    if (r >= rank.shipping)
      events.push({ type: 'shipped', note: `${couriers[i % 3]} 배송 시작`, at: new Date(base.getTime() + 1 * 24 * 3600_000) });
    if (r >= rank.delivered && status !== 'refunded')
      events.push({ type: 'delivered', note: '배송 완료', at: new Date(base.getTime() + 3 * 24 * 3600_000) });
    if (status === 'confirmed')
      events.push({ type: 'confirmed', note: '구매 확정', at: new Date(base.getTime() + 5 * 24 * 3600_000) });
    if (status === 'refunded')
      events.push({ type: 'refunded', note: '환불 처리 완료', at: new Date(base.getTime() + 4 * 24 * 3600_000) });
    for (const ev of events) {
      await prisma.orderEvent.create({ data: { orderId: order.id, type: ev.type, note: ev.note, at: ev.at } });
      orderEventCount++;
    }

    // 5c) Refund — 환불 주문에 레코드 생성
    if (status === 'refunded') {
      await prisma.refund.create({
        data: {
          orderId: order.id,
          amount: selfPay,
          reason: refundReasons[refundCount % refundReasons.length],
          status: 'done',
          createdAt: new Date(base.getTime() + 4 * 24 * 3600_000),
        },
      });
      refundCount++;
    }

    // 5d) WelfareReview — 복지용구 급여 심사 (grade/certNo 채움, 일부 gov)
    if (i % 2 === 0) {
      // 짝수 i 만 들어오므로 (i/2) 로 4개 상태를 고르게 순환 → pending/gov/approved/rejected 모두 등장
      const rs = reviewStatuses[(i / 2) % 4];
      await prisma.welfareReview.create({
        data: {
          orderId: order.id,
          buyerId: buyer.id,
          docUrl: '/uploads/welfare/sample.pdf',
          grade: grades[i % grades.length],
          certNo: 'L' + String(20250000 + i * 37).padStart(8, '0'),
          status: rs,
          reviewer: rs === 'pending' ? null : rs === 'gov' ? '공단연계' : '관리자',
          note: rs === 'rejected' ? '장기요양 인정서 누락' : rs === 'gov' ? '공단 자격 확인 중' : '',
          reviewedAt: rs === 'approved' || rs === 'rejected' ? new Date(createdAt.getTime() + 2 * 24 * 3600_000) : null,
          createdAt,
        },
      });
      welfareReviewCount++;
    }
  }

  // 6) PointLog (40건)
  const ptypes: ('earn' | 'use' | 'expire')[] = ['earn', 'use', 'expire'];
  let pointLogCount = 0;
  for (let i = 0; i < 40; i++) {
    const b = bizs[i % bizs.length];
    if (b.status !== 'approved') continue;
    const amt = 1000 + (i * 173) % 18000;
    const type = ptypes[i % 3];
    const sign = type === 'earn' ? 1 : -1;
    await prisma.pointLog.create({
      data: {
        bizId: b.id,
        type,
        amount: amt,
        balance: 100000 + i * sign * amt,
        memo: `${b.companyName} ${type === 'earn' ? '적립' : type === 'use' ? '사용' : '만료'} #${i + 1}`,
      },
    });
    pointLogCount++;
  }

  // 7) Setting (10건)
  const settings: [string, string][] = [
    ['company.name', '(주)코지케어'],
    ['company.phone', '1588-0000'],
    ['company.email', 'cs@cozycare.co.kr'],
    ['ship.fee', '3000'],
    ['ship.free.over', '50000'],
    ['welfare.rate.normal', '0.15'],
    ['welfare.rate.discount50', '0.09'],
    ['welfare.rate.basic', '0.06'],
    ['biz.point.rate', '0.02'],
    ['notification.kakao.enabled', 'true'],
  ];
  for (const [k, v] of settings) {
    await prisma.setting.create({ data: { key: k, value: v, scope: 'global' } });
  }

  // 8) Notification (6건)
  const notifs: Array<{ audience: string; channel: 'sms' | 'kakao' | 'email'; template: string; memo: string }> = [
    { audience: 'order.confirmed', channel: 'kakao', template: '주문확인_알림톡', memo: '결제 완료 시 발송' },
    { audience: 'shipping.dispatched', channel: 'sms', template: '배송시작_SMS', memo: '송장번호 입력 시' },
    { audience: 'welfare.approved', channel: 'kakao', template: '복지서류통과_알림톡', memo: '' },
    { audience: 'welfare.rejected', channel: 'kakao', template: '복지서류반려_알림톡', memo: '' },
    { audience: 'biz.signup', channel: 'email', template: '사업자가입_이메일', memo: '' },
    { audience: 'biz.approved', channel: 'email', template: '사업자승인_이메일', memo: '' },
  ];
  await prisma.notification.createMany({ data: notifs });

  // 9) AdminRole (5개) — permissions 는 권한키 배열 JSON 문자열
  const adminRoles: Array<{ key: string; name: string; permissions: string[]; otpRequired: boolean }> = [
    {
      key: 'super',
      name: '최고관리자',
      permissions: ['*'],
      otpRequired: true,
    },
    {
      key: 'order_manager',
      name: '주문매니저',
      permissions: ['order.read', 'order.update', 'shipping.read', 'shipping.update', 'refund.read', 'refund.process'],
      otpRequired: false,
    },
    {
      key: 'reviewer',
      name: '검토자',
      permissions: ['biz.read', 'biz.approve', 'welfare.read', 'welfare.review'],
      otpRequired: true,
    },
    {
      key: 'product_manager',
      name: '상품매니저',
      permissions: ['product.read', 'product.create', 'product.update', 'category.read', 'category.update'],
      otpRequired: false,
    },
    {
      key: 'cs',
      name: 'CS',
      permissions: ['order.read', 'user.read', 'notification.send'],
      otpRequired: false,
    },
  ];
  for (const r of adminRoles) {
    await prisma.adminRole.create({
      data: { key: r.key, name: r.name, permissions: JSON.stringify(r.permissions), otpRequired: r.otpRequired },
    });
  }

  // =====================================================================
  // 운영 확장 모델 시드 (CS / B2B / 마케팅 / 배송정책)
  // 위에서 생성한 in-memory users / bizs / prods 를 그대로 사용한다.
  // =====================================================================
  const daysAgo = (n: number): Date => new Date(SEED_NOW.getTime() - n * 24 * 3600_000);
  const memberUsers = users.filter((u) => u.role === 'user'); // 9명
  const approvedBizs = bizs.filter((b) => b.status === 'approved'); // biz1, biz2

  // 10) ProductReview — 모든 상품에 2~4건 (평점 1~5 분산, 일부 답변)
  const reviewSnippets = [
    { t: '어머니가 너무 편해하세요', c: '바퀴가 부드럽게 굴러가서 혼자서도 잘 다니십니다. 브레이크도 잘 잡혀요.' },
    { t: '튼튼합니다', c: '생각보다 무게가 있어 안정적이에요. 다만 접을 때 살짝 뻑뻑합니다.' },
    { t: '복지용구로 저렴하게 구매', c: '15% 부담금으로 구매했는데 품질이 정말 좋네요. 추천합니다.' },
    { t: '아버지 선물로 드렸어요', c: '높이 조절이 쉬워서 키 큰 아버지도 편하게 쓰십니다.' },
    { t: '무난해요', c: '가격 대비 괜찮습니다. 시트가 조금 더 푹신했으면 좋겠어요.' },
    { t: '배송 빨라요', c: '주문하고 이틀 만에 받았습니다. 포장도 꼼꼼했어요.' },
    { t: '효도 제대로', c: '할머니가 산책을 다시 시작하셨어요. 정말 감사합니다.' },
    { t: '욕실에서 잘 써요', c: '미끄럼 방지가 확실해서 안심됩니다.' },
    { t: '재구매 의사 있어요', c: '두 번째 구매인데 만족도가 높습니다.' },
    { t: '조금 아쉬워요', c: '기능은 좋은데 설명서가 부실합니다.' },
  ];
  const ratingPool = [5, 4, 5, 3, 4, 5, 2, 4, 5, 1];
  for (let pi = 0; pi < prods.length; pi++) {
    const p = prods[pi];
    const n = 2 + (pi % 3); // 2~4건
    for (let k = 0; k < n; k++) {
      const seq = pi * 4 + k;
      const u = memberUsers[seq % memberUsers.length];
      const snip = reviewSnippets[seq % reviewSnippets.length];
      const rating = ratingPool[seq % ratingPool.length];
      const replied = seq % 4 === 0;
      const createdAt = daysAgo((seq % 90) + 1);
      await prisma.productReview.create({
        data: {
          productId: p.id,
          userId: u.id,
          authorName: u.name,
          rating,
          title: k === n - 1 ? null : snip.t,
          content: snip.c,
          imageUrl: seq % 6 === 0 ? '/cozycare/images/products/product-p2-1.jpg' : null,
          reply: replied ? '소중한 후기 감사합니다. 더 좋은 제품으로 보답하겠습니다. — 코지케어' : null,
          repliedAt: replied ? daysAgo(seq % 90) : null,
          status: rating <= 2 && seq % 7 === 0 ? 'hidden' : 'visible',
          createdAt,
        },
      });
    }
  }

  // 11) ProductQna — 상품 문의 (일부 answered, 일부 pending, 일부 secret)
  const qnaSrc = [
    { q: '제가 장기요양 4등급인데 복지용구로 구매 가능한가요?', a: '네, 인정번호 확인 후 15% 부담금으로 구매 가능합니다. 상세 안내는 복지용구 안내 페이지를 참고해 주세요.' },
    { q: '최대 몸무게 몇 kg까지 사용할 수 있나요?', a: '최대 100kg까지 안전하게 사용 가능합니다.' },
    { q: '보호자가 대신 주문해도 되나요?', a: '가능합니다. 결제 시 사용자(본인) 정보와 인정번호를 함께 입력해 주세요.' },
    { q: '색상은 어떤 게 있나요?', a: null },
    { q: 'A/S 기간이 어떻게 되나요?', a: '구매일로부터 1년간 무상 A/S가 제공됩니다.' },
    { q: '제주도 배송 되나요?', a: null },
    { q: '접이식인가요? 차에 실리나요?', a: '접이식이며 트렁크에 충분히 들어갑니다.' },
    { q: '재고가 있나요? 언제 발송되나요?', a: null },
    { q: '인증서 첨부가 가능한가요?', a: 'KC 인증 완료 제품이며 상세페이지에 인증번호가 기재되어 있습니다.' },
    { q: '세금계산서 발행되나요?', a: '사업자 회원은 마이페이지에서 발행 요청이 가능합니다.' },
  ];
  for (let i = 0; i < qnaSrc.length; i++) {
    const it = qnaSrc[i];
    const p = prods[(i * 2) % prods.length];
    const u = memberUsers[(i + 2) % memberUsers.length];
    const answered = it.a !== null;
    await prisma.productQna.create({
      data: {
        productId: p.id,
        userId: u.id,
        authorName: u.name,
        question: it.q,
        answer: it.a,
        answeredBy: answered ? '관리자' : null,
        answeredAt: answered ? daysAgo(i) : null,
        secret: i % 4 === 0,
        status: answered ? QnaStatus.answered : QnaStatus.pending,
        createdAt: daysAgo(i * 2 + 1),
      },
    });
  }

  // 12) Inquiry — 1:1 문의 (일부 답변/상태 다양)
  const inqSrc = [
    { cat: '복지용구', t: '인정번호 확인이 안 돼요', c: '서류를 제출했는데 검토 중이라고만 나옵니다. 얼마나 걸리나요?', onBehalf: false, st: 'answered' as const },
    { cat: '배송', t: '언제 출고되나요?', c: '결제한 지 3일 됐는데 아직 배송 준비중입니다.', onBehalf: true, st: 'answered' as const },
    { cat: '반품/교환', t: '사이즈 교환 가능한가요', c: '생각보다 커서 한 단계 작은 걸로 교환하고 싶어요.', onBehalf: false, st: 'open' as const },
    { cat: '구매', t: '두 개 구매 시 할인 없나요?', c: '부모님 두 분 것을 함께 사려고 합니다.', onBehalf: true, st: 'open' as const },
    { cat: '사업자', t: '사업자 가입 승인이 늦어요', c: '사업자등록증 첨부했는데 승인 대기 중입니다.', onBehalf: false, st: 'answered' as const },
    { cat: '복지용구', t: '대여 품목도 있나요?', c: '전동침대는 구입인가요 대여인가요?', onBehalf: false, st: 'open' as const },
    { cat: '일반', t: '세금계산서 발행 문의', c: '사업소인데 세금계산서 받을 수 있나요?', onBehalf: false, st: 'closed' as const },
  ];
  for (let i = 0; i < inqSrc.length; i++) {
    const it = inqSrc[i];
    const u = memberUsers[(i + 1) % memberUsers.length];
    const answered = it.st === 'answered' || it.st === 'closed';
    await prisma.inquiry.create({
      data: {
        userId: u.id,
        category: it.cat,
        title: it.t,
        content: it.c,
        authorName: u.name,
        phone: u.phone ?? '010-0000-0000',
        onBehalf: it.onBehalf,
        answer: answered ? '문의 주셔서 감사합니다. 확인 후 안내드렸습니다.' : null,
        answeredBy: answered ? '관리자' : null,
        answeredAt: answered ? daysAgo(i) : null,
        status:
          it.st === 'answered'
            ? InquiryStatus.answered
            : it.st === 'closed'
              ? InquiryStatus.closed
              : InquiryStatus.open,
        createdAt: daysAgo(i * 2 + 1),
      },
    });
  }

  // 13) NotificationTemplate — 주문/배송/정산 등 알림톡 템플릿
  await prisma.notificationTemplate.createMany({
    data: [
      { code: 'order_paid', name: '결제 완료 안내', channel: NotificationChannel.kakao, trigger: '결제완료', content: '{{이름}}님, 주문 {{주문번호}} 결제가 완료되었습니다. 빠르게 준비하겠습니다.', enabled: true },
      { code: 'doc_review', name: '복지용구 서류 검토중', channel: NotificationChannel.kakao, trigger: '서류검토', content: '{{이름}}님, 제출하신 복지용구 서류를 검토 중입니다. 공단 확인 후 안내드리겠습니다.', enabled: true },
      { code: 'gov_check', name: '공단 확인중', channel: NotificationChannel.kakao, trigger: '공단확인', content: '{{이름}}님의 장기요양 인정 내역을 공단에 확인 중입니다. (1~2영업일 소요)', enabled: true },
      { code: 'shipped', name: '출고/송장 안내', channel: NotificationChannel.kakao, trigger: '출고', content: '{{이름}}님, {{상품명}} 상품이 출고되었습니다. 송장번호 {{송장번호}}', enabled: true },
      { code: 'delivered', name: '배송 완료', channel: NotificationChannel.sms, trigger: '배송완료', content: '{{이름}}님, 주문하신 상품이 배송 완료되었습니다.', enabled: true },
      { code: 'refund_done', name: '환불 완료', channel: NotificationChannel.kakao, trigger: '환불완료', content: '{{이름}}님, 주문 {{주문번호}} 환불이 완료되었습니다.', enabled: false },
      { code: 'settle_done', name: '정산 완료 안내', channel: NotificationChannel.email, trigger: '정산완료', content: '{{사업자명}} 정산 {{정산월}} 처리가 완료되었습니다. 금액 {{금액}}원.', enabled: true },
      { code: 'biz_approved', name: '사업자 가입 승인', channel: NotificationChannel.kakao, trigger: '사업자승인', content: '{{이름}} 담당자님, 사업자 회원 가입이 승인되었습니다.', enabled: true },
    ],
  });

  // 14) FaqCategory + Faq (카테고리 5 + FAQ 14건)
  const faqTree: Array<{ name: string; items: Array<{ q: string; a: string }> }> = [
    { name: '복지용구', items: [
      { q: '장기요양 인정번호는 어디서 확인하나요?', a: '국민건강보험공단 장기요양보험(1577-1000) 또는 The건강보험 앱에서 확인 가능합니다.' },
      { q: '본인부담금 15%는 누구나 동일한가요?', a: '일반대상자는 15%, 감경대상자는 6~9%, 기초생활수급자는 면제입니다.' },
      { q: '연간 구매 한도가 있나요?', a: '복지용구는 연 한도(약 160만원) 내에서 급여로 구매할 수 있습니다.' },
      { q: '대여 품목과 구입 품목 차이가 있나요?', a: '전동침대 등 일부는 대여, 보행기·휠체어 등은 구입 품목입니다.' },
    ] },
    { name: '구매/결제', items: [
      { q: '복지용구 결제는 누가 받나요?', a: '복지용구는 관계사인 ㈜베스트시니어에서 결제가 진행됩니다.' },
      { q: '어떤 결제수단을 지원하나요?', a: '신용카드·계좌이체·카카오페이를 지원합니다.' },
      { q: '본인부담금만 결제하면 되나요?', a: '네, 공단 지원분을 제외한 본인부담금만 결제하시면 됩니다.' },
    ] },
    { name: '배송', items: [
      { q: '배송은 얼마나 걸리나요?', a: '서류 확인 후 평균 2~3일 내 출고됩니다.' },
      { q: '제주/도서산간도 배송되나요?', a: '가능하며 추가 배송비가 발생할 수 있습니다.' },
      { q: '배송비는 얼마인가요?', a: '기본 3,000원이며 5만원 이상 구매 시 무료입니다.' },
    ] },
    { name: '반품/교환', items: [
      { q: '단순 변심도 반품되나요?', a: '미개봉 상태에서 수령 후 7일 이내 가능합니다. (왕복 배송비 부담)' },
      { q: '공단 확인 불가 시 어떻게 되나요?', a: '결제 금액은 전액 환불 처리됩니다.' },
    ] },
    { name: '사업자', items: [
      { q: '사업자 회원은 어떻게 가입하나요?', a: '사업자등록증을 첨부해 신청하면 1~2영업일 내 승인됩니다.' },
      { q: '세금계산서 발행이 되나요?', a: '사업자 회원은 마이페이지에서 발행 요청이 가능합니다.' },
    ] },
  ];
  for (let ci = 0; ci < faqTree.length; ci++) {
    const cat = await prisma.faqCategory.create({ data: { name: faqTree[ci].name, order: ci } });
    await prisma.faq.createMany({
      data: faqTree[ci].items.map((it, i) => ({
        categoryId: cat.id,
        question: it.q,
        answer: it.a,
        order: i,
        visible: !(ci === 3 && i === 1), // 일부 비공개 샘플
        createdAt: daysAgo(ci * 2 + i),
      })),
    });
  }

  // 15) Post — 공지/이벤트 (6건)
  await prisma.post.createMany({
    data: [
      { type: PostType.notice, title: '[공지] 설 연휴 배송 안내', content: '설 연휴 기간 출고가 일시 중단됩니다. 자세한 일정은 본문을 확인해 주세요.', pinned: true, visible: true, views: 342, createdAt: daysAgo(5) },
      { type: PostType.notice, title: '[공지] 복지용구 본인부담금 안내 업데이트', content: '2026년 복지용구 급여 기준이 일부 변경되었습니다.', pinned: false, visible: true, views: 198, createdAt: daysAgo(12) },
      { type: PostType.notice, title: '[공지] 개인정보처리방침 개정 안내', content: '개인정보처리방침이 개정되었습니다.', pinned: false, visible: true, views: 87, createdAt: daysAgo(20) },
      { type: PostType.notice, title: '[공지] 고객센터 운영시간 변경', content: '평일 09:00~18:00로 운영됩니다.', pinned: false, visible: false, views: 41, createdAt: daysAgo(30) },
      { type: PostType.event, title: '어버이날 효도 기획전 (최대 20%)', content: '어버이날 맞이 보행기·휠체어 특가전을 진행합니다.', pinned: true, visible: true, views: 1203, startAt: daysAgo(2), endAt: daysAgo(-12), createdAt: daysAgo(3) },
      { type: PostType.event, title: '신규 가입 5,000P 적립 이벤트', content: '신규 회원가입 시 적립금을 드립니다.', pinned: false, visible: true, views: 654, startAt: daysAgo(10), endAt: daysAgo(-20), createdAt: daysAgo(10) },
    ],
  });

  // 16) BizGroup + 등급 배정 + ProductGroupPrice
  await prisma.bizGroup.create({ data: { code: 'general', name: '일반 사업소', discountRate: 0, pointRate: 1, memo: '기본 등급' } });
  const gPremium = await prisma.bizGroup.create({ data: { code: 'premium', name: '우수 사업소', discountRate: 5, pointRate: 2, memo: '월 500만원 이상' } });
  const gVip = await prisma.bizGroup.create({ data: { code: 'vip', name: 'VIP 사업소', discountRate: 10, pointRate: 3, memo: '월 1천만원 이상' } });
  if (approvedBizs[0]) await prisma.bizMember.update({ where: { id: approvedBizs[0].id }, data: { groupId: gPremium.id, creditLimit: 3000000 } });
  if (approvedBizs[1]) await prisma.bizMember.update({ where: { id: approvedBizs[1].id }, data: { groupId: gVip.id, creditLimit: 5000000 } });
  // 그룹별 상품 단가 오버라이드 (일부 상품)
  for (let i = 0; i < Math.min(3, prods.length); i++) {
    const base = prods[i].supplierPrice ?? prods[i].price;
    await prisma.productGroupPrice.create({ data: { groupId: gVip.id, productId: prods[i].id, price: Math.round(base * 0.9) } });
    await prisma.productGroupPrice.create({ data: { groupId: gPremium.id, productId: prods[i].id, price: Math.round(base * 0.95) } });
  }

  // 17) Quote + QuoteItem — 사업자 견적 (상태 다양)
  if (approvedBizs.length > 0) {
    const quoteSrc: Array<{ biz: number; title: string; status: QuoteStatus; items: number[]; days: number }> = [
      { biz: 0, title: '6월 정기 발주', status: QuoteStatus.ordered, items: [0, 1, 2], days: 6 },
      { biz: 1, title: '여름 시즌 대량 구매', status: QuoteStatus.quoted, items: [1, 3], days: 3 },
      { biz: 0, title: '신규 거래처 납품용', status: QuoteStatus.requested, items: [0, 2, 4], days: 1 },
      { biz: 1, title: '예산 초과로 보류', status: QuoteStatus.rejected, items: [5, 6], days: 9 },
    ];
    for (let qi = 0; qi < quoteSrc.length; qi++) {
      const q = quoteSrc[qi];
      const biz = approvedBizs[q.biz % approvedBizs.length];
      const items = q.items.map((pi) => {
        const p = prods[pi % prods.length];
        const unit = p.supplierPrice ?? p.price;
        return { productId: p.id, productName: p.name, qty: (pi % 5) + 5, unitPrice: unit };
      });
      const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
      await prisma.quote.create({
        data: {
          quoteNo: `Q-2026060${qi + 1}`,
          bizId: biz.id,
          title: q.title,
          status: q.status,
          totalAmount: total,
          validUntil: daysAgo(-14),
          createdAt: daysAgo(q.days),
          items: { create: items },
        },
      });
    }
  }

  // 18) TaxInvoice — 승인 사업자 (상태 다양)
  if (approvedBizs.length > 0) {
    const taxRows: Array<{ biz: number; period: string; item: string; supply: number; status: TaxInvoiceStatus; days: number }> = [
      { biz: 0, period: '2026-05', item: '복지용구 외', supply: 4200000, status: TaxInvoiceStatus.issued, days: 8 },
      { biz: 1, period: '2026-05', item: '휠체어 외', supply: 8800000, status: TaxInvoiceStatus.issued, days: 8 },
      { biz: 0, period: '2026-06', item: '보행기 외', supply: 3100000, status: TaxInvoiceStatus.requested, days: 2 },
      { biz: 1, period: '2026-06', item: '목욕의자 외', supply: 1500000, status: TaxInvoiceStatus.requested, days: 1 },
      { biz: 0, period: '2026-04', item: '복지용구 외', supply: 2600000, status: TaxInvoiceStatus.cancelled, days: 40 },
    ];
    for (const t of taxRows) {
      const biz = approvedBizs[t.biz % approvedBizs.length];
      const tax = Math.round(t.supply * 0.1);
      await prisma.taxInvoice.create({
        data: {
          bizId: biz.id,
          period: t.period,
          itemName: t.item,
          supplyAmount: t.supply,
          taxAmount: tax,
          totalAmount: t.supply + tax,
          status: t.status,
          ntsNo: t.status === TaxInvoiceStatus.issued ? `2026${String(t.days).padStart(8, '0')}` : null,
          issuedAt: t.status === TaxInvoiceStatus.issued ? daysAgo(t.days) : null,
          memo: t.status === TaxInvoiceStatus.cancelled ? '거래 취소로 인한 발행 취소' : null,
          createdAt: daysAgo(t.days),
        },
      });
    }
  }

  // 19) ShippingFeePolicy + RemoteArea
  await prisma.shippingFeePolicy.create({ data: { name: '기본 배송정책', baseFee: 3000, freeThreshold: 50000, jejuFee: 3000, islandFee: 5000, isDefault: true } });
  await prisma.shippingFeePolicy.create({ data: { name: '복지용구 무료배송', baseFee: 0, freeThreshold: 0, jejuFee: 3000, islandFee: 5000, isDefault: false } });
  await prisma.remoteArea.createMany({
    data: [
      { zipFrom: '63000', zipTo: '63644', region: '제주특별자치도', extraFee: 3000 },
      { zipFrom: '40200', zipTo: '40240', region: '울릉군', extraFee: 5000 },
      { zipFrom: '23004', zipTo: '23010', region: '인천 옹진군(백령도)', extraFee: 5000 },
      { zipFrom: '59650', zipTo: '59766', region: '전남 신안군 도서', extraFee: 4000 },
    ],
  });

  // counts
  const counts = {
    User: await prisma.user.count(),
    LoginLog: await prisma.loginLog.count(),
    BizMember: await prisma.bizMember.count(),
    BizApproval: await prisma.bizApproval.count(),
    Settlement: await prisma.settlement.count(),
    Category: await prisma.category.count(),
    Product: await prisma.product.count(),
    ProductImage: await prisma.productImage.count(),
    ProductOption: await prisma.productOption.count(),
    Order: await prisma.order.count(),
    OrderItem: await prisma.orderItem.count(),
    OrderEvent: await prisma.orderEvent.count(),
    Refund: await prisma.refund.count(),
    Shipping: await prisma.shipping.count(),
    WelfareReview: await prisma.welfareReview.count(),
    PointLog: await prisma.pointLog.count(),
    Setting: await prisma.setting.count(),
    Notification: await prisma.notification.count(),
    AdminRole: await prisma.adminRole.count(),
    ProductReview: await prisma.productReview.count(),
    ProductQna: await prisma.productQna.count(),
    Inquiry: await prisma.inquiry.count(),
    NotificationTemplate: await prisma.notificationTemplate.count(),
    FaqCategory: await prisma.faqCategory.count(),
    Faq: await prisma.faq.count(),
    Post: await prisma.post.count(),
    BizGroup: await prisma.bizGroup.count(),
    ProductGroupPrice: await prisma.productGroupPrice.count(),
    Quote: await prisma.quote.count(),
    QuoteItem: await prisma.quoteItem.count(),
    TaxInvoice: await prisma.taxInvoice.count(),
    ShippingFeePolicy: await prisma.shippingFeePolicy.count(),
    RemoteArea: await prisma.remoteArea.count(),
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log('seed done', counts, 'TOTAL=' + total);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
