'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReviewStatus } from '@prisma/client';

export type TabKey = 'wait' | 'gov' | 'done' | 'ng';

const TAB_TO_STATUS: Record<TabKey, ReviewStatus> = {
  wait: 'pending',
  gov: 'gov',
  done: 'approved',
  ng: 'rejected',
};

export type WelfareReviewView = {
  id: number;
  orderId: number;
  orderNo: string;
  buyerName: string;
  buyerLabel: string;
  productName: string;
  amount: string;
  docUrl: string | null;
  grade: string | null;
  certNo: string | null;
  note: string | null;
  status: ReviewStatus;
  receivedAt: string;
};

type Props = {
  reviews: WelfareReviewView[];
  activeTab: TabKey;
  counts: { wait: number; gov: number; done: number; ng: number };
};

export default function WelfareReviewClient({ reviews, activeTab, counts }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [memos, setMemos] = useState<Record<number, string>>({});

  const handleTabClick = (tab: TabKey): void => {
    router.push(`/admin/welfare-review?status=${TAB_TO_STATUS[tab]}`);
  };

  const decide = async (id: number, status: 'approved' | 'rejected'): Promise<void> => {
    setBusy(id);
    try {
      const current = reviews.find((r) => r.id === id);
      const note = memos[id] ?? current?.note ?? null;
      const res = await fetch(`/cozycare/api/welfare-review/${id}/decision`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>복지용구 서류 검토</h1>
          <p>장기요양 인정번호 + 첨부 서류 검토 후 공단 확인</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon"></i><input type="text" placeholder="주문번호, 구매자 검색..." /></div>
        </div>
      </div>

      <div className="rv-tabs">
        <div className={`rv-tab${activeTab === 'wait' ? ' active' : ''}`} onClick={() => handleTabClick('wait')}>대기 <span className="tc">{counts.wait}</span></div>
        <div className={`rv-tab${activeTab === 'gov' ? ' active' : ''}`} onClick={() => handleTabClick('gov')}>공단 확인중 <span className="tc">{counts.gov}</span></div>
        <div className={`rv-tab${activeTab === 'done' ? ' active' : ''}`} onClick={() => handleTabClick('done')}>완료 <span className="tc">{counts.done}</span></div>
        <div className={`rv-tab danger${activeTab === 'ng' ? ' active' : ''}`} onClick={() => handleTabClick('ng')}>불가 <span className="tc">{counts.ng}</span></div>
      </div>

      <div className="rv-body">
        {reviews.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-muted)' }}>검토 대기 중인 항목이 없습니다.</div>
        )}
        {reviews.map((r) => (
          <div className="rv-card" key={r.id}>
            <div className="rv-card-main">
              <div className="rv-card-header">
                <span className="rv-order-num">#{r.orderNo}</span>
                <span className="rv-badge welfare">복지용구</span>
                <span className="rv-badge wait">검토 대기</span>
                <span className="rv-time">{r.receivedAt}</span>
              </div>
              <div className="rv-info">
                <div className="rv-info-item">
                  <span className="rv-info-label">구매자</span>
                  <span className="rv-info-value">{r.buyerName} <span style={{ fontWeight: 500, color: 'var(--fg-muted)', fontSize: 13 }}>({r.buyerLabel})</span></span>
                </div>
                <div className="rv-info-item">
                  <span className="rv-info-label">장기요양 등급</span>
                  <span className="rv-info-value">{r.grade ?? '-'}</span>
                </div>
                <div className="rv-info-item">
                  <span className="rv-info-label">인정번호</span>
                  <span className="rv-info-value">{r.certNo ?? '-'}</span>
                </div>
                <div className="rv-info-item">
                  <span className="rv-info-label">신청 상품</span>
                  <span className="rv-info-value">{r.productName}</span>
                </div>
                <div className="rv-info-item">
                  <span className="rv-info-label">결제 금액 (부담금)</span>
                  <span className="rv-info-value amount">{r.amount}</span>
                </div>
              </div>
              {r.docUrl && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={r.docUrl} target="_blank" rel="noreferrer" className="rv-file">
                    <i className="icon-file-text"></i> 첨부 서류
                  </a>
                </div>
              )}
            </div>
            <div className="rv-side">
              <h4>공단 확인 결과</h4>
              <textarea
                className="rv-memo"
                placeholder="검토 메모"
                value={memos[r.id] ?? r.note ?? ''}
                onChange={(e) => setMemos((m) => ({ ...m, [r.id]: e.target.value }))}
              ></textarea>
              <div className="rv-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy === r.id}
                  onClick={() => decide(r.id, 'approved')}
                >
                  <i className="icon-check" style={{ fontSize: 14 }}></i> 통과
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={busy === r.id}
                  onClick={() => decide(r.id, 'rejected')}
                >
                  반려
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
