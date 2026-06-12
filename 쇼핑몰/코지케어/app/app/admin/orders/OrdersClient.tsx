'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, MouseEvent } from 'react';
import type { OrderStatus } from '@prisma/client';
import { STATUS_LABEL, nextStatus, prevStatus } from '@/lib/orderStatus';

export type OrderView = {
  id: number;
  orderNo: string;
  buyer: string;
  type: 'welfare' | 'general' | 'biz';
  product: string;
  amount: string;
  status: string;
  rawStatus: OrderStatus;
  statusLabel: string;
  hasWelfare: boolean;
  docUrl: string | null;
  date: string;
  carrier: string;
  tracking: string;
  shippingId: number | null;
  bizId: number | null;
};

export type OrdersFilter = {
  period: string;
  status: string;
  category: string;
  q: string;
  page: number;
  totalPages: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
};

type TabKey = 'all' | 'welfare' | 'general' | 'biz';

const pageStyles = `
.sidebar{background:#fff}
.order-toolbar{display:flex;align-items:center;gap:12px;padding:16px 24px;background:#fff;border-bottom:1px solid var(--border);flex-shrink:0;flex-wrap:wrap}
.order-tabs{display:flex;gap:0;border-bottom:1px solid var(--border);padding:0 24px;background:#fff;flex-shrink:0}
.order-tab{padding:12px 18px;font-size:14px;color:var(--fg-muted);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;font-weight:500}
.order-tab.active{color:var(--accent);font-weight:600;border-bottom-color:var(--accent)}
.order-tab .tab-count{font-family:var(--font-mono);font-size:12px;font-weight:700;background:var(--bg-secondary);color:var(--fg-secondary);padding:2px 8px;border-radius:9999px;margin-left:6px}
.order-tab.active .tab-count{background:var(--accent-light);color:var(--accent)}
.order-stat-cards{display:flex;gap:10px;padding:14px 24px;background:var(--bg-secondary);border-bottom:1px solid var(--border);flex-shrink:0;flex-wrap:wrap}
.osc{flex:1;min-width:120px;display:flex;flex-direction:column;gap:4px;padding:12px 16px;border:1px solid var(--border);border-radius:12px;cursor:pointer;background:#fff;transition:border-color .15s,box-shadow .15s,background .15s;text-align:left}
.osc:hover{border-color:var(--accent);box-shadow:0 2px 10px rgba(15,23,42,.06)}
.osc.active{border-color:var(--accent);background:var(--accent-light)}
.osc .osc-lbl{font-size:12px;color:var(--fg-muted);display:flex;align-items:center;gap:6px}
.osc .osc-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.osc .osc-val{font-size:22px;font-weight:800;color:var(--fg-primary);font-family:var(--font-mono);line-height:1}
.osc.active .osc-val{color:var(--accent)}
.filter-bar{display:flex;align-items:center;gap:10px;padding:12px 24px;background:#fff;border-bottom:1px solid var(--border);flex-shrink:0;flex-wrap:wrap}
.filter-bar .form-input,.filter-bar .form-select{height:38px;font-size:13px}
.filter-bar .filter-search{flex:1;min-width:200px;max-width:320px}
.order-body{flex:1;overflow-y:auto;padding:0;background:var(--bg-card)}
.order-table-wrap{background:#fff}
.badge-type{display:inline-flex;align-items:center;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;letter-spacing:.2px;white-space:nowrap}
.badge-type.welfare{background:#FEE2E2;color:#ef4444}
.badge-type.general{background:#E5E7EB;color:#4B5563}
.badge-type.biz{background:#DCFCE7;color:#16a34a}
.badge-status{display:inline-flex;align-items:center;padding:4px 10px;border-radius:9999px;font-size:12px;font-weight:600;color:#fff;white-space:nowrap}
.badge-status.doc-review{background:#a855f7}
.badge-status.doc-approved{background:#0891b2}
.badge-status.prep{background:#f59e0b}
.badge-status.delivering{background:#3b82f6}
.badge-status.done{background:#84c140}
.badge-status.confirmed{background:#46782b}
.badge-status.cancelled{background:#9ca3af}
.badge-status.refunded{background:#ef4444}
.step-btns{display:inline-flex;align-items:center;gap:4px;flex-shrink:0}
.btn-step{height:30px;padding:0 9px;font-size:12px;font-weight:600;border:1px solid var(--border);background:#fff;border-radius:6px;cursor:pointer;color:var(--fg-secondary);white-space:nowrap}
.btn-step:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
.btn-step:disabled{opacity:.35;cursor:default}
.btn-step-next{background:var(--accent);color:#fff;border-color:var(--accent)}
.btn-step-next:hover:not(:disabled){filter:brightness(.94);color:#fff}
.doc-btns{display:inline-flex;align-items:center;gap:4px;flex-shrink:0}
.btn-doc{height:30px;padding:0 10px;font-size:12px;display:inline-flex;align-items:center;gap:5px;border:1px solid #c8b6ef;background:#f5f0ff;color:#7c3aed;border-radius:6px;font-weight:600;white-space:nowrap;text-decoration:none}
.btn-doc:hover{background:#ede5ff}
.btn-doc.icon-only{padding:0 8px}
.order-num{font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--accent);cursor:pointer}
.order-num:hover{text-decoration:underline}
.amount{font-family:var(--font-mono);font-weight:600}
.date-cell{font-family:var(--font-mono);font-size:12px;color:var(--fg-muted)}
.data-table td,.data-table th{word-break:keep-all}
.data-table td:nth-child(2),.data-table td:nth-child(8){white-space:nowrap}
.data-table tbody tr{cursor:pointer}
.data-table tbody tr:hover{background:#fafafa}
.row-actions{display:inline-flex;align-items:center;gap:6px;justify-content:flex-end;flex-wrap:nowrap}
.row-actions .form-select,.row-actions .form-input{height:30px;font-size:12px;padding:0 8px}
.row-actions .btn{height:30px;padding:0 10px;font-size:12px}
.invoice-box{display:inline-flex;align-items:center;gap:4px}
.invoice-box .form-select{width:88px}
.invoice-box .form-input{width:110px}
.status-select{width:110px}
`;


export type StatusCounts = {
  all: number;
  docReview: number;
  docApproved: number;
  ready: number;
  shipping: number;
  delivered: number;
  confirmed: number;
};

type Props = {
  orders: OrderView[];
  role: 'admin' | 'biz';
  bizName?: string;
  filter: OrdersFilter;
  statusCounts: StatusCounts;
};

const STATUS_CARDS: Array<{ key: keyof StatusCounts; label: string; filterLabel: string; color: string }> = [
  { key: 'all', label: '전체', filterLabel: '전체 상태', color: '#6B7280' },
  { key: 'docReview', label: '서류 검토중', filterLabel: '서류 검토중', color: '#a855f7' },
  { key: 'docApproved', label: '서류 검토 완료', filterLabel: '서류 검토 완료', color: '#0891b2' },
  { key: 'ready', label: '상품 준비중', filterLabel: '상품 준비중', color: '#f59e0b' },
  { key: 'shipping', label: '배송중', filterLabel: '배송중', color: '#3b82f6' },
  { key: 'delivered', label: '배송 완료', filterLabel: '배송 완료', color: '#84c140' },
  { key: 'confirmed', label: '구매 확정', filterLabel: '구매 확정', color: '#46782b' },
];

const PERIODS = ['전체 기간', '오늘', '최근 7일', '최근 30일', '이번 달'];
const CATEGORIES = ['전체 카테고리', '보행기', '휠체어', '목욕의자', '이동변기', '전동침대', '미끄럼방지', '기타용품'];

export default function OrdersClient({ orders, role, bizName, filter, statusCounts }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [busy, setBusy] = useState<number | null>(null);
  const [period, setPeriod] = useState<string>(filter.period);
  const [statusFilter, setStatusFilter] = useState<string>(filter.status || '전체 상태');
  const [category, setCategory] = useState<string>(filter.category);
  const [keyword, setKeyword] = useState<string>(filter.q);

  const buildQuery = (overrides: Partial<{ page: number }>): string => {
    const params = new URLSearchParams();
    if (period && period !== '전체 기간') params.set('period', period);
    if (statusFilter && statusFilter !== '전체 상태') params.set('status', statusFilter);
    if (category && category !== '전체 카테고리') params.set('category', category);
    if (keyword.trim()) params.set('q', keyword.trim());
    const page = overrides.page ?? 1;
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : '/admin/orders';
  };

  const applyFilter = (): void => {
    router.push(buildQuery({ page: 1 }));
  };

  // 셀렉트 변경 시 즉시 적용 (state 비동기 문제 회피 위해 새 값으로 직접 빌드)
  const navWith = (patch: { period?: string; status?: string; category?: string }): void => {
    const pr = patch.period ?? period;
    const st = patch.status ?? statusFilter;
    const ca = patch.category ?? category;
    const params = new URLSearchParams();
    if (pr && pr !== '전체 기간') params.set('period', pr);
    if (st && st !== '전체 상태') params.set('status', st);
    if (ca && ca !== '전체 카테고리') params.set('category', ca);
    if (keyword.trim()) params.set('q', keyword.trim());
    const qs = params.toString();
    router.push(qs ? `/admin/orders?${qs}` : '/admin/orders');
  };

  const downloadExcel = (): void => {
    window.location.href = '/cozycare/api/orders/export';
  };

  const goPage = (page: number): void => {
    if (page < 1 || page > filter.totalPages || page === filter.page) return;
    router.push(buildQuery({ page }));
  };

  const stop = (e: MouseEvent<HTMLTableCellElement>): void => {
    e.stopPropagation();
  };

  const go = (id: number): void => {
    router.push(`/admin/orders/detail?id=${id}`);
  };

  const moveStatus = async (orderId: number, to: OrderStatus): Promise<void> => {
    setBusy(orderId);
    try {
      const res = await fetch(`/cozycare/api/orders/${orderId}/transition`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ to }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const filteredOrders =
    activeTab === 'all' ? orders : orders.filter((o) => o.type === activeTab);

  const counts = {
    all: orders.length,
    welfare: orders.filter((o) => o.type === 'welfare').length,
    general: orders.filter((o) => o.type === 'general').length,
    biz: orders.filter((o) => o.type === 'biz').length,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      {/* TopBar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            주문 관리
            {role === 'biz' && (
              <span style={{ background: '#DCFCE7', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                {bizName ?? '사업자'} 전용 뷰
              </span>
            )}
          </h1>
          <p>
            {role === 'biz'
              ? '본인 거래 주문만 표시됩니다.'
              : '복지용구·일반·사업자 주문 통합 관리'}
          </p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon"></i><input type="text" placeholder="주문번호, 구매자 검색.." /></div>
          <div className="bell-wrapper">
            <button className="bell-btn" onClick={() => { window.location.href = '/admin/shipping'; }}><i className="icon-bell" style={{ color: '#4B5563', fontSize: 18 }}></i><span className="bell-dot"></span></button>
          </div>
          <button className="btn-icon" title="설정"><i className="icon-settings" style={{ fontSize: 16, color: 'var(--fg-secondary)' }}></i></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="order-tabs">
        <div className={`order-tab${activeTab === 'all' ? ' active' : ''}`} onClick={() => setActiveTab('all')}>전체 <span className="tab-count">{counts.all}</span></div>
        <div className={`order-tab${activeTab === 'welfare' ? ' active' : ''}`} onClick={() => setActiveTab('welfare')}>복지용구 <span className="tab-count">{counts.welfare}</span></div>
        <div className={`order-tab${activeTab === 'general' ? ' active' : ''}`} onClick={() => setActiveTab('general')}>일반 <span className="tab-count">{counts.general}</span></div>
        {role === 'admin' && (
          <div className={`order-tab${activeTab === 'biz' ? ' active' : ''}`} onClick={() => setActiveTab('biz')}>사업자 <span className="tab-count">{counts.biz}</span></div>
        )}
      </div>

      {/* 배송 상태별 건수 카드 (클릭 시 해당 상태로 필터) */}
      <div className="order-stat-cards">
        {STATUS_CARDS.map((c) => {
          const active = (statusFilter || '전체 상태') === c.filterLabel;
          return (
            <button
              key={c.key}
              type="button"
              className={`osc${active ? ' active' : ''}`}
              onClick={() => { setStatusFilter(c.filterLabel); navWith({ status: c.filterLabel }); }}
            >
              <span className="osc-lbl">
                {c.key !== 'all' && <span className="osc-dot" style={{ background: c.color }} />}
                {c.label}
              </span>
              <span className="osc-val">{statusCounts[c.key].toLocaleString('ko-KR')}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select className="form-select" style={{ width: 140 }} value={period} onChange={(e) => { setPeriod(e.target.value); navWith({ period: e.target.value }); }}>
          {PERIODS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className="form-select" style={{ width: 140 }} value={category} onChange={(e) => { setCategory(e.target.value); navWith({ category: e.target.value }); }}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="search-box filter-search"><i className="icon-search search-icon"></i><input type="text" placeholder="주문번호 / 구매자 / 상품명" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') applyFilter(); }} /></div>
        <button className="btn btn-secondary" onClick={applyFilter}><i className="icon-search" style={{ fontSize: 14 }}></i> 조회</button>
        <div style={{ flex: 1 }}></div>
        <button className="btn btn-secondary" onClick={() => alert('스윗트래커(SweetTracker) 연동 예정 기능입니다.\nhttps://www.sweettracker.co.kr/')} title="스윗트래커 연동 예정"><i className="icon-truck" style={{ fontSize: 14 }}></i> 배송 자동 추적</button>
        <button className="btn btn-primary" onClick={downloadExcel}><i className="icon-download" style={{ fontSize: 14 }}></i> 엑셀 다운로드</button>
      </div>

      {/* Order Table */}
      <div className="order-body">
        <div className="order-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}><div className="custom-checkbox" data-role="all" data-group="orders"></div></th>
                <th>주문번호</th>
                <th>구매자</th>
                <th>유형</th>
                <th>상품</th>
                <th style={{ textAlign: 'right' }}>금액</th>
                <th>상태</th>
                <th>결제일</th>
                <th style={{ width: 230, textAlign: 'right' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <OrderRow
                  key={o.id}
                  order={o}
                  busy={busy === o.id}
                  onRowClick={() => go(o.id)}
                  onStopCellClick={stop}
                  onMove={(to) => moveStatus(o.id, to)}
                />
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--fg-muted)' }}>
                    표시할 주문이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#fff', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
            {filter.rangeStart}–{filter.rangeEnd} / {filter.total}
          </div>
          <div className="pagination">
            <button className="page-btn" disabled={filter.page <= 1} onClick={() => goPage(filter.page - 1)}><i className="icon-chevron-left" style={{ fontSize: 14 }}></i></button>
            {Array.from({ length: filter.totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`page-btn${p === filter.page ? ' active' : ''}`} onClick={() => goPage(p)}>{p}</button>
            ))}
            <button className="page-btn" disabled={filter.page >= filter.totalPages} onClick={() => goPage(filter.page + 1)}><i className="icon-chevron-right" style={{ fontSize: 14 }}></i></button>
          </div>
        </div>
      </div>
    </>
  );
}

type OrderRowProps = {
  order: OrderView;
  busy: boolean;
  onRowClick: () => void;
  onStopCellClick: (e: MouseEvent<HTMLTableCellElement>) => void;
  onMove: (to: OrderStatus) => void;
};

function OrderRow({ order: o, busy, onRowClick, onStopCellClick, onMove }: OrderRowProps) {
  const prev = prevStatus(o.rawStatus, o.hasWelfare);
  const next = nextStatus(o.rawStatus);

  return (
    <tr onClick={onRowClick}>
      <td style={{ textAlign: 'center' }} onClick={onStopCellClick}>
        <div className="custom-checkbox" data-role="item" data-group="orders"></div>
      </td>
      <td><span className="order-num">#{o.orderNo}</span></td>
      <td>{o.buyer}</td>
      <td>
        <span className={`badge-type ${o.type}`}>
          {o.type === 'welfare' ? '복지' : o.type === 'general' ? '일반' : '사업자'}
        </span>
      </td>
      <td>{o.product}</td>
      <td style={{ textAlign: 'right' }}><span className="amount">{o.amount}</span></td>
      <td><span className={`badge-status ${o.status}`}>{o.statusLabel}</span></td>
      <td><span className="date-cell">{o.date}</span></td>
      <td onClick={onStopCellClick}>
        <div className="row-actions">
          {o.docUrl && (
            <a href={o.docUrl} target="_blank" rel="noreferrer" className="btn btn-doc" title="담당자 업로드 서류 보기"><i className="icon-file-text" />서류</a>
          )}
          <span className="step-btns">
            <button
              type="button"
              className="btn-step"
              disabled={busy || !prev}
              title={prev ? `${STATUS_LABEL[prev]}(으)로 되돌리기` : '이전 단계 없음'}
              onClick={() => prev && onMove(prev)}
            >◀</button>
            <button
              type="button"
              className="btn-step btn-step-next"
              disabled={busy || !next}
              title={next ? `${STATUS_LABEL[next]}(으)로 이동` : '마지막 단계'}
              onClick={() => next && onMove(next)}
            >{next ? STATUS_LABEL[next] : '완료'} ▶</button>
          </span>
          <Link href={`/admin/orders/detail?id=${o.id}`} className="btn btn-dark">상세</Link>
        </div>
      </td>
    </tr>
  );
}
