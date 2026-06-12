'use client';

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@prisma/client';

type TabName = 'account' | 'password' | 'history';

export type MyInfo = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  roleLabel: string;
};

export type LoginHistoryEntry = {
  id: number;
  ip: string | null;
  at: string;
};

type Props = { info: MyInfo; loginLogs: LoginHistoryEntry[] };

const BASE = '/cozycare';

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function formatTel(value: string): string {
  const pattern: number[] = [3, 4, 4];
  const maxDigits: number = pattern.reduce((a, b) => a + b, 0);
  const digits: string = value.replace(/\D/g, '').slice(0, maxDigits);
  let out = '';
  let i = 0;
  for (const seg of pattern) {
    if (i >= digits.length) break;
    const take = digits.slice(i, i + seg);
    out += (out ? '-' : '') + take;
    i += seg;
  }
  return out;
}

export default function MyInfoClient({ info, loginLogs }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('account');
  const [name, setName] = useState<string>(info.name);
  const [email, setEmail] = useState<string>(info.email);
  const [contactTel, setContactTel] = useState<string>(formatTel(info.phone));
  const [currentPw, setCurrentPw] = useState<string>('');
  const [newPw, setNewPw] = useState<string>('');
  const [confirmPw, setConfirmPw] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  const [unsavedOpen, setUnsavedOpen] = useState<boolean>(false);
  const [logoutOpen, setLogoutOpen] = useState<boolean>(false);

  const handleTelChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setContactTel(formatTel(e.target.value));
  };

  const showSuccess = (title: string, desc: string): void => {
    setToast({ title, desc });
    window.setTimeout(() => setToast(null), 2500);
  };

  const closeModal = (name: string): void => {
    if (name === 'unsavedModal') setUnsavedOpen(false);
    if (name === 'logoutModal') setLogoutOpen(false);
  };

  const doLogout = async (): Promise<void> => {
    setLogoutOpen(false);
    await fetch(`${BASE}/api/auth/logout`, { method: 'POST' });
    window.location.href = '/admin/login';
  };

  const saveAccount = async (): Promise<void> => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/users/${info.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: contactTel || null,
        }),
      });
      if (!res.ok) {
        showSuccess('저장에 실패했습니다', '잠시 후 다시 시도해 주세요.');
        return;
      }
      showSuccess('저장이 완료되었습니다', '변경 사항이 저장되었습니다.');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (): Promise<void> => {
    if (!currentPw) {
      showSuccess('비밀번호를 확인해 주세요', '현재 비밀번호를 입력해 주세요.');
      return;
    }
    if (!newPw || newPw !== confirmPw) {
      showSuccess('비밀번호를 확인해 주세요', '새 비밀번호가 일치하지 않습니다.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/me/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        if (data?.error === 'invalid_current_password') {
          showSuccess('비밀번호를 확인해 주세요', '현재 비밀번호가 올바르지 않습니다.');
          return;
        }
        showSuccess('저장에 실패했습니다', '잠시 후 다시 시도해 주세요.');
        return;
      }
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      showSuccess('저장이 완료되었습니다', '비밀번호가 변경되었습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (): void => {
    if (saving) return;
    if (activeTab === 'password') {
      void savePassword();
    } else {
      void saveAccount();
    }
  };

  return (
    <>
      <style>{`
        .info-layout{display:flex;flex:1;overflow:hidden}
        .info-body{flex:1;overflow-y:auto;padding:28px 32px;display:flex;flex-direction:column;gap:28px}
        .info-section h2{font-size:16px;font-weight:700;color:var(--fg-primary);margin-bottom:4px}
        .info-section .section-desc{font-size:13px;color:var(--fg-muted);margin-bottom:20px}
        .info-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px 24px}
        .info-form-grid .full{grid-column:1/-1}
        .file-upload-area{display:flex;gap:16px}
        .file-upload-card{width:160px;height:100px;border:1px dashed var(--border);border-radius:var(--radius-sm);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:12px;color:var(--fg-muted);cursor:pointer;transition:border-color .15s}
        .file-upload-card:hover{border-color:var(--accent)}
        .file-upload-card .upload-icon{font-size:20px;color:var(--fg-muted)}
        .file-upload-card .upload-ext{font-size:11px;color:var(--fg-muted)}
        .bottom-bar .progress-bar{width:200px}
      `}</style>

      <div className="top-bar">
        <div className="top-bar-left">
          <h1>내 정보</h1>
          <p>관리자 계정 정보 및 비밀번호</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon"></i><input type="text" placeholder="검색.." /></div>
          <div className="bell-wrapper">
            <button className="bell-btn" onClick={() => { window.location.href = '/admin/shipping'; }}><i className="icon-bell" style={{ color: '#4B5563', fontSize: '18px' }}></i><span className="bell-dot"></span></button>
          </div>
        </div>
      </div>

      <div className="info-layout">
        <div style={{ width: '240px', padding: '20px', borderRight: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-card)' }}>
          <div className="sub-nav" style={{ width: '100%' }}>
            <div
              className={`sub-nav-item${activeTab === 'account' ? ' active' : ''}`}
              data-tab="account"
              onClick={(e) => { e.stopPropagation(); setActiveTab('account'); }}
            >
              <i className="icon-user sub-nav-icon"></i> 계정 정보
            </div>
            <div
              className={`sub-nav-item${activeTab === 'password' ? ' active' : ''}`}
              data-tab="password"
              onClick={(e) => { e.stopPropagation(); setActiveTab('password'); }}
            >
              <i className="icon-lock sub-nav-icon"></i> 비밀번호 변경
            </div>
            <div
              className={`sub-nav-item${activeTab === 'history' ? ' active' : ''}`}
              data-tab="history"
              onClick={(e) => { e.stopPropagation(); setActiveTab('history'); }}
            >
              <i className="icon-history sub-nav-icon"></i> 로그인 이력
            </div>
          </div>
        </div>

        <div className="info-body" data-tab-panel="account" style={{ display: activeTab === 'account' ? '' : 'none' }}>
          <div className="info-section">
            <h2>계정 정보</h2>
            <div className="section-desc">관리자 계정의 기본 정보입니다</div>

            <div className="info-form-grid">
              <div className="form-group">
                <label className="form-label">이름 <span className="required">*</span></label>
                <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">이메일 <span className="required">*</span></label>
                <input className="form-input" type="email" id="contactEmail" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">역할</label>
                <input className="form-input" value={info.roleLabel} readOnly style={{ background: 'var(--bg-secondary)', color: 'var(--fg-secondary)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">연락처 <span className="required">*</span></label>
                <input
                  className="form-input"
                  id="contactTel"
                  inputMode="numeric"
                  maxLength={13}
                  value={contactTel}
                  onChange={handleTelChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="info-body" data-tab-panel="password" style={{ display: activeTab === 'password' ? '' : 'none' }}>
          <div className="info-section">
            <h2>비밀번호 변경</h2>
            <div className="section-desc">보안을 위해 정기적으로 비밀번호를 변경해 주세요</div>

            <div className="info-form-grid">
              <div className="form-group full">
                <label className="form-label">현재 비밀번호 <span className="required">*</span></label>
                <input className="form-input" type="password" placeholder="현재 비밀번호 입력" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
              </div>
              <div className="form-group full">
                <label className="form-label">새 비밀번호 <span className="required">*</span></label>
                <input className="form-input" type="password" placeholder="영문 + 숫자 + 특수문자 조합 8자 이상" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
              </div>
              <div className="form-group full">
                <label className="form-label">새 비밀번호 확인 <span className="required">*</span></label>
                <input className="form-input" type="password" placeholder="새 비밀번호 다시 입력" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="info-body" data-tab-panel="history" style={{ display: activeTab === 'history' ? '' : 'none' }}>
          <div className="info-section">
            <h2>최근 로그인 이력</h2>
            <div className="section-desc">최근 5건의 로그인 기록입니다</div>

            <div className="table-wrap" style={{ marginTop: '8px' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>일시</th>
                    <th>IP 주소</th>
                  </tr>
                </thead>
                <tbody>
                  {loginLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="font-mono">{formatDateTime(log.at)}</td>
                      <td className="font-mono">{log.ip ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-bar" id="bottomBar">
        <div></div>
        <div style={{ display: 'flex', gap: '12px' }} id="bottomActions">
          <button className="btn btn-secondary" id="btnCancel" onClick={() => router.refresh()}>취소</button>
          <button
            className="btn btn-primary"
            id="btnSave"
            disabled={saving}
            onClick={handleSave}
          >
            <i className="icon-check" style={{ fontSize: '14px' }}></i> 저장하기
          </button>
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
            padding: '14px 18px',
            minWidth: '260px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-primary)' }}>{toast.title}</div>
          <div style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '4px' }}>{toast.desc}</div>
        </div>
      )}

      <div className="modal-overlay" id="unsavedModal" style={{ display: unsavedOpen ? 'flex' : 'none' }}>
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#FFF8EE' }}>
            <i className="icon-alert-triangle" style={{ color: '#FF9500', fontSize: '24px' }}></i>
          </div>
          <div className="modal-title">저장하지 않은 변경사항이 있습니다</div>
          <div className="modal-desc">이 페이지를 떠나면 변경사항이 사라집니다.<br />정말 나가시겠습니까?</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('unsavedModal')}>나가기</button>
            <button className="btn btn-dark" onClick={() => closeModal('unsavedModal')}>저장 후 나가기</button>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="logoutModal" style={{ display: logoutOpen ? 'flex' : 'none' }}>
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#F3F4F6' }}>
            <i className="icon-log-out" style={{ color: '#4B5563', fontSize: '24px' }}></i>
          </div>
          <div className="modal-title">로그아웃 하시겠습니까?</div>
          <div className="modal-desc">다시 로그인이 필요합니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('logoutModal')}>취소</button>
            <button className="btn btn-dark" onClick={() => void doLogout()}>로그아웃</button>
          </div>
        </div>
      </div>
    </>
  );
}
