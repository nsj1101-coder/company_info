'use client';

import Link from 'next/link';
import { LIST_STYLES } from '@/components/admin/listStyles';
import MonthNav from '@/components/admin/MonthNav';

export type BizSettlement = { bizId: number; company: string; count: number; total: number };

function won(n: number): string { return `${n.toLocaleString('ko-KR')}원`; }

export default function SettlementsClient({ month, rows }: { month: string; rows: BizSettlement[] }) {
  const totalAmt = rows.reduce((s, r) => s + r.total, 0);
  const totalCnt = rows.reduce((s, r) => s + r.count, 0);

  return (
    <>
      <style>{LIST_STYLES}</style>
      <div className="top-bar">
        <div className="top-bar-left"><h1>정산 관리</h1><p>구매확정 주문 기준 · 입점사별 월 정산</p></div>
        <div className="top-bar-right"><MonthNav month={month} /></div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="lp-grid">
          <div className="tier">
            <div className="stat-c" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
              <div className="s-ic"><i className="icon-calendar" style={{ color: '#4f46e5' }} /></div>
              <div><span className="s-val" style={{ fontSize: 16 }}>{month}</span><div className="s-lbl">정산 월</div></div>
            </div>
            <div className="stat-c" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
              <div className="s-ic"><i className="icon-handshake" style={{ color: '#4B5563' }} /></div>
              <div><span className="s-val">{rows.length}</span><div className="s-lbl">정산대상 업체</div></div>
            </div>
            <div className="stat-c" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
              <div className="s-ic"><i className="icon-shopping-cart" style={{ color: '#b45309' }} /></div>
              <div><span className="s-val">{totalCnt}</span><div className="s-lbl">구매확정 건수</div></div>
            </div>
            <div className="stat-c" style={{ background: '#EEFBF0', border: '1px solid #C8F0CE' }}>
              <div className="s-ic"><i className="icon-banknote" style={{ color: '#16a34a' }} /></div>
              <div><span className="s-val" style={{ fontSize: 17 }}>{won(totalAmt)}</span><div className="s-lbl">정산대상 매출</div></div>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">{month} · 구매확정 기준 {rows.length}개 업체</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col /><col style={{ width: '160px' }} /><col style={{ width: '180px' }} /><col style={{ width: '120px' }} /></colgroup>
              <thead><tr><th>입점사</th><th>구매확정 건수</th><th>정산대상 매출</th><th>처리</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.bizId}>
                    <td className="ag-name">{r.company}</td>
                    <td className="ag-num">{r.count}건</td>
                    <td className="ag-num">{won(r.total)}</td>
                    <td><Link className="btn-sm primary" href={`/admin/settlements/detail?bizId=${r.bizId}&month=${month}`}>주문 상세</Link></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={4} className="empty-row">{month}에 구매확정된 입점사 주문이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="ag-pag"><span className="pag-info">합계 {won(totalAmt)}</span></div>
        </div>
      </div>
    </>
  );
}
