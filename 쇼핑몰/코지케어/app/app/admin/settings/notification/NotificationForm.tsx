'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ModalId = 'unsavedModal' | 'logoutModal' | 'deleteModal' | 'successModal' | 'errorModal';

export type ChannelState = { email: boolean; kakao: boolean; sms: boolean };

export type NotificationRow = {
  id: number;
  audience: string;
  channelLabel: string;
  template: string;
  memo: string;
  sentAt: string;
};

type ApiNotification = {
  id: number;
  audience: string;
  channel: string;
  template: string;
  memo: string | null;
  sentAt: string;
};

const CHANNEL_LABELS: Record<string, string> = {
  sms: 'SMS',
  kakao: '카카오 알림톡',
  email: '이메일',
};

function formatSentAt(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${hh}:${mm}`;
}

type Props = { channels: ChannelState; history: NotificationRow[] };

export default function NotificationForm({ channels, history }: Props) {
  const router = useRouter();
  const [openModals, setOpenModals] = useState<Record<ModalId, boolean>>({
    unsavedModal: false,
    logoutModal: false,
    deleteModal: false,
    successModal: false,
    errorModal: false,
  });

  const [successTitle, setSuccessTitle] = useState<string>('등록이 완료되었습니다');
  const [successDesc, setSuccessDesc] = useState<string>('목록 페이지로 이동하거나 상세보기 할 수 있습니다.');
  const [channelState, setChannelState] = useState<ChannelState>(channels);
  const [historyState, setHistoryState] = useState<NotificationRow[]>(history);

  const loadHistory = useCallback(async (): Promise<void> => {
    const res = await fetch('/cozycare/api/notifications?limit=20', { cache: 'no-store' });
    if (!res.ok) return;
    const data = (await res.json()) as { notifications?: ApiNotification[] };
    if (!data.notifications) return;
    setHistoryState(
      data.notifications.map((n) => ({
        id: n.id,
        audience: n.audience,
        channelLabel: CHANNEL_LABELS[n.channel] ?? n.channel,
        template: n.template,
        memo: n.memo ?? '',
        sentAt: formatSentAt(n.sentAt),
      }))
    );
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const openModal = (id: ModalId): void => {
    setOpenModals((prev) => ({ ...prev, [id]: true }));
  };

  const closeModal = (id: ModalId): void => {
    setOpenModals((prev) => ({ ...prev, [id]: false }));
  };

  const doLogout = (): void => {
    closeModal('logoutModal');
  };

  const showSuccess = (title: string, desc: string): void => {
    setSuccessTitle(title);
    setSuccessDesc(desc);
    openModal('successModal');
  };

  const toggleChannel = (channel: keyof ChannelState): void => {
    setChannelState((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const save = async (): Promise<void> => {
    const res = await fetch('/cozycare/api/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items: [
          { key: 'notification.channels', value: JSON.stringify(channelState), scope: 'notification' },
        ],
      }),
    });
    if (res.ok) {
      showSuccess('저장이 완료되었습니다', '알림 설정이 저장되었습니다.');
      router.refresh();
    } else {
      openModal('errorModal');
    }
  };

  return (
    <>
      <style>{`
        .sidebar-user .su-av{width:36px;height:36px;border-radius:50%;background:var(--fg-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;flex-shrink:0}
        .su-name-row{display:flex;align-items:center;gap:6px}
        .su-name{font-size:13px;font-weight:600;color:var(--fg-primary)}
        .su-tag{background:var(--accent-light);color:var(--accent);font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px}
        .su-mail{font-size:12px;color:var(--fg-muted);margin-top:2px}

        .settings-wrap{display:flex;flex:1;min-height:0;overflow:hidden}
        .cat-nav{width:240px;flex-shrink:0;background:var(--bg-card);border-right:1px solid var(--border);padding:12px;display:flex;flex-direction:column;gap:4px}
        .cat-item{display:flex;align-items:center;gap:10px;height:40px;padding:8px 12px;border-radius:6px;font-size:14px;font-weight:500;color:var(--fg-secondary);cursor:pointer;transition:background .15s}
        .cat-item:hover{background:var(--border-light)}
        .cat-item i{font-size:18px;color:var(--fg-muted)}
        .cat-item.active{background:var(--accent-light);color:var(--fg-primary);font-weight:600}
        .cat-item.active i{color:var(--accent)}

        .form-area{flex:1;min-width:0;background:var(--bg-card);padding:28px 32px;display:flex;flex-direction:column;gap:24px;overflow-y:auto}
        .form-title h2{font-size:18px;font-weight:700;color:var(--fg-primary);margin-bottom:4px}
        .form-title p{font-size:14px;color:var(--fg-muted)}
        .form-fields{width:480px;max-width:100%;display:flex;flex-direction:column}
        .noti-row{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid var(--border)}
        .noti-row.last{border-bottom:none}
        .noti-row .nr-title{font-size:14px;font-weight:600;color:var(--fg-primary)}
        .noti-row .nr-desc{font-size:13px;color:var(--fg-muted);margin-top:4px;font-weight:500}
        .sec-divider{width:480px;max-width:100%;height:1px;background:var(--border)}
        .sec-title{font-size:18px;font-weight:700;color:var(--fg-primary)}
      `}</style>

      <div className="settings-wrap">
        <nav className="cat-nav">
          <Link className="cat-item" href="/admin/settings"><i className="icon-home"></i><span>설정 메인</span></Link>
          <Link className="cat-item" href="/admin/settings/general"><i className="icon-globe"></i><span>일반 설정</span></Link>
          <Link className="cat-item" href="/admin/settings/data"><i className="icon-database"></i><span>데이터 관리</span></Link>
          <Link className="cat-item active" href="/admin/settings/shipping"><i className="icon-bell"></i><span>알림 설정</span></Link>
          <Link className="cat-item" href="/admin/settings/permission"><i className="icon-shield"></i><span>권한 관리</span></Link>
        </nav>

        <div className="form-area">
          <div className="form-title">
            <h2>알림 채널</h2>
            <p>이메일·카카오 알림톡·SMS 발송 설정</p>
          </div>

          <div className="form-fields" style={{ width: '560px' }}>
            <div className="noti-row">
              <div>
                <div className="nr-title">이메일 (SMTP)</div>
                <div className="nr-desc">발신 noreply@cozycare.co.kr · smtp.cozycare.co.kr:587</div>
              </div>
              <div className={`toggle-switch${channelState.email ? ' active' : ''}`} onClick={() => toggleChannel('email')}></div>
            </div>
            <div className="noti-row">
              <div>
                <div className="nr-title">카카오 알림톡</div>
                <div className="nr-desc">센더키 cz_kakao_2026 · 발신 프로필 @코지워커SHOP</div>
              </div>
              <div className={`toggle-switch${channelState.kakao ? ' active' : ''}`} onClick={() => toggleChannel('kakao')}></div>
            </div>
            <div className="noti-row last">
              <div>
                <div className="nr-title">SMS (LMS)</div>
                <div className="nr-desc">발신 1588-0000 · 카카오 알림톡 실패 시 대체 발송</div>
              </div>
              <div className={`toggle-switch${channelState.sms ? ' active' : ''}`} onClick={() => toggleChannel('sms')}></div>
            </div>
          </div>

          <div className="sec-divider" style={{ width: '560px' }}></div>

          <div className="sec-title">템플릿</div>

          <div className="form-fields" style={{ width: '560px', gap: '14px' }}>
            <div className="card" style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-primary)' }}>1. 주문 접수</div>
                <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>알림톡 · SMS</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--fg-secondary)', lineHeight: 1.5, background: 'var(--border-light)', padding: '10px', borderRadius: '6px' }}>{'[코지워커 SHOP] #{고객명}님 주문이 접수되었습니다. 주문번호 #{주문번호} / 코지워커 #{상품명} / 결제 #{금액}원'}</div>
            </div>

            <div className="card" style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-primary)' }}>2. 결제 완료</div>
                <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>이메일 · 알림톡</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--fg-secondary)', lineHeight: 1.5, background: 'var(--border-light)', padding: '10px', borderRadius: '6px' }}>{'[코지워커 SHOP] 결제가 완료되었습니다. 부담금 #{부담금}원 (정가의 15%) · ㈜베스트시니어 결제 위임 완료'}</div>
            </div>

            <div className="card" style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-primary)' }}>3. 서류 검토 결과 (정상 · 불가)</div>
                <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>알림톡</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--fg-secondary)', lineHeight: 1.5, background: 'var(--border-light)', padding: '10px', borderRadius: '6px' }}>{'정상: 인정번호 #{인정번호} 공단 확인 완료, 출고 준비 중입니다.'}<br />{'불가: 서류 보완 사유 — #{사유}. 재제출 부탁드립니다.'}</div>
            </div>

            <div className="card" style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-primary)' }}>4. 출고 송장</div>
                <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>알림톡 · SMS</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--fg-secondary)', lineHeight: 1.5, background: 'var(--border-light)', padding: '10px', borderRadius: '6px' }}>{'[코지워커 SHOP] 송장이 등록되었습니다. CJ대한통운 #{운송장번호} · 코지워커 #{상품명}'}</div>
            </div>

            <div className="card" style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-primary)' }}>5. 사업자 승인 결과</div>
                <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>이메일</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--fg-secondary)', lineHeight: 1.5, background: 'var(--border-light)', padding: '10px', borderRadius: '6px' }}>{'사업자 #{상호} 가입이 승인되었습니다. 분류 #{사업자유형 — 복지용구사업소/인터넷 사업소/재가복지센터/기타} · 도매가 즉시 적용'}</div>
            </div>
          </div>

          <div className="sec-divider" style={{ width: '560px' }}></div>

          <div className="sec-title">발송 이력</div>

          <div style={{ width: '100%', maxWidth: '760px' }}>
            {historyState.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--fg-muted)', padding: '16px 0' }}>발송된 알림 이력이 없습니다.</div>
            ) : (
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>발송 시각</th>
                    <th>대상 이벤트</th>
                    <th>채널</th>
                    <th>템플릿</th>
                    <th>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {historyState.map((n) => (
                    <tr key={n.id}>
                      <td>{n.sentAt}</td>
                      <td>{n.audience}</td>
                      <td><span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>{n.channelLabel}</span></td>
                      <td>{n.template}</td>
                      <td style={{ color: 'var(--fg-muted)' }}>{n.memo || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <button className="btn btn-primary save-btn" style={{ width: '120px', height: '44px' }} onClick={save}>저장</button>
        </div>
      </div>

      <div className="modal-overlay" id="unsavedModal" style={{ display: openModals.unsavedModal ? 'flex' : 'none' }}>
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#FFF8EE' }}><i className="icon-alert-triangle" style={{ color: '#FF9500', fontSize: '24px' }}></i></div>
          <div className="modal-title">저장하지 않은 변경사항이 있습니다</div>
          <div className="modal-desc">이 페이지를 떠나면 변경사항이 사라집니다.<br />정말 나가시겠습니까?</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('unsavedModal')}>나가기</button>
            <button className="btn btn-dark" onClick={() => closeModal('unsavedModal')}>저장 후 나가기</button>
          </div>
        </div>
      </div>
      <div className="modal-overlay" id="logoutModal" style={{ display: openModals.logoutModal ? 'flex' : 'none' }}>
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#F3F4F6' }}><i className="icon-log-out" style={{ color: '#4B5563', fontSize: '24px' }}></i></div>
          <div className="modal-title">로그아웃 하시겠습니까?</div>
          <div className="modal-desc">다시 로그인이 필요합니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('logoutModal')}>취소</button>
            <button className="btn btn-dark" onClick={doLogout}>로그아웃</button>
          </div>
        </div>
      </div>
      <div className="modal-overlay" id="deleteModal" style={{ display: openModals.deleteModal ? 'flex' : 'none' }}>
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}><i className="icon-trash-2" style={{ color: '#FF3B30', fontSize: '24px' }}></i></div>
          <div className="modal-title">정말 삭제하시겠습니까?</div>
          <div className="modal-desc">삭제된 데이터는 복구할 수 없습니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('deleteModal')}>취소</button>
            <button className="btn btn-danger" onClick={() => closeModal('deleteModal')}>삭제</button>
          </div>
        </div>
      </div>
      <div className="modal-overlay" id="successModal" style={{ display: openModals.successModal ? 'flex' : 'none' }}>
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#EEFBF0' }}><i className="icon-check-circle" style={{ color: '#34C759', fontSize: '24px' }}></i></div>
          <div className="modal-title">{successTitle}</div>
          <div className="modal-desc">{successDesc}</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('successModal')}>닫기</button>
            <button className="btn btn-primary" onClick={() => closeModal('successModal')}>확인</button>
          </div>
        </div>
      </div>
      <div className="modal-overlay" id="errorModal" style={{ display: openModals.errorModal ? 'flex' : 'none' }}>
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}><i className="icon-alert-circle" style={{ color: '#FF3B30', fontSize: '24px' }}></i></div>
          <div className="modal-title">일시적인 오류가 발생했습니다</div>
          <div className="modal-desc">서비스 이용 중 오류가 발생했습니다.<br />잠시 후 다시 시도해주세요.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('errorModal')}>닫기</button>
            <button className="btn btn-danger" onClick={() => closeModal('errorModal')}>다시 시도</button>
          </div>
        </div>
      </div>
    </>
  );
}
