'use client';

import Link from 'next/link';
import { LIST_STYLES } from '@/components/admin/listStyles';
import MonthNav from '@/components/admin/MonthNav';

export type DetailOrder = {
  id: number;
  orderNo: string;
  date: string;
  buyer: string;
  goods: string;
  amount: number;
  status: string;
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  ready: { label: '결제완료', cls: 'st-blue' },
  shipping: { label: '배송중', cls: 'st-amber' },
  delivered: { label: '배송완료', cls: 'st-navy' },
  confirmed: { label: '구매확정', cls: 'st-green' },
  cancelled: { label: '취소', cls: 'st-gray' },
  refunded: { label: '환불', cls: 'st-red' },
};

function won(n: number): string { return `${n.toLocaleString('ko-KR')}원`; }

export default function SettlementDetailClient({ month, company, rows }: { month: string; company: string; rows: DetailOrder[] }) {
  const confirmed = rows.filter((r) => r.status === 'confirmed');
  const settleAmt = confirmed.reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <style>{LIST_STYLES}</style>
      <div className="top-bar">
        <div className="top-bar-left">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href={`/admin/settlements?month=${month}`} className="btn-sm" style={{ textDecoration: 'none' }}><i className="icon-arrow-left" /> 목록</Link>
            {company} 정산 상세
          </h1>
          <p>{month} · 구매확정 기준 정산 + 전체 주문 현황</p>
        </div>
        <div className="top-bar-right"><MonthNav month={month} /></div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="lp-grid">
          <div className="tier">
            <div className="stat-c" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
              <div className="s-ic"><i className="icon-shopping-cart" style={{ color: '#4B5563' }} /></div>
              <div><span className="s-val">{rows.length}</span><div className="s-lbl">해당월 전체 주문</div></div>
            </div>
            <div className="stat-c" style={{ background: '#EEFBF0', border: '1px solid #C8F0CE' }}>
              <div className="s-ic"><i className="icon-shield-check" style={{ color: '#16a34a' }} /></div>
              <div><span className="s-val">{confirmed.length}</span><div className="s-lbl">구매확정 건수</div></div>
            </div>
            <div className="stat-c" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
              <div className="s-ic"><i className="icon-banknote" style={{ color: '#4f46e5' }} /></div>
              <div><span className="s-val" style={{ fontSize: 17 }}>{won(settleAmt)}</span><div className="s-lbl">정산대상 매출</div></div>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">{company} · {month} 주문 {rows.length}건</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col style={{ width: '150px' }} /><col style={{ width: '130px' }} /><col style={{ width: '110px' }} /><col /><col style={{ width: '120px' }} /><col style={{ width: '110px' }} /></colgroup>
              <thead><tr><th>주문일시</th><th>주문번호</th><th>구매자</th><th>상품</th><th>금액</th><th>상태</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={r.status === 'confirmed' ? { background: '#F6FCF7' } : undefined}>
                    <td className="ag-date">{r.date}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.orderNo}</td>
                    <td className="ag-name">{r.buyer}</td>
                    <td className="ag-clip">{r.goods}</td>
                    <td className="ag-num">{won(r.amount)}</td>
                    <td><span className={`st-badge ${STATUS_META[r.status]?.cls ?? 'st-gray'}`}>{STATUS_META[r.status]?.label ?? r.status}</span></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={6} className="empty-row">{month}에 주문이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="ag-pag"><span className="pag-info">구매확정 정산액 {won(settleAmt)}</span></div>
        </div>
      </div>
    </>
  );
}
