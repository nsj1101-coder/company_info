'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { addToCart } from '../_cart';

type TabKey = 'detail' | 'review' | 'qna' | 'shipping';

export type DetailReview = {
  id: number;
  rating: number;
  authorName: string;
  title: string | null;
  content: string;
  createdAt: string;
  reply: string | null;
};

export type DetailQna = {
  id: number;
  authorName: string;
  question: string;
  answer: string | null;
  status: string;
  secret: boolean;
  createdAt: string;
};

export type DetailOption = {
  id: number;
  name: string;
  value: string;
};

export type DetailProduct = {
  id: number;
  code: string;
  name: string;
  price: number;
  welfarePrice: number | null;
  description: string | null;
  detailContent: string | null;
  kcCert: string | null;
  categoryName: string;
  thumbnail: string | null;
  images: string[];
  options: DetailOption[];
};

type Props = {
  product: DetailProduct;
  reviews: DetailReview[];
  qnas: DetailQna[];
  ratingAvg: number;
  reviewCount: number;
  isLoggedIn: boolean;
};

const FEATURES = [
  '경량 알루미늄 소재 (중량 9kg)',
  '높이 조절 가능 (87.5~99cm)',
  '넓은 좌면 (41×27cm)',
  '큰 바퀴 (전/후 19cm)',
  '접이식 설계 (접이 폭 23.5cm)',
  '최대 하중 80kg / KC 안전 인증',
];

const STYLES = `
  .breadcrumb {
    font-size: 13px;
    color: var(--gray-500);
    padding: 20px 0;
  }
  .breadcrumb a:hover { color: var(--gray-900); }
  .breadcrumb .sep { margin: 0 8px; color: var(--gray-300); }

  .detail-wrap {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 48px;
    align-items: flex-start;
    margin-bottom: 60px;
  }

  .gallery .main-img {
    aspect-ratio: 1;
    background: var(--gray-100);
    border-radius: var(--r-lg);
    position: relative;
    overflow: hidden;
  }
  .gallery .main-img img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  /* 모바일 가로 스와이프 갤러리 */
  .gallery .swipe-track { display: none; }
  .gallery .swipe-dots { display: none; }
  @media (max-width: 720px) {
    /* 모바일: 메인 이미지 + 그 아래 썸네일(이미지 고르기) 유지, swipe 캐러셀 미사용 */
    .gallery .main-img { display: block; }
    .gallery .thumbs { display: grid; }
    .gallery .swipe-track { display: none; }
    .gallery .swipe-dots { display: none; }
  }
  .gallery .img-action-row {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .gallery .img-btn {
    width: 44px;
    height: 44px;
    background: rgba(255,255,255,0.95);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-700);
    box-shadow: var(--shadow-sm);
  }
  .gallery .img-btn:hover { color: var(--red-500); }
  .gallery .thumbs {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-top: 12px;
  }
  .gallery .thumb {
    aspect-ratio: 1;
    background: var(--gray-100);
    border-radius: var(--r-sm);
    cursor: pointer;
    border: 2px solid transparent;
    display: flex; align-items: center; justify-content: center;
    font-size: 32px;
  }
  .gallery .thumb.active { border-color: var(--green-700); }

  .info-area .brand-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .info-area h1 {
    font-size: 28px;
    font-weight: 800;
    line-height: 1.3;
    letter-spacing: -0.5px;
    margin-bottom: 16px;
  }
  .info-area .rating-row {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--gray-500);
    font-size: 14px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--gray-100);
  }
  .info-area .rating-row .stars { color: var(--warning); font-weight: 700; }

  /* 사양 표 */
  .spec-list {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--r-md);
    padding: 14px 18px;
    margin-bottom: 22px;
    font-size: 13px;
  }
  .spec-list .row {
    display: flex;
    padding: 6px 0;
  }
  .spec-list .row .k {
    width: 90px;
    color: var(--gray-500);
    font-weight: 600;
    flex-shrink: 0;
  }
  .spec-list .row .v {
    flex: 1;
    color: var(--gray-900);
    font-weight: 600;
  }

  .option-block { margin-bottom: 20px; }
  .option-label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: var(--gray-700);
    margin-bottom: 10px;
  }
  .color-list {
    display: flex;
    gap: 10px;
  }
  .color-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--r-pill);
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.15s;
  }
  .color-chip:hover { border-color: var(--gray-400); }
  .color-chip.active { border-color: var(--gray-900); border-width: 2px; background: #fff; color: var(--gray-900); }
  .color-chip .dot {
    width: 16px; height: 16px;
    border-radius: 50%;
    border: 1px solid var(--gray-300);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6);
  }

  .price-box { box-sizing: border-box; }

  .info-popup {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-left: 3px solid var(--green-600);
    padding: 12px 14px;
    margin-top: 10px;
    border-radius: 4px;
    font-size: 12px;
    color: var(--gray-700);
    line-height: 1.6;
    display: none;
  }
  .info-popup.show { display: block; }

  .price-box {
    border: 1px solid var(--gray-200);
    background: #fff;
  }
  .price-box.welfare-box { background: #fff; }
  .price-box.biz-box { background: #fff; }

  .biz-hint {
    margin-top: 10px;
    padding: 12px 14px;
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--r-sm);
    font-size: 12px;
    color: var(--gray-700);
    text-align: center;
  }
  .biz-hint a {
    color: var(--biz-navy);
    font-weight: 700;
  }
  .biz-hint.hidden { display: none; }

  .detail-shots {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin: 32px auto;
    max-width: 720px;
  }
  .detail-shots img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: var(--r-md);
    background: var(--gray-100);
  }
  @media (max-width: 720px) {
    .detail-shots { grid-template-columns: 1fr; max-width: none; }
  }

  .action-row {
    display: flex;
    gap: 10px;
    margin-top: 24px;
  }
  .action-row .like-big {
    width: 56px;
    height: 56px;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--r-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-400);
    background: #fff;
  }
  .action-row .like-big:hover { color: var(--red-500); border-color: var(--red-500); }

  .mobile-cta-bar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: #fff;
    border-top: 1px solid var(--gray-200);
    padding: 10px 16px;
    display: none;
    gap: 8px;
    z-index: 50;
    box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
  }
  .mobile-cta-bar .btn { flex: 1; }

  .detail-content {
    margin-top: 40px;
    padding-top: 40px;
    border-top: 1px solid var(--gray-100);
  }
  .detail-tabs {
    display: flex;
    gap: 0;
    border-bottom: 2px solid var(--gray-100);
    margin-bottom: 32px;
    position: sticky;
    top: 73px;
    background: #fff;
    z-index: 10;
  }
  .detail-tabs .tab {
    padding: 16px 24px;
    font-weight: 700;
    color: var(--gray-500);
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    cursor: pointer;
  }
  .detail-tabs .tab.active { color: var(--green-700); border-color: var(--green-700); }

  .detail-body {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--r-lg);
    padding: 60px 40px;
    text-align: center;
  }
  .detail-body h3 { font-size: 24px; margin-bottom: 16px; }
  .detail-body p { color: var(--gray-600); max-width: 600px; margin: 0 auto 16px; }
  .detail-body .placeholder {
    width: 100%;
    max-width: 520px;
    aspect-ratio: 4 / 5;
    background: var(--gray-200);
    margin: 32px auto;
    border-radius: var(--r-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80px;
    color: var(--gray-400);
  }
  .detail-body .feature-list {
    text-align: left;
    max-width: 520px;
    margin: 24px auto;
    padding: 0;
    list-style: none;
  }
  .detail-body .feature-list li {
    padding: 10px 0;
    border-bottom: 1px solid var(--gray-100);
    color: var(--gray-800);
    font-weight: 600;
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .detail-body .feature-list li::before {
    content: '✓';
    color: var(--green-700);
    font-weight: 800;
  }

  /* 리뷰 탭 */
  .review-summary {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--r-md);
    padding: 24px;
    margin-bottom: 20px;
    text-align: center;
  }
  .review-summary .big-score {
    font-size: 44px;
    font-weight: 800;
    color: var(--gray-900);
    line-height: 1;
  }
  .review-summary .big-stars {
    color: var(--warning);
    font-size: 22px;
    margin: 8px 0;
  }
  .review-summary .total {
    color: var(--gray-500);
    font-size: 13px;
  }
  .review-card {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--r-md);
    padding: 18px 20px;
    margin-bottom: 10px;
    text-align: left;
  }
  .review-card .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
  }
  .review-card .top .stars { color: var(--warning); font-weight: 700; }
  .review-card .top .meta { color: var(--gray-500); }
  .review-card .body { color: var(--gray-800); font-size: 14px; line-height: 1.6; }

  /* Q&A 탭 */
  .qna-list { text-align: left; }
  .qna-item {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--r-md);
    margin-bottom: 8px;
    overflow: hidden;
  }
  .qna-q {
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-weight: 700;
    color: var(--gray-900);
    font-size: 14px;
  }
  .qna-q .q-mark {
    color: var(--green-700);
    margin-right: 10px;
    font-weight: 800;
  }
  .qna-q .arrow {
    color: var(--gray-400);
    transition: transform 0.2s;
  }
  .qna-q.open .arrow { transform: rotate(180deg); }
  .qna-a {
    padding: 16px 20px;
    background: var(--gray-50, #f9fafb);
    border-top: 1px solid var(--gray-200);
    color: var(--gray-700);
    font-size: 13px;
    line-height: 1.7;
    display: flex;
    gap: 10px;
  }
  .qna-a .a-mark {
    color: var(--red-500);
    font-weight: 800;
    flex-shrink: 0;
  }

  /* 작성 폼 */
  .write-box {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--r-md);
    padding: 20px;
    margin-bottom: 20px;
    text-align: left;
  }
  .write-box h4 {
    font-size: 15px;
    font-weight: 800;
    color: var(--gray-900);
    margin: 0 0 12px;
  }
  .write-box .write-input,
  .write-box .write-textarea {
    width: 100%;
    border: 1px solid var(--gray-200);
    border-radius: var(--r-sm);
    padding: 10px 12px;
    font-size: 13px;
    box-sizing: border-box;
    margin-bottom: 10px;
    font-family: inherit;
  }
  .write-box .write-textarea { min-height: 88px; resize: vertical; }
  .write-box .star-pick {
    display: flex;
    gap: 4px;
    margin-bottom: 10px;
    font-size: 22px;
    color: var(--gray-300);
    cursor: pointer;
  }
  .write-box .star-pick .on { color: var(--warning); }
  .write-box .write-actions { display: flex; justify-content: flex-end; }
  .write-box .login-hint {
    font-size: 13px;
    color: var(--gray-500);
  }
  .write-box .login-hint a { color: var(--green-700); font-weight: 700; }

  /* 배송·반품 탭 */
  .shipping-box {
    text-align: left;
  }
  .shipping-box h4 {
    font-size: 16px;
    font-weight: 800;
    color: var(--gray-900);
    margin: 0 0 14px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--green-700);
    display: inline-block;
  }
  .shipping-box .section { margin-bottom: 28px; }
  .shipping-box .section:last-child { margin-bottom: 0; }
  .shipping-box ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .shipping-box ul li {
    padding: 10px 0;
    border-bottom: 1px solid var(--gray-100);
    color: var(--gray-700);
    font-size: 13px;
    line-height: 1.6;
    display: flex;
    gap: 12px;
  }
  .shipping-box ul li b {
    min-width: 130px;
    color: var(--gray-900);
    font-weight: 700;
    flex-shrink: 0;
  }

  /* 상세 — 유튜브 영상 */
  .detail-video {
    max-width: 480px;
    margin: 32px auto;
    aspect-ratio: 370 / 658;
  }
  .detail-video iframe {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    border: 0;
    display: block;
  }

  /* 상세 — 외부 CDN 이미지 블록 */
  .detail-img-block {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 32px 0;
  }
  .detail-img-block img {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    display: block;
    border-radius: 8px;
  }

  /* 상품필수 정보 / 상품정보제공고시 */
  .must-info, .provide-info {
    margin: 48px 0 24px;
    text-align: left;
  }
  .must-info h3, .provide-info h3 {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 2px solid #111827;
  }
  .must-table {
    width: 100%;
    border-collapse: collapse;
    border-top: 1px solid #E5E7EB;
  }
  .must-table th {
    width: 20%;
    padding: 14px 12px;
    text-align: left;
    background: #F9FAFB;
    font-weight: 600;
    font-size: 13px;
    color: #374151;
    border-bottom: 1px solid #E5E7EB;
    vertical-align: top;
  }
  .must-table td {
    padding: 14px 12px;
    font-size: 13px;
    color: #374151;
    border-bottom: 1px solid #E5E7EB;
    line-height: 1.6;
  }
  .must-table td .muted {
    color: #9CA3AF;
    font-size: 12px;
    margin-top: 6px;
  }
  .must-table td a {
    color: #84c140;
    text-decoration: underline;
  }
  .kc-block p { margin: 0 0 6px; }
  .kc-block p:last-child { margin-bottom: 0; }

  .provide-list {
    border-top: 1px solid #E5E7EB;
    margin: 0;
  }
  .provide-list > div {
    display: grid;
    grid-template-columns: 200px 1fr;
    padding: 14px 12px;
    border-bottom: 1px solid #E5E7EB;
    gap: 16px;
  }
  .provide-list dt {
    font-weight: 600;
    font-size: 13px;
    color: #6B7280;
    margin: 0;
  }
  .provide-list dd {
    font-size: 13px;
    color: #374151;
    margin: 0;
  }

  @media (max-width: 640px) {
    .provide-list > div { grid-template-columns: 1fr; gap: 4px; }
    .must-table th { width: auto; display: block; }
    .must-table td { display: block; }
  }

  @media (max-width: 1024px) {
    .detail-wrap { grid-template-columns: 1fr; gap: 32px; }
  }
  @media (max-width: 720px) {
    .breadcrumb { font-size: 12px; padding: 12px 0; }
    .info-area h1 { font-size: 20px; line-height: 1.35; }
    .gallery .main-img { font-size: 100px; border-radius: var(--r-md); }
    .gallery .img-btn { width: 36px; height: 36px; }
    .gallery .thumb { font-size: 22px; }
    .mobile-cta-bar { display: flex; }
    body { padding-bottom: 80px; }
    .detail-tabs { top: 60px; overflow-x: auto; }
    .detail-tabs .tab { padding: 12px 14px; font-size: 13px; white-space: nowrap; flex-shrink: 0; }
    .detail-body { padding: 32px 16px; }
    .detail-body h3 { font-size: 18px; }
    .price-box { padding: 16px; }
    .price-box .price-row strong { font-size: 18px; }
    .spec-list { font-size: 12px; padding: 12px 14px; }
    .spec-list .row .k { width: 70px; }
    .shipping-box ul li { flex-direction: column; gap: 4px; }
    .shipping-box ul li b { min-width: 0; }
  }
`;

function renderStars(filled: number): string {
  return '★★★★★'.slice(0, filled) + '☆☆☆☆☆'.slice(0, 5 - filled);
}

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

const COLOR_SWATCH: Record<string, string> = {
  실버: '#c0c0c0',
  레드: '#d64545',
  블루: '#3b6fb5',
  블랙: '#222',
  그레이: '#888',
};

export default function DetailClient(props: Props) {
  return (
    <Suspense fallback={null}>
      <DetailContent {...props} />
    </Suspense>
  );
}

function DetailContent({ product, reviews, qnas, ratingAvg, reviewCount, isLoggedIn }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBiz = searchParams.get('biz') === '1';

  const colorOptions = product.options.filter((o) => o.name === '색상');

  const [activeColor, setActiveColor] = useState(0);
  const [activeThumb, setActiveThumb] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('detail');
  const [welfarePopOpen, setWelfarePopOpen] = useState(false);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [openQna, setOpenQna] = useState<Set<number>>(new Set());

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [question, setQuestion] = useState('');
  const [questionSecret, setQuestionSecret] = useState(false);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const idx = Math.round(track.scrollLeft / track.clientWidth);
      setSwipeIndex(idx);
    };
    track.addEventListener('scroll', onScroll);
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  const optionLabel = colorOptions.length ? colorOptions[activeColor]?.value ?? '' : '';
  const welfarePay = product.welfarePrice ?? Math.round(product.price * 0.15);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      option: optionLabel || '단일 옵션',
      image: product.thumbnail ?? product.images[0] ?? '',
      price: product.price,
      qty,
    });
    router.push('/shop/cart');
  };

  const buildBuyQuery = () => {
    const params = new URLSearchParams();
    params.set('productId', String(product.id));
    params.set('qty', String(qty));
    if (optionLabel) params.set('option', optionLabel);
    return params.toString();
  };

  const handleBuyWelfare = () => router.push(`/shop/checkout-welfare?${buildBuyQuery()}`);
  const handleBuyNormal = () => router.push(`/shop/checkout-normal?${buildBuyQuery()}`);
  const handleBuyBiz = () => router.push(`/shop/checkout-normal?${buildBuyQuery()}`);

  const toggleQna = (i: number) => {
    setOpenQna((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const submitReview = async () => {
    if (!reviewContent.trim() || reviewSubmitting) return;
    setReviewSubmitting(true);
    const res = await fetch('/cozycare/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        content: reviewContent,
      }),
    });
    setReviewSubmitting(false);
    if (res.ok) {
      setReviewTitle('');
      setReviewContent('');
      setReviewRating(5);
      router.refresh();
    } else {
      alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const submitQuestion = async () => {
    if (!question.trim() || questionSubmitting) return;
    setQuestionSubmitting(true);
    const res = await fetch('/cozycare/api/product-qna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        question,
        secret: questionSecret,
      }),
    });
    setQuestionSubmitting(false);
    if (res.ok) {
      setQuestion('');
      setQuestionSecret(false);
      router.refresh();
    } else {
      alert('질문 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const galleryImgs = product.images.length ? product.images : [product.thumbnail ?? ''];

  return (
    <>
      <style>{STYLES}</style>

      <main className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link><span className="sep">/</span>
          <Link href="/shop/list">전체상품</Link><span className="sep">/</span>
          <Link href="/shop/list">{product.categoryName}</Link><span className="sep">/</span>
          <span>{product.name}</span>
        </div>

        <div className="detail-wrap">
          <div className="gallery">
            {/* PC 메인 이미지 */}
            <div className="main-img">
              <img src={galleryImgs[activeThumb]} alt={product.name} />
              <div className="img-action-row">
                <button className="img-btn" aria-label="찜">
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                </button>
                <button className="img-btn" aria-label="공유">
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                </button>
                <button className="img-btn" aria-label="영상">
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
              </div>
            </div>
            {/* PC 썸네일 */}
            <div className="thumbs">
              {galleryImgs.map((src, i) => (
                <div
                  key={i}
                  className={`thumb${activeThumb === i ? ' active' : ''}`}
                  style={{ background: `url('${src}') center/cover` }}
                  onClick={() => setActiveThumb(i)}
                />
              ))}
            </div>
            {/* 모바일 가로 스와이프 갤러리 */}
            <div className="swipe-track" id="swipeTrack" ref={trackRef}>
              {galleryImgs.map((src, i) => (
                <div key={i} className="swipe-slide"><img src={src} alt="" /></div>
              ))}
            </div>
            <div className="swipe-dots">
              {galleryImgs.map((_, i) => (
                <span key={i} className={`dot${swipeIndex === i ? ' active' : ''}`} />
              ))}
            </div>
          </div>

          <div className="info-area">
            <div className="brand-row">
              <span className="badge-tag badge-best">예약구매</span>
              <span className="badge-tag badge-welfare">복지용구</span>
              <span className="badge-tag" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }}>6월 중순 순차출고</span>
            </div>
            <h1>{product.name}</h1>
            <div className="rating-row">
              <span className="stars">{renderStars(Math.round(ratingAvg))}</span>
              <strong style={{ color: 'var(--gray-900)' }}>{ratingAvg.toFixed(1)}</strong>
              <span>· {reviewCount}개 리뷰</span>
              <span style={{ color: 'var(--gray-300)' }}>|</span>
              <span>본사 직영 · KC 안전인증</span>
            </div>

            {/* 사양 */}
            <div className="spec-list">
              <div className="row"><div className="k">브랜드</div><div className="v">코지케어</div></div>
              <div className="row"><div className="k">모델명</div><div className="v">{product.name}</div></div>
              <div className="row"><div className="k">상품코드</div><div className="v">{product.code}</div></div>
              <div className="row"><div className="k">카테고리</div><div className="v">{product.categoryName}</div></div>
              {product.kcCert && (
                <div className="row"><div className="k">KC 인증</div><div className="v">{product.kcCert}</div></div>
              )}
              <div className="row"><div className="k">원산지</div><div className="v">대한민국</div></div>
            </div>

            {/* 색상 선택 */}
            {colorOptions.length > 0 && (
              <div className="option-block">
                <label className="option-label">색상 — <span style={{ color: 'var(--gray-400)', fontWeight: 500 }}>{colorOptions.length === 1 ? '단일 색상' : '선택'}</span></label>
                <div className="color-list">
                  {colorOptions.map((c, i) => (
                    <div
                      key={c.id}
                      className={`color-chip${activeColor === i ? ' active' : ''}`}
                      onClick={() => setActiveColor(i)}
                    >
                      <span className="dot" style={{ background: COLOR_SWATCH[c.value] ?? '#c0c0c0' }}></span>{c.value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 비-사업자 기본 가격박스 */}
            {!isBiz && (
              <div className="price-box welfare-box" id="defaultPriceBox">
                <div className="price-row">
                  <span className="price-label">정가</span>
                  <span><strong style={{ color: 'var(--gray-500)', textDecoration: 'line-through' }}>{product.price.toLocaleString()}</strong>원</span>
                </div>
                <div className="price-row">
                  <span className="price-label">일반대상자 15% 부담금</span>
                  <span><strong>{welfarePay.toLocaleString()}</strong>원
                    <button className="info-btn" onClick={() => setWelfarePopOpen((o) => !o)}>
                      <svg className="icon" style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      안내
                    </button>
                  </span>
                </div>
                <div className="price-row">
                  <span className="price-label">감경대상자 50% (9%)</span>
                  <span><strong style={{ color: 'var(--green-700)' }}>{Math.round(product.price * 0.09).toLocaleString()}</strong>원</span>
                </div>
                <div className="price-row">
                  <span className="price-label">기초·차상위 (6%)</span>
                  <span><strong style={{ color: 'var(--green-700)' }}>{Math.round(product.price * 0.06).toLocaleString()}</strong>원</span>
                </div>
                <div id="pop-welfare" className={`info-popup${welfarePopOpen ? ' show' : ''}`}>
                  ※ 장기요양 인정번호와 인정서가 필요합니다. 구매 시 서류 제출 → 공단 확인 → 본인부담금(6~15%) 결제 순으로 진행되며,
                  결제는 관계사 <strong>㈜베스트시니어</strong>에서 처리됩니다.
                </div>
                <div className="cta-row">
                  <span className="label-buy">구매하기</span>
                  <button onClick={handleBuyWelfare} className="btn btn-welfare btn-lg">복지용구 구매</button>
                  <button onClick={handleBuyNormal} className="btn btn-normal btn-lg">일반 구매</button>
                </div>
              </div>
            )}

            {/* 사업자 가격박스 */}
            {isBiz && (
              <div className="price-box biz-box" id="bizPriceBox">
                <div className="price-row">
                  <span className="price-label">급여가 / 판매가</span>
                  <strong style={{ color: 'var(--gray-500)', fontSize: '16px', fontWeight: 600, textDecoration: 'line-through' }}>{product.price.toLocaleString()}원</strong>
                </div>
                <div className="price-row">
                  <span className="price-label">공급가</span>
                  <strong style={{ color: 'var(--biz-navy)' }}>{Math.round(product.price * 0.72).toLocaleString()}원</strong>
                </div>
                <div className="price-row">
                  <span className="price-label">적립포인트</span>
                  <strong style={{ color: 'var(--biz-gold)', fontSize: '18px' }}>+ 5,000 P</strong>
                </div>
                <div className="price-row" style={{ borderTop: '1px solid var(--gray-300)', marginTop: '6px', paddingTop: '12px' }}>
                  <span className="price-label" style={{ fontWeight: 700, color: 'var(--gray-900)' }}>결제 금액</span>
                  <strong style={{ color: 'var(--biz-navy)', fontSize: '24px' }}>{(Math.round(product.price * 0.72) * qty).toLocaleString()}원</strong>
                </div>
                <div className="cta-row">
                  <span className="label-buy">수량</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--r-sm)', padding: '0 6px', background: '#fff' }}>
                    <button
                      style={{ width: '32px', height: '40px', fontSize: '18px', color: 'var(--gray-500)' }}
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                    >−</button>
                    <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                    <button
                      style={{ width: '32px', height: '40px', fontSize: '18px', color: 'var(--gray-500)' }}
                      onClick={() => setQty((q) => q + 1)}
                    >+</button>
                  </div>
                  <button onClick={handleBuyBiz} className="btn btn-primary btn-lg" style={{ flex: 1 }}>구매하기</button>
                </div>
              </div>
            )}

            {/* 사업자 안내 */}
            <div className={`biz-hint${isBiz ? ' hidden' : ''}`} id="bizHint">
              <Link href="/auth/biz-login">★ 사업자로 로그인</Link>하시면 공급가·적립 포인트로 구매하실 수 있어요.
            </div>

            <div className="action-row">
              <button className="like-big">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
              </button>
              <button onClick={handleAddToCart} className="btn btn-normal btn-lg" style={{ flex: 1 }}>장바구니 담기</button>
            </div>
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-tabs">
            <a
              className={`tab${activeTab === 'detail' ? ' active' : ''}`}
              onClick={() => setActiveTab('detail')}
            >상품 상세</a>
            <a
              className={`tab${activeTab === 'review' ? ' active' : ''}`}
              onClick={() => setActiveTab('review')}
            >리뷰 ({reviewCount})</a>
            <a
              className={`tab${activeTab === 'qna' ? ' active' : ''}`}
              onClick={() => setActiveTab('qna')}
            >Q&A ({qnas.length})</a>
            <a
              className={`tab${activeTab === 'shipping' ? ' active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >배송·반품</a>
          </div>

          {activeTab === 'detail' && (
            <div className="detail-body">
              {product.detailContent ? (
                <div className="detail-html" dangerouslySetInnerHTML={{ __html: product.detailContent.replace(/<script[\s\S]*?<\/script>/gi, '') }} />
              ) : (<>
              <h3>{product.name}</h3>
              <p>{product.description ?? '알루미늄 경량 구조와 넓은 좌석으로 외출 시 휴식까지 한 번에. 노인장기요양보험 복지용구 등록 제품으로 본인부담금 6~15%만 결제하시면 됩니다.'}</p>
              <ul className="feature-list">
                {FEATURES.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {galleryImgs.length >= 3 && (
                <div className="detail-shots">
                  {galleryImgs.slice(0, 3).map((src, i) => (
                    <img key={i} src={src} alt="" />
                  ))}
                </div>
              )}
              <p>높이 87.5~99cm 조절 가능. 큰 19cm 바퀴와 핸드브레이크로 안전한 외출, 접으면 23.5cm 폭으로 트렁크 보관이 쉽습니다.</p>

              <div className="detail-video">
                <iframe
                  src="https://www.youtube.com/embed/P5NQkjBo55k"
                  title="재활훈련 및 일반 보행기가 힘든 분들에게 제격인 코지워커 P02"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              <div className="detail-img-block">
                <img
                  src="https://cdn-pro-web-250-117.cdn-nhncommerce.com/greyscale_godomall_com/data/editor/goods/221213/23de6bdd2e12e6d115ad7c128aae0cf5_044111.png"
                  alt="코지워커 P02 상세 1"
                />
                <img
                  src="https://cdn-pro-web-250-117.cdn-nhncommerce.com/greyscale_godomall_com/data/editor/goods/230217/8968692e8e1968e4154e7b99765e8d1e_115016.png"
                  alt="코지워커 P02 상세 2"
                />
              </div>

              <section className="must-info">
                <h3>상품필수 정보</h3>
                <table className="must-table">
                  <tbody>
                    <tr>
                      <th>KC 안전 인증</th>
                      <td>
                        <div className="kc-block">
                          <p>[전기용품] 안전확인 대상 품목으로 아래의 국가 통합인증 필함.</p>
                          <p>
                            인증번호:{' '}
                            <a
                              href="http://www.safetykorea.kr/search/searchPop?certNum=B201H007-6001"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {product.kcCert ?? 'B201H007-6001'}
                            </a>
                          </p>
                          <p className="muted">
                            (해당 인증 검사 정보는 판매자가 직접 등록한 것으로 등록 정보에 대한 책임은 판매자에게 있습니다.)
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section className="provide-info">
                <h3>상품정보제공고시</h3>
                <dl className="provide-list">
                  <div><dt>품명 및 모델명</dt><dd>{product.name} (예약구매 / 6월 중순 순차출고)</dd></div>
                  <div><dt>출시년월</dt><dd>-</dd></div>
                  <div><dt>제조사/수입사</dt><dd>코지케어</dd></div>
                  <div><dt>제조국/원산지</dt><dd>대한민국</dd></div>
                  <div><dt>제품의 사용목적 및 사용방법</dt><dd>상세설명참조</dd></div>
                  <div><dt>취급시 주의사항</dt><dd>상세설명참조</dd></div>
                  <div><dt>품질보증기준</dt><dd>공정거래위원회 고시(소비자분쟁해결기준)에 의거하여 보상해 드립니다.</dd></div>
                  <div><dt>A/S 책임자와 전화번호</dt><dd>코지케어 고객센터 1588-0000</dd></div>
                </dl>
              </section>
              </>)}
            </div>
          )}

          {activeTab === 'review' && (
            <div className="detail-body">
              <div className="review-summary">
                <div className="big-score">{ratingAvg.toFixed(1)}</div>
                <div className="big-stars">{renderStars(Math.round(ratingAvg))}</div>
                <div className="total">후기 {reviewCount}건</div>
              </div>

              {isLoggedIn ? (
                <div className="write-box">
                  <h4>리뷰 작성</h4>
                  <div className="star-pick">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={s <= reviewRating ? 'on' : ''}
                        onClick={() => setReviewRating(s)}
                      >★</span>
                    ))}
                  </div>
                  <input
                    className="write-input"
                    placeholder="제목 (선택)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                  />
                  <textarea
                    className="write-textarea"
                    placeholder="상품에 대한 후기를 남겨주세요."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                  />
                  <div className="write-actions">
                    <button
                      className="btn btn-primary"
                      onClick={submitReview}
                      disabled={reviewSubmitting || !reviewContent.trim()}
                    >{reviewSubmitting ? '등록 중…' : '리뷰 등록'}</button>
                  </div>
                </div>
              ) : (
                <div className="write-box">
                  <p className="login-hint">리뷰는 <Link href="/login">로그인</Link> 후 작성하실 수 있습니다.</p>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="write-box"><p className="login-hint">아직 등록된 리뷰가 없습니다.</p></div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="review-card">
                    <div className="top">
                      <span className="stars">{renderStars(r.rating)}</span>
                      <span className="meta">{r.authorName} · {formatDate(r.createdAt)}</span>
                    </div>
                    {r.title && <div className="body" style={{ fontWeight: 700 }}>{r.title}</div>}
                    <div className="body">{r.content}</div>
                    {r.reply && (
                      <div className="qna-a" style={{ marginTop: 10, borderRadius: 8 }}>
                        <span className="a-mark">답변</span>
                        <span>{r.reply}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'qna' && (
            <div className="detail-body">
              {isLoggedIn ? (
                <div className="write-box">
                  <h4>질문하기</h4>
                  <textarea
                    className="write-textarea"
                    placeholder="상품에 대해 궁금한 점을 남겨주세요."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <label className="login-hint" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <input
                      type="checkbox"
                      checked={questionSecret}
                      onChange={(e) => setQuestionSecret(e.target.checked)}
                    />
                    비밀글로 문의하기
                  </label>
                  <div className="write-actions">
                    <button
                      className="btn btn-primary"
                      onClick={submitQuestion}
                      disabled={questionSubmitting || !question.trim()}
                    >{questionSubmitting ? '등록 중…' : '질문 등록'}</button>
                  </div>
                </div>
              ) : (
                <div className="write-box">
                  <p className="login-hint">질문은 <Link href="/login">로그인</Link> 후 등록하실 수 있습니다.</p>
                </div>
              )}

              <div className="qna-list">
                {qnas.length === 0 ? (
                  <div className="write-box"><p className="login-hint">아직 등록된 질문이 없습니다.</p></div>
                ) : (
                  qnas.map((item, i) => {
                    const open = openQna.has(i);
                    return (
                      <div key={item.id} className="qna-item">
                        <div className={`qna-q${open ? ' open' : ''}`} onClick={() => toggleQna(i)}>
                          <span><span className="q-mark">Q.</span>{item.secret ? '비밀글입니다.' : item.question} <span style={{ color: 'var(--gray-400)', fontWeight: 500, fontSize: 12 }}>· {item.authorName}</span></span>
                          <span className="arrow">▾</span>
                        </div>
                        {open && (
                          <div className="qna-a">
                            <span className="a-mark">A.</span>
                            <span>{item.answer ?? '답변 준비 중입니다.'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="detail-body">
              <div className="shipping-box">
                <div className="section">
                  <h4>배송 정보</h4>
                  <ul>
                    <li><b>배송비</b><span>복지용구 결제 시 무료 / 일반 결제 시 3,000원 (5만원 이상 무료)</span></li>
                    <li><b>배송 방식</b><span>택배 (CJ대한통운)</span></li>
                    <li><b>출고일</b><span>예약구매 — 결제일 기준 6월 중순부터 순차 출고</span></li>
                    <li><b>배송 기간</b><span>발송 후 평균 1~2일 (도서산간 +1~3일)</span></li>
                    <li><b>도서산간 추가비</b><span>제주 3,000원 / 그 외 도서산간 5,000원</span></li>
                  </ul>
                </div>
                <div className="section">
                  <h4>교환·반품 정보</h4>
                  <ul>
                    <li><b>단순 변심</b><span>수령 후 7일 이내, 미사용 상태에 한함. 왕복 배송비 6,000원 고객부담</span></li>
                    <li><b>상품 하자·오배송</b><span>수령 후 30일 이내, 배송비 전액 본사 부담. 즉시 교환·환불 처리</span></li>
                    <li><b>복지용구 환급 반품</b><span>장기요양 등급 변경·취소 시 사진 첨부하시면 반품·환급 처리됩니다</span></li>
                    <li><b>반품 불가</b><span>사용 흔적이 있거나 위생 상태 훼손 (손잡이·좌석 사용 등)</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="mobile-cta-bar">
        <button className="like-big" style={{ width: '48px', height: '48px' }}>
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
        </button>
        <button onClick={handleBuyWelfare} className="btn btn-welfare">복지용구</button>
        <button onClick={handleBuyNormal} className="btn btn-normal">일반구매</button>
      </div>
    </>
  );
}
