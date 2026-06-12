'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PERMISSION_LABELS, type MatrixRow, type RoleKey } from './permissionMatrix';

type ModalId = 'unsavedModal' | 'logoutModal' | 'deleteModal' | 'successModal' | 'errorModal';

export type AdminRow = {
  id: number;
  name: string;
  email: string;
  lastLoginAt: string;
};

type Props = {
  admins: AdminRow[];
  matrix: MatrixRow[];
  otpRequired: boolean;
};

const ROLE_COLUMNS: RoleKey[] = ['superadmin', 'ordermanager', 'reviewer', 'productmanager', 'cs'];

export default function PermissionClient({ admins, matrix, otpRequired }: Props) {
  const router = useRouter();
  const [openModals, setOpenModals] = useState<Record<string, boolean>>({
    unsavedModal: false,
    logoutModal: false,
    deleteModal: false,
    successModal: false,
    errorModal: false,
  });
  const [otpActive, setOtpActive] = useState<boolean>(otpRequired);
  const [matrixState, setMatrixState] = useState<MatrixRow[]>(matrix);

  const openModal = (id: string): void => {
    setOpenModals((prev) => ({ ...prev, [id]: true }));
  };

  const closeModal = (id: string): void => {
    setOpenModals((prev) => ({ ...prev, [id]: false }));
  };

  const doLogout = (): void => {
    closeModal('logoutModal');
  };

  const toggleCell = (rowIdx: number, role: RoleKey): void => {
    setMatrixState((prev) =>
      prev.map((row, i) => (i === rowIdx ? { ...row, [role]: !row[role] } : row))
    );
  };

  const save = async (): Promise<void> => {
    const res = await fetch('/cozycare/api/admin-roles', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ matrix: matrixState, otpRequired: otpActive }),
    });
    if (res.ok) {
      openModal('successModal');
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
        .form-fields{width:480px;max-width:100%;display:flex;flex-direction:column;gap:20px}
        .f-change{display:flex;align-items:center;justify-content:space-between}
        .f-change .change-btn{color:var(--accent);font-size:14px;font-weight:500;background:none;border:none;cursor:pointer}
        .toggle-sec{display:flex;align-items:center;justify-content:space-between;width:100%}
        .toggle-sec .tg-lbl{font-size:14px;font-weight:500;color:var(--fg-primary)}
        .toggle-sec .tg-desc{font-size:13px;color:var(--fg-muted);margin-top:2px}
        .save-btn{width:180px;height:44px;font-size:16px}
      `}</style>

      <div className="settings-wrap">
        <nav className="cat-nav">
          <Link className="cat-item" href="/admin/settings"><i className="icon-home"></i><span>설정 메인</span></Link>
          <Link className="cat-item" href="/admin/settings/general"><i className="icon-globe"></i><span>일반 설정</span></Link>
          <Link className="cat-item" href="/admin/settings/data"><i className="icon-database"></i><span>데이터 관리</span></Link>
          <Link className="cat-item" href="/admin/settings/shipping"><i className="icon-bell"></i><span>알림 설정</span></Link>
          <Link className="cat-item active" href="/admin/settings/permission"><i className="icon-shield"></i><span>권한 관리</span></Link>
        </nav>

        <div className="form-area" style={{ maxWidth: 'none' }}>
          <div className="form-title">
            <h2>관리자 목록</h2>
            <p>코지케어 관리자 계정 (총 {admins.length}명)</p>
          </div>

          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>역할</th>
                <th>최근 로그인</th>
                <th>상태</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.email}</td>
                  <td><span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>최고관리자</span></td>
                  <td>{a.lastLoginAt}</td>
                  <td><span style={{ color: '#34C759', fontWeight: 600 }}>활성</span></td>
                  <td><button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>수정</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <button className="btn btn-primary" style={{ padding: '8px 16px' }}><i className="icon-plus" style={{ fontSize: '14px', marginRight: '6px' }}></i>관리자 초대</button>
          </div>

          <div className="divider" style={{ width: '100%', height: '1px', background: 'var(--border)' }}></div>

          <div className="form-title">
            <h2>역할 매트릭스</h2>
            <p>역할별 권한 — 체크된 항목만 접근/조작 가능합니다</p>
          </div>

          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>권한</th>
                <th style={{ textAlign: 'center' }}>최고관리자</th>
                <th style={{ textAlign: 'center' }}>주문매니저</th>
                <th style={{ textAlign: 'center' }}>검토자</th>
                <th style={{ textAlign: 'center' }}>상품매니저</th>
                <th style={{ textAlign: 'center' }}>CS</th>
              </tr>
            </thead>
            <tbody>
              {matrixState.map((row, rowIdx) => (
                <tr key={PERMISSION_LABELS[rowIdx]}>
                  <td>{PERMISSION_LABELS[rowIdx]}</td>
                  {ROLE_COLUMNS.map((role) => (
                    <td key={role} style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={row[role]} onChange={() => toggleCell(rowIdx, role)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="toggle-sec" style={{ maxWidth: '560px' }}>
            <div>
              <div className="tg-lbl">2단계 인증 의무화</div>
              <div className="tg-desc">최고관리자·주문매니저·검토자 로그인 시 OTP 인증 요구</div>
            </div>
            <div className={`toggle-switch${otpActive ? ' active' : ''}`} onClick={() => setOtpActive((v) => !v)}></div>
          </div>

          <button className="btn btn-primary save-btn" onClick={save}>저장</button>
        </div>
      </div>

      <div className={`modal-overlay${openModals.unsavedModal ? ' active' : ''}`} id="unsavedModal">
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

      <div className={`modal-overlay${openModals.logoutModal ? ' active' : ''}`} id="logoutModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#F3F4F6' }}><i className="icon-log-out" style={{ color: '#4B5563', fontSize: '24px' }}></i></div>
          <div className="modal-title">로그아웃 하시겠습니까?</div>
          <div className="modal-desc">다시 로그인이 필요합니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('logoutModal')}>취소</button>
            <button className="btn btn-dark" onClick={() => doLogout()}>로그아웃</button>
          </div>
        </div>
      </div>

      <div className={`modal-overlay${openModals.deleteModal ? ' active' : ''}`} id="deleteModal">
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

      <div className={`modal-overlay${openModals.successModal ? ' active' : ''}`} id="successModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#EEFBF0' }}><i className="icon-check-circle" style={{ color: '#34C759', fontSize: '24px' }}></i></div>
          <div className="modal-title">저장이 완료되었습니다</div>
          <div className="modal-desc">변경사항이 정상적으로 반영되었습니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('successModal')}>닫기</button>
            <button className="btn btn-primary" onClick={() => closeModal('successModal')}>확인</button>
          </div>
        </div>
      </div>

      <div className={`modal-overlay${openModals.errorModal ? ' active' : ''}`} id="errorModal">
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
