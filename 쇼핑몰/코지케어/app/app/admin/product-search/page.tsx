'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

type ProductImageRow = { id: number; url: string; order: number };
type CategoryRow = { id: number; name: string; slug: string };
type ProductRow = {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  bizId: number | null;
  price: number;
  welfarePrice: number | null;
  stock: number;
  status: 'draft' | 'published' | 'hidden' | 'soldout';
  thumbnail: string | null;
  description: string | null;
  kcCert: string | null;
  category: CategoryRow | null;
  images: ProductImageRow[];
};

const pageStyles = `
.hs-layout{display:flex;flex:1;min-height:0;overflow:hidden}
.hs-filter{width:240px;flex-shrink:0;background:var(--bg-card);border-right:1px solid var(--border);padding:20px;display:flex;flex-direction:column;gap:20px;overflow-y:auto}
.hs-filter-header{display:flex;align-items:center;justify-content:space-between}
.hs-filter-header .fh-title{font-size:16px;font-weight:700;color:var(--fg-primary)}
.hs-reset{display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border:1px solid var(--border);border-radius:20px;background:var(--bg-card);font-size:11px;font-weight:600;color:var(--fg-secondary);cursor:pointer}
.hs-reset i{font-size:12px}
.hs-section{display:flex;flex-direction:column;gap:10px}
.hs-section-label{font-size:14px;font-weight:600;color:var(--fg-primary)}
.hs-chips{display:flex;flex-wrap:wrap;gap:6px}
.hs-chip{display:inline-flex;align-items:center;height:30px;padding:6px 10px;border-radius:20px;border:1px solid var(--border);background:var(--bg-card);color:var(--fg-secondary);font-size:12px;font-weight:500;cursor:pointer}
.hs-chip.active{background:var(--accent);border-color:var(--accent);color:var(--fg-inverse);font-weight:700}
.hs-check-list{display:flex;flex-direction:column;gap:10px}
.hs-check{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--fg-primary);cursor:pointer}
.hs-check .cb{width:16px;height:16px;border-radius:3px;border:1px solid var(--border);background:var(--bg-card);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hs-check.checked .cb{background:var(--fg-primary);border-color:var(--fg-primary)}
.hs-check.checked.accent .cb{background:var(--accent);border-color:var(--accent)}
.hs-check .cb i{font-size:10px;color:#fff;display:none}
.hs-check.checked .cb i{display:inline-block}
.hs-check.checked .lbl{font-weight:500}

.hs-list{width:320px;flex-shrink:0;background:var(--bg-card);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.hs-list-header{display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid var(--border)}
.hs-list-title{display:flex;align-items:center;gap:8px}
.hs-list-title .lt{font-size:16px;font-weight:700;color:var(--fg-primary)}
.hs-list-count{background:var(--accent-light);color:var(--accent);font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px}
.hs-list-search{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border);color:var(--fg-muted);font-size:14px}
.hs-list-items{flex:1;overflow-y:auto}
.hs-card{display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border-light);cursor:pointer;align-items:flex-start}
.hs-card:hover{background:var(--bg-secondary)}
.hs-card.selected{background:#F9F9FF}
.hs-card .hc-av{width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;flex-shrink:0}
.hs-card .hc-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.hs-card .hc-name{font-size:14px;font-weight:600;color:var(--fg-primary)}
.hs-card .hc-meta{font-size:12px;color:var(--fg-secondary)}
.hs-card .hc-tags{display:flex;flex-wrap:wrap;gap:4px}
.hs-tag{padding:4px 8px;border-radius:9999px;font-size:12px;font-weight:600;line-height:1}
.hs-tag.accent{background:var(--accent-light);color:var(--accent)}
.hs-tag.warning{background:#FFF7ED;color:var(--warning)}
.hs-tag.success{background:#ECFDF5;color:#059669}
.hs-tag.info{background:#EFF6FF;color:#2563EB}
.hs-mgmt-btn{width:28px;height:28px;border:1px solid var(--border);border-radius:6px;background:var(--bg-card);display:flex;align-items:center;justify-content:center;color:var(--fg-secondary);cursor:pointer;flex-shrink:0}

.hs-detail-wrap{flex:1;min-width:0;display:flex;flex-direction:column;background:var(--bg-card);overflow:hidden}
.hs-detail{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px}
.hs-img-row{display:flex;gap:12px;height:160px;flex-shrink:0}
.hs-img{flex:1;border-radius:var(--radius-sm);background-size:cover;background-position:center}
.hs-img.img1{background-image:url('/cozycare/assets/admin/img/generated-1776044203736.png')}
.hs-img.img2{background-image:url('/cozycare/assets/admin/img/generated-1776044221333.png')}
.hs-name-row{display:flex;justify-content:space-between;align-items:center;gap:12px}
.hs-name{font-size:20px;font-weight:700;color:var(--fg-primary)}
.hs-action-row{display:flex;align-items:center;gap:8px}
.hs-btn-wa{display:inline-flex;align-items:center;gap:6px;height:34px;padding:6px 12px;border-radius:6px;background:#25D366;color:#fff;font-size:13px;font-weight:600;border:none;cursor:pointer}
.hs-btn-sec{display:inline-flex;align-items:center;gap:6px;height:34px;padding:6px 12px;border-radius:6px;background:var(--bg-card);color:var(--fg-secondary);font-size:13px;font-weight:600;border:1px solid var(--border);cursor:pointer}
.hs-addr{font-size:14px;color:var(--fg-secondary)}
.hs-badges{display:flex;flex-wrap:wrap;gap:8px}
.hs-bdg{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:9999px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12px;font-weight:600;color:var(--fg-secondary)}
.hs-bdg i{font-size:14px}
.hs-d-label{font-size:15px;font-weight:700;color:var(--fg-primary)}
.hs-desc{font-size:14px;line-height:1.6;color:var(--fg-secondary)}
.hs-map{width:100%;height:140px;border-radius:var(--radius-sm);background:url('/cozycare/assets/admin/img/generated-1776047895332.png') center/cover no-repeat}
.hs-addr-row{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--fg-secondary)}
.hs-addr-row i{font-size:18px;color:var(--fg-muted)}
.hs-divider{height:1px;background:var(--border-light)}
.hs-dept-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
.hs-dept-search{width:200px;height:40px;border:1px solid var(--border);border-radius:6px;display:flex;align-items:center;gap:6px;padding:6px 10px;color:var(--fg-muted);font-size:14px}
.hs-dept-list{border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden}
.hs-dept-row{display:flex;justify-content:space-between;align-items:center;height:40px;padding:10px 14px;border-bottom:1px solid var(--border-light)}
.hs-dept-row:last-child{border-bottom:none}
.hs-dept-row.all{background:#F9F9FF}
.hs-dept-left{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--fg-primary)}
.hs-dept-right{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--fg-muted)}
.hs-dept-right i{font-size:16px}

.hs-intake{height:56px;background:var(--fg-primary);padding:0 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.hs-intake-left{color:var(--fg-inverse);font-size:14px;font-weight:500}
.hs-intake-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:var(--radius-sm);background:var(--accent);color:var(--fg-inverse);font-size:14px;font-weight:600;border:none;cursor:pointer}
`;

type PriceFilter = 'all' | 'under200' | 'mid' | 'high';
type WelfareFilter = 'all' | 'welfare' | 'normal';

export default function Page() {
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [welfareFilter, setWelfareFilter] = useState<WelfareFilter>('all');
  const [keyword, setKeyword] = useState<string>('');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);

  const categories: string[] = ['전체', '보행기', '휠체어', '목욕의자', '이동변기', '전동침대', '미끄럼방지', '기타용품'];

  const loadProducts = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch('/cozycare/api/products');
      if (!res.ok) return;
      const data = (await res.json()) as { products?: ProductRow[] };
      setProducts(data.products ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const priceInRange = useCallback((price: number): boolean => {
    if (priceFilter === 'all') return true;
    if (priceFilter === 'under200') return price <= 200000;
    if (priceFilter === 'mid') return price > 200000 && price <= 350000;
    return price > 350000 && price <= 535000;
  }, [priceFilter]);

  const filtered = useMemo<ProductRow[]>(() => {
    const kw = keyword.trim().toLowerCase();
    return products.filter((p) => {
      if (activeCategory !== '전체' && p.category?.name !== activeCategory) return false;
      if (!priceInRange(p.price)) return false;
      if (welfareFilter === 'welfare' && p.welfarePrice === null) return false;
      if (welfareFilter === 'normal' && p.welfarePrice !== null) return false;
      if (kw && !(p.name.toLowerCase().includes(kw) || p.code.toLowerCase().includes(kw))) return false;
      return true;
    });
  }, [products, activeCategory, priceInRange, welfareFilter, keyword]);

  const selected = useMemo<ProductRow | null>(
    () => filtered.find((p) => p.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  const resetFilters = useCallback((): void => {
    setActiveCategory('전체');
    setPriceFilter('all');
    setWelfareFilter('all');
    setKeyword('');
  }, []);

  const toggleChecked = useCallback((id: number): void => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const bulkDelete = useCallback(async (): Promise<void> => {
    const ids = Array.from(checkedIds);
    if (ids.length === 0) return;
    await Promise.all(
      ids.map((id) =>
        fetch(`/cozycare/api/products/${id}`, { method: 'DELETE' }),
      ),
    );
    setCheckedIds(new Set());
    setSelectedId(null);
    await loadProducts();
  }, [checkedIds, loadProducts]);

  const fmt = (n: number): string => `${n.toLocaleString('ko-KR')}원`;
  const checkedCount = checkedIds.size;

  return (
    <>
      <style>{pageStyles}</style>
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>상품 검색</h1>
          <p>고급 검색 및 일괄 작업</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon"></i><input type="text" placeholder="상품명·모델번호 검색..." value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div>
          <div className="bell-wrapper">
            <button className="bell-btn"><i className="icon-bell" style={{ color: '#4B5563', fontSize: '18px' }}></i><span className="bell-dot"></span></button>
            <div className="noti-dropdown">
              <div className="noti-header"><span className="noti-title">알림</span><span className="noti-read-all">모두 읽음</span></div>
              <div className="noti-item unread"><div className="noti-dot" style={{ background: '#3B43DB' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#EEEFFC', color: '#3B43DB' }}>신규 주문</span><span className="noti-time">10분 전</span><div className="noti-text">김○○ 회원이 카본로얄파인더를 주문했습니다</div></div></div>
              <div className="noti-item unread"><div className="noti-dot" style={{ background: '#34C759' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#EEFBF0', color: '#34C759' }}>복지용구 승인</span><span className="noti-time">1시간 전</span><div className="noti-text">박○○ 인정번호 확인 완료</div></div></div>
              <div className="noti-item"><div className="noti-dot" style={{ background: '#FF9500' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#FFF8EE', color: '#FF9500' }}>재고 알림</span><span className="noti-time">3시간 전</span><div className="noti-text">로얄쿠션 재고 20개 미만</div></div></div>
              <a href="/admin/shipping" className="noti-footer">알림 센터 전체 보기 →</a>
            </div>
          </div>
        </div>
      </div>

      <div className="hs-layout">
        <aside className="hs-filter">
          <div className="hs-filter-header">
            <span className="fh-title">검색 조건</span>
            <button className="hs-reset" onClick={resetFilters}><i className="icon-rotate-ccw"></i>초기화</button>
          </div>
          <div className="hs-section">
            <span className="hs-section-label">상품명</span>
            <div style={{ display: 'flex', alignItems: 'center', height: '36px', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 10px', background: 'var(--bg-card)', fontSize: '13px', color: 'var(--fg-muted)' }}>예: 카본로얄파인더</div>
          </div>
          <div className="hs-section">
            <span className="hs-section-label">모델번호</span>
            <div style={{ display: 'flex', alignItems: 'center', height: '36px', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 10px', background: 'var(--bg-card)', fontSize: '13px', color: 'var(--fg-muted)' }}>예: P04 / FR01</div>
          </div>
          <div className="hs-section">
            <span className="hs-section-label">카테고리</span>
            <div className="hs-chips">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className={`hs-chip${activeCategory === cat ? ' active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <div className="hs-section">
            <span className="hs-section-label">가격대</span>
            <div className="hs-check-list">
              <label className={`hs-check${priceFilter === 'all' ? ' checked' : ''}`} onClick={() => setPriceFilter('all')}><span className="cb"><i className="icon-check"></i></span><span className="lbl">전체</span></label>
              <label className={`hs-check${priceFilter === 'under200' ? ' checked' : ''}`} onClick={() => setPriceFilter('under200')}><span className="cb"><i className="icon-check"></i></span><span className="lbl">~ 200,000원</span></label>
              <label className={`hs-check${priceFilter === 'mid' ? ' checked' : ''}`} onClick={() => setPriceFilter('mid')}><span className="cb"><i className="icon-check"></i></span><span className="lbl">200,000 ~ 350,000원</span></label>
              <label className={`hs-check${priceFilter === 'high' ? ' checked' : ''}`} onClick={() => setPriceFilter('high')}><span className="cb"><i className="icon-check"></i></span><span className="lbl">350,000 ~ 535,000원</span></label>
            </div>
          </div>
          <div className="hs-section">
            <span className="hs-section-label">등록일</span>
            <div style={{ display: 'flex', alignItems: 'center', height: '36px', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 10px', background: 'var(--bg-card)', fontSize: '13px', color: 'var(--fg-muted)' }}>YYYY-MM-DD ~ YYYY-MM-DD</div>
          </div>
          <div className="hs-section">
            <span className="hs-section-label">복지용구 여부</span>
            <div className="hs-check-list">
              <label className={`hs-check${welfareFilter === 'all' ? ' checked' : ''}`} onClick={() => setWelfareFilter('all')}><span className="cb"><i className="icon-check"></i></span><span className="lbl">전체</span></label>
              <label className={`hs-check accent${welfareFilter === 'welfare' ? ' checked' : ''}`} onClick={() => setWelfareFilter('welfare')}><span className="cb"><i className="icon-check"></i></span><span className="lbl">복지용구</span></label>
              <label className={`hs-check${welfareFilter === 'normal' ? ' checked' : ''}`} onClick={() => setWelfareFilter('normal')}><span className="cb"><i className="icon-check"></i></span><span className="lbl">일반 상품</span></label>
            </div>
          </div>
        </aside>

        <section className="hs-list">
          <div className="hs-list-header">
            <div className="hs-list-title">
              <span className="lt">검색 결과</span>
              <span className="hs-list-count">{filtered.length}개</span>
            </div>
            <i className="icon-external-link" style={{ color: 'var(--fg-muted)', fontSize: '16px' }}></i>
          </div>
          <div className="hs-list-search">
            <i className="icon-search"></i>
            <span>{loading ? '불러오는 중...' : `총 ${products.length}개 상품 · 조건에 맞는 ${filtered.length}개`}</span>
          </div>
          <div className="hs-list-items">
            {filtered.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px', color: 'var(--fg-muted)', textAlign: 'center' }}>
                <i className="icon-search" style={{ fontSize: '40px', color: 'var(--border)' }}></i>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg-secondary)' }}>검색 결과가 없습니다</div>
                <div style={{ fontSize: '13px' }}>왼쪽 검색 조건을 입력하고<br />검색 버튼을 눌러주세요</div>
              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  className={`hs-card${selectedId === p.id ? ' selected' : ''}`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <div className="hc-av" style={{ background: p.welfarePrice !== null ? 'var(--accent)' : '#9CA3AF' }}>
                    {p.code.slice(0, 4)}
                  </div>
                  <div className="hc-info">
                    <span className="hc-name">{p.name}</span>
                    <span className="hc-meta">{p.code} · {p.category?.name ?? '-'} · 재고 {p.stock}</span>
                    <div className="hc-tags">
                      <span className="hs-tag accent">{fmt(p.price)}</span>
                      {p.welfarePrice !== null && <span className="hs-tag success">복지용구</span>}
                      {p.status !== 'published' && <span className="hs-tag warning">비노출</span>}
                    </div>
                  </div>
                  <span
                    className="hs-mgmt-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChecked(p.id);
                    }}
                    style={checkedIds.has(p.id) ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } : undefined}
                  >
                    <i className="icon-check"></i>
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="hs-detail-wrap" id="hsDetail" style={{ display: selected ? 'flex' : 'none' }}>
          <div className="hs-detail">
            {selected ? (
              <>
                <div className="hs-name-row">
                  <span className="hs-name">{selected.name}</span>
                  <div className="hs-action-row">
                    <span className="hs-bdg">{selected.code}</span>
                  </div>
                </div>
                <div className="hs-badges">
                  <span className="hs-bdg">{selected.category?.name ?? '-'}</span>
                  <span className="hs-bdg">재고 {selected.stock}</span>
                  {selected.welfarePrice !== null && <span className="hs-bdg">복지용구</span>}
                  <span className="hs-bdg">{selected.status === 'published' ? '노출' : '비노출'}</span>
                </div>
                <div className="hs-divider"></div>
                <div className="hs-d-label">가격 정보</div>
                <div className="hs-desc">
                  정가 {fmt(selected.price)}
                  {selected.welfarePrice !== null && <> · 복지부담금 {fmt(selected.welfarePrice)}</>}
                </div>
                {selected.description && (
                  <>
                    <div className="hs-divider"></div>
                    <div className="hs-d-label">상세 설명</div>
                    <div className="hs-desc">{selected.description}</div>
                  </>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '12px', color: 'var(--fg-muted)', textAlign: 'center' }}>
                <i className="icon-package" style={{ fontSize: '48px', color: 'var(--border)' }}></i>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--fg-secondary)' }}>상품을 선택해주세요</div>
                <div style={{ fontSize: '13px' }}>검색 결과에서 상품을 클릭하면<br />상세 정보가 표시됩니다</div>
              </div>
            )}
          </div>
        </section>
      </div>
      <div className="hs-intake" id="hsIntake" style={{ display: checkedCount > 0 ? 'flex' : 'none' }}>
        <span className="hs-intake-left">{checkedCount}개 상품 선택됨</span>
        <button className="hs-intake-btn" onClick={bulkDelete}>선택 삭제<i className="icon-arrow-right"></i></button>
      </div>
    </>
  );
}
