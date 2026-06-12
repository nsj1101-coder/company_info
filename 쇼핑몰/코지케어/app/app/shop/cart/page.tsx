'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  getCart,
  setQty as setQtyStore,
  setChecked,
  setAllChecked,
  removeItem,
  removeChecked as removeCheckedStore,
  type CartItem,
} from '../_cart';

const toMoney = (n: number) => n.toLocaleString('ko-KR');

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(getCart());
    setReady(true);
  }, []);

  const checkedItems = items.filter((it) => it.checked);
  const checkedCount = checkedItems.length;
  const allChecked = items.length > 0 && checkedCount === items.length;

  const toggleAll = () => {
    setItems(setAllChecked(!allChecked));
  };

  const toggleOne = (it: CartItem) => {
    setItems(setChecked(it.productId, it.option, !it.checked));
  };

  const inc = (it: CartItem) => {
    setItems(setQtyStore(it.productId, it.option, it.qty + 1));
  };

  const dec = (it: CartItem) => {
    setItems(setQtyStore(it.productId, it.option, it.qty - 1));
  };

  const removeOne = (it: CartItem) => {
    setItems(removeItem(it.productId, it.option));
  };

  const removeChecked = () => {
    setItems(removeCheckedStore());
  };

  const subtotal = checkedItems.reduce((sum, it) => sum + it.price * it.qty, 0);
  const discount = 0;
  const shipping = subtotal >= 50000 || subtotal === 0 ? 0 : 3000;
  const total = subtotal - discount + shipping;

  const orderAll = () => {
    setAllChecked(true);
    router.push('/shop/checkout-normal');
  };

  const orderSelected = () => {
    if (checkedCount === 0) return;
    router.push('/shop/checkout-normal');
  };

  if (ready && items.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-inner">
          <nav className="cart-breadcrumb">
            <Link href="/">홈</Link> / 장바구니
          </nav>
          <div className="cart-stepper">
            <div className="cart-step active"><span>01</span><b>장바구니</b></div>
            <div className="cart-step"><span>02</span><b>주문서 작성</b></div>
            <div className="cart-step"><span>03</span><b>주문 완료</b></div>
          </div>
          <h1>장바구니</h1>
          <div className="cart-empty">
            <p className="cart-empty-msg">장바구니가 비어 있습니다.</p>
            <p className="cart-empty-sub">코지케어의 다양한 복지용구를 둘러보세요.</p>
            <Link href="/shop/list" className="cart-continue-btn">쇼핑 계속하기</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-inner">
        <nav className="cart-breadcrumb">
          <Link href="/">홈</Link> / 장바구니
        </nav>
        <div className="cart-stepper">
          <div className="cart-step active"><span>01</span><b>장바구니</b></div>
          <div className="cart-step"><span>02</span><b>주문서 작성</b></div>
          <div className="cart-step"><span>03</span><b>주문 완료</b></div>
        </div>
        <h1>장바구니</h1>
        <div className="cart-grid">
          <section className="cart-list">
            <header className="cart-list-head">
              <label>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                전체선택 ({checkedCount}/{items.length})
              </label>
              <button onClick={removeChecked} className="cart-list-action">선택삭제</button>
            </header>
            {items.map((it) => (
              <article className="cart-row" key={`${it.productId}-${it.option}`}>
                <input type="checkbox" checked={it.checked} onChange={() => toggleOne(it)} />
                <Image src={it.image} width={88} height={88} alt={it.name} />
                <div className="cart-row-info">
                  <Link href={`/shop/${it.productId}`} className="cart-row-name">{it.name}</Link>
                  <p className="cart-row-opt">옵션: {it.option}</p>
                  <div className="cart-row-qty">
                    <button onClick={() => dec(it)} aria-label="수량 감소">-</button>
                    <span>{it.qty}</span>
                    <button onClick={() => inc(it)} aria-label="수량 증가">+</button>
                  </div>
                </div>
                <div className="cart-row-price">
                  <p className="cart-row-unit">{toMoney(it.price)}원</p>
                  <p className="cart-row-sub">{toMoney(it.price * it.qty)}원</p>
                </div>
                <button onClick={() => removeOne(it)} className="cart-row-del" aria-label="삭제">×</button>
              </article>
            ))}
          </section>
          <aside className="cart-summary">
            <h3>결제 예상 금액</h3>
            <dl>
              <div><dt>총 상품금액</dt><dd>{toMoney(subtotal)}원</dd></div>
              <div><dt>총 할인금액</dt><dd className="dim">-{toMoney(discount)}원</dd></div>
              <div><dt>배송비</dt><dd>{shipping === 0 ? '무료' : toMoney(shipping) + '원'}</dd></div>
              <div className="cart-total"><dt>최종 결제금액</dt><dd className="accent">{toMoney(total)}원</dd></div>
            </dl>
            <button className="cart-order-all" onClick={orderAll}>전체 주문하기 ({items.length})</button>
            <button className="cart-order-selected" onClick={orderSelected}>선택 주문하기 ({checkedCount})</button>
            <Link href="/shop/list" className="cart-continue-link">쇼핑 계속하기</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
