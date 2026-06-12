'use client';

import { useRouter } from 'next/navigation';
import { useState, MouseEvent } from 'react';

type StatusFilter = 'all' | 'on' | 'off';
type ModalKey = 'agencyRegisterModal' | 'unsavedModal' | 'logoutModal' | 'deleteModal' | 'successModal' | 'errorModal' | null;

export type BizRow = {
  id: number;
  name: string;
  manager: string;
  type: string;
  bizNum: string;
  date: string;
  sales: string;
  point: string;
  status: 'on' | 'off';
  statusLabel: string;
};

export type TypeCounts = {
  welfare_shop: number;
  internet_shop: number;
  home_care: number;
  etc: number;
};

const pageStyles = `
.sidebar-user .su-av{width:36px;height:36px;border-radius:50%;background:var(--fg-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;flex-shrink:0}
.su-name-row{display:flex;align-items:center;gap:6px}
.su-name{font-size:13px;font-weight:600;color:var(--fg-primary)}
.su-tag{background:var(--accent-light);color:var(--accent);font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px}
.su-mail{font-size:12px;color:var(--fg-muted);margin-top:2px}

.bot-area{display:flex;flex:1;min-height:0;overflow:hidden}
.filter-side{width:240px;flex-shrink:0;background:var(--bg-card);border-right:1px solid var(--border);display:flex;flex-direction:column;gap:16px;padding:20px;overflow-y:auto}
.filter-side .add-btn{width:100%;background:var(--fg-primary);color:var(--fg-inverse);border:none;border-radius:var(--radius-sm);padding:12px 20px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;font-weight:600;cursor:pointer}
.filter-side .add-btn i{font-size:16px}
.seg-tab{display:flex;border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden}
.seg-tab .st{flex:1;height:36px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:var(--fg-secondary);background:var(--bg-card);cursor:pointer;border-left:1px solid var(--border)}
.seg-tab .st:first-child{border-left:none}
.seg-tab .st.active{background:var(--accent);color:var(--fg-inverse);font-weight:600}
.region-sec{display:flex;flex-direction:column;gap:10px}
.region-sec .rg-title{font-size:14px;font-weight:600;color:var(--fg-primary)}
.region-sec .rg-row{display:flex;align-items:center;justify-content:space-between}
.region-sec .rg-row .rg-l{font-size:14px;color:var(--fg-secondary)}
.region-sec .rg-row .rg-v{font-family:var(--font-mono);font-size:14px;color:var(--fg-muted)}

.table-wrap{flex:1;min-width:0;background:var(--bg-card);display:flex;flex-direction:column;overflow:hidden}
.info-bar{display:flex;align-items:center;justify-content:space-between;padding:10px 24px}
.info-bar .info-txt{font-size:14px;color:var(--fg-muted)}
.sort-frame{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-card);font-size:14px;font-weight:500;color:var(--fg-secondary);cursor:pointer}
.sort-frame i{font-size:14px}
.ag-table-scroll{flex:1;overflow-y:auto}
.ag-table{width:100%;border-collapse:collapse;table-layout:fixed}
.ag-table thead th{background:var(--bg-secondary);height:44px;padding:0 0 0 12px;font-size:14px;font-weight:600;color:var(--fg-muted);text-align:left;border-bottom:1px solid var(--border-light);white-space:nowrap}
.ag-table thead th:first-child{padding-left:24px;width:28px}
.ag-table thead th:last-child{padding-right:24px;text-align:center}
.ag-table tbody td{height:52px;padding:0 0 0 12px;font-size:14px;color:var(--fg-primary);border-bottom:1px solid var(--border-light);vertical-align:middle}
.ag-table tbody td:first-child{padding-left:24px;width:28px}
.ag-table tbody td:last-child{padding-right:24px}
.ag-table tbody tr.selected{background:#F9F9FF}
.ag-ck{width:16px;height:16px;border:1.5px solid var(--border);border-radius:3px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;vertical-align:middle}
.ag-ck.on{background:var(--accent);border-color:var(--accent);color:#fff}
.ag-ck.on::after{content:'';width:8px;height:4px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg) translateY(-1px)}
.ag-name{display:inline-flex;align-items:center;gap:10px;font-weight:500}
.ag-av{width:32px;height:32px;border-radius:50%;background:var(--accent-light);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.ag-av i{color:var(--accent);font-size:16px}
.ag-country,.ag-mgr{color:var(--fg-secondary);font-weight:400}
.ag-badge{display:inline-flex;align-items:center;padding:4px 10px;border-radius:9999px;font-size:14px;font-weight:500}
.ag-badge.on{background:var(--accent-light);color:var(--accent)}
.ag-badge.off{background:#FFEBEE;color:var(--danger)}
.ag-num{font-family:var(--font-mono);font-weight:500;color:var(--fg-primary)}
.ag-date{font-family:var(--font-mono);color:var(--fg-muted)}
.ag-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px}
.ag-actions i{color:var(--fg-muted);font-size:16px;cursor:pointer}

.ag-pag{display:flex;align-items:center;justify-content:center;position:relative;height:48px;padding:0 24px;border-top:1px solid var(--border-light);flex-shrink:0}
.ag-pag .pag-info{position:absolute;left:24px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--fg-muted)}
.ag-pag .pag-btns{display:flex;align-items:center;gap:4px}
.ag-pag .pb{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:var(--radius-sm);font-size:14px;color:var(--fg-secondary);border:none;background:none;cursor:pointer}
.ag-pag .pb.bd{border:1px solid var(--border)}
.ag-pag .pb.active{background:var(--accent);color:#fff;font-weight:600}
.ag-pag .pb i{font-size:16px;color:var(--fg-muted)}
`;

const TYPE_LABEL_TO_CODE: Record<string, string> = {
  '복지용구사업소': 'welfare_shop',
  '인터넷 사업소': 'internet_shop',
  '재가복지센터': 'home_care',
  '기타 관련업체': 'etc',
};

type Props = {
  members: BizRow[];
  typeCounts: TypeCounts;
  total: number;
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  query: string;
  sort: 'sales' | 'recent';
};

export default function BizMembersClient({
  members: rows,
  typeCounts,
  total,
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  query,
  sort,
}: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchInput, setSearchInput] = useState<string>(query);
  const [selected, setSelected] = useState<Set<number>>(new Set<number>());
  const [openedModal, setOpenedModal] = useState<ModalKey>(null);
  const [regCompany, setRegCompany] = useState<string>('');
  const [regType, setRegType] = useState<string>('');
  const [regOwner, setRegOwner] = useState<string>('');
  const [regBizNo, setRegBizNo] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regSubmitting, setRegSubmitting] = useState<boolean>(false);

  const buildUrl = (next: { q?: string; sort?: 'sales' | 'recent'; page?: number }): string => {
    const params = new URLSearchParams();
    const q = next.q !== undefined ? next.q : query;
    const s = next.sort !== undefined ? next.sort : sort;
    const p = next.page !== undefined ? next.page : page;
    if (q) params.set('q', q);
    if (s !== 'sales') params.set('sort', s);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/admin/biz-members?${qs}` : '/admin/biz-members';
  };

  const applySearch = (): void => {
    router.push(buildUrl({ q: searchInput.trim(), page: 1 }));
  };

  const toggleSort = (): void => {
    router.push(buildUrl({ sort: sort === 'sales' ? 'recent' : 'sales', page: 1 }));
  };

  const goToPage = (p: number): void => {
    if (p < 1 || p > totalPages || p === page) return;
    router.push(buildUrl({ page: p }));
  };

  const openModal = (key: Exclude<ModalKey, null>): void => {
    setOpenedModal(key);
  };

  const closeModal = (_key: Exclude<ModalKey, null>): void => {
    setOpenedModal(null);
  };

  const submitRegister = async (): Promise<void> => {
    if (!regCompany || !regOwner || !regBizNo) {
      setOpenedModal('errorModal');
      return;
    }
    setRegSubmitting(true);
    try {
      const digits = regBizNo.replace(/[^0-9]/g, '');
      const res = await fetch('/cozycare/api/biz-members', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          loginId: `biz_${digits}`,
          password: digits || 'biz1234',
          companyName: regCompany,
          bizNo: regBizNo,
          owner: regOwner,
          phone: regPhone || '-',
          businessType: regType ? (TYPE_LABEL_TO_CODE[regType] ?? null) : null,
          status: 'approved',
        }),
      });
      if (res.ok) {
        setRegCompany('');
        setRegType('');
        setRegOwner('');
        setRegBizNo('');
        setRegPhone('');
        setOpenedModal('successModal');
        router.refresh();
        return;
      }
      setOpenedModal('errorModal');
    } finally {
      setRegSubmitting(false);
    }
  };

  const doLogout = (): void => {
    setOpenedModal(null);
    router.push('/admin');
  };

  const navigateTo = (path: string): void => {
    if (path === 'biz-register.html') {
      openModal('agencyRegisterModal');
      return;
    }
    router.push('/admin/' + path.replace('.html', ''));
  };

  const toggleRow = (idx: number, e: MouseEvent<HTMLSpanElement>): void => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const filteredRows = rows
    .map((row, idx) => ({ row, idx }))
    .filter(({ row }) => statusFilter === 'all' || row.status === statusFilter);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="top-bar">
        <div className="top-bar-left">
          <h1>사업자 회원</h1>
          <p>승인된 사업자 회원 거래 현황</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box"><i className="icon-search search-icon"></i><input type="text" placeholder="상호·사업자번호 검색..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); }} /></div>
          <div className="bell-wrapper">
            <button className="bell-btn"><i className="icon-bell" style={{ color: '#4B5563', fontSize: 18 }}></i><span className="bell-dot"></span></button>
            <div className="noti-dropdown">
              <div className="noti-header"><span className="noti-title">알림</span><span className="noti-read-all">모두 읽음</span></div>
              <div className="noti-item unread"><div className="noti-dot" style={{ background: '#3B43DB' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#EEEFFC', color: '#3B43DB' }}>신규 사업자 신청</span><span className="noti-time">10분 전</span><div className="noti-text">광주실버몰 사업자 등록 신청이 접수되었습니다</div></div></div>
              <div className="noti-item unread"><div className="noti-dot" style={{ background: '#34C759' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#EEFBF0', color: '#34C759' }}>포인트 정산</span><span className="noti-time">1시간 전</span><div className="noti-text">㈜시니어라이프 5월 포인트 정산 완료</div></div></div>
              <div className="noti-item"><div className="noti-dot" style={{ background: '#FF9500' }}></div><div className="noti-body"><span className="noti-badge" style={{ background: '#FFF8EE', color: '#FF9500' }}>도매 주문</span><span className="noti-time">3시간 전</span><div className="noti-text">㈜이로움파트너 카본로얄파인더 12대 주문</div></div></div>
              <a href="/admin/shipping" className="noti-footer">알림 센터 전체 보기 →</a>
            </div>
          </div>
        </div>
      </div>

      <div className="bot-area">
        <aside className="filter-side">
          <button className="add-btn" onClick={() => navigateTo('biz-register.html')}><i className="icon-plus"></i>사업자 추가</button>
          <div className="seg-tab" id="agencyStatusTabs">
            <div className={`st${statusFilter === 'all' ? ' active' : ''}`} data-status="all" onClick={() => setStatusFilter('all')}>전체</div>
            <div className={`st${statusFilter === 'on' ? ' active' : ''}`} data-status="on" onClick={() => setStatusFilter('on')}>활성</div>
            <div className={`st${statusFilter === 'off' ? ' active' : ''}`} data-status="off" onClick={() => setStatusFilter('off')}>정지</div>
          </div>
          <div className="region-sec">
            <div className="rg-title">사업자 유형</div>
            <div className="rg-row"><span className="rg-l">복지용구사업소</span><span className="rg-v">{typeCounts.welfare_shop}</span></div>
            <div className="rg-row"><span className="rg-l">인터넷 사업소</span><span className="rg-v">{typeCounts.internet_shop}</span></div>
            <div className="rg-row"><span className="rg-l">재가복지센터</span><span className="rg-v">{typeCounts.home_care}</span></div>
            <div className="rg-row"><span className="rg-l">기타 관련업체</span><span className="rg-v">{typeCounts.etc}</span></div>
          </div>
        </aside>

        <div className="table-wrap">
          <div className="info-bar">
            <span className="info-txt">총 {total}개 사업자</span>
            <button className="sort-frame" onClick={toggleSort}><i className="icon-arrow-up-down"></i>{sort === 'sales' ? '누적매출순' : '최근승인순'}</button>
          </div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup>
                <col style={{ width: '52px' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '90px' }} />
                <col style={{ width: '130px' }} />
                <col style={{ width: '130px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '130px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '90px' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th><span className="ag-ck"></span></th>
                  <th>상호</th>
                  <th>대표</th>
                  <th>유형</th>
                  <th>사업자번호</th>
                  <th>승인일</th>
                  <th>누적매출</th>
                  <th>포인트</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map(({ row, idx }) => (
                  <tr key={row.id} className={selected.has(idx) ? 'selected' : ''}>
                    <td><span className={`ag-ck${selected.has(idx) ? ' on' : ''}`} onClick={(e) => toggleRow(idx, e)}></span></td>
                    <td><span className="ag-name"><span className="ag-av"><i className="icon-store"></i></span>{row.name}</span></td>
                    <td className="ag-mgr">{row.manager}</td>
                    <td><span className="ag-badge on">{row.type}</span></td>
                    <td className="ag-num">{row.bizNum}</td>
                    <td className="ag-date">{row.date}</td>
                    <td className="ag-num">{row.sales}</td>
                    <td className="ag-num">{row.point}</td>
                    <td><span className={`ag-badge ${row.status}`}>{row.statusLabel}</span></td>
                    <td><div className="ag-actions"><i className="icon-pencil"></i><i className="icon-ellipsis"></i></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ag-pag">
            <span className="pag-info">{rangeStart}-{rangeEnd} / {total}</span>
            <div className="pag-btns">
              <button className="pb bd" disabled={page <= 1} onClick={() => goToPage(page - 1)}><i className="icon-chevron-left"></i></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`pb${p === page ? ' active' : ' bd'}`} onClick={() => goToPage(p)}>{p}</button>
              ))}
              <button className="pb bd" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}><i className="icon-chevron-right"></i></button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="agencyRegisterModal" style={{ display: openedModal === 'agencyRegisterModal' ? 'flex' : 'none' }}>
        <div className="modal-content" style={{ width: 520, padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg-primary)', fontFamily: "'Pretendard',sans-serif" }}>사업자 회원 등록</div>
            <i className="icon-x" style={{ fontSize: 20, color: 'var(--fg-muted)', cursor: 'pointer' }} onClick={() => closeModal('agencyRegisterModal')}></i>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">상호 <span className="required">*</span></label>
                <input className="form-input" type="text" placeholder="사업자 상호" value={regCompany} onChange={(e) => setRegCompany(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">유형 <span className="required">*</span></label>
                <select className="form-select" value={regType} onChange={(e) => setRegType(e.target.value)}><option value="">유형 선택</option><option value="복지용구사업소">복지용구사업소</option><option value="인터넷 사업소">인터넷 사업소</option><option value="재가복지센터">재가복지센터</option><option value="기타 관련업체">기타 관련업체</option></select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">대표 <span className="required">*</span></label>
                <input className="form-input" type="text" placeholder="대표자 이름" value={regOwner} onChange={(e) => setRegOwner(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">사업자번호 <span className="required">*</span></label>
                <input className="form-input" type="text" placeholder="000-00-00000" value={regBizNo} onChange={(e) => setRegBizNo(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">대표 연락처</label>
              <input className="form-input" type="text" placeholder="이메일 또는 전화번호" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" style={{ flex: 1, height: 44 }} onClick={() => closeModal('agencyRegisterModal')}>취소</button>
            <button className="btn btn-primary" style={{ flex: 1, height: 44 }} disabled={regSubmitting} onClick={submitRegister}>등록하기</button>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="unsavedModal" style={{ display: openedModal === 'unsavedModal' ? 'flex' : 'none' }}>
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

      <div className="modal-overlay" id="logoutModal" style={{ display: openedModal === 'logoutModal' ? 'flex' : 'none' }}>
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

      <div className="modal-overlay" id="deleteModal" style={{ display: openedModal === 'deleteModal' ? 'flex' : 'none' }}>
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

      <div className="modal-overlay" id="successModal" style={{ display: openedModal === 'successModal' ? 'flex' : 'none' }}>
        <div className="modal-content" style={{ width: 400 }}>
          <div className="modal-icon" style={{ background: '#EEFBF0' }}><i className="icon-check-circle" style={{ color: '#34C759', fontSize: 24 }}></i></div>
          <div className="modal-title">등록이 완료되었습니다</div>
          <div className="modal-desc">목록 페이지로 이동하거나 상세보기 할 수 있습니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('successModal')}>목록으로</button>
            <button className="btn btn-primary" onClick={() => closeModal('successModal')}>상세보기</button>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="errorModal" style={{ display: openedModal === 'errorModal' ? 'flex' : 'none' }}>
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
