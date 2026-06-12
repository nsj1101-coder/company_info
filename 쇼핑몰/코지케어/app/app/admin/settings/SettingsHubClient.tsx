'use client';

import Link from 'next/link';
import { useState } from 'react';

const pageStyles = `
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
.form-fields{width:480px;max-width:100%;display:flex;flex-direction:column;gap:20px}
.f-pw{display:flex;align-items:center;justify-content:space-between}
.f-pw .pw-change{color:var(--accent);font-size:14px;font-weight:500;background:none;border:none;cursor:pointer}
.toggle-sec{display:flex;align-items:center;justify-content:space-between;width:100%}
.toggle-sec .tg-lbl{font-size:14px;font-weight:500;color:var(--fg-primary)}
.toggle-sec .tg-desc{font-size:13px;color:var(--fg-muted);margin-top:2px}
.save-btn{width:120px;height:44px}
`;

type ModalKey = 'unsavedModal' | 'logoutModal' | 'deleteModal' | 'successModal' | 'errorModal' | null;

export type SettingEntry = { key: string; value: string; scope: string };

type Props = { settings: SettingEntry[] };

export default function SettingsHubClient({ settings }: Props) {
  const [openModalKey, setOpenModalKey] = useState<ModalKey>(null);
  const [items, setItems] = useState<SettingEntry[]>(settings);
  const [newKey, setNewKey] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');

  const closeModal = (_key: Exclude<ModalKey, null>): void => setOpenModalKey(null);
  const doLogout = (): void => setOpenModalKey(null);

  const isOpen = (key: Exclude<ModalKey, null>): string =>
    openModalKey === key ? 'modal-overlay active' : 'modal-overlay';

  const updateLocal = (key: string, value: string): void => {
    setItems((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const saveAll = async (): Promise<void> => {
    setSubmitting(true);
    setFeedback('');
    try {
      const payload = items
        .map(({ key, value, scope }) => ({ key, value, scope }))
        .concat(newKey ? [{ key: newKey, value: newValue, scope: 'global' }] : []);
      const res = await fetch('/cozycare/api/settings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });
      if (res.ok) {
        setNewKey('');
        setNewValue('');
        setFeedback('저장되었습니다.');
      } else {
        setFeedback('저장 실패');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="panel" style={{ margin: '24px 32px', padding: 28 }}>
        <div className="form-title" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg-primary)', marginBottom: 4 }}>설정 메뉴</h2>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)' }}>관리할 설정 영역을 선택하세요</p>
        </div>

        <div style={{ marginBottom: 28, padding: 20, border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>KV 설정</div>
          {items.length === 0 && <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 12 }}>등록된 설정이 없습니다.</div>}
          {items.map((s) => (
            <div key={s.key} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <input
                value={s.key}
                readOnly
                style={{ width: 240, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-secondary)' }}
              />
              <input
                value={s.value}
                onChange={(e) => updateLocal(s.key, e.target.value)}
                style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6 }}
              />
              <span style={{ fontSize: 12, color: 'var(--fg-muted)', alignSelf: 'center' }}>{s.scope}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
            <input
              placeholder="새 키"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              style={{ width: 240, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6 }}
            />
            <input
              placeholder="새 값"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
            <button type="button" className="btn btn-dark" onClick={saveAll} disabled={submitting}>
              {submitting ? '저장 중...' : '저장'}
            </button>
            {feedback && <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{feedback}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          <Link href="/admin/settings/general" className="card" style={{ padding: 20, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="icon-globe" style={{ color: 'var(--accent)', fontSize: 20 }}></i></div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-primary)' }}>일반 설정</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5 }}>상호, 대표, 사업자번호, 주소, 대표 전화, 운영시간 등 사이트 기본 정보</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 'auto' }}>마지막 수정 2026.06.02</div>
          </Link>

          <Link href="/admin/settings/data" className="card" style={{ padding: 20, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="icon-database" style={{ color: 'var(--accent)', fontSize: 20 }}></i></div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-primary)' }}>데이터 관리</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5 }}>자동/수동 백업, 복구, 상품·주문·회원 CSV/XLSX 내보내기</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 'auto' }}>마지막 수정 2026.06.05</div>
          </Link>

          <Link href="/admin/settings/shipping" className="card" style={{ padding: 20, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="icon-bell" style={{ color: 'var(--accent)', fontSize: 20 }}></i></div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-primary)' }}>알림 설정</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5 }}>이메일(SMTP), 카카오 알림톡, SMS 채널 및 템플릿 5종 관리</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 'auto' }}>마지막 수정 2026.06.06</div>
          </Link>

          <Link href="/admin/settings/permission" className="card" style={{ padding: 20, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="icon-shield" style={{ color: 'var(--accent)', fontSize: 20 }}></i></div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-primary)' }}>권한 관리</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5 }}>관리자 계정과 역할(최고관리자/주문매니저/검토자/상품매니저/CS) 매트릭스</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 'auto' }}>마지막 수정 2026.06.07</div>
          </Link>
        </div>
      </div>

      <div className={isOpen('unsavedModal')} id="unsavedModal">
        <div className="modal-content" style={{ width: 400 }}>
          <div className="modal-icon" style={{ background: '#FFF8EE' }}><i className="icon-alert-triangle" style={{ color: '#FF9500', fontSize: 24 }}></i></div>
          <div className="modal-title">저장하지 않은 변경사항이 있습니다</div>
          <div className="modal-desc">이 페이지를 떠나면 변경사항이 사라집니다.<br />정말 나가시겠습니까?</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('unsavedModal')}>나가기</button>
            <button className="btn btn-dark" onClick={() => closeModal('unsavedModal')}>저장 후 나가기</button>
          </div>
        </div>
      </div>

      <div className={isOpen('logoutModal')} id="logoutModal">
        <div className="modal-content" style={{ width: 400 }}>
          <div className="modal-icon" style={{ background: '#F3F4F6' }}><i className="icon-log-out" style={{ color: '#4B5563', fontSize: 24 }}></i></div>
          <div className="modal-title">로그아웃 하시겠습니까?</div>
          <div className="modal-desc">다시 로그인이 필요합니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('logoutModal')}>취소</button>
            <button className="btn btn-dark" onClick={doLogout}>로그아웃</button>
          </div>
        </div>
      </div>

      <div className={isOpen('deleteModal')} id="deleteModal">
        <div className="modal-content" style={{ width: 400 }}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}><i className="icon-trash-2" style={{ color: '#FF3B30', fontSize: 24 }}></i></div>
          <div className="modal-title">정말 삭제하시겠습니까?</div>
          <div className="modal-desc">삭제된 데이터는 복구할 수 없습니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('deleteModal')}>취소</button>
            <button className="btn btn-danger" onClick={() => closeModal('deleteModal')}>삭제</button>
          </div>
        </div>
      </div>

      <div className={isOpen('successModal')} id="successModal">
        <div className="modal-content" style={{ width: 400 }}>
          <div className="modal-icon" style={{ background: '#EEFBF0' }}><i className="icon-check-circle" style={{ color: '#34C759', fontSize: 24 }}></i></div>
          <div className="modal-title">저장이 완료되었습니다</div>
          <div className="modal-desc">변경사항이 정상적으로 반영되었습니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('successModal')}>닫기</button>
            <button className="btn btn-primary" onClick={() => closeModal('successModal')}>확인</button>
          </div>
        </div>
      </div>

      <div className={isOpen('errorModal')} id="errorModal">
        <div className="modal-content" style={{ width: 400 }}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}><i className="icon-alert-circle" style={{ color: '#FF3B30', fontSize: 24 }}></i></div>
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
