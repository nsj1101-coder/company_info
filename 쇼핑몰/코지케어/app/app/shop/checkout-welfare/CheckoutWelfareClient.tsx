'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AddressSearch from '@/components/common/AddressSearch';
import { getCart, clearCart, type CartItem } from '../_cart';

type BuyerType = 'self' | 'guardian';
type PayMethod = 'card' | 'transfer' | 'kakao';

type LineItem = {
  productId: number;
  name: string;
  option: string;
  image: string;
  price: number;
  qty: number;
};

const PAY_METHOD_LABEL: Record<PayMethod, string> = {
  card: '신용카드',
  transfer: '계좌이체',
  kakao: '카카오페이',
};

const SELF_PAY_RATE = 0.15;

export default function CheckoutWelfareClient(props: { sessionName: string; sessionEmail: string }) {
  return (
    <Suspense fallback={null}>
      <CheckoutWelfareInner {...props} />
    </Suspense>
  );
}

function CheckoutWelfareInner({ sessionName, sessionEmail }: { sessionName: string; sessionEmail: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<LineItem[]>([]);
  const [singleBuy, setSingleBuy] = useState(false);

  const [buyerType, setBuyerType] = useState<BuyerType>('self');
  const [userName, setUserName] = useState(sessionName);
  const [birth, setBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(sessionEmail);

  const [ltcNumber, setLtcNumber] = useState('');

  const [receiver, setReceiver] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [zip, setZip] = useState('');
  const [addr1, setAddr1] = useState('');
  const [addr2, setAddr2] = useState('');
  const [deliveryMemo, setDeliveryMemo] = useState('선택해주세요');

  const [payMethod, setPayMethod] = useState<PayMethod>('card');

  const [agreeAll, setAgreeAll] = useState(false);
  const [agreePay, setAgreePay] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

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

  const listPrice = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const selfPay = Math.round(listPrice * SELF_PAY_RATE);
  const insuranceSupport = listPrice - selfPay;

  const handlePay = async () => {
    if (!agreePay || !agreePrivacy) {
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
        listPrice,
        insuranceSupport,
        selfPay,
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
      alert('복지용구 주문이 접수되었습니다. 서류 검토 후 진행 상황을 안내드립니다.');
      router.push('/mypage/orders');
    } else {
      alert('주문 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <style>{`
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
          background: var(--welfare-red);
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
        .step .num {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--gray-200);
          color: var(--gray-500);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }
        .step .name {
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-500);
        }
        .step.active .num { background: var(--green-600); color: #fff; }
        .step.active .name { color: var(--gray-900); }
        .step.done .num { background: var(--success); color: #fff; }
        .step.done .name { color: var(--gray-700); }
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
        .panel h2 {
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
        .panel-status.done   { background: var(--green-600); color: #fff; }
        .panel-status.active { background: var(--gray-900); color: #fff; }
        .panel-status.todo   { background: var(--gray-100); color: var(--gray-500); }
        .panel .sub {
          color: var(--gray-500);
          font-size: 13px;
          margin-bottom: 20px;
        }
        .summary .progress {
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
        .summary .progress .pct {
          color: var(--green-700);
          font-size: 14px;
        }

        .alert {
          border-radius: var(--r-md);
          padding: 16px 20px;
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .alert.info {
          align-items: flex-start;
        }
        .alert.dark {
          align-items: flex-start;
        }
        .alert .ico {
          flex-shrink: 0;
          width: 28px; height: 28px;
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
        .alert.info .ico { background: var(--primary-600); color: #fff; }
        .alert.warning {
          background: #fff;
          border: 1px solid var(--gray-200);
        }
        .alert.warning .ico { background: var(--welfare-red); color: #fff; }
        .alert.dark {
          background: var(--biz-navy);
          color: #fff;
        }
        .alert.dark .ico { background: var(--biz-gold); color: var(--biz-navy); }
        .alert .body { font-size: 13px; line-height: 1.5; }
        .alert.warning .body { line-height: 1.5; }
        .alert .body strong { font-weight: 700; }
        .alert.info .body strong { color: var(--green-700); }
        .alert.warning .body strong { color: var(--welfare-red); }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 16px;
        }
        .form-grid .full { grid-column: 1 / -1; }
        .form-grid .form-row { margin-bottom: 0; }
        .form-grid .form-row .form-label {
          display: block;
          margin-bottom: 8px;
          white-space: nowrap;
        }
        .form-grid .form-row .form-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          border-radius: 10px;
        }
        .form-grid .form-row .form-hint {
          display: block;
          font-size: 12px;
          color: var(--gray-400);
          margin-top: 6px;
          line-height: 1.4;
        }
        .addr-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          flex-wrap: nowrap;
          align-items: stretch;
        }
        .addr-row .form-input {
          flex: 0 0 140px;
          width: 140px;
        }
        .addr-row .btn {
          flex: 0 0 auto;
          height: 44px;
          padding: 0 20px;
          min-width: 120px;
          white-space: nowrap;
          font-size: 14px;
        }
        .form-row .form-input + .form-input { margin-top: 8px; }
        select.form-input {
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='none' stroke='%236b7280' stroke-width='2' d='M1 1l5 5 5-5'/></svg>");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }
        .panel .radio-group .radio-item .label { white-space: nowrap; }
        .panel .radio-group .radio-item .desc { white-space: nowrap; }

        .upload-box {
          border: 2px dashed var(--gray-300);
          border-radius: var(--r-md);
          padding: 28px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s;
          background: #fff;
        }
        .upload-box:hover {
          border-color: var(--welfare-red);
          background: #fff;
        }
        .upload-box .up-ico {
          width: 48px; height: 48px;
          background: #fff;
          border-radius: 50%;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--welfare-red);
          box-shadow: var(--shadow-sm);
        }
        .upload-box .up-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
        .upload-box .up-desc { font-size: 12px; color: var(--gray-500); }
        .upload-box.uploaded {
          border-style: solid;
          border-color: var(--success);
          background: #fff;
        }
        .upload-box.uploaded .up-ico { color: var(--success); }

        .step-doc-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .step-doc {
          display: grid;
          grid-template-columns: 32px 1fr;
          gap: 12px;
          align-items: start;
        }
        .step-doc .num-circle {
          width: 32px; height: 32px;
          background: var(--green-600);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }
        .step-doc h4 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
        .step-doc p { font-size: 12px; color: var(--gray-500); margin-bottom: 10px; }

        .summary {
          background: #fff;
          border: 1px solid var(--gray-200);
          border-radius: var(--r-md);
          padding: 24px;
          position: sticky;
          top: 100px;
        }
        .summary h3 {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--gray-100);
        }
        .summary .item-row {
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid var(--gray-100);
        }
        .summary .item-row .item-img {
          width: 60px; height: 60px;
          background: var(--gray-100);
          border-radius: var(--r-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          overflow: hidden;
        }
        .summary .item-row .item-img img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .summary .item-row .item-info .nm {
          font-size: 13px;
          font-weight: 600;
          line-height: 1.4;
          margin-bottom: 4px;
        }
        .summary .item-row .item-info .opt {
          font-size: 12px;
          color: var(--gray-500);
          margin-bottom: 4px;
        }
        .summary .item-row .item-info .price {
          color: var(--gray-900);
          font-size: 13px;
          font-weight: 800;
        }

        .price-list { padding: 16px 0; }
        .price-list .price-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
          color: var(--gray-700);
        }
        .price-list .price-row .num { font-weight: 600; }
        .price-list .price-row.total {
          border-top: 2px solid var(--gray-900);
          padding: 16px 0 4px;
          margin-top: 12px;
          font-size: 16px;
          font-weight: 800;
          color: var(--gray-900);
        }
        .price-list .price-row.total .num {
          color: var(--green-700);
          font-size: 24px;
          letter-spacing: -0.5px;
        }
        .price-list .saved {
          background: transparent;
          color: var(--green-700);
          padding: 12px 0 0;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
          margin-top: 8px;
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
        .agree-item label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .agree-item input { width: 18px; height: 18px; accent-color: var(--green-600); }
        .agree-item .req { color: var(--welfare-red); font-weight: 700; margin-right: 4px; }
        .agree-item .view { color: var(--gray-400); font-size: 12px; }

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
        .pay-opt:hover { border-color: var(--gray-400); }
        .pay-opt.active {
          border-color: var(--welfare-red);
          background: var(--welfare-bg);
          color: var(--welfare-red);
        }
        .pay-opt .pay-ico { font-size: 22px; margin-bottom: 6px; }

        @media (max-width: 1024px) {
          .checkout-layout { grid-template-columns: 1fr; }
          .summary { position: static; }
        }
        @media (max-width: 720px) {
          .checkout-head h1 { font-size: 22px; }
          .panel { padding: 20px; }
          .form-grid { grid-template-columns: 1fr; }
          .pay-grid { grid-template-columns: repeat(3, 1fr); gap: 6px; }
          .pay-opt { padding: 14px 6px; font-size: 12px; }
          .step .name { display: none; }
          .step.active .name { display: block; }
          .step-sep { width: 16px; }
          .panel .radio-group .radio-item .label,
          .panel .radio-group .radio-item .desc { white-space: normal; }
          .addr-row .form-input { flex: 1 1 0; width: auto; }
          .addr-row .btn { min-width: 100px; padding: 0 14px; }
        }
      `}</style>

      <main className="container">

        <div className="checkout-head">
          <h1>
            <span className="head-badge">복지용구</span>
            구매 신청서
          </h1>
          <p>장기요양 인정번호와 서류를 제출하시면 공단 확인 후 부담금(15%)만 결제됩니다.</p>
        </div>

        {/* 스텝 */}
        <div className="stepper">
          <div className="step active"><div className="num">1</div><div className="name">구매자 정보</div></div>
          <div className="step-sep"></div>
          <div className="step active"><div className="num">2</div><div className="name">서류 제출</div></div>
          <div className="step-sep"></div>
          <div className="step active"><div className="num">3</div><div className="name">배송 정보</div></div>
          <div className="step-sep"></div>
          <div className="step active"><div className="num">4</div><div className="name">결제</div></div>
        </div>

        <div className="checkout-layout">

          {/* 메인 */}
          <div className="checkout-main">

            {/* 1. 구매자 정보 */}
            <div className="panel">
              <h2>① 구매자 정보 <span className="panel-status done">✓ 완료</span></h2>
              <div className="sub">사용자(어르신)와 구매자(보호자)가 다른 경우 모두 입력해주세요.</div>

              <div className="form-row">
                <label className="form-label">구매자 구분 <span className="required">*</span></label>
                <div className="radio-group" style={{ flexDirection: 'row' }}>
                  <label className={`radio-item${buyerType === 'self' ? ' checked' : ''}`} style={{ flex: 1 }}>
                    <input
                      type="radio"
                      name="buyer-type"
                      checked={buyerType === 'self'}
                      onChange={() => setBuyerType('self')}
                    />
                    <div>
                      <div className="label">본인 (사용자)</div>
                      <div className="desc">제가 직접 사용합니다</div>
                    </div>
                  </label>
                  <label className={`radio-item${buyerType === 'guardian' ? ' checked' : ''}`} style={{ flex: 1 }}>
                    <input
                      type="radio"
                      name="buyer-type"
                      checked={buyerType === 'guardian'}
                      onChange={() => setBuyerType('guardian')}
                    />
                    <div>
                      <div className="label">보호자</div>
                      <div className="desc">가족이 대신 구매합니다</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-row">
                  <label className="form-label">사용자(어르신) 성함 <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="홍길동"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">생년월일 <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="1948-03-15"
                    value={birth}
                    onChange={(e) => setBirth(e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">연락처 <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">이메일</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="example@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="form-hint">주문 확인 및 진행 상황 안내용</div>
                </div>
              </div>
            </div>

            {/* 2. 서류 제출 (핵심) */}
            <div className="panel">
              <h2>② 서류 제출 <span className="badge-tag badge-welfare">필수</span> <span className="panel-status active">● 진행 중</span></h2>
              <div className="sub">장기요양 인정번호와 서류는 국민건강보험공단 확인 절차에 사용됩니다.</div>

              <div className="alert info" style={{ marginBottom: 24 }}>
                <div className="ico">i</div>
                <div className="body">
                  <strong>장기요양 인정번호란?</strong><br />
                  국민건강보험공단에서 발급한 장기요양 등급 인정자 번호로, 인정서에 기재되어 있습니다.
                  모르시는 경우 공단 콜센터 <strong>1577-1000</strong>으로 문의하세요.
                </div>
              </div>

              <div className="form-row">
                <label className="form-label">장기요양 인정번호 <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="L0000000000"
                  value={ltcNumber}
                  onChange={(e) => setLtcNumber(e.target.value)}
                />
                <div className="form-hint">L로 시작하는 11자리 번호</div>
              </div>

              <div className="step-doc-list">
                <div className="step-doc">
                  <div className="num-circle">1</div>
                  <div>
                    <h4>장기요양 인정서 첨부 <span className="required" style={{ color: 'var(--welfare-red)' }}>*</span></h4>
                    <p>공단에서 발급받은 인정서를 사진 또는 PDF로 업로드해주세요.</p>
                    <div className="upload-box uploaded">
                      <div className="up-ico">
                        <svg className="icon" style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="up-title">인정서_홍길동.pdf</div>
                      <div className="up-desc">2.4 MB · 업로드 완료 (다시 선택)</div>
                    </div>
                  </div>
                </div>

                <div className="step-doc">
                  <div className="num-circle">2</div>
                  <div>
                    <h4>추가 서류 (선택)</h4>
                    <p>표준이용계획서·등급판정 결과지 등 있으시면 첨부해주세요.</p>
                    <div className="upload-box">
                      <div className="up-ico">
                        <svg className="icon" style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="up-title">파일 선택 또는 드래그</div>
                      <div className="up-desc">JPG · PNG · PDF (최대 10MB, 여러 장 가능)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert warning" style={{ marginTop: 20 }}>
                <div className="ico">!</div>
                <div className="body">
                  제출하신 서류는 공단 확인을 거칩니다. <strong>확인 결과 구매 불가</strong>한 경우 결제하신 금액은 영업일 기준 <strong>2~3일 내 전액 환불</strong>됩니다.
                </div>
              </div>
            </div>

            {/* 3. 배송 정보 */}
            <div className="panel">
              <h2>③ 배송 정보 <span className="panel-status todo">○ 미완료</span></h2>
              <div className="form-grid">
                <div className="form-row">
                  <label className="form-label">수령인 <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="홍길동"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                  />
                  <div className="form-hint">실제로 물품을 받으실 분의 성함</div>
                </div>
                <div className="form-row">
                  <label className="form-label">수령인 연락처 <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="010-0000-0000"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                  />
                  <div className="form-hint">배송 출고/도착 안내 문자 발송</div>
                </div>
                <div className="form-row full">
                  <label className="form-label">배송 주소 <span className="required">*</span></label>
                  <div className="addr-row">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="우편번호"
                      readOnly
                      value={zip}
                    />
                    <AddressSearch
                      className="btn btn-outline"
                      onComplete={({ zonecode, roadAddress, buildingName }) => {
                        setZip(zonecode);
                        setAddr1(buildingName ? `${roadAddress} (${buildingName})` : roadAddress);
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="기본 주소"
                    style={{ marginBottom: 8 }}
                    readOnly
                    value={addr1}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="상세 주소 (동, 호수)"
                    value={addr2}
                    onChange={(e) => setAddr2(e.target.value)}
                  />
                  <div className="form-hint">실제 받으실 주소를 정확히 입력해주세요. 산간/도서 지역은 추가 1~2일 소요됩니다.</div>
                </div>
                <div className="form-row full">
                  <label className="form-label">배송 메모</label>
                  <select
                    className="form-input"
                    value={deliveryMemo}
                    onChange={(e) => setDeliveryMemo(e.target.value)}
                  >
                    <option>선택해주세요</option>
                    <option>문 앞에 놓아주세요</option>
                    <option>경비실에 맡겨주세요</option>
                    <option>배송 전 미리 연락 주세요</option>
                    <option>직접 입력</option>
                  </select>
                  <div className="form-hint">기사님께 전달할 요청사항을 선택해주세요.</div>
                </div>
              </div>
            </div>

            {/* 4. 결제 */}
            <div className="panel">
              <h2>④ 결제 <span className="panel-status todo">○ 미완료</span></h2>

              <div className="alert dark" style={{ marginBottom: 24 }}>
                <div className="ico">!</div>
                <div className="body">
                  <strong>결제는 ㈜베스트시니어를 통해 진행됩니다.</strong><br />
                  ㈜코지케어는 생산 업체로 복지용구사업소가 아니므로,
                  관련 법규에 따라 당사 관계사인 <strong>복지용구사업소 ㈜베스트시니어</strong>로 결제가 이루어집니다.
                </div>
              </div>

              <label className="form-label">결제 수단 <span className="required">*</span></label>
              <div className="pay-grid">
                <div
                  className={`pay-opt${payMethod === 'card' ? ' active' : ''}`}
                  onClick={() => setPayMethod('card')}
                >
                  신용카드
                </div>
                <div
                  className={`pay-opt${payMethod === 'transfer' ? ' active' : ''}`}
                  onClick={() => setPayMethod('transfer')}
                >
                  계좌이체
                </div>
                <div
                  className={`pay-opt${payMethod === 'kakao' ? ' active' : ''}`}
                  onClick={() => setPayMethod('kakao')}
                >
                  카카오페이
                </div>
              </div>

              <div className="agree-list">
                <label className="agree-item">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={agreeAll}
                      onChange={(e) => {
                        const v = e.target.checked;
                        setAgreeAll(v);
                        setAgreePay(v);
                        setAgreePrivacy(v);
                        setAgreeMarketing(v);
                      }}
                    />
                    <span><span className="req">[필수]</span> 전체 약관에 동의합니다</span>
                  </span>
                </label>
                <label className="agree-item">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={agreePay}
                      onChange={(e) => setAgreePay(e.target.checked)}
                    />
                    <span><span className="req">[필수]</span> 결제 위탁(㈜베스트시니어) 동의</span>
                  </span>
                  <a href="#" className="view">보기 ›</a>
                </label>
                <label className="agree-item">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                    />
                    <span><span className="req">[필수]</span> 개인정보 제3자 제공 (공단 확인용) 동의</span>
                  </span>
                  <a href="#" className="view">보기 ›</a>
                </label>
                <label className="agree-item">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={agreeMarketing}
                      onChange={(e) => setAgreeMarketing(e.target.checked)}
                    />
                    <span><span style={{ color: 'var(--gray-500)', marginRight: 4 }}>[선택]</span> 마케팅 정보 수신 동의</span>
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
                    {it.image ? <img src={it.image} alt={it.name} /> : '🚶‍♂️'}
                  </div>
                  <div className="item-info">
                    <div className="nm">{it.name}</div>
                    <div className="opt">옵션: {it.option} / 수량 {it.qty}</div>
                    <div className="price">부담금 {Math.round(it.price * it.qty * SELF_PAY_RATE).toLocaleString()}원</div>
                  </div>
                </div>
              ))}

              <div className="price-list">
                <div className="price-row">
                  <span>정가</span>
                  <span className="num">{listPrice.toLocaleString()}원</span>
                </div>
                <div className="price-row">
                  <span>공단 지원 (85%)</span>
                  <span className="num" style={{ color: 'var(--success)' }}>− {insuranceSupport.toLocaleString()}원</span>
                </div>
                <div className="price-row">
                  <span>배송비</span>
                  <span className="num">무료</span>
                </div>
                <div className="price-row total">
                  <span>결제 금액</span>
                  <span className="num">{selfPay.toLocaleString()}원</span>
                </div>
                <div className="saved">정가 대비 {insuranceSupport.toLocaleString()}원 (85%) 절약</div>
              </div>

              <button
                className="btn btn-primary btn-xl btn-block"
                style={{ marginTop: 8 }}
                onClick={handlePay}
                disabled={submitting || items.length === 0}
              >
                {submitting ? '처리 중…' : `${selfPay.toLocaleString()}원 결제하기`}
              </button>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--gray-400)', marginTop: 10, lineHeight: 1.5 }}>
                결제 진행 → 서류 검토 → 공단 확인<br />→ 출고 → 송장 문자 발송 순서로 진행됩니다.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
