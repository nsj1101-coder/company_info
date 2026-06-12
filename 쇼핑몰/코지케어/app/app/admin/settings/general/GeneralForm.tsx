'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export type GeneralValues = {
  companyName: string;
  owner: string;
  bizNo: string;
  address: string;
  phone: string;
  csEmail: string;
  weekdayHours: string;
  saturdayHours: string;
  holiday: string;
  salesReportNo: string;
  welfareLicenseNo: string;
  privacyOfficer: string;
};

type Props = { initial: GeneralValues };

const KEY_MAP: Record<keyof GeneralValues, string> = {
  companyName: 'general.companyName',
  owner: 'general.owner',
  bizNo: 'general.bizNo',
  address: 'general.address',
  phone: 'general.phone',
  csEmail: 'general.csEmail',
  weekdayHours: 'general.weekdayHours',
  saturdayHours: 'general.saturdayHours',
  holiday: 'general.holiday',
  salesReportNo: 'general.salesReportNo',
  welfareLicenseNo: 'general.welfareLicenseNo',
  privacyOfficer: 'general.privacyOfficer',
};

export default function GeneralForm({ initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<GeneralValues>(initial);
  const [openModals, setOpenModals] = useState<Record<string, boolean>>({
    unsavedModal: false,
    logoutModal: false,
    deleteModal: false,
    successModal: false,
    errorModal: false,
  });

  const openModal = (id: string): void => {
    setOpenModals((prev) => ({ ...prev, [id]: true }));
  };

  const closeModal = (id: string): void => {
    setOpenModals((prev) => ({ ...prev, [id]: false }));
  };

  const doLogout = (): void => {
    closeModal('logoutModal');
  };

  const setField = (field: keyof GeneralValues, value: string): void => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const save = async (): Promise<void> => {
    const items = (Object.keys(KEY_MAP) as (keyof GeneralValues)[]).map((field) => ({
      key: KEY_MAP[field],
      value: values[field],
      scope: 'general',
    }));
    const res = await fetch('/cozycare/api/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items }),
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
        .f-curr{display:flex;align-items:center;justify-content:space-between}
        .f-curr .curr-change{color:var(--accent);font-size:14px;font-weight:500;background:none;border:none;cursor:pointer}
        .toggle-sec{display:flex;align-items:center;justify-content:space-between;width:100%}
        .toggle-sec .tg-lbl{font-size:14px;font-weight:500;color:var(--fg-primary)}
        .toggle-sec .tg-desc{font-size:13px;color:var(--fg-muted);margin-top:2px}
        .save-btn{width:180px;height:44px;font-size:16px}

        .divider{width:480px;height:1px;background:var(--border)}
        .sys-title{font-size:18px;font-weight:700;color:var(--fg-primary)}
        .sys-fields{width:480px;display:flex;flex-direction:column}
        .sys-row{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid var(--border-light)}
        .sys-row:last-child{border-bottom:none}
        .sys-row .sr-tit{font-size:14px;font-weight:600;color:var(--fg-primary)}
        .sys-row .sr-desc{font-size:13px;color:var(--fg-muted);margin-top:4px}
      `}</style>

      <div className="settings-wrap">
        <nav className="cat-nav">
          <Link className="cat-item" href="/admin/settings"><i className="icon-home"></i><span>설정 메인</span></Link>
          <Link className="cat-item active" href="/admin/settings/general"><i className="icon-globe"></i><span>일반 설정</span></Link>
          <Link className="cat-item" href="/admin/settings/data"><i className="icon-database"></i><span>데이터 관리</span></Link>
          <Link className="cat-item" href="/admin/settings/shipping"><i className="icon-bell"></i><span>알림 설정</span></Link>
          <Link className="cat-item" href="/admin/settings/permission"><i className="icon-shield"></i><span>권한 관리</span></Link>
        </nav>

        <div className="form-area">
          <div className="form-title">
            <h2>회사 정보</h2>
            <p>코지워커 SHOP 사이트 푸터와 거래명세서에 표기됩니다</p>
          </div>

          <div className="form-fields">
            <div className="form-group">
              <label className="form-label">회사명</label>
              <input className="form-input" type="text" value={values.companyName} onChange={(e) => setField('companyName', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">대표자</label>
              <input className="form-input" type="text" value={values.owner} onChange={(e) => setField('owner', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">사업자등록번호</label>
              <input className="form-input" type="text" value={values.bizNo} onChange={(e) => setField('bizNo', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">주소</label>
              <input className="form-input" type="text" value={values.address} onChange={(e) => setField('address', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">대표 전화</label>
              <input className="form-input" type="tel" value={values.phone} onChange={(e) => setField('phone', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">CS 이메일</label>
              <input className="form-input" type="email" value={values.csEmail} onChange={(e) => setField('csEmail', e.target.value)} />
            </div>
          </div>

          <div className="divider"></div>

          <div className="sys-title">운영 시간</div>

          <div className="form-fields">
            <div className="form-group">
              <label className="form-label">평일 운영시간</label>
              <input className="form-input" type="text" value={values.weekdayHours} onChange={(e) => setField('weekdayHours', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">토요일 운영시간</label>
              <input className="form-input" type="text" value={values.saturdayHours} onChange={(e) => setField('saturdayHours', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">휴무</label>
              <input className="form-input" type="text" value={values.holiday} onChange={(e) => setField('holiday', e.target.value)} />
            </div>
          </div>

          <div className="divider"></div>

          <div className="sys-title">푸터 회사 정보</div>

          <div className="form-fields">
            <div className="form-group">
              <label className="form-label">통신판매업 신고번호</label>
              <input className="form-input" type="text" value={values.salesReportNo} onChange={(e) => setField('salesReportNo', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">복지용구사업소 지정번호</label>
              <input className="form-input" type="text" value={values.welfareLicenseNo} onChange={(e) => setField('welfareLicenseNo', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">개인정보 책임자</label>
              <input className="form-input" type="text" value={values.privacyOfficer} onChange={(e) => setField('privacyOfficer', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" style={{ width: '120px', height: '44px' }} onClick={() => setValues(initial)}>취소</button>
            <button className="btn btn-primary save-btn" onClick={save}>저장</button>
          </div>
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
