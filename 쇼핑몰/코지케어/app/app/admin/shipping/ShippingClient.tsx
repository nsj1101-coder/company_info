'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const pageStyles = `
.noti-page{padding:24px 28px;display:flex;flex-direction:column;gap:16px}
.noti-stats{display:flex;gap:12px;font-size:13px;color:var(--fg-muted)}
.noti-stats span{font-family:var(--font-mono);font-weight:600;color:var(--fg-primary)}
`;

const CARRIERS = ['CJ대한통운', '한진택배', '롯데택배', '우체국택배'];

export type ShippingRow = {
  shippingId: number | null;
  orderId: number;
  orderNo: string;
  buyer: string;
  product: string;
  phone: string;
  carrier: string;
  trackingNo: string;
};

type Props = {
  rows: ShippingRow[];
  pendingCount: number;
  shippedTodayCount: number;
};

export default function ShippingClient({ rows, pendingCount, shippedTodayCount }: Props) {
  const router = useRouter();
  const [edits, setEdits] = useState<Record<number, { carrier: string; trackingNo: string }>>({});
  const [busy, setBusy] = useState<number | null>(null);

  const carrierOf = (orderId: number, fallback: string): string =>
    edits[orderId]?.carrier ?? fallback;
  const trackingOf = (orderId: number, fallback: string): string =>
    edits[orderId]?.trackingNo ?? fallback;

  const updateEdit = (
    orderId: number,
    field: 'carrier' | 'trackingNo',
    value: string,
    initial: { carrier: string; trackingNo: string }
  ): void => {
    setEdits((prev) => {
      const cur = prev[orderId] ?? initial;
      return { ...prev, [orderId]: { ...cur, [field]: value } };
    });
  };

  const saveAndShip = async (row: ShippingRow): Promise<void> => {
    setBusy(row.orderId);
    try {
      const courier = carrierOf(row.orderId, row.carrier);
      const trackingNo = trackingOf(row.orderId, row.trackingNo);
      const tr = await fetch(`/cozycare/api/orders/${row.orderId}/transition`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ to: 'shipping', courier, trackingNo }),
      });
      if (tr.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="top-bar">
        <div className="top-bar-left">
          <h1>송장 입력 · 알림 발송</h1>
          <p>출고 송장 입력 및 자동 문자 발송</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon"></i><input type="text" placeholder="주문번호 · 구매자 검색" /></div>
        </div>
      </div>

      <div className="content-scroll">
        <div className="noti-page">
          <div className="noti-stats">
            출고 대기 <span>{pendingCount}</span>건 · 오늘 발송 <span>{shippedTodayCount}</span>건
          </div>

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">출고 대기 주문</div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>주문번호</th>
                    <th>구매자</th>
                    <th>상품</th>
                    <th>연락처</th>
                    <th style={{ width: 340 }}>송장 입력</th>
                    <th style={{ width: 120 }}>처리</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--fg-muted)' }}>
                      출고 대기중인 주문이 없습니다.
                    </td></tr>
                  )}
                  {rows.map((r) => {
                    const initial = { carrier: r.carrier, trackingNo: r.trackingNo };
                    return (
                      <tr key={r.orderId}>
                        <td className="font-mono">{r.orderNo}</td>
                        <td>{r.buyer}</td>
                        <td>{r.product}</td>
                        <td className="font-mono">{r.phone}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <select
                              className="form-select"
                              style={{ width: 110 }}
                              value={carrierOf(r.orderId, r.carrier)}
                              onChange={(e) => updateEdit(r.orderId, 'carrier', e.target.value, initial)}
                            >
                              {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input
                              className="form-input"
                              placeholder="송장번호"
                              style={{ flex: 1 }}
                              value={trackingOf(r.orderId, r.trackingNo)}
                              onChange={(e) => updateEdit(r.orderId, 'trackingNo', e.target.value, initial)}
                            />
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '6px 10px' }}
                            disabled={busy === r.orderId || trackingOf(r.orderId, r.trackingNo).trim() === ''}
                            onClick={() => saveAndShip(r)}
                          >
                            저장+발송
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
