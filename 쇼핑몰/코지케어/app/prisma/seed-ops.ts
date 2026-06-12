/**
 * 운영 확장 기능(리뷰·QnA·문의·FAQ·게시판·알림톡·세금계산서·견적·그룹·배송비·정산·환불) 더미 데이터.
 * 기존 데이터는 건드리지 않고, 신규 모델만 비우고 다시 채운다. 재실행 안전(멱등).
 * 실행: npx tsx prisma/seed-ops.ts
 */
import { prisma } from '../lib/prisma';
import { NotificationChannel, PostType, QnaStatus, InquiryStatus, TaxInvoiceStatus, QuoteStatus } from '@prisma/client';

const daysAgo = (n: number): Date => new Date(Date.now() - n * 86400000);
const pick = <T>(arr: T[], i: number): T => arr[i % arr.length];

async function main() {
  const users = await prisma.user.findMany({ where: { role: 'user' }, select: { id: true, name: true, phone: true }, orderBy: { id: 'asc' } });
  const products = await prisma.product.findMany({ select: { id: true, name: true, supplierPrice: true, price: true }, orderBy: { id: 'asc' } });
  const bizList = await prisma.bizMember.findMany({ where: { status: 'approved' }, select: { id: true, companyName: true }, orderBy: { id: 'asc' } });

  if (users.length === 0 || products.length === 0) {
    console.error('기존 회원/상품 데이터가 없습니다. 먼저 메인 시드를 실행하세요.');
    return;
  }

  // ---------- 0. 회원 적립금(포인트) ----------
  const pointPreset = [12500, 3200, 28000, 5400, 0, 9800, 41000, 1500, 7600];
  for (let i = 0; i < users.length; i++) {
    await prisma.user.update({ where: { id: users[i].id }, data: { points: pick(pointPreset, i) } });
  }

  // ---------- 1. 상품평 ----------
  await prisma.productReview.deleteMany();
  const reviewTexts = [
    { r: 5, t: '어머니가 너무 편해하세요', c: '바퀴가 부드럽게 굴러가서 혼자서도 잘 다니십니다. 브레이크도 잘 잡혀요.' },
    { r: 4, t: '튼튼합니다', c: '생각보다 무게가 있어 안정적이에요. 다만 접을 때 살짝 뻑뻑합니다.' },
    { r: 5, t: '복지용구로 저렴하게 구매', c: '15% 부담금으로 구매했는데 품질이 정말 좋네요. 추천합니다.' },
    { r: 5, t: '아버지 선물로 드렸어요', c: '높이 조절이 쉬워서 키 큰 아버지도 편하게 쓰십니다.' },
    { r: 3, t: '무난해요', c: '가격 대비 괜찮습니다. 시트가 조금 더 푹신했으면 좋겠어요.' },
    { r: 4, t: '배송 빨라요', c: '주문하고 이틀 만에 받았습니다. 포장도 꼼꼼했어요.' },
    { r: 5, t: '효도 제대로', c: '할머니가 산책을 다시 시작하셨어요. 정말 감사합니다.' },
    { r: 4, t: '욕실에서 잘 써요', c: '미끄럼 방지가 확실해서 안심됩니다.' },
  ];
  const reviewData = reviewTexts.flatMap((rv, i) => {
    const u = pick(users, i);
    const p = pick(products, i);
    const base = { productId: p.id, userId: u.id, authorName: u.name, rating: rv.r, title: rv.t, content: rv.c, createdAt: daysAgo(i * 3 + 1) };
    return i % 3 === 0
      ? [{ ...base, reply: '소중한 후기 감사합니다. 더 좋은 제품으로 보답하겠습니다. — 코지케어', repliedAt: daysAgo(i * 3) }]
      : [base];
  });
  // 일부는 다른 상품에도 추가
  for (let i = 0; i < 4; i++) {
    const u = pick(users, i + 4);
    const p = pick(products, i + 4);
    reviewData.push({ productId: p.id, userId: u.id, authorName: u.name, rating: (i % 3) + 3, title: '', content: pick(reviewTexts, i + 2).c, createdAt: daysAgo(i * 2) });
  }
  await prisma.productReview.createMany({ data: reviewData });

  // ---------- 2. 상품 Q&A ----------
  await prisma.productQna.deleteMany();
  const qnaSrc = [
    { q: '제가 장기요양 4등급인데 복지용구로 구매 가능한가요?', a: '네, 인정번호 확인 후 15% 부담금으로 구매 가능합니다. 상세 안내는 복지용구 안내 페이지를 참고해 주세요.' },
    { q: '최대 몸무게 몇 kg까지 사용할 수 있나요?', a: '최대 100kg까지 안전하게 사용 가능합니다.' },
    { q: '보호자가 대신 주문해도 되나요?', a: '가능합니다. 결제 시 사용자(본인) 정보와 인정번호를 함께 입력해 주세요.' },
    { q: '색상은 어떤 게 있나요?', a: null },
    { q: 'A/S 기간이 어떻게 되나요?', a: '구매일로부터 1년간 무상 A/S가 제공됩니다.' },
    { q: '제주도 배송 되나요?', a: null },
    { q: '접이식인가요? 차에 실리나요?', a: '접이식이며 트렁크에 충분히 들어갑니다.' },
  ];
  await prisma.productQna.createMany({
    data: qnaSrc.map((it, i) => {
      const u = pick(users, i + 2);
      const p = pick(products, i);
      return {
        productId: p.id, userId: u.id, authorName: u.name, question: it.q,
        answer: it.a, answeredBy: it.a ? 'admin' : null, answeredAt: it.a ? daysAgo(i) : null,
        secret: i % 4 === 0, status: it.a ? QnaStatus.answered : QnaStatus.pending, createdAt: daysAgo(i * 2 + 1),
      };
    }),
  });

  // ---------- 3. 1:1 문의 ----------
  await prisma.inquiry.deleteMany();
  const inqSrc = [
    { cat: '복지용구', t: '인정번호 확인이 안 돼요', c: '서류를 제출했는데 검토 중이라고만 나옵니다. 얼마나 걸리나요?', onBehalf: false, answered: true },
    { cat: '배송', t: '언제 출고되나요?', c: '결제한 지 3일 됐는데 아직 배송 준비중입니다.', onBehalf: true, answered: true },
    { cat: '반품/교환', t: '사이즈 교환 가능한가요', c: '생각보다 커서 한 단계 작은 걸로 교환하고 싶어요.', onBehalf: false, answered: false },
    { cat: '구매', t: '두 개 구매 시 할인 없나요?', c: '부모님 두 분 것을 함께 사려고 합니다.', onBehalf: true, answered: false },
    { cat: '사업자', t: '사업자 가입 승인이 늦어요', c: '사업자등록증 첨부했는데 승인 대기 중입니다.', onBehalf: false, answered: true },
    { cat: '복지용구', t: '대여 품목도 있나요?', c: '전동침대는 구입인가요 대여인가요?', onBehalf: false, answered: false },
    { cat: '일반', t: '세금계산서 발행 문의', c: '사업소인데 세금계산서 받을 수 있나요?', onBehalf: false, answered: true },
  ];
  await prisma.inquiry.createMany({
    data: inqSrc.map((it, i) => {
      const u = pick(users, i + 1);
      return {
        userId: u.id, category: it.cat, title: it.t, content: it.c, authorName: u.name, phone: u.phone ?? '010-0000-0000',
        onBehalf: it.onBehalf, answer: it.answered ? '문의 주셔서 감사합니다. 확인 후 안내드렸습니다.' : null,
        answeredBy: it.answered ? 'admin' : null, answeredAt: it.answered ? daysAgo(i) : null,
        status: it.answered ? InquiryStatus.answered : InquiryStatus.open, createdAt: daysAgo(i * 2 + 1),
      };
    }),
  });

  // ---------- 4. 알림톡 템플릿 ----------
  await prisma.notificationTemplate.deleteMany();
  await prisma.notificationTemplate.createMany({
    data: [
      { code: 'order_paid', name: '결제 완료 안내', channel: NotificationChannel.kakao, trigger: '결제완료', content: '{{이름}}님, 주문 {{주문번호}} 결제가 완료되었습니다. 빠르게 준비하겠습니다.', enabled: true },
      { code: 'doc_review', name: '복지용구 서류 검토중', channel: NotificationChannel.kakao, trigger: '서류검토', content: '{{이름}}님, 제출하신 복지용구 서류를 검토 중입니다. 공단 확인 후 안내드리겠습니다.', enabled: true },
      { code: 'gov_check', name: '공단 확인중', channel: NotificationChannel.kakao, trigger: '공단확인', content: '{{이름}}님의 장기요양 인정 내역을 공단에 확인 중입니다. (1~2영업일 소요)', enabled: true },
      { code: 'shipped', name: '출고/송장 안내', channel: NotificationChannel.kakao, trigger: '출고', content: '{{이름}}님, {{상품명}} 상품이 출고되었습니다. 송장번호 {{송장번호}}', enabled: true },
      { code: 'delivered', name: '배송 완료', channel: NotificationChannel.kakao, trigger: '배송완료', content: '{{이름}}님, 주문하신 상품이 배송 완료되었습니다.', enabled: true },
      { code: 'refund_done', name: '환불 완료', channel: NotificationChannel.kakao, trigger: '환불완료', content: '{{이름}}님, 주문 {{주문번호}} 환불이 완료되었습니다.', enabled: false },
      { code: 'biz_approved', name: '사업자 가입 승인', channel: NotificationChannel.kakao, trigger: '사업자승인', content: '{{이름}} 담당자님, 사업자 회원 가입이 승인되었습니다.', enabled: true },
    ],
  });

  // ---------- 5. FAQ ----------
  await prisma.faq.deleteMany();
  await prisma.faqCategory.deleteMany();
  const faqTree: Array<{ name: string; items: Array<{ q: string; a: string }> }> = [
    { name: '복지용구', items: [
      { q: '장기요양 인정번호는 어디서 확인하나요?', a: '국민건강보험공단 장기요양보험(1577-1000) 또는 The건강보험 앱에서 확인 가능합니다.' },
      { q: '본인부담금 15%는 누구나 동일한가요?', a: '일반대상자는 15%, 감경대상자는 6~9%, 기초생활수급자는 면제입니다.' },
      { q: '연간 구매 한도가 있나요?', a: '복지용구는 연 한도(약 160만원) 내에서 급여로 구매할 수 있습니다.' },
    ] },
    { name: '구매/결제', items: [
      { q: '복지용구 결제는 누가 받나요?', a: '복지용구는 관계사인 ㈜베스트시니어에서 결제가 진행됩니다.' },
      { q: '어떤 결제수단을 지원하나요?', a: '신용카드·계좌이체·카카오페이를 지원합니다.' },
    ] },
    { name: '배송', items: [
      { q: '배송은 얼마나 걸리나요?', a: '서류 확인 후 평균 2~3일 내 출고됩니다.' },
      { q: '제주/도서산간도 배송되나요?', a: '가능하며 추가 배송비가 발생할 수 있습니다.' },
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
    await prisma.faq.createMany({ data: faqTree[ci].items.map((it, i) => ({ categoryId: cat.id, question: it.q, answer: it.a, order: i, visible: true, createdAt: daysAgo(ci * 2 + i) })) });
  }

  // ---------- 6. 공지/이벤트 ----------
  await prisma.post.deleteMany();
  await prisma.post.createMany({
    data: [
      { type: PostType.notice, title: '[공지] 설 연휴 배송 안내', content: '설 연휴 기간 출고가 일시 중단됩니다. 자세한 일정은 본문을 확인해 주세요.', pinned: true, visible: true, views: 342, createdAt: daysAgo(5) },
      { type: PostType.notice, title: '[공지] 복지용구 본인부담금 안내 업데이트', content: '2026년 복지용구 급여 기준이 일부 변경되었습니다.', pinned: false, visible: true, views: 198, createdAt: daysAgo(12) },
      { type: PostType.notice, title: '[공지] 개인정보처리방침 개정 안내', content: '개인정보처리방침이 개정되었습니다.', pinned: false, visible: true, views: 87, createdAt: daysAgo(20) },
      { type: PostType.notice, title: '[공지] 고객센터 운영시간 변경', content: '평일 09:00~18:00로 운영됩니다.', pinned: false, visible: false, views: 41, createdAt: daysAgo(30) },
      { type: PostType.event, title: '🎉 어버이날 효도 기획전 (최대 20%)', content: '어버이날 맞이 보행기·휠체어 특가전을 진행합니다.', pinned: true, visible: true, views: 1203, startAt: daysAgo(2), endAt: daysAgo(-12), createdAt: daysAgo(3) },
      { type: PostType.event, title: '신규 가입 5,000P 적립 이벤트', content: '신규 회원가입 시 적립금을 드립니다.', pinned: false, visible: true, views: 654, startAt: daysAgo(10), endAt: daysAgo(-20), createdAt: daysAgo(10) },
    ],
  });

  // ---------- 7. 사업자 그룹 + 배정 ----------
  await prisma.productGroupPrice.deleteMany();
  await prisma.bizMember.updateMany({ where: { groupId: { not: null } }, data: { groupId: null } });
  await prisma.bizGroup.deleteMany();
  const gGeneral = await prisma.bizGroup.create({ data: { code: 'general', name: '일반 사업소', discountRate: 0, pointRate: 1, memo: '기본 등급' } });
  const gPremium = await prisma.bizGroup.create({ data: { code: 'premium', name: '우수 사업소', discountRate: 5, pointRate: 2, memo: '월 500만원 이상' } });
  const gVip = await prisma.bizGroup.create({ data: { code: 'vip', name: 'VIP 사업소', discountRate: 10, pointRate: 3, memo: '월 1천만원 이상' } });
  if (bizList[0]) await prisma.bizMember.update({ where: { id: bizList[0].id }, data: { groupId: gPremium.id, creditLimit: 3000000 } });
  if (bizList[1]) await prisma.bizMember.update({ where: { id: bizList[1].id }, data: { groupId: gVip.id, creditLimit: 5000000 } });
  // 그룹별 상품 공급가 오버라이드 일부
  if (bizList.length > 0) {
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const base = products[i].supplierPrice ?? products[i].price;
      await prisma.productGroupPrice.create({ data: { groupId: gVip.id, productId: products[i].id, price: Math.round(base * 0.9) } });
    }
  }

  // ---------- 8. 세금계산서 ----------
  if (bizList.length > 0) {
    await prisma.taxInvoice.deleteMany();
    const taxRows = [
      { biz: 0, period: '2026-05', item: '복지용구 외', supply: 4200000, status: TaxInvoiceStatus.issued, days: 8 },
      { biz: 1, period: '2026-05', item: '휠체어 외', supply: 8800000, status: TaxInvoiceStatus.issued, days: 8 },
      { biz: 0, period: '2026-06', item: '보행기 외', supply: 3100000, status: TaxInvoiceStatus.requested, days: 2 },
      { biz: 1, period: '2026-06', item: '목욕의자 외', supply: 1500000, status: TaxInvoiceStatus.requested, days: 1 },
      { biz: 0, period: '2026-04', item: '복지용구 외', supply: 2600000, status: TaxInvoiceStatus.cancelled, days: 40 },
    ];
    for (const t of taxRows) {
      const biz = pick(bizList, t.biz);
      const tax = Math.round(t.supply * 0.1);
      await prisma.taxInvoice.create({
        data: {
          bizId: biz.id, period: t.period, itemName: t.item, supplyAmount: t.supply, taxAmount: tax, totalAmount: t.supply + tax,
          status: t.status, ntsNo: t.status === TaxInvoiceStatus.issued ? `2026${String(t.days).padStart(8, '0')}` : null,
          issuedAt: t.status === TaxInvoiceStatus.issued ? daysAgo(t.days) : null, createdAt: daysAgo(t.days),
        },
      });
    }
  }

  // ---------- 9. 견적/대량주문 ----------
  if (bizList.length > 0) {
    await prisma.quoteItem.deleteMany();
    await prisma.quote.deleteMany();
    const quoteSrc = [
      { biz: 0, title: '6월 정기 발주', status: QuoteStatus.ordered, items: [0, 1, 2], days: 6 },
      { biz: 1, title: '여름 시즌 대량 구매', status: QuoteStatus.quoted, items: [1, 3], days: 3 },
      { biz: 0, title: '신규 거래처 납품용', status: QuoteStatus.requested, items: [0, 2, 4], days: 1 },
    ];
    for (let qi = 0; qi < quoteSrc.length; qi++) {
      const q = quoteSrc[qi];
      const biz = pick(bizList, q.biz);
      const items = q.items.map((pi) => {
        const p = pick(products, pi);
        const unit = p.supplierPrice ?? p.price;
        return { productId: p.id, productName: p.name, qty: (pi % 5) + 5, unitPrice: unit };
      });
      const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
      await prisma.quote.create({
        data: {
          quoteNo: `Q-2026060${qi + 1}`, bizId: biz.id, title: q.title, status: q.status, totalAmount: total,
          validUntil: daysAgo(-14), createdAt: daysAgo(q.days), items: { create: items },
        },
      });
    }
  }

  // ---------- 10. 배송비 정책 + 도서산간 ----------
  await prisma.remoteArea.deleteMany();
  await prisma.shippingFeePolicy.deleteMany();
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

  // ---------- 11. 정산 (기존 유지, 부족분 추가) ----------
  if (bizList.length > 0) {
    const existCount = await prisma.settlement.count();
    if (existCount < 4) {
      const setRows = [
        { biz: 0, period: '2026-05', amount: 3780000, status: 'paid', days: 5 },
        { biz: 1, period: '2026-05', amount: 7920000, status: 'paid', days: 5 },
        { biz: 0, period: '2026-06', amount: 2790000, status: 'confirmed', days: 1 },
        { biz: 1, period: '2026-06', amount: 1350000, status: 'pending', days: 0 },
      ];
      for (const s of setRows) {
        const biz = pick(bizList, s.biz);
        await prisma.settlement.create({
          data: { bizId: biz.id, period: s.period, amount: s.amount, status: s.status, settledAt: s.status === 'paid' ? daysAgo(s.days) : null, createdAt: daysAgo(s.days + 2) },
        });
      }
    }
  }

  // ---------- 12. 환불 (환불 없는 주문에 다양한 상태 추가) ----------
  const ordersNoRefund = await prisma.order.findMany({ where: { refund: null }, select: { id: true, totalPrice: true, selfPay: true }, take: 4, orderBy: { id: 'desc' } });
  const refundPlan = [
    { cause: '공단 확인 불가', method: '카드 취소', status: 'requested', days: 1 },
    { cause: '단순 변심', method: '계좌 환불', status: 'approved', days: 2 },
    { cause: '상품 불량/파손', method: '카드 취소', status: 'done', days: 4 },
  ];
  for (let i = 0; i < Math.min(refundPlan.length, ordersNoRefund.length); i++) {
    const o = ordersNoRefund[i];
    const rp = refundPlan[i];
    await prisma.refund.create({
      data: {
        orderId: o.id, amount: o.selfPay ?? o.totalPrice, reason: rp.cause, cause: rp.cause, refundMethod: rp.method,
        status: rp.status, reviewer: rp.status === 'requested' ? null : 'admin',
        memo: rp.cause === '공단 확인 불가' ? '공단 조회 결과 인정번호 불일치' : null,
        processedAt: rp.status === 'done' ? daysAgo(rp.days) : null, createdAt: daysAgo(rp.days + 1),
      },
    });
    if (rp.status === 'done') await prisma.order.update({ where: { id: o.id }, data: { status: 'refunded' } });
  }

  // ---------- 결과 요약 ----------
  const summary = {
    리뷰: await prisma.productReview.count(),
    QnA: await prisma.productQna.count(),
    문의: await prisma.inquiry.count(),
    알림톡템플릿: await prisma.notificationTemplate.count(),
    FAQ: await prisma.faq.count(),
    공지이벤트: await prisma.post.count(),
    사업자그룹: await prisma.bizGroup.count(),
    세금계산서: await prisma.taxInvoice.count(),
    견적: await prisma.quote.count(),
    배송비정책: await prisma.shippingFeePolicy.count(),
    도서산간: await prisma.remoteArea.count(),
    정산: await prisma.settlement.count(),
    환불: await prisma.refund.count(),
  };
  console.log('✅ 운영 더미 데이터 시드 완료:', JSON.stringify(summary, null, 2));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
