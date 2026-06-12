'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export type ProductView = {
  id: number;
  name: string;
  category: string;
  price: string;
  welfare: string;
  stock: string;
  visible: boolean;
  image: string;
  bizId: number | null;
};

const CATEGORY_ABBR: Record<string, string> = {
  보행기: '보행',
  휠체어: '휠체',
  목욕의자: '목욕',
  이동변기: '변기',
  전동침대: '침대',
  미끄럼방지: '미끄',
  기타용품: '기타',
};

type TabKey = 'all' | 'visible' | 'hidden';
type ModalKey = 'unsavedModal' | 'logoutModal' | 'deleteModal';

type Props = {
  products: ProductView[];
  role: 'admin' | 'biz';
  bizName?: string;
};

export default function ProductsClient({ products, role, bizName }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [openModalKey, setOpenModalKey] = useState<ModalKey | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);

  const closeModal = (_id: ModalKey): void => setOpenModalKey(null);
  const doLogout = (): void => setOpenModalKey(null);

  const openDeleteModal = (id: number): void => {
    setDeleteTargetId(id);
    setOpenModalKey('deleteModal');
  };

  const confirmDelete = async (): Promise<void> => {
    if (deleteTargetId === null) return;
    setDeleting(true);
    try {
      const res = await fetch(`/cozycare/api/products/${deleteTargetId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setOpenModalKey(null);
        setDeleteTargetId(null);
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const tbody = tbodyRef.current;
    if (!tbody) return;

    let dragRow: HTMLTableRowElement | null = null;

    const handleClick = (e: MouseEvent): void => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const btn = target.closest('.hl-actions button') as HTMLButtonElement | null;
      if (!btn) return;
      const row = btn.closest('tr') as HTMLTableRowElement | null;
      if (!row) return;
      const isUp = !!btn.querySelector('.icon-arrow-up');
      if (isUp && row.previousElementSibling) {
        tbody.insertBefore(row, row.previousElementSibling);
      } else if (!isUp && row.nextElementSibling) {
        tbody.insertBefore(row.nextElementSibling, row);
      }
    };

    tbody.addEventListener('click', handleClick);

    const rowHandlers: Array<{ row: HTMLTableRowElement; cleanup: () => void }> = [];

    Array.from(tbody.rows).forEach((row) => {
      const grip = row.querySelector('.grip-handle') as HTMLElement | null;
      const onMouseDown = (): void => row.setAttribute('draggable', 'true');
      const onDragStart = (e: DragEvent): void => {
        dragRow = row;
        row.classList.add('dragging');
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          try {
            e.dataTransfer.setData('text/plain', '');
          } catch {
            /* noop */
          }
        }
      };
      const onDragEnd = (): void => {
        row.classList.remove('dragging');
        row.removeAttribute('draggable');
        tbody
          .querySelectorAll('.drag-over-top,.drag-over-bottom')
          .forEach((r) => r.classList.remove('drag-over-top', 'drag-over-bottom'));
        dragRow = null;
      };
      const onDragOver = (e: DragEvent): void => {
        if (!dragRow || dragRow === row) return;
        e.preventDefault();
        const rect = row.getBoundingClientRect();
        const before = e.clientY - rect.top < rect.height / 2;
        row.classList.toggle('drag-over-top', before);
        row.classList.toggle('drag-over-bottom', !before);
      };
      const onDragLeave = (): void => {
        row.classList.remove('drag-over-top', 'drag-over-bottom');
      };
      const onDrop = (e: DragEvent): void => {
        if (!dragRow || dragRow === row) return;
        e.preventDefault();
        const rect = row.getBoundingClientRect();
        const before = e.clientY - rect.top < rect.height / 2;
        tbody.insertBefore(dragRow, before ? row : row.nextElementSibling);
      };

      if (grip) grip.addEventListener('mousedown', onMouseDown);
      row.addEventListener('dragstart', onDragStart);
      row.addEventListener('dragend', onDragEnd);
      row.addEventListener('dragover', onDragOver);
      row.addEventListener('dragleave', onDragLeave);
      row.addEventListener('drop', onDrop);

      rowHandlers.push({
        row,
        cleanup: () => {
          if (grip) grip.removeEventListener('mousedown', onMouseDown);
          row.removeEventListener('dragstart', onDragStart);
          row.removeEventListener('dragend', onDragEnd);
          row.removeEventListener('dragover', onDragOver);
          row.removeEventListener('dragleave', onDragLeave);
          row.removeEventListener('drop', onDrop);
        },
      });
    });

    return () => {
      tbody.removeEventListener('click', handleClick);
      rowHandlers.forEach((h) => h.cleanup());
    };
  }, [products]);

  const rowStatusVisible = (visible: boolean): TabKey => (visible ? 'visible' : 'hidden');
  const rowDisplay = (visible: boolean): string =>
    activeTab === 'all' || activeTab === rowStatusVisible(visible) ? '' : 'none';

  return (
    <>
      {/* TopBar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            상품 목록
            {role === 'biz' && (
              <span style={{ background: '#DCFCE7', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                {bizName ?? '사업자'} 전용 뷰
              </span>
            )}
          </h1>
          <p>
            {role === 'biz'
              ? '본사 직영 + 본인 등록 상품만 표시됩니다.'
              : '코지워커 시리즈 + 복지용구 카테고리별 관리'}
          </p>
        </div>
        <div className="top-bar-right">
          <div className="search-box">
            <i className="icon-search search-icon"></i>
            <input type="text" placeholder="상품명·모델번호 검색.." />
          </div>
          <Link
            href="/admin/products/import"
            className="btn btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--bg-card)',
              color: 'var(--fg-primary)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <i className="icon-upload"></i>엑셀 업로드
          </Link>
          <div className="bell-wrapper">
            <button className="bell-btn" onClick={() => router.push('/admin/shipping')}>
              <i className="icon-bell" style={{ color: '#4B5563', fontSize: '18px' }}></i>
              <span className="bell-dot"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="content-scroll" style={{ overflow: 'hidden', background: 'var(--bg-card)' }}>
        <div className="hl-layout">
          {/* Left Filter Panel */}
          <aside className="hl-filter">
            <Link href="/admin/product-register" className="hl-add-btn">
              <i className="icon-plus"></i>상품 추가
            </Link>

            <div className="hl-tabs" data-tab-container>
              <div className={`hl-tab${activeTab === 'all' ? ' active' : ''}`} data-tab="all" onClick={() => setActiveTab('all')}>전체</div>
              <div className={`hl-tab${activeTab === 'visible' ? ' active' : ''}`} data-tab="visible" onClick={() => setActiveTab('visible')}>노출</div>
              <div className={`hl-tab${activeTab === 'hidden' ? ' active' : ''}`} data-tab="hidden" onClick={() => setActiveTab('hidden')}>비노출</div>
            </div>

            <div className="hl-divider"></div>

            <div className="hl-filter-section">
              <div className="hl-filter-label">카테고리</div>
              <label className="hl-check"><div className="custom-checkbox" data-role="all" data-group="dept"></div>전체</label>
              <label className="hl-check"><div className="custom-checkbox" data-role="item" data-group="dept"></div>보행기</label>
              <label className="hl-check"><div className="custom-checkbox" data-role="item" data-group="dept"></div>휠체어</label>
              <label className="hl-check"><div className="custom-checkbox" data-role="item" data-group="dept"></div>목욕의자</label>
              <label className="hl-check"><div className="custom-checkbox" data-role="item" data-group="dept"></div>이동변기</label>
              <label className="hl-check"><div className="custom-checkbox" data-role="item" data-group="dept"></div>전동침대</label>
              <label className="hl-check"><div className="custom-checkbox" data-role="item" data-group="dept"></div>미끄럼방지</label>
              <label className="hl-check"><div className="custom-checkbox" data-role="item" data-group="dept"></div>기타용품</label>
            </div>

            <div className="hl-filter-section">
              <div className="hl-filter-label">복지용구 여부</div>
              <label className="hl-check"><div className="custom-checkbox" data-role="all" data-group="welfare"></div>전체</label>
              <label className="hl-check"><div className="custom-checkbox" data-role="item" data-group="welfare"></div>복지용구</label>
              <label className="hl-check"><div className="custom-checkbox" data-role="item" data-group="welfare"></div>일반 상품</label>
            </div>

            <div className="hl-filter-section">
              <div className="hl-filter-label">노출 상태</div>
              <label className="hl-check"><div className="custom-checkbox" data-role="all" data-group="visible"></div>전체</label>
              <label className="hl-check"><div className="custom-checkbox" data-role="item" data-group="visible"></div>노출</label>
              <label className="hl-check"><div className="custom-checkbox" data-role="item" data-group="visible"></div>비노출</label>
              <label className="hl-check"><div className="custom-checkbox" data-role="item" data-group="visible"></div>품절</label>
            </div>
          </aside>

          {/* Right Table Area */}
          <div className="hl-table-area">
            <div className="hl-info-bar">
              <span className="hl-info-text">총 {products.length}개 상품 · 드래그하여 순서 변경</span>
              <button className="hl-sort"><i className="icon-arrow-up-down"></i>추천순</button>
            </div>

            <div className="hl-card">
              <table className="hl-table" id="hlTable">
                <thead>
                  <tr>
                    <th style={{ width: '24px' }}></th>
                    <th style={{ width: '24px' }}><div className="custom-checkbox" data-role="all" data-group="product"></div></th>
                    <th style={{ width: '60px' }}>사진</th>
                    <th style={{ width: '200px' }}>상품명</th>
                    <th style={{ width: '110px' }}>카테고리</th>
                    <th style={{ width: '110px' }}>정가</th>
                    <th style={{ width: '120px' }}>복지부담금</th>
                    <th style={{ width: '80px' }}>재고</th>
                    <th style={{ width: '90px' }}>노출</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody ref={tbodyRef}>
                  {products.map((p) => (
                    <tr key={p.id} style={{ display: rowDisplay(p.visible) }}>
                      <td><i className="icon-grip-vertical grip-handle"></i></td>
                      <td><div className="custom-checkbox" data-role="item" data-group="product"></div></td>
                      <td>
                        <div
                          className="product-thumb"
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            background: '#F3F4F6',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6B7280',
                            fontSize: '10px',
                            fontWeight: 700,
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              width={36}
                              height={36}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                const img = e.currentTarget;
                                img.style.display = 'none';
                                const parent = img.parentElement;
                                if (parent && !parent.querySelector('.thumb-fallback')) {
                                  const span = document.createElement('span');
                                  span.className = 'thumb-fallback';
                                  span.textContent = CATEGORY_ABBR[p.category] ?? '상품';
                                  parent.appendChild(span);
                                }
                              }}
                            />
                          ) : (
                            <span>{CATEGORY_ABBR[p.category] ?? '상품'}</span>
                          )}
                        </div>
                      </td>
                      <td><span className="hl-name">{p.name}</span></td>
                      <td className="hl-dept">{p.category}</td>
                      <td className="hl-mono">{p.price}</td>
                      <td className="hl-mono">{p.welfare}</td>
                      <td className="hl-mono">{p.stock}</td>
                      <td>
                        <span className={`hl-badge ${p.visible ? 'active' : 'inactive'}`}>
                          {p.visible ? '노출' : '비노출'}
                        </span>
                      </td>
                      <td>
                        <div className="hl-actions">
                          <button onClick={() => router.push(`/admin/products/${p.id}`)}><i className="icon-pencil"></i></button>
                          <button onClick={() => openDeleteModal(p.id)}><i className="icon-trash-2"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="hl-pagination">
                <span className="page-info">1–{products.length} / {products.length}</span>
                <div className="pagination">
                  <button className="page-btn"><i className="icon-chevron-left" style={{ fontSize: '14px' }}></i></button>
                  <button className="page-btn active">1</button>
                  <button className="page-btn"><i className="icon-chevron-right" style={{ fontSize: '14px' }}></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Modals */}
      <div className={`modal-overlay${openModalKey === 'unsavedModal' ? ' active' : ''}`} id="unsavedModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#FFF8EE' }}>
            <i className="icon-alert-triangle" style={{ color: '#FF9500', fontSize: '24px' }}></i>
          </div>
          <div className="modal-title">저장하지 않은 변경사항이 있습니다</div>
          <div className="modal-desc">이 페이지를 떠나면 변경사항이 사라집니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('unsavedModal')}>나가기</button>
            <button className="btn btn-dark" onClick={() => closeModal('unsavedModal')}>저장 후 나가기</button>
          </div>
        </div>
      </div>
      <div className={`modal-overlay${openModalKey === 'logoutModal' ? ' active' : ''}`} id="logoutModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#F3F4F6' }}>
            <i className="icon-log-out" style={{ color: '#4B5563', fontSize: '24px' }}></i>
          </div>
          <div className="modal-title">로그아웃 하시겠습니까?</div>
          <div className="modal-desc">다시 로그인이 필요합니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('logoutModal')}>취소</button>
            <button className="btn btn-dark" onClick={doLogout}>로그아웃</button>
          </div>
        </div>
      </div>
      <div className={`modal-overlay${openModalKey === 'deleteModal' ? ' active' : ''}`} id="deleteModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}>
            <i className="icon-trash-2" style={{ color: '#FF3B30', fontSize: '24px' }}></i>
          </div>
          <div className="modal-title">정말 삭제하시겠습니까?</div>
          <div className="modal-desc">삭제된 데이터는 복구할 수 없습니다.</div>
          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setDeleteTargetId(null);
                closeModal('deleteModal');
              }}
            >
              취소
            </button>
            <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
