import Link from "next/link";
import Image from "next/image";
import ShopHeader from "@/components/shop/ShopHeader";
import ShopFooter from "@/components/shop/ShopFooter";
import PromoPopup from "@/components/shop/PromoPopup";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <style>{`
        .hero {
          background: #fff;
          border-bottom: 1px solid var(--gray-200);
          padding: 56px 0;
        }
        .hero-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 56px;
          align-items: center;
        }
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          color: var(--green-700);
          border: 1px solid var(--green-300);
          padding: 6px 14px;
          border-radius: var(--r-pill);
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 20px;
        }
        .hero-tag .heart { color: var(--red-500); }
        .hero h1 {
          font-size: 46px;
          font-weight: 900;
          line-height: 1.18;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
          color: var(--gray-900);
        }
        .hero h1 .accent { color: var(--green-700); }
        .hero p.desc {
          font-size: 17px;
          color: var(--gray-600);
          line-height: 1.7;
          margin-bottom: 32px;
        }
        .hero p.desc strong { color: var(--red-600); font-weight: 800; }
        .hero-cta { display: flex; gap: 10px; flex-wrap: wrap; }
        .hero-cta .btn-lg { height: 50px; padding: 0 24px; font-size: 15px; }
        .hero-stats {
          display: flex;
          gap: 32px;
          margin-top: 40px;
          padding-top: 28px;
          border-top: 1px solid var(--green-100);
        }
        .hero-stat .num {
          font-size: 28px;
          font-weight: 900;
          color: var(--green-700);
          letter-spacing: -1px;
        }
        .hero-stat .lbl {
          font-size: 13px;
          color: var(--gray-600);
          margin-top: 2px;
        }
        .hero-visual { position: relative; height: 460px; }
        .hero-card {
          position: absolute;
          background: #fff;
          border-radius: var(--r-lg);
          box-shadow: var(--shadow-lg);
          padding: 24px;
        }
        .hero-card.main {
          width: 320px;
          height: 460px;
          top: 0;
          left: 30px;
          padding: 28px;
        }
        .hero-card.main .product-img {
          width: 100%;
          height: 260px;
          background: var(--gray-100);
          border-radius: var(--r-md);
          margin-bottom: 20px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
        }
        .hero-card.main h3 { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
        .hero-card.main .price-mini { color: var(--red-600); font-size: 14px; font-weight: 700; margin-bottom: 8px; }
        .hero-card.main .price-mini strong { font-size: 22px; }
        .hero-card.float-1 {
          width: 220px;
          top: 0;
          right: 0;
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 16px 20px;
        }
        .hero-card.float-1 .icon-bg {
          width: 44px; height: 44px;
          background: var(--green-50);
          color: var(--green-700);
          border-radius: var(--r-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hero-card.float-1 .ttl { font-size: 13px; color: var(--gray-500); }
        .hero-card.float-1 .val { font-size: 18px; font-weight: 800; color: var(--gray-900); }
        .hero-card.float-2 {
          width: 260px;
          bottom: 30px;
          right: 40px;
          background: var(--biz-navy);
          color: #fff;
        }
        .hero-card.float-2 h4 {
          font-size: 14px;
          margin-bottom: 6px;
          color: var(--biz-gold);
        }
        .hero-card.float-2 p { font-size: 13px; opacity: 0.85; line-height: 1.5; }
        .hero-card.float-2 a { color: var(--biz-gold); font-size: 13px; font-weight: 700; margin-top: 10px; display: inline-block; }

        .cat-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }
        .cat-card {
          background: #fff;
          border: 1px solid var(--gray-200);
          border-radius: var(--r-md);
          padding: 24px 12px;
          text-align: center;
          transition: all 0.15s;
          cursor: pointer;
        }
        .cat-card:hover {
          border-color: var(--green-500);
          background: #fff;
          transform: translateY(-2px);
        }
        .cat-card .cat-icon {
          width: 72px; height: 72px;
          background: var(--green-50);
          border-radius: var(--r-md);
          margin: 0 auto 12px;
          overflow: hidden;
        }
        .cat-card .cat-icon img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cat-card .cat-name { font-size: 14px; font-weight: 600; }

        .welfare-cta {
          background: #fff;
          border: 1px solid var(--gray-200);
          border-radius: var(--r-lg);
          padding: 40px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 32px;
          align-items: center;
        }
        .welfare-cta h3 {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }
        .welfare-cta h3 .em { color: var(--red-600); }
        .welfare-cta p { color: var(--gray-700); font-size: 15px; line-height: 1.7; }

        .biz-cta {
          background: var(--biz-navy);
          color: #fff;
          border-radius: var(--r-lg);
          padding: 40px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 32px;
          align-items: center;
        }
        .biz-cta h3 {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
          color: #fff;
        }
        .biz-cta h3 .gold {
          color: #fff;
          font-weight: 900;
          border-bottom: 2px solid rgba(255,255,255,0.6);
          padding-bottom: 2px;
        }
        .biz-cta p { color: rgba(255,255,255,0.85); font-size: 15px; line-height: 1.7; opacity: 1; }
        .biz-cta .biz-types {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          flex-wrap: wrap;
          color: #fff;
        }
        .biz-cta .biz-types span {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          padding: 4px 10px;
          border-radius: var(--r-pill);
          font-size: 12px;
        }
        .biz-cta .btn-gold {
          background: #fff;
          color: var(--biz-navy);
          border: none;
          font-weight: 800;
        }
        .biz-cta .btn-gold:hover { background: rgba(255,255,255,0.92); }

        .trust-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          padding: 32px;
          background: #fff;
          border: 1px solid var(--gray-200);
          border-radius: var(--r-lg);
        }
        .trust-item { text-align: center; }
        .trust-item .ico {
          width: 56px; height: 56px;
          background: #fff;
          border-radius: 50%;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--green-700);
          border: 1px solid var(--gray-200);
        }
        .trust-item h5 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
        .trust-item p { font-size: 12px; color: var(--gray-500); }

        @media (max-width: 1024px) {
          .hero-inner { grid-template-columns: 1fr; gap: 32px; }
          .hero-visual { height: 360px; }
          .cat-grid { grid-template-columns: repeat(4, 1fr); }
          .trust-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 720px) {
          .hero { padding: 28px 0; }
          .hero h1 { font-size: 28px; letter-spacing: -1px; }
          .hero p.desc { font-size: 14px; line-height: 1.6; }
          .hero-stats { gap: 14px; padding-top: 20px; margin-top: 24px; }
          .hero-stat .num { font-size: 20px; }
          .hero-stat .lbl { font-size: 11px; }
          .hero-visual { display: none; }
          .hero-card.main { width: 200px; height: 250px; padding: 14px; left: 0; top: 0; }
          .hero-card.main .product-img { height: 130px; font-size: 50px; }
          .hero-card.main h3 { font-size: 14px; }
          .hero-card.main .price-mini strong { font-size: 18px; }
          .hero-card.float-1 { width: 160px; right: 0; padding: 12px 14px; }
          .hero-card.float-1 .ttl { font-size: 11px; }
          .hero-card.float-1 .val { font-size: 14px; }
          .hero-card.float-1 .icon-bg { width: 36px; height: 36px; }
          .hero-card.float-2 { width: 200px; bottom: 0; right: 0; padding: 14px; }
          .hero-card.float-2 h4 { font-size: 12px; }
          .hero-card.float-2 p { font-size: 11px; }
          .cat-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .cat-card { padding: 16px 8px; }
          .cat-card .cat-icon { width: 40px; height: 40px; font-size: 20px; margin-bottom: 8px; }
          .cat-card .cat-name { font-size: 13px; }
          .welfare-cta, .biz-cta { grid-template-columns: 1fr; padding: 24px; gap: 18px; }
          .welfare-cta h3, .biz-cta h3 { font-size: 20px; }
          .trust-row { padding: 20px; }
        }
      `}</style>

      <ShopHeader />
      <PromoPopup />

      <div className="quick-chips">
        <Link href="/shop/list" className="chip hot">🔥 BEST 50</Link>
        <Link href="/shop/list" className="chip"># 복지용구 전체</Link>
        <Link href="/shop/list" className="chip new"># 신상</Link>
        <Link href="/shop/list" className="chip"># 당일출고</Link>
        <Link href="/shop/list" className="chip"># SALE</Link>
        <Link href="/shop/list" className="chip"># 카본로얄</Link>
        <Link href="/shop/list" className="chip"># 와이드</Link>
      </div>

      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="hero-tag"><span className="heart">♥</span> 본사 직영 · 코지케어</span>
            <h1>어르신의 걸음에<br /><span className="accent">자유로움</span>을 더합니다.</h1>
            <p className="desc">
              20년 노인 보행기 전문 제조사 ㈜코지케어가 직접 운영합니다.<br />
              장기요양 인정자라면 정가의 <strong>15%만 부담</strong>하고 구매하실 수 있습니다.
            </p>
            <div className="hero-cta">
              <Link href="/shop/list" className="btn btn-primary btn-lg">제품 둘러보기</Link>
              <Link href="/info/welfare-guide" className="btn btn-outline btn-lg">복지용구 안내 →</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><div className="num">20<small style={{ fontSize: '18px' }}>년+</small></div><div className="lbl">노인 보행기 전문</div></div>
              <div className="hero-stat"><div className="num">12,400<small style={{ fontSize: '18px' }}>+</small></div><div className="lbl">누적 구매 가구</div></div>
              <div className="hero-stat"><div className="num">98<small style={{ fontSize: '18px' }}>%</small></div><div className="lbl">고객 만족도</div></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card main">
              <div className="product-img" style={{ background: 'var(--gray-100)', padding: 0, overflow: 'hidden' }}>
                <Image src="/cozycare/images/products/carbon-royal.jpg" width={320} height={260} alt="코지워커 카본로얄파인더" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="badge-tag badge-welfare" style={{ marginBottom: '8px' }}>복지용구</div>
              <h3>코지워커 카본로얄파인더</h3>
              <div className="price-mini">
                부담금 <strong>52,500</strong>원
                <span style={{ color: 'var(--gray-400)', fontWeight: 500, textDecoration: 'line-through', marginLeft: '6px', fontSize: '12px' }}>350,000원</span>
              </div>
            </div>
            <div className="hero-card float-1">
              <div className="icon-bg">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="ttl">공단 인정</div>
                <div className="val">15% 부담금</div>
              </div>
            </div>
            <div className="hero-card float-2">
              <h4>★ 사업자 회원 혜택</h4>
              <p>공급가 · 누적 포인트 · 정산 관리</p>
              <Link href="/auth/biz-signup">사업자 등록 신청 →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">카테고리</h2>
              <p className="section-sub">필요한 복지용구를 한눈에</p>
            </div>
          </div>
          <div className="cat-grid">
            <Link href="/shop/list" className="cat-card"><div className="cat-icon"><Image src="/cozycare/images/products/carbon-royal.jpg" width={72} height={72} alt="보행기" /></div><div className="cat-name">보행기</div></Link>
            <Link href="/shop/list" className="cat-card"><div className="cat-icon"><Image src="/cozycare/images/products/wide-red-p04.jpg" width={72} height={72} alt="휠체어" /></div><div className="cat-name">휠체어</div></Link>
            <Link href="/shop/list" className="cat-card"><div className="cat-icon"><Image src="/cozycare/images/products/royal-cushion.jpg" width={72} height={72} alt="목욕의자" /></div><div className="cat-name">목욕의자</div></Link>
            <Link href="/shop/list" className="cat-card"><div className="cat-icon"><Image src="/cozycare/images/products/royal-wide.jpg" width={72} height={72} alt="이동변기" /></div><div className="cat-name">이동변기</div></Link>
            <Link href="/shop/list" className="cat-card"><div className="cat-icon"><Image src="/cozycare/images/products/eurolight.jpg" width={72} height={72} alt="전동침대" /></div><div className="cat-name">전동침대</div></Link>
            <Link href="/shop/list" className="cat-card"><div className="cat-icon"><Image src="/cozycare/images/products/red-front.jpg" width={72} height={72} alt="기타" /></div><div className="cat-name">기타</div></Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">베스트 컬렉션</h2>
              <p className="section-sub">코지워커 시리즈 인기 모델</p>
            </div>
            <Link href="/shop/list" className="section-more">전체보기 →</Link>
          </div>
          <div className="product-grid">

            <Link href="/shop/detail" className="product-card">
              <div className="thumb">
                <div className="thumb-badges">
                  <span className="badge-tag badge-best">BEST</span>
                  <span className="badge-tag badge-welfare">복지</span>
                </div>
                <button className="like-btn">
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                  </svg>
                </button>
                <Image src="/cozycare/images/products/carbon-royal.jpg" width={300} height={300} alt="코지워커 카본로얄파인더" />
              </div>
              <div className="info">
                <div className="brand">코지케어</div>
                <div className="title">코지워커 카본로얄파인더 — 카본 프레임</div>
                <div className="price-welfare">부담금 <strong>52,500원</strong></div>
                <div className="price-normal">350,000원<span className="strike">395,000원</span></div>
                <div className="rating"><span className="star">★</span> 4.8 (124)</div>
              </div>
            </Link>

            <Link href="/shop/detail" className="product-card">
              <div className="thumb">
                <div className="thumb-badges">
                  <span className="badge-tag badge-best">BEST</span>
                  <span className="badge-tag badge-welfare">복지</span>
                </div>
                <button className="like-btn">
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                  </svg>
                </button>
                <Image src="/cozycare/images/products/wide-red-p04.jpg" width={300} height={300} alt="코지워커 와이드레드 P04" />
              </div>
              <div className="info">
                <div className="brand">코지케어</div>
                <div className="title">코지워커 와이드레드 P04 — 좌석+장바구니</div>
                <div className="price-welfare">부담금 <strong>37,500원</strong></div>
                <div className="price-normal">250,000원</div>
                <div className="rating"><span className="star">★</span> 4.7 (87)</div>
              </div>
            </Link>

            <Link href="/shop/detail" className="product-card">
              <div className="thumb">
                <div className="thumb-badges">
                  <span className="badge-tag badge-new">NEW</span>
                  <span className="badge-tag badge-welfare">복지</span>
                </div>
                <button className="like-btn">
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                  </svg>
                </button>
                <Image src="/cozycare/images/products/eurolight.jpg" width={300} height={300} alt="코지워커 유로라이트" />
              </div>
              <div className="info">
                <div className="brand">코지케어</div>
                <div className="title">코지워커 유로라이트 — 초경량 4륜</div>
                <div className="price-welfare">부담금 <strong>33,750원</strong></div>
                <div className="price-normal">225,000원</div>
                <div className="rating"><span className="star">★</span> 4.6 (96)</div>
              </div>
            </Link>

            <Link href="/shop/detail" className="product-card">
              <div className="thumb">
                <div className="thumb-badges">
                  <span className="badge-tag badge-welfare">복지</span>
                </div>
                <button className="like-btn">
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                  </svg>
                </button>
                <Image src="/cozycare/images/products/royal-cushion.jpg" width={300} height={300} alt="코지워커 로얄쿠션" />
              </div>
              <div className="info">
                <div className="brand">코지케어</div>
                <div className="title">코지워커 로얄쿠션 — 쿠션 좌석형</div>
                <div className="price-welfare">부담금 <strong>40,500원</strong></div>
                <div className="price-normal">270,000원</div>
                <div className="rating"><span className="star">★</span> 4.9 (203)</div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="welfare-cta">
            <div>
              <h3>장기요양 인정자라면 <span className="em">15% 부담금</span>으로 구매하세요</h3>
              <p>국민건강보험공단 장기요양 등급을 받으신 분은 정가의 15%만 부담하시면 됩니다. 인정번호와 서류만 준비해주시면 저희가 공단 확인부터 출고까지 모두 진행해드립니다.</p>
            </div>
            <Link href="/info/welfare-guide" className="btn btn-welfare btn-lg">자세히 보기 →</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="biz-cta">
            <div>
              <h3>사업소·재가복지센터라면 <span className="gold">사업자 회원</span>으로</h3>
              <p>공급가 + 누적 포인트 + 거래 명세서 다운로드까지. 사업자등록증만 첨부하시면 1~2영업일 내 승인됩니다.</p>
              <div className="biz-types">
                <span>복지용구사업소</span>
                <span>인터넷 사업소</span>
                <span>재가복지센터</span>
                <span>기타 관련업체</span>
              </div>
            </div>
            <Link href="/auth/biz-signup" className="btn btn-gold btn-lg">사업자 등록 신청 →</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="trust-row">
            <div className="trust-item">
              <div className="ico">
                <svg className="icon" style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h5>본사 직영</h5>
              <p>중간 마진 없는 제조사 직배</p>
            </div>
            <div className="trust-item">
              <div className="ico">
                <svg className="icon" style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h5>당일 출고</h5>
              <p>오후 2시 이전 주문시 당일</p>
            </div>
            <div className="trust-item">
              <div className="ico">
                <svg className="icon" style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h5>공단 확인 대행</h5>
              <p>서류 검토부터 출고까지</p>
            </div>
            <div className="trust-item">
              <div className="ico">
                <svg className="icon" style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h5>전화 상담</h5>
              <p>1588-0000 평일 9시~6시</p>
            </div>
          </div>
        </div>
      </section>

      <ShopFooter />
    </>
  );
}
