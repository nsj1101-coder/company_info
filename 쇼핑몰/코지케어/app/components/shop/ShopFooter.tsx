import Link from 'next/link';

export default function ShopFooter() {
  return (
    <footer className="shop-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col">
            <h5>고객센터</h5>
            <p className="phone">1588-0000</p>
            <p>평일 09:00~18:00 / 점심 12~13시</p>
            <p>주말·공휴일 휴무</p>
          </div>
          <div className="footer-col">
            <h5>쇼핑 안내</h5>
            <ul>
              <li><Link href="/info/welfare-guide">복지용구 안내</Link></li>
              <li><Link href="/info/faq">자주 묻는 질문</Link></li>
              <li><Link href="/shop/cart">장바구니</Link></li>
              <li><Link href="/mypage/orders">주문 조회</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>서비스 정보</h5>
            <ul>
              <li><Link href="/info/welfare-guide">회사 소개</Link></li>
              <li><Link href="/info/terms">이용약관</Link></li>
              <li><Link href="/info/privacy">개인정보처리방침</Link></li>
              <li><Link href="/auth/biz-signup">사업자회원</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>결제·배송 정보</h5>
            <p>무통장입금, 카드결제, 카카오페이</p>
            <p>CJ대한통운 / 평균 출고 1~2일</p>
            <p>도서산간 추가 배송비 발생</p>
          </div>
        </div>
        <div className="footer-info">
          <p><strong>(주)코지케어</strong> · 대표 김◯◯ · 1588-0000 · cs@cozycare.co.kr</p>
          <p>경기도 부천시 ◯◯로 ◯◯ · 사업자등록번호 000-00-00000 · 통신판매업 2026-경기부천-0000</p>
        </div>
        <div className="footer-copy">
          Copyright © COZYCARE 코지케어 All rights reserved.
        </div>
      </div>
    </footer>
  );
}
