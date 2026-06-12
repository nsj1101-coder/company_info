'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AddressSearch from '@/components/common/AddressSearch';
import { getCart, clearCart, type CartItem } from '../_cart';

type BuyerInfo = {
  name: string;
  phone: string;
  email: string;
};

type ShippingInfo = {
  receiverName: string;
  receiverPhone: string;
  zip: string;
  addr1: string;
  addr2: string;
  memo: string;
};

type Agreements = {
  all: boolean;
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
};

type LineItem = {
  productId: number;
  name: string;
  option: string;
  image: string;
  price: number;
  qty: number;
};

const PAY_METHOD_LABEL: Record<'card' | 'bank' | 'kakao', string> = {
  card: '신용카드',
  bank: '계좌이체',
  kakao: '카카오페이',
};

export default function CheckoutNormalClient(props: { sessionName: string; sessionEmail: string }) {
  return (
    <Suspense fallback={null}>
      <CheckoutNormalInner {...props} />
    </Suspense>
  );
}

function CheckoutNormalInner({ sessionName, sessionEmail }: { sessionName: string; sessionEmail: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<LineItem[]>([]);
  const [singleBuy, setSingleBuy] = useState(false);

  const [buyer, setBuyer] = useState<BuyerInfo>({ name: sessionName, phone: '', email: sessionEmail });
  const [shipping, setShipping] = useState<ShippingInfo>({
    receiverName: '',
    receiverPhone: '',
    zip: '',
    addr1: '',
    addr2: '',
    memo: '선택해주세요',
  });
  const [payMethod, setPayMethod] = useState<'card' | 'bank' | 'kakao'>('card');
  const [agree, setAgree] = useState<Agreements>({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const productId = Number(searchParams.get('productId'));
    if (Number.isInteger(productId) && productId > 0) {
      const qty = Math.max(1, Number(searchParams.get('qty')) || 1);
      const option = searchParams.get('option') ?? '';
      const cartMatch = getCart().find((c) => c.productId === productId);
      setSingleBuy(true);
      setItems([
        {
          productId,
          name: cartMatch?.name ?? `상품 #${productId}`,
          option: option || cartMatch?.option || '단일 옵션',
          image: cartMatch?.image ?? '/cozycare/images/products/eurolight.jpg',
          price: cartMatch?.price ?? 0,
          qty,
        },
      ]);
      return;
    }
    const cart = getCart().filter((c) => c.checked);
    const source = cart.length ? cart : getCart();
    setItems(
      source.map((c: CartItem) => ({
        productId: c.productId,
        name: c.name,
        option: c.option,
        image: c.image,
        price: c.price,
        qty: c.qty,
      }))
    );
  }, [searchParams]);

  const toggleAll = (checked: boolean) => {
    setAgree({ all: checked, terms: checked, privacy: checked, marketing: checked });
  };

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const shippingFee = subtotal >= 50000 || subtotal === 0 ? 0 : 3000;
  const total = subtotal + shippingFee;

  const handlePay = async () => {
    if (!agree.terms || !agree.privacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }
    if (items.length === 0 || submitting) return;
    setSubmitting(true);
    const res = await fetch('/cozycare/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethod: PAY_METHOD_LABEL[payMethod],
        items: items.map((it) => ({
          productId: it.productId,
          qty: it.qty,
          unitPrice: it.price,
          optionLabel: it.option,
        })),
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      if (!singleBuy) clearCart();
      alert('주문이 완료되었습니다. 주문 내역에서 확인하실 수 있습니다.');
      router.push('/mypage/orders');
    } else {
      alert('주문 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <style jsx>{`
        .checkout-head {
          padding: 40px 0 16px;
        }
        .checkout-head h1 {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .checkout-head .head-badge {
          background: var(--green-600);
          color: #fff;
          font-size: 12px;
          padding: 4px 10px;
          border-radius: var(--r-pill);
          font-weight: 700;
        }
        .checkout-head p {
          color: var(--gray-500);
          font-size: 14px;
          margin-top: 6px;
        }

        .stepper {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 24px 0 32px;
          overflow-x: auto;
        }
        .step {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .step :global(.num) {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--gray-200);
          color: var(--gray-500);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }
        .step :global(.name) {
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-500);
        }
        .step.active :global(.num) {
          background: var(--green-600);
          color: #fff;
        }
        .step.active :global(.name) {
          color: var(--gray-900);
        }
        .step.done :global(.num) {
          background: var(--success);
          color: #fff;
        }
        .step.done :global(.name) {
          color: var(--gray-700);
        }
        .step-sep {
          width: 40px;
          height: 1px;
          background: var(--gray-200);
          flex-shrink: 0;
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          padding-bottom: 60px;
        }

        .checkout-main {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .panel {
          background: #fff;
          border: 1px solid var(--gray-200);
          border-radius: var(--r-md);
          padding: 28px;
        }
        .panel :global(h2) {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .panel-status {
          margin-left: auto;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
          letter-spacing: 0.2px;
        }
        .panel-status.done {
          background: var(--green-600);
          color: #fff;
        }
        .panel-status.active {
          background: var(--gray-900);
          color: #fff;
        }
        .panel-status.todo {
          background: var(--gray-100);
          color: var(--gray-500);
        }
        .panel :global(.sub) {
          color: var(--gray-500);
          font-size: 13px;
          margin-bottom: 20px;
        }
        .summary :global(.progress) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #fff;
          border: 1px solid var(--gray-200);
          border-radius: var(--r-sm);
          font-size: 12px;
          font-weight: 700;
          color: var(--gray-700);
          margin-bottom: 16px;
        }
        .summary :global(.progress .pct) {
          color: var(--green-700);
          font-size: 14px;
        }

        .alert {
          border-radius: var(--r-md);
          padding: 18px 20px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .alert :global(.ico) {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .alert.info {
          background: #fff;
          border: 1px solid var(--gray-200);
        }
        .alert.info :global(.ico) {
          background: var(--green-600);
          color: #fff;
        }
        .alert :global(.body) {
          font-size: 13px;
          line-height: 1.7;
        }
        .alert :global(.body strong) {
          font-weight: 700;
        }
        .alert.info :global(.body strong) {
          color: var(--green-700);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .form-grid :global(.full) {
          grid-column: 1 / -1;
        }

        .summary {
          background: #fff;
          border: 1px solid var(--gray-200);
          border-radius: var(--r-md);
          padding: 24px;
          position: sticky;
          top: 100px;
        }
        .summary :global(h3) {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--gray-100);
        }
        .summary :global(.item-row) {
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid var(--gray-100);
        }
        .summary :global(.item-row .item-img) {
          width: 60px;
          height: 60px;
          background: var(--gray-100);
          border-radius: var(--r-sm);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .summary :global(.item-row .item-img img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .summary :global(.item-row .item-info .nm) {
          font-size: 13px;
          font-weight: 600;
          line-height: 1.4;
          margin-bottom: 4px;
        }
        .summary :global(.item-row .item-info .opt) {
          font-size: 12px;
          color: var(--gray-500);
          margin-bottom: 4px;
        }
        .summary :global(.item-row .item-info .price) {
          color: var(--green-700);
          font-size: 13px;
          font-weight: 700;
        }

        .price-list {
          padding: 16px 0;
        }
        .price-list :global(.price-row) {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
          color: var(--gray-700);
        }
        .price-list :global(.price-row .num) {
          font-weight: 600;
        }
        .price-list :global(.price-row.total) {
          border-top: 2px solid var(--gray-900);
          padding: 16px 0 4px;
          margin-top: 12px;
          font-size: 16px;
          font-weight: 800;
          color: var(--gray-900);
        }
        .price-list :global(.price-row.total .num) {
          color: var(--green-700);
          font-size: 24px;
          letter-spacing: -0.5px;
        }

        .agree-list {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .agree-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: var(--gray-700);
        }
        .agree-item :global(label) {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .agree-item :global(input) {
          width: 18px;
          height: 18px;
          accent-color: var(--green-600);
        }
        .agree-item :global(.req) {
          color: var(--green-700);
          font-weight: 700;
          margin-right: 4px;
        }
        .agree-item :global(.view) {
          color: var(--gray-400);
          font-size: 12px;
        }

        .pay-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 4px;
        }
        .pay-opt {
          border: 1.5px solid var(--gray-200);
          border-radius: var(--r-sm);
          padding: 18px 12px;
          text-align: center;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          background: #fff;
        }
        .pay-opt:hover {
          border-color: var(--gray-400);
        }
        .pay-opt.active {
          border-color: var(--green-600);
          background: var(--green-50);
          color: var(--green-700);
        }
        .pay-opt :global(.pay-ico) {
          font-size: 22px;
          margin-bottom: 6px;
        }

        @media (max-width: 1024px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
          .summary {
            position: static;
          }
        }
        @media (max-width: 720px) {
          .checkout-head h1 {
            font-size: 22px;
          }
          .panel {
            padding: 20px;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .pay-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
          }
          .pay-opt {
            padding: 14px 6px;
            font-size: 12px;
          }
          .step :global(.name) {
            display: none;
          }
          .step.active :global(.name) {
            display: block;
          }
          .step-sep {
            width: 16px;
          }
        }
      `}</style>

      <main className="container">
        <div className="checkout-head">
          <h1>
            <span className="head-badge">일반</span>
            구매 신청서
          </h1>
          <p>장기요양 등급이 없으셔도 누구나 정가로 구매 가능합니다. 결제 즉시 출고 준비됩니다.</p>
        </div>

        {/* 스텝 */}
        <div className="stepper">
          <div className="step active"><div className="num">1</div><div className="name">구매자 정보</div></div>
          <div className="step-sep"></div>
          <div className="step active"><div className="num">2</div><div className="name">배송 정보</div></div>
          <div className="step-sep"></div>
          <div className="step active"><div className="num">3</div><div className="name">결제</div></div>
        </div>

        <div className="checkout-layout">
          {/* 메인 */}
          <div className="checkout-main">
            {/* 1. 구매자 정보 */}
            <div className="panel">
              <h2>① 구매자 정보 <span className="panel-status active">● 진행 중</span></h2>
              <div className="sub">주문 확인과 배송 안내에 사용됩니다.</div>

              <div className="form-grid">
                <div className="form-row">
                  <label className="form-label">구매자 성함 <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="홍길동"
                    value={buyer.name}
                    onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">연락처 <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="010-0000-0000"
                    value={buyer.phone}
                    onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                  />
                </div>
                <div className="form-row full">
                  <label className="form-label">이메일</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="example@example.com"
                    value={buyer.email}
                    onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                  />
                  <div className="form-hint">주문 확인 및 배송 안내용</div>
                </div>
              </div>
            </div>

            {/* 2. 배송 정보 */}
            <div className="panel">
              <h2>② 배송 정보 <span className="panel-status todo">○ 미완료</span></h2>
              <div className="form-grid">
                <div className="form-row">
                  <label className="form-label">수령인 <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="홍길동"
                    value={shipping.receiverName}
                    onChange={(e) => setShipping({ ...shipping, receiverName: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">수령인 연락처 <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="010-0000-0000"
                    value={shipping.receiverPhone}
                    onChange={(e) => setShipping({ ...shipping, receiverPhone: e.target.value })}
                  />
                </div>
                <div className="form-row full">
                  <label className="form-label">배송 주소 <span className="required">*</span></label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="우편번호"
                      style={{ maxWidth: '140px' }}
                      readOnly
                      value={shipping.zip}
                    />
                    <AddressSearch
                      className="btn btn-outline"
                      onComplete={({ zonecode, roadAddress, buildingName }) => {
                        setShipping((prev) => ({
                          ...prev,
                          zip: zonecode,
                          addr1: buildingName ? `${roadAddress} (${buildingName})` : roadAddress,
                        }));
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="기본 주소"
                    style={{ marginBottom: '8px' }}
                    readOnly
                    value={shipping.addr1}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="상세 주소 (동, 호수)"
                    value={shipping.addr2}
                    onChange={(e) => setShipping({ ...shipping, addr2: e.target.value })}
                  />
                </div>
                <div className="form-row full">
                  <label className="form-label">배송 메모</label>
                  <select
                    className="form-input"
                    value={shipping.memo}
                    onChange={(e) => setShipping({ ...shipping, memo: e.target.value })}
                  >
                    <option>선택해주세요</option>
                    <option>문 앞에 놓아주세요</option>
                    <option>경비실에 맡겨주세요</option>
                    <option>배송 전 미리 연락 주세요</option>
                    <option>직접 입력</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. 결제 */}
            <div className="panel">
              <h2>③ 결제 <span className="panel-status todo">○ 미완료</span></h2>

              <div className="alert info" style={{ marginBottom: '24px' }}>
                <div className="ico">i</div>
                <div className="body">
                  본 페이지는 <strong>정가 100% 결제</strong>입니다. 장기요양 인정자 부담금(15%) 구매를 원하시면{' '}
                  <Link
                    href="/shop/checkout-welfare"
                    style={{ color: 'var(--green-700)', fontWeight: 700, textDecoration: 'underline' }}
                  >
                    복지용구 구매 페이지
                  </Link>
                  를 이용해주세요.
                </div>
              </div>

              <label className="form-label">결제 수단 <span className="required">*</span></label>
              <div className="pay-grid">
                <div
                  className={`pay-opt ${payMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPayMethod('card')}
                >
                  신용카드
                </div>
                <div
                  className={`pay-opt ${payMethod === 'bank' ? 'active' : ''}`}
                  onClick={() => setPayMethod('bank')}
                >
                  계좌이체
                </div>
                <div
                  className={`pay-opt ${payMethod === 'kakao' ? 'active' : ''}`}
                  onClick={() => setPayMethod('kakao')}
                >
                  카카오페이
                </div>
              </div>

              <div className="agree-list">
                <label className="agree-item">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={agree.all}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                    <span><span className="req">[필수]</span> 전체 약관에 동의합니다</span>
                  </span>
                </label>
                <label className="agree-item">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={agree.terms}
                      onChange={(e) => setAgree({ ...agree, terms: e.target.checked })}
                    />
                    <span><span className="req">[필수]</span> 구매 조건 및 환불 규정 동의</span>
                  </span>
                  <a href="#" className="view">보기 ›</a>
                </label>
                <label className="agree-item">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={agree.privacy}
                      onChange={(e) => setAgree({ ...agree, privacy: e.target.checked })}
                    />
                    <span><span className="req">[필수]</span> 개인정보 수집·이용 동의</span>
                  </span>
                  <a href="#" className="view">보기 ›</a>
                </label>
                <label className="agree-item">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={agree.marketing}
                      onChange={(e) => setAgree({ ...agree, marketing: e.target.checked })}
                    />
                    <span><span style={{ color: 'var(--gray-500)', marginRight: '4px' }}>[선택]</span> 마케팅 정보 수신 동의</span>
                  </span>
                  <a href="#" className="view">보기 ›</a>
                </label>
              </div>
            </div>
          </div>

          {/* 사이드 요약 */}
          <aside>
            <div className="summary">
              <h3>주문 요약</h3>

              <div className="progress">
                <span>주문 상품</span>
                <span className="pct">{items.length}개</span>
              </div>

              {items.map((it) => (
                <div className="item-row" key={`${it.productId}-${it.option}`}>
                  <div className="item-img">
                    <Image
                      src={it.image}
                      alt={it.name}
                      width={60}
                      height={60}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="item-info">
                    <div className="nm">{it.name}</div>
                    <div className="opt">옵션: {it.option} / 수량 {it.qty}</div>
                    <div className="price">정가 {(it.price * it.qty).toLocaleString()}원</div>
                  </div>
                </div>
              ))}

              <div className="price-list">
                <div className="price-row">
                  <span>상품 금액</span>
                  <span className="num">{subtotal.toLocaleString()}원</span>
                </div>
                <div className="price-row">
                  <span>배송비</span>
                  <span className="num">{shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString()}원`}</span>
                </div>
                <div className="price-row total">
                  <span>결제 금액</span>
                  <span className="num">{total.toLocaleString()}원</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-xl btn-block"
                style={{ marginTop: '8px' }}
                onClick={handlePay}
                type="button"
                disabled={submitting || items.length === 0}
              >
                {submitting ? '처리 중…' : `${total.toLocaleString()}원 결제하기`}
              </button>
              <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--gray-400)', marginTop: '10px', lineHeight: 1.5 }}>
                결제 즉시 출고 준비가 시작되며,<br />송장 발송 시 문자로 안내됩니다.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
