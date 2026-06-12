import Link from 'next/link';
import Image from 'next/image';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: '전체 상품 — 코지워커 SHOP',
};

export const dynamic = 'force-dynamic';

const styles = `
  .list-head {
    padding: 32px 0 20px;
    border-bottom: 1px solid var(--gray-100);
    margin-bottom: 28px;
  }
  .list-head h1 {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }
  .list-head p {
    color: var(--gray-500);
    font-size: 14px;
  }

  .filter-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    align-items: center;
  }
  .filter-chip {
    padding: 8px 16px;
    border-radius: var(--r-pill);
    font-size: 13px;
    font-weight: 600;
    background: var(--gray-100);
    color: var(--gray-700);
    cursor: pointer;
    border: 1.5px solid transparent;
  }
  .filter-chip:hover { background: var(--gray-200); }
  .filter-chip.active {
    background: var(--green-700);
    color: #fff;
    border-color: var(--green-700);
  }
  .filter-chip.welfare {
    background: var(--red-50);
    color: var(--red-600);
    border-color: var(--welfare-border);
  }
  .filter-chip.welfare.active {
    background: var(--red-500);
    color: #fff;
  }
  .filter-sep {
    width: 1px;
    height: 20px;
    background: var(--gray-200);
    margin: 0 6px;
  }

  .toolbar-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--gray-100);
  }
  .toolbar-row .count { color: var(--gray-700); font-size: 14px; }
  .toolbar-row .count strong { color: var(--green-700); font-weight: 800; }
  .toolbar-row .sort {
    display: flex;
    gap: 4px;
  }
  .sort-item {
    padding: 6px 12px;
    font-size: 13px;
    color: var(--gray-500);
    border-radius: var(--r-sm);
    font-weight: 600;
  }
  .sort-item:hover { background: var(--gray-100); color: var(--gray-900); }
  .sort-item.active { color: var(--gray-900); }

  .list-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 32px;
  }

  /* 사이드 카테고리 */
  .side-cat {
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: var(--r-md);
    padding: 24px 20px;
    height: fit-content;
    position: sticky;
    top: 100px;
    min-width: 0;
  }
  .side-cat h4 {
    font-size: 13px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .side-cat ul {
    list-style: none;
    margin-bottom: 24px;
  }
  .side-cat li {
    padding: 8px 0;
  }
  .side-cat a {
    color: var(--gray-700);
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .side-cat a:hover { color: var(--green-700); }
  .side-cat a.active { color: var(--green-700); font-weight: 700; }
  .side-cat a span { color: var(--gray-400); font-size: 12px; }

  /* 가격 input 박스 */
  .price-range {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }
  .price-range .price-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .price-range .price-field label {
    font-size: 11px;
    color: var(--gray-500);
    font-weight: 600;
  }
  .price-range input {
    width: 100%;
    height: 36px;
    padding: 0 10px;
    border: 1px solid var(--gray-200);
    border-radius: var(--r-sm);
    font-size: 12px;
    background: #fff;
    box-sizing: border-box;
  }
  .price-range input:focus {
    outline: none;
    border-color: var(--green-600);
  }
  .price-range-apply {
    width: 100%;
    height: 36px;
    background: var(--green-700);
    color: #fff;
    border-radius: var(--r-sm);
    font-size: 12px;
    font-weight: 700;
    margin-top: 8px;
  }
  .price-range-apply:hover { opacity: 0.92; }

  /* 페이지네이션 */
  .pagination {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-top: 48px;
  }
  .pagination a {
    min-width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--r-sm);
    font-size: 14px;
    color: var(--gray-600);
  }
  .pagination a:hover { background: var(--gray-100); }
  .pagination a.active {
    background: var(--green-700);
    color: #fff;
  }

  /* 모바일 필터 트레이 */
  .m-filter-row {
    display: none;
    gap: 8px;
    margin-bottom: 14px;
  }
  .m-filter-row button {
    flex: 1;
    height: 40px;
    border-radius: var(--r-sm);
    background: var(--gray-100);
    color: var(--gray-700);
    font-size: 13px;
    font-weight: 600;
  }

  @media (max-width: 1024px) {
    .list-layout { grid-template-columns: 1fr; }
    .side-cat { position: static; }
  }
  @media (max-width: 720px) {
    .list-head { padding: 20px 0 14px; margin-bottom: 18px; }
    .list-head h1 { font-size: 20px; }
    .list-head p { font-size: 13px; }
    .filter-sep { display: none; }
    .filter-chip { padding: 6px 12px; font-size: 12px; }
    .toolbar-row { flex-direction: column; align-items: flex-start; gap: 10px; }
    .sort { width: 100%; overflow-x: auto; }
    .sort-item { white-space: nowrap; }
    .side-cat { display: none; }
    .m-filter-row { display: flex; }
  }
`;

const PAGE_SIZE = 12;
const NEW_DAYS = 14;

type SortKey = 'popular' | 'new' | 'low' | 'high';
const SORT_KEYS: SortKey[] = ['popular', 'new', 'low', 'high'];

const ORDER_BY: Record<SortKey, Prisma.ProductOrderByWithRelationInput> = {
  popular: { id: 'desc' },
  new: { createdAt: 'desc' },
  low: { price: 'asc' },
  high: { price: 'desc' },
};

const toMoney = (n: number) => n.toLocaleString('ko-KR');

function buildQuery(params: { category?: string; q?: string; sort?: SortKey; page?: number }): string {
  const sp = new URLSearchParams();
  if (params.category) sp.set('category', params.category);
  if (params.q) sp.set('q', params.q);
  if (params.sort && params.sort !== 'popular') sp.set('sort', params.sort);
  if (params.page && params.page > 1) sp.set('page', String(params.page));
  const s = sp.toString();
  return s ? `/shop/list?${s}` : '/shop/list';
}

type SearchParams = { category?: string; q?: string; sort?: string; page?: string };

export default async function ShopListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const cat = typeof sp.category === 'string' && sp.category ? sp.category : undefined;
  const q = typeof sp.q === 'string' && sp.q.trim() ? sp.q.trim() : undefined;
  const sort: SortKey = SORT_KEYS.includes(sp.sort as SortKey) ? (sp.sort as SortKey) : 'popular';
  const pageNum = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);

  const categories = await prisma.category.findMany({
    where: { parentId: null, visible: true },
    orderBy: { order: 'asc' },
    select: { id: true, slug: true, name: true },
  });

  const selectedCategory = cat ? categories.find((c) => c.slug === cat) : undefined;

  const baseWhere: Prisma.ProductWhereInput = { status: 'published' };
  const where: Prisma.ProductWhereInput = {
    ...baseWhere,
    ...(selectedCategory ? { categoryId: selectedCategory.id } : {}),
    ...(q ? { name: { contains: q } } : {}),
  };

  const allCount = await prisma.product.count({ where: { ...baseWhere, ...(q ? { name: { contains: q } } : {}) } });
  const perCatCounts = await prisma.product.groupBy({
    by: ['categoryId'],
    where: { ...baseWhere, ...(q ? { name: { contains: q } } : {}) },
    _count: { _all: true },
  });
  const countByCategoryId = new Map<number, number>(
    perCatCounts.map((row) => [row.categoryId, row._count._all]),
  );

  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);

  const products = await prisma.product.findMany({
    where,
    include: { images: { orderBy: { order: 'asc' } }, category: true },
    orderBy: ORDER_BY[sort],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const productIds = products.map((p) => p.id);
  const reviewStats = productIds.length
    ? await prisma.productReview.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds }, status: 'visible' },
        _avg: { rating: true },
        _count: { _all: true },
      })
    : [];
  const ratingByProductId = new Map<number, { avg: number; count: number }>(
    reviewStats.map((r) => [r.productId, { avg: r._avg.rating ?? 0, count: r._count._all }]),
  );

  const now = Date.now();
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <main className="container">

        <div className="list-head">
          <h1>전체 상품</h1>
          <p>코지워커가 직접 만든 모든 복지용구를 한 자리에서</p>
        </div>

        <div className="filter-bar">
          <span className="filter-chip welfare active">복지용구 등록</span>
          <span className="filter-chip">당일 출고</span>
          <span className="filter-chip">신상품</span>
          <span className="filter-chip">SALE</span>
          <span className="filter-sep"></span>
          <span className="filter-chip">~10만원</span>
          <span className="filter-chip">10~30만원</span>
          <span className="filter-chip">30만원+</span>
        </div>

        <div className="list-layout">

          {/* 사이드 카테고리 */}
          <aside className="side-cat">
            <h4>카테고리</h4>
            <ul>
              <li>
                <Link href={buildQuery({ q, sort })} className={cat ? undefined : 'active'}>
                  전체 <span>{allCount}</span>
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildQuery({ category: c.slug, q, sort })}
                    className={cat === c.slug ? 'active' : undefined}
                  >
                    {c.name} <span>{countByCategoryId.get(c.id) ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <h4>가격대</h4>
            <div className="price-range">
              <div className="price-field">
                <label>최소 (원)</label>
                <input type="number" placeholder="0" />
              </div>
              <div className="price-field">
                <label>최대 (원)</label>
                <input type="number" placeholder="1,000,000" />
              </div>
              <button className="price-range-apply">적용</button>
            </div>
          </aside>

          {/* 그리드 */}
          <div>
            {/* 모바일 전용 필터 트레이 */}
            <div className="m-filter-row">
              <button>📂 카테고리</button>
              <button>⚙ 가격대 필터</button>
            </div>

            <div className="toolbar-row">
              <div className="count">전체 <strong>{total}</strong>개 상품</div>
              <div className="sort">
                <Link className={`sort-item${sort === 'popular' ? ' active' : ''}`} href={buildQuery({ category: cat, q, sort: 'popular' })}>인기순</Link>
                <Link className={`sort-item${sort === 'new' ? ' active' : ''}`} href={buildQuery({ category: cat, q, sort: 'new' })}>신상순</Link>
                <Link className={`sort-item${sort === 'low' ? ' active' : ''}`} href={buildQuery({ category: cat, q, sort: 'low' })}>낮은가격</Link>
                <Link className={`sort-item${sort === 'high' ? ' active' : ''}`} href={buildQuery({ category: cat, q, sort: 'high' })}>높은가격</Link>
              </div>
            </div>

            <div className="product-grid">
              {products.map((p) => {
                const isNew = now - new Date(p.createdAt).getTime() < NEW_DAYS * 24 * 60 * 60 * 1000;
                const welfarePrice = p.welfarePrice;
                const img = p.images[0]?.url ?? p.thumbnail ?? '/cozycare/images/products/product-p2-1.jpg';
                const stat = ratingByProductId.get(p.id);
                return (
                  <Link key={p.id} href={`/shop/${p.id}`} className="product-card">
                    <div className="thumb">
                      <div className="thumb-badges">
                        {isNew && <span className="badge-tag badge-new">NEW</span>}
                        {welfarePrice !== null && <span className="badge-tag badge-welfare">복지</span>}
                      </div>
                      <button className="like-btn">
                        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                        </svg>
                      </button>
                      <Image src={img} alt={p.name} width={400} height={400} />
                    </div>
                    <div className="info">
                      <div className="brand">{p.category.name}</div>
                      <div className="title">{p.name}</div>
                      {welfarePrice !== null && (
                        <div className="price-welfare">부담금 <strong>{toMoney(welfarePrice)}원</strong></div>
                      )}
                      <div className="price-normal">
                        {toMoney(p.price)}원
                      </div>
                      {stat && stat.count > 0 && (
                        <div className="rating"><span className="star">★</span> {stat.avg.toFixed(1)} ({stat.count})</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {page > 1 && <Link href={buildQuery({ category: cat, q, sort, page: page - 1 })}>‹</Link>}
                {pageNumbers.map((n) => (
                  <Link key={n} href={buildQuery({ category: cat, q, sort, page: n })} className={n === page ? 'active' : undefined}>
                    {n}
                  </Link>
                ))}
                {page < totalPages && <Link href={buildQuery({ category: cat, q, sort, page: page + 1 })}>›</Link>}
              </div>
            )}
          </div>
        </div>

      </main>
    </>
  );
}
