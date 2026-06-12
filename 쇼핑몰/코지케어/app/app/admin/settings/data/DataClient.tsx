'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ModalKey = 'unsavedModal' | 'logoutModal' | 'deleteModal' | 'successModal' | 'errorModal';

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
.f-row{display:flex;align-items:center;justify-content:space-between}
.f-row .f-change{color:var(--accent);font-size:14px;font-weight:500;background:none;border:none;cursor:pointer}
.toggle-sec{display:flex;align-items:center;justify-content:space-between;width:100%}
.toggle-sec .tg-lbl{font-size:14px;font-weight:500;color:var(--fg-primary)}
.toggle-sec .tg-desc{font-size:13px;color:var(--fg-muted);margin-top:2px}
.save-btn{width:180px;height:44px}
`;

export type BackupConfig = {
  cycle: string;
  retention: string;
  enabled: boolean;
  lastBackupAt: string;
};

type Props = { config: BackupConfig };

export default function DataClient({ config }: Props) {
  const router = useRouter();
  const [openModals, setOpenModals] = useState<Record<ModalKey, boolean>>({
    unsavedModal: false,
    logoutModal: false,
    deleteModal: false,
    successModal: false,
    errorModal: false,
  });
  const [successTitle, setSuccessTitle] = useState<string>('저장이 완료되었습니다');
  const [successDesc, setSuccessDesc] = useState<string>('변경사항이 정상적으로 반영되었습니다.');
  const [cycle, setCycle] = useState<string>(config.cycle);
  const [retention, setRetention] = useState<string>(config.retention);
  const [autoBackupActive, setAutoBackupActive] = useState<boolean>(config.enabled);

  const openModal = (key: ModalKey): void => {
    setOpenModals((prev) => ({ ...prev, [key]: true }));
  };

  const closeModal = (key: ModalKey): void => {
    setOpenModals((prev) => ({ ...prev, [key]: false }));
  };

  const showSuccess = (title: string, desc: string): void => {
    setSuccessTitle(title);
    setSuccessDesc(desc);
    openModal('successModal');
  };

  const doLogout = (): void => {
    closeModal('logoutModal');
    window.location.href = '/admin/login';
  };

  const toggleAutoBackup = (): void => {
    setAutoBackupActive((prev) => !prev);
  };

  const downloadFile = async (url: string): Promise<boolean> => {
    const res = await fetch(url, { method: url.includes('/backup') ? 'POST' : 'GET' });
    if (!res.ok) return false;
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match ? match[1] : 'download.xlsx';
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objectUrl);
    return true;
  };

  const runBackup = async (): Promise<void> => {
    const ok = await downloadFile('/cozycare/api/settings/backup');
    if (ok) {
      showSuccess('백업이 완료되었습니다', '백업 파일이 다운로드되었습니다.');
      router.refresh();
    } else {
      openModal('errorModal');
    }
  };

  const exportData = async (type: 'products' | 'orders' | 'members'): Promise<void> => {
    const ok = await downloadFile(`/cozycare/api/settings/export?type=${type}`);
    if (!ok) openModal('errorModal');
  };

  const saveConfig = async (): Promise<void> => {
    const res = await fetch('/cozycare/api/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items: [
          { key: 'data.backupCycle', value: cycle, scope: 'data' },
          { key: 'data.backupRetention', value: retention, scope: 'data' },
          { key: 'data.autoBackupEnabled', value: String(autoBackupActive), scope: 'data' },
        ],
      }),
    });
    if (res.ok) {
      showSuccess('저장이 완료되었습니다', '변경 사항이 저장되었습니다.');
      router.refresh();
    } else {
      openModal('errorModal');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="top-bar">
        <div className="top-bar-left">
          <h1>데이터 관리</h1>
          <p>백업·복구·내보내기</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon"></i><input type="text" placeholder="설정 검색..." /></div>
          <div className="bell-wrapper">
            <button className="bell-btn"><i className="icon-bell" style={{ color: '#4B5563', fontSize: 18 }}></i><span className="bell-dot"></span></button>
            <div className="noti-dropdown">
              <div className="noti-header"><span className="noti-title">알림</span><span className="noti-read-all">모두 읽음</span></div>
              <div className="noti-item unread"><div className="noti-dot" style={{ background: '#84c140' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#EEFBF0', color: '#84c140' }}>서류 검토 대기</span><span className="noti-time">10분 전</span><div className="noti-text">복지용구 인정번호 7건 검토 대기</div></div></div>
              <div className="noti-item unread"><div className="noti-dot" style={{ background: '#34C759' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#EEFBF0', color: '#34C759' }}>사업자 승인</span><span className="noti-time">1시간 전</span><div className="noti-text">파주실버케어 사업자 가입 요청</div></div></div>
              <div className="noti-item"><div className="noti-dot" style={{ background: '#FF9500' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#FFF8EE', color: '#FF9500' }}>출고 알림</span><span className="noti-time">3시간 전</span><div className="noti-text">코지워커 클래식 24건 출고 완료</div></div></div>
              <Link href="/admin/shipping" className="noti-footer">알림 센터 전체 보기 →</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-wrap">
        <nav className="cat-nav">
          <Link className="cat-item" href="/admin/settings"><i className="icon-home"></i><span>설정 메인</span></Link>
          <Link className="cat-item" href="/admin/settings/general"><i className="icon-globe"></i><span>일반 설정</span></Link>
          <Link className="cat-item active" href="/admin/settings/data"><i className="icon-database"></i><span>데이터 관리</span></Link>
          <Link className="cat-item" href="/admin/settings/shipping"><i className="icon-bell"></i><span>알림 설정</span></Link>
          <Link className="cat-item" href="/admin/settings/permission"><i className="icon-shield"></i><span>권한 관리</span></Link>
        </nav>

        <div className="form-area">
          <div className="form-title">
            <h2>자동 백업 설정</h2>
            <p>일정에 따라 데이터베이스를 자동 백업합니다</p>
          </div>

          <div className="form-fields">
            <div className="form-group">
              <label className="form-label">백업 주기</label>
              <select className="form-select" value={cycle} onChange={(e) => setCycle(e.target.value)}>
                <option>매일 03:00</option>
                <option>매주 일요일 03:00</option>
                <option>매월 1일 03:00</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">보관 기간</label>
              <select className="form-select" value={retention} onChange={(e) => setRetention(e.target.value)}>
                <option>12개월</option>
                <option>6개월</option>
                <option>3개월</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">마지막 자동 백업</label>
              <div className="form-input"><span>{config.lastBackupAt}</span></div>
            </div>

            <div className="toggle-sec">
              <div>
                <div className="tg-lbl">자동 백업 사용</div>
                <div className="tg-desc">설정된 주기에 따라 자동으로 백업합니다</div>
              </div>
              <div className={`toggle-switch${autoBackupActive ? ' active' : ''}`} onClick={toggleAutoBackup}></div>
            </div>
          </div>

          <div className="divider" style={{ width: 480, height: 1, background: 'var(--border)' }}></div>

          <div className="form-title">
            <h2>수동 백업 / 복구</h2>
            <p>즉시 백업 실행 또는 백업 파일로부터 복구합니다</p>
          </div>

          <div className="form-fields">
            <div className="form-group">
              <label className="form-label">수동 백업 실행</label>
              <div className="form-input f-row">
                <span>지금 백업 실행 (예상 소요 1분 30초)</span>
                <button className="f-change" type="button" onClick={runBackup}>실행</button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">백업 파일에서 복구</label>
              <div className="form-input f-row">
                <span>cozycare_2026-06-08_0300.sql.gz</span>
                <button className="f-change" type="button">복구</button>
              </div>
            </div>
          </div>

          <div className="divider" style={{ width: 480, height: 1, background: 'var(--border)' }}></div>

          <div className="form-title">
            <h2>데이터 내보내기</h2>
            <p>상품 / 주문 / 회원 데이터를 CSV·XLSX로 내보냅니다</p>
          </div>

          <div className="form-fields">
            <div className="form-group">
              <label className="form-label">상품 데이터 (코지워커 8종)</label>
              <div className="form-input f-row">
                <span>CSV / XLSX</span>
                <button className="f-change" type="button" onClick={() => exportData('products')}>내보내기</button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">주문 데이터 (복지용구·일반·사업자)</label>
              <div className="form-input f-row">
                <span>CSV / XLSX</span>
                <button className="f-change" type="button" onClick={() => exportData('orders')}>내보내기</button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">회원 데이터 (일반·사업자 4종)</label>
              <div className="form-input f-row">
                <span>CSV / XLSX</span>
                <button className="f-change" type="button" onClick={() => exportData('members')}>내보내기</button>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary save-btn"
            onClick={saveConfig}
          >
            저장
          </button>
        </div>
      </div>

      <div className={`modal-overlay${openModals.unsavedModal ? ' active' : ''}`} id="unsavedModal">
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

      <div className={`modal-overlay${openModals.logoutModal ? ' active' : ''}`} id="logoutModal">
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

      <div className={`modal-overlay${openModals.deleteModal ? ' active' : ''}`} id="deleteModal">
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

      <div className={`modal-overlay${openModals.successModal ? ' active' : ''}`} id="successModal">
        <div className="modal-content" style={{ width: 400 }}>
          <div className="modal-icon" style={{ background: '#EEFBF0' }}><i className="icon-check-circle" style={{ color: '#34C759', fontSize: 24 }}></i></div>
          <div className="modal-title">{successTitle}</div>
          <div className="modal-desc">{successDesc}</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('successModal')}>닫기</button>
            <button className="btn btn-primary" onClick={() => closeModal('successModal')}>확인</button>
          </div>
        </div>
      </div>

      <div className={`modal-overlay${openModals.errorModal ? ' active' : ''}`} id="errorModal">
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
