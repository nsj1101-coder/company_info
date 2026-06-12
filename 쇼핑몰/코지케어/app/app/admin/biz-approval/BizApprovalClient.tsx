'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type TabKey = 'wait' | 'approved' | 'rejected';

export type BizApplication = {
  id: number;
  company: string;
  bizType: string;
  appliedAt: string;
  representative: string;
  bizNumber: string;
  phone: string;
  fileName: string;
};

type Props = {
  applications: BizApplication[];
  counts: { wait: number; approved: number; rejected: number };
};

export default function BizApprovalClient({ applications, counts }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('wait');
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const openRejectModal = (id: number): void => {
    setPendingId(id);
    setRejectOpen(true);
  };
  const closeRejectModal = (): void => {
    setRejectOpen(false);
    setPendingId(null);
    setRejectReason('');
  };

  const decide = async (id: number, decision: 'approve' | 'reject', note?: string): Promise<void> => {
    setBusy(id);
    try {
      const res = await fetch(`/cozycare/api/biz-approval/${id}/decision`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ decision, note }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const confirmReject = async (): Promise<void> => {
    if (!pendingId) return;
    await decide(pendingId, 'reject', rejectReason);
    closeRejectModal();
  };

  return (
    <>
      <style>{`
        .sidebar-user .su-av{width:36px;height:36px;border-radius:50%;background:var(--fg-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;flex-shrink:0}
        .su-name-row{display:flex;align-items:center;gap:6px}
        .su-name{font-size:13px;font-weight:600;color:var(--fg-primary)}
        .su-tag{background:var(--accent-light);color:var(--accent);font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px}
        .su-mail{font-size:12px;color:var(--fg-muted);margin-top:2px}

        .ap-tabs{display:flex;gap:0;border-bottom:1px solid var(--border);padding:0 24px;background:#fff;flex-shrink:0}
        .ap-tab{padding:14px 18px;font-size:14px;color:var(--fg-muted);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;font-weight:500}
        .ap-tab.active{color:var(--accent);font-weight:600;border-bottom-color:var(--accent)}
        .ap-tab .tc{font-family:var(--font-mono);font-size:12px;font-weight:700;background:var(--bg-secondary);color:var(--fg-secondary);padding:2px 8px;border-radius:9999px;margin-left:6px}
        .ap-tab.active .tc{background:var(--accent-light);color:var(--accent)}

        .ap-body{flex:1;overflow-y:auto;padding:20px 24px;background:var(--bg-secondary);display:flex;flex-direction:column;gap:14px}

        .ap-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:22px 26px;display:grid;grid-template-columns:1fr 280px;gap:24px;box-shadow:0 1px 3px rgba(0,0,0,.03)}
        .ap-card-main{display:flex;flex-direction:column;gap:14px;min-width:0}
        .ap-card-header{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .ap-company{font-size:18px;font-weight:700;color:var(--fg-primary)}
        .ap-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700}
        .ap-badge.wait{background:#FEF3C7;color:#D97706}
        .ap-badge.biz{background:#DCFCE7;color:#16a34a}
        .ap-time{font-size:12px;color:var(--fg-muted);font-family:var(--font-mono);margin-left:auto}

        .ap-info{display:grid;grid-template-columns:repeat(2,1fr);gap:10px 24px;padding:14px 16px;background:var(--bg-secondary);border-radius:var(--radius-sm)}
        .ap-info-item{display:flex;flex-direction:column;gap:2px}
        .ap-info-label{font-size:11px;color:var(--fg-muted);font-weight:600;letter-spacing:.2px}
        .ap-info-value{font-size:14px;color:var(--fg-primary);font-weight:600}
        .ap-info-value .num{font-family:var(--font-mono)}

        .ap-file{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;background:#fff;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:13px;color:var(--fg-secondary);cursor:pointer;font-weight:500;align-self:flex-start}
        .ap-file:hover{border-color:var(--accent);color:var(--accent)}
        .ap-file i{font-size:14px;color:#ef4444}

        .ap-side{display:flex;flex-direction:column;gap:10px;padding-left:24px;border-left:1px solid var(--border-light);justify-content:center}
        .ap-side .btn{height:44px;font-size:14px;font-weight:600}
        .ap-side .btn i{font-size:16px}
        .ap-side .btn-approve{background:var(--accent);color:#fff;border-color:var(--accent)}
        .ap-side .btn-approve:hover{filter:brightness(.95)}
        .ap-side .btn-reject{background:#fff;color:#ef4444;border:1px solid #ef4444}
        .ap-side .btn-reject:hover{background:#FEE2E2}
        .ap-side .btn-detail{background:#fff;color:var(--fg-secondary);border:1px solid var(--border)}

        @media (max-width:980px){.ap-card{grid-template-columns:1fr}.ap-side{padding-left:0;border-left:none;border-top:1px solid var(--border-light);padding-top:14px}}

        .reject-textarea{width:100%;border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;font-size:14px;font-family:inherit;resize:vertical;min-height:100px}
      `}</style>

      <div className="top-bar">
        <div className="top-bar-left">
          <h1>사업자 가입 승인</h1>
          <p>사업자등록증 검토 후 사업자 회원 승인/반려</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon"></i><input type="text" placeholder="상호, 사업자번호 검색..." /></div>
          <div className="bell-wrapper">
            <button className="bell-btn"><i className="icon-bell" style={{ color: '#4B5563', fontSize: '18px' }}></i><span className="bell-dot"></span></button>
          </div>
        </div>
      </div>

      <div className="ap-tabs">
        <div className={`ap-tab${activeTab === 'wait' ? ' active' : ''}`} data-tab="wait" onClick={() => setActiveTab('wait')}>대기 <span className="tc">{counts.wait}</span></div>
        <div className={`ap-tab${activeTab === 'approved' ? ' active' : ''}`} data-tab="approved" onClick={() => setActiveTab('approved')}>승인됨 <span className="tc">{counts.approved}</span></div>
        <div className={`ap-tab${activeTab === 'rejected' ? ' active' : ''}`} data-tab="rejected" onClick={() => setActiveTab('rejected')}>반려 <span className="tc">{counts.rejected}</span></div>
      </div>

      <div className="ap-body">
        {applications.map((app) => (
          <div className="ap-card" key={app.id}>
            <div className="ap-card-main">
              <div className="ap-card-header">
                <span className="ap-company">{app.company}</span>
                <span className="ap-badge biz">{app.bizType}</span>
                <span className="ap-badge wait">승인 대기</span>
                <span className="ap-time">{app.appliedAt}</span>
              </div>
              <div className="ap-info">
                <div className="ap-info-item">
                  <span className="ap-info-label">대표자</span>
                  <span className="ap-info-value">{app.representative}</span>
                </div>
                <div className="ap-info-item">
                  <span className="ap-info-label">사업자번호</span>
                  <span className="ap-info-value"><span className="num">{app.bizNumber}</span></span>
                </div>
                <div className="ap-info-item">
                  <span className="ap-info-label">사업자 유형</span>
                  <span className="ap-info-value">{app.bizType}</span>
                </div>
                <div className="ap-info-item">
                  <span className="ap-info-label">대표 전화</span>
                  <span className="ap-info-value"><span className="num">{app.phone}</span></span>
                </div>
              </div>
              <span className="ap-file"><i className="icon-file-text"></i> {app.fileName}</span>
            </div>
            <div className="ap-side">
              <button
                type="button"
                className="btn btn-approve"
                disabled={busy === app.id}
                onClick={() => decide(app.id, 'approve')}
              >
                <i className="icon-check"></i> 승인
              </button>
              <button
                type="button"
                className="btn btn-reject"
                disabled={busy === app.id}
                onClick={() => openRejectModal(app.id)}
              >
                <i className="icon-x"></i> 반려
              </button>
              <button type="button" className="btn btn-detail">
                <i className="icon-eye" style={{ fontSize: '14px' }}></i> 상세 보기
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={`modal-overlay${rejectOpen ? ' active' : ''}`} id="rejectModal">
        <div className="modal-content" style={{ width: '460px' }}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}><i className="icon-x-circle" style={{ color: '#ef4444', fontSize: '24px' }}></i></div>
          <div className="modal-title">사업자 가입 신청을 반려하시겠습니까?</div>
          <div className="modal-desc" style={{ marginBottom: '16px' }}>반려 사유를 입력해 주세요. 신청자에게 메일로 전달됩니다.</div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">반려 사유 <span className="required">*</span></label>
            <textarea className="reject-textarea" placeholder="예: 사업자등록증 사본 흐림 - 재제출 요청 / 업종 코드 불일치 등" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}></textarea>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={closeRejectModal}>취소</button>
            <button type="button" className="btn btn-danger" onClick={confirmReject}>반려 처리</button>
          </div>
        </div>
      </div>
    </>
  );
}
