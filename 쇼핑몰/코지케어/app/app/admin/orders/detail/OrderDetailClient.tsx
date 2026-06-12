'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderStatus } from '@prisma/client';
import { STATUS_LABEL, STATUS_BADGE, ORDER_CHAIN, chainIndex, nextStatus, prevStatus } from '@/lib/orderStatus';

export type DetailItem = {
  id: number;
  name: string;
  option: string;
  qty: number;
  unitPrice: string;
  sum: string;
};

export type TimelineEntry = {
  title: string;
  time: string;
  done: boolean;
};

export type OrderDetailView = {
  id: number;
  orderNo: string;
  createdAt: string;
  totalPrice: string;
  buyerName: string;
  buyerPhone: string;
  productName: string;
  carrier: string;
  trackingNo: string;
  shippingId: number | null;
  statusLabel: string;
  rawStatus: OrderStatus;
  hasWelfare: boolean;
  docUrl: string | null;
  orderTypeLabel: string;
  orderTypeBadge: string;
  items: DetailItem[];
  shipping: { recipient: string; phone: string; address: string; request: string };
  payment: {
    listPrice: string;
    supportRate: number;
    insuranceSupport: string;
    selfRate: number;
    selfPay: string;
    method: string;
    paidAt: string;
    finalAmount: string;
  };
  welfare: {
    present: boolean;
    statusLabel: string;
    statusBadge: string;
    certNo: string;
    grade: string;
    docs: { name: string; type: 'pdf' | 'image'; url: string }[];
    reviewer: string;
    note: string;
    reviewedAt: string;
  };
  refund: { present: boolean; amount: string; reason: string; status: string; createdAt: string };
  memo: string;
  timeline: TimelineEntry[];
};

const STYLES = `
.od-detail{padding:24px 28px 60px;background:#f4f6f8;min-height:100%}
.od-detail .od-stepper{display:flex;background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:22px 16px;margin-bottom:20px}
.od-detail .od-step{flex:1;display:flex;flex-direction:column;align-items:center;position:relative;gap:8px}
.od-detail .od-step::before{content:'';position:absolute;top:17px;left:-50%;width:100%;height:3px;background:#e5e7eb;z-index:0}
.od-detail .od-step:first-child::before{display:none}
.od-detail .od-step.done::before{background:var(--accent)}
.od-detail .od-step .num{position:relative;z-index:1;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;background:#eef1f4;color:#9aa3ad;border:2px solid #e5e7eb}
.od-detail .od-step.done .num{background:var(--accent);color:#fff;border-color:var(--accent)}
.od-detail .od-step.current .num{box-shadow:0 0 0 4px var(--accent-light)}
.od-detail .od-step .lbl{font-size:12.5px;color:#9aa3ad;font-weight:600;text-align:center;white-space:nowrap}
.od-detail .od-step.done .lbl{color:#111827}
.od-detail .od-cancel-banner{display:flex;align-items:center;gap:10px;background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;border-radius:12px;padding:14px 18px;margin-bottom:20px;font-weight:600;font-size:14px}

.od-detail .od-grid{display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start}
.od-detail .od-col,.od-detail .od-side{display:flex;flex-direction:column;gap:20px}
.od-detail .panel{background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden}
.od-detail .panel-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:15px 20px;border-bottom:1px solid #eef1f4;font-size:15px;font-weight:700;color:#111827}
.od-detail .panel-b{padding:18px 20px;display:flex;flex-direction:column;gap:0}

.od-detail .info-row{display:flex;gap:14px;padding:10px 0;border-bottom:1px solid #f4f6f8;font-size:14px}
.od-detail .info-row:last-child{border-bottom:0}
.od-detail .info-row .lbl{width:120px;flex-shrink:0;color:#8b95a1}
.od-detail .info-row .val{flex:1;min-width:0;color:#1f2937;font-weight:500;word-break:break-all}

.od-detail .prod-row{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid #f4f6f8}
.od-detail .prod-row:last-child{border-bottom:0}
.od-detail .prod-thumb{width:56px;height:56px;border-radius:10px;background:var(--accent-light);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.od-detail .prod-body{flex:1;min-width:0}
.od-detail .prod-n{font-size:15px;font-weight:600;color:#111827}
.od-detail .prod-opt{font-size:13px;color:#8b95a1;margin-top:2px}
.od-detail .prod-meta{display:flex;gap:14px;font-size:13px;color:#8b95a1;margin-top:4px}
.od-detail .prod-meta b{color:#374151}
.od-detail .prod-sum{font-weight:800;font-family:var(--font-mono);color:#111827;white-space:nowrap}

.od-detail .pay-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;font-size:14px;color:#4b5563;border-bottom:1px solid #f4f6f8}
.od-detail .pay-row:last-child{border-bottom:0;padding-top:14px;margin-top:4px;border-top:2px solid #eef1f4}
.od-detail .pay-row .pv{font-family:var(--font-mono);font-weight:600;color:#1f2937}
.od-detail .pay-row .pv.neg{color:#16a34a}
.od-detail .pay-row .pv.acc{color:var(--accent);font-size:18px;font-weight:800}

.od-detail .doc-card{border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
.od-detail .doc-card + .doc-card{margin-top:12px}
.od-detail .doc-head{display:flex;align-items:center;gap:8px;padding:12px 14px;background:#f8fafc;border-bottom:1px solid #eef1f4;font-size:13.5px;font-weight:600;color:#374151}
.od-detail .doc-head .doc-type{margin-left:auto;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;background:#ede9fe;color:#7c3aed;text-transform:uppercase}
.od-detail .doc-preview{width:100%;height:440px;border:0;background:#fff;display:block}
.od-detail img.doc-preview{object-fit:contain}
.od-detail .doc-actions{display:flex;gap:8px;padding:12px 14px;border-top:1px solid #eef1f4;background:#fff}
.od-detail .doc-actions a{flex:1;text-align:center;height:38px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:8px;font-size:13.5px;font-weight:600;text-decoration:none}
.od-detail .doc-actions .a-view{background:var(--accent);color:#fff}
.od-detail .doc-actions .a-dl{background:#fff;border:1px solid #d1d5db;color:#374151}
.od-detail .doc-empty{padding:20px;text-align:center;color:#9aa3ad;font-size:13px;border:1px dashed #d1d5db;border-radius:10px}

.od-detail .ship-form{display:flex;gap:8px;flex-wrap:wrap}
.od-detail .ship-form .form-select{width:120px}
.od-detail .ship-form .form-input{flex:1;min-width:120px}

.od-detail .status-now{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.od-detail .badge-status{display:inline-flex;align-items:center;padding:5px 12px;border-radius:9999px;font-size:13px;font-weight:700;color:#fff}
.od-detail .badge-status.doc-review{background:#a855f7}
.od-detail .badge-status.doc-approved{background:#0891b2}
.od-detail .badge-status.prep{background:#f59e0b}
.od-detail .badge-status.delivering{background:#3b82f6}
.od-detail .badge-status.done{background:#84c140}
.od-detail .badge-status.confirmed{background:#46782b}
.od-detail .badge-status.cancelled{background:#9ca3af}
.od-detail .badge-status.refunded{background:#ef4444}
.od-detail .step-controls{display:flex;gap:8px}
.od-detail .step-controls .btn{flex:1;justify-content:center}
.od-detail .step-hint{font-size:12px;color:#8b95a1;margin-top:8px;line-height:1.5}

.od-detail .badge-type{display:inline-flex;align-items:center;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700}
.od-detail .badge-type.welfare{background:#FEE2E2;color:#ef4444}
.od-detail .badge-type.general{background:#E5E7EB;color:#4B5563}
.od-detail .badge-type.biz{background:#DCFCE7;color:#16a34a}
.od-detail .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700}
.od-detail .badge-success{background:#dcfce7;color:#16a34a}
.od-detail .badge-info{background:#dbeafe;color:#2563eb}
.od-detail .badge-warning{background:#fef3c7;color:#d97706}
.od-detail .badge-inactive{background:#f3f4f6;color:#6b7280}

.od-detail .action-btns{display:flex;flex-direction:column;gap:8px}
.od-detail .action-btns .btn{justify-content:center}
.od-detail textarea.form-input{width:100%;min-height:90px;resize:vertical;padding:10px 12px}

.od-detail .od-tl-item{display:flex;gap:12px}
.od-detail .od-tl-col{display:flex;flex-direction:column;align-items:center;width:14px;flex-shrink:0}
.od-detail .od-tl-dot{width:11px;height:11px;border-radius:50%;background:var(--accent);margin-top:4px}
.od-detail .od-tl-dot.muted{background:#d1d5db}
.od-detail .od-tl-bar{flex:1;width:2px;background:#eef1f4;margin:2px 0}
.od-detail .od-tl-body{flex:1;padding-bottom:16px}
.od-detail .od-tl-t{display:block;font-size:14px;font-weight:600;color:#1f2937}
.od-detail .od-tl-tm{display:block;font-size:12px;color:#9aa3ad;font-family:var(--font-mono);margin-top:2px}

@media (max-width:980px){
  .od-detail{padding:16px 14px 48px}
  .od-detail .od-grid{grid-template-columns:1fr}
  .od-detail .od-step .lbl{font-size:11px}
}
`;

type Props = { order: OrderDetailView };

export default function OrderDetailClient({ order }: Props) {
  const router = useRouter();
  const [memo, setMemo] = useState<string>(order.memo);
  const [trackingNo, setTrackingNo] = useState<string>(order.trackingNo);
  const [carrier, setCarrier] = useState<string>(order.carrier);
  const [busy, setBusy] = useState<boolean>(false);

  const curIdx = chainIndex(order.rawStatus);
  const offChain = curIdx < 0; // cancelled / refunded
  const steps = order.hasWelfare ? ORDER_CHAIN : ORDER_CHAIN.slice(ORDER_CHAIN.indexOf('ready'));
  const prev = prevStatus(order.rawStatus, order.hasWelfare);
  const next = nextStatus(order.rawStatus);

  const handleSaveMemo = async (): Promise<void> => {
    setBusy(true);
    try {
      const res = await fetch(`/cozycare/api/orders/${order.id}/memo`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ memo }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleSaveTracking = async (): Promise<void> => {
    setBusy(true);
    try {
      const res = order.shippingId
        ? await fetch(`/cozycare/api/shipping/${order.shippingId}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ courier: carrier, trackingNo }),
          })
        : await fetch('/cozycare/api/shipping', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ orderId: order.id, courier: carrier, trackingNo }),
          });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async (to: OrderStatus | null): Promise<void> => {
    if (!to) return;
    setBusy(true);
    try {
      const res = await fetch(`/cozycare/api/orders/${order.id}/transition`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ to }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleRefund = async (): Promise<void> => {
    if (order.refund.present) return;
    const reason = window.prompt('환불 사유를 입력하세요', '단순 변심');
    if (reason === null) return;
    setBusy(true);
    try {
      const res = await fetch(`/cozycare/api/orders/${order.id}/refund`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handlePrintPdf = (): void => {
    window.print();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>주문 상세 #{order.orderNo}</h1>
          <p>{order.productName} · {order.buyerName} · {order.createdAt}</p>
        </div>
        <div className="top-bar-right">
          <Link href="/admin/orders" className="btn btn-secondary btn-sm"><i className="icon-arrow-left"></i>목록으로</Link>
          <button className="btn btn-dark btn-sm" onClick={handlePrintPdf}><i className="icon-printer"></i>PDF 출력</button>
        </div>
      </div>

      <div className="content-scroll">
        <div className="od-detail">
          {/* Stepper */}
          {offChain ? (
            <div className="od-cancel-banner"><i className="icon-alert-circle" />이 주문은 {order.statusLabel} 상태입니다.</div>
          ) : (
            <div className="od-stepper">
              {steps.map((s, i) => {
                const sIdx = chainIndex(s);
                const done = sIdx <= curIdx;
                const current = sIdx === curIdx;
                return (
                  <div className={`od-step${done ? ' done' : ''}${current ? ' current' : ''}`} key={s}>
                    <div className="num">{i + 1}</div>
                    <div className="lbl">{STATUS_LABEL[s]}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="od-grid">
            {/* Left column */}
            <div className="od-col">
              <div className="panel">
                <div className="panel-h"><span>주문 정보</span><span className={`badge-type ${order.orderTypeBadge}`}>{order.orderTypeLabel}</span></div>
                <div className="panel-b">
                  <div className="info-row"><span className="lbl">주문번호</span><span className="val" style={{ fontFamily: 'var(--font-mono)' }}>{order.orderNo}</span></div>
                  <div className="info-row"><span className="lbl">주문일시</span><span className="val" style={{ fontFamily: 'var(--font-mono)' }}>{order.createdAt}</span></div>
                  <div className="info-row"><span className="lbl">구매자</span><span className="val">{order.buyerName} · {order.buyerPhone}</span></div>
                  <div className="info-row"><span className="lbl">총 결제금액</span><span className="val" style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', fontWeight: 800 }}>{order.totalPrice}</span></div>
                </div>
              </div>

              {/* 복지용구 서류 — 담당자 업로드 */}
              {order.welfare.present && (
                <div className="panel">
                  <div className="panel-h"><span>복지용구 서류 (담당자 업로드)</span><span className={`badge ${order.welfare.statusBadge}`}>{order.welfare.statusLabel}</span></div>
                  <div className="panel-b">
                    <div className="info-row"><span className="lbl">장기요양 인정번호</span><span className="val" style={{ fontFamily: 'var(--font-mono)' }}>{order.welfare.certNo}</span></div>
                    <div className="info-row"><span className="lbl">등급</span><span className="val">{order.welfare.grade}</span></div>
                    <div className="info-row"><span className="lbl">담당 검토자</span><span className="val">{order.welfare.reviewer || '-'}</span></div>
                    {order.welfare.reviewedAt && (
                      <div className="info-row"><span className="lbl">검토 일시</span><span className="val" style={{ fontFamily: 'var(--font-mono)' }}>{order.welfare.reviewedAt}</span></div>
                    )}
                    <div style={{ marginTop: 14 }}>
                      {order.welfare.docs.length === 0 && <div className="doc-empty">담당자가 업로드한 서류가 없습니다.</div>}
                      {order.welfare.docs.map((d, idx) => (
                        <div className="doc-card" key={idx}>
                          <div className="doc-head"><i className={d.type === 'image' ? 'icon-file-image' : 'icon-file-text'} />{d.name}<span className="doc-type">{d.type}</span></div>
                          {d.type === 'image'
                            ? <img className="doc-preview" src={d.url} alt={d.name} />
                            : <iframe className="doc-preview" src={`${d.url}#toolbar=0`} title={d.name} />}
                          <div className="doc-actions">
                            <a className="a-view" href={d.url} target="_blank" rel="noreferrer"><i className="icon-search" />새 창에서 보기</a>
                            <a className="a-dl" href={d.url} download><i className="icon-download" />다운로드</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 상품 정보 */}
              <div className="panel">
                <div className="panel-h"><span>상품 정보</span></div>
                <div className="panel-b">
                  {order.items.map((it) => (
                    <div className="prod-row" key={it.id}>
                      <div className="prod-thumb"><i className="icon-package" style={{ color: 'var(--accent)', fontSize: 30 }} /></div>
                      <div className="prod-body">
                        <div className="prod-n">{it.name}</div>
                        {it.option && <div className="prod-opt">옵션: {it.option}</div>}
                        <div className="prod-meta"><span>수량 <b>{it.qty}개</b></span><span>단가 <b>{it.unitPrice}</b></span></div>
                      </div>
                      <div className="prod-sum">{it.sum}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 배송 정보 */}
              <div className="panel">
                <div className="panel-h"><span>배송 정보</span></div>
                <div className="panel-b">
                  <div className="info-row"><span className="lbl">수령인</span><span className="val">{order.shipping.recipient}</span></div>
                  <div className="info-row"><span className="lbl">연락처</span><span className="val" style={{ fontFamily: 'var(--font-mono)' }}>{order.shipping.phone}</span></div>
                  <div className="info-row"><span className="lbl">주소</span><span className="val">{order.shipping.address}</span></div>
                  <div className="info-row"><span className="lbl">요청사항</span><span className="val">{order.shipping.request}</span></div>
                  <div className="info-row" style={{ flexDirection: 'column', gap: 8 }}>
                    <span className="lbl">송장번호</span>
                    <div className="ship-form">
                      <select className="form-select" value={carrier} onChange={(e) => setCarrier(e.target.value)}>
                        <option>CJ대한통운</option><option>롯데택배</option><option>한진택배</option><option>우체국</option><option>로젠택배</option>
                      </select>
                      <input type="text" className="form-input" placeholder="송장번호 입력" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} />
                      <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} disabled={busy} onClick={handleSaveTracking}><i className="icon-send" />저장</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 결제 정보 */}
              <div className="panel">
                <div className="panel-h"><span>결제 정보</span></div>
                <div className="panel-b">
                  <div className="pay-row"><span>정가</span><span className="pv">{order.payment.listPrice}</span></div>
                  <div className="pay-row"><span>공단 지원 ({order.payment.supportRate}%)</span><span className="pv neg">{order.payment.insuranceSupport}</span></div>
                  <div className="pay-row"><span>본인 부담금 ({order.payment.selfRate}%)</span><span className="pv">{order.payment.selfPay}</span></div>
                  <div className="pay-row"><span>결제수단</span><span className="pv" style={{ fontFamily: 'inherit' }}>{order.payment.method}</span></div>
                  <div className="pay-row"><span>결제일시</span><span className="pv">{order.payment.paidAt}</span></div>
                  <div className="pay-row"><span>최종 결제금액</span><span className="pv acc">{order.payment.finalAmount}</span></div>
                </div>
              </div>

              {/* 환불 정보 */}
              {order.refund.present && (
                <div className="panel">
                  <div className="panel-h"><span>환불 정보</span><span className="badge badge-inactive">환불 {order.refund.status}</span></div>
                  <div className="panel-b">
                    <div className="info-row"><span className="lbl">환불 금액</span><span className="val" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{order.refund.amount}</span></div>
                    <div className="info-row"><span className="lbl">환불 사유</span><span className="val">{order.refund.reason}</span></div>
                    <div className="info-row"><span className="lbl">접수 일시</span><span className="val" style={{ fontFamily: 'var(--font-mono)' }}>{order.refund.createdAt}</span></div>
                  </div>
                </div>
              )}

              {/* 메모 */}
              <div className="panel">
                <div className="panel-h"><span>관리자 메모</span></div>
                <div className="panel-b">
                  <textarea className="form-input" placeholder="내부 관리용 메모를 입력하세요" value={memo} onChange={(e) => setMemo(e.target.value)} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}><button className="btn btn-primary btn-sm" onClick={handleSaveMemo} disabled={busy}>메모 저장</button></div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="od-side">
              <div className="panel">
                <div className="panel-h"><span>주문 상태</span></div>
                <div className="panel-b">
                  <div className="status-now"><span className={`badge-status ${STATUS_BADGE[order.rawStatus]}`}>{order.statusLabel}</span></div>
                  <div className="step-controls">
                    <button className="btn btn-secondary" disabled={busy || !prev} onClick={() => handleMove(prev)}><i className="icon-arrow-left" />{prev ? STATUS_LABEL[prev] : '이전 없음'}</button>
                    <button className="btn btn-primary" disabled={busy || !next} onClick={() => handleMove(next)}>{next ? STATUS_LABEL[next] : '마지막 단계'}<i className="icon-arrow-right" /></button>
                  </div>
                  {order.hasWelfare && curIdx <= 1 && (
                    <div className="step-hint">담당자가 올린 서류를 확인한 뒤 <b>다음 단계</b>로 승인하세요. 서류 검토 완료 후 <b>상품 준비중</b>으로 전환됩니다.</div>
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-h"><span>액션</span></div>
                <div className="panel-b">
                  <div className="action-btns">
                    <button className="btn btn-secondary" onClick={handleRefund} disabled={busy || order.refund.present}><i className="icon-rotate-ccw" />{order.refund.present ? '환불 완료' : '환불 처리'}</button>
                    <button className="btn btn-dark" onClick={() => alert('고객 메시지 발송은 데모에서 생략됩니다.')}><i className="icon-message-square" />고객에게 메시지</button>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-h"><span>처리 타임라인</span></div>
                <div className="panel-b">
                  {order.timeline.map((t, idx) => (
                    <div className="od-tl-item" key={idx}>
                      <div className="od-tl-col"><div className={`od-tl-dot${t.done ? '' : ' muted'}`}></div>{idx < order.timeline.length - 1 && <div className="od-tl-bar"></div>}</div>
                      <div className="od-tl-body"><span className="od-tl-t">{t.title}</span><span className="od-tl-tm">{t.time}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
