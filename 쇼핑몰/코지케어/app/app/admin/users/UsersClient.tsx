'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type TabKey = 'all' | 'on' | 'off';

type ModalKey =
  | 'agencyRegisterModal'
  | 'unsavedModal'
  | 'logoutModal'
  | 'deleteModal'
  | 'successModal'
  | 'errorModal';

export type UserRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  joined: string;
  orders: string;
  total: string;
  lastLogin: string;
  statusLabel: string;
  statusVariant: 'active' | 'dormant' | 'withdrawn';
  selected?: boolean;
};

type StatusKey = 'all' | 'active' | 'dormant' | 'withdrawn';

type Props = {
  users: UserRow[];
  total: number;
  query: string;
  tab: TabKey;
  status: string;
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
};

export default function UsersClient({
  users: USERS,
  total,
  query: initialQuery,
  tab: activeTab,
  status: activeStatus,
  page,
  totalPages,
  rangeStart,
  rangeEnd,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [openModalKey, setOpenModalKey] = useState<ModalKey | null>(null);

  const buildUrl = (params: { q?: string; tab?: TabKey; status?: StatusKey; page?: number }): string => {
    const next = new URLSearchParams();
    const q = params.q !== undefined ? params.q : query;
    const tab = params.tab !== undefined ? params.tab : activeTab;
    const status = params.status !== undefined ? params.status : (activeStatus as StatusKey);
    const p = params.page !== undefined ? params.page : page;
    if (q.trim()) next.set('q', q.trim());
    if (tab !== 'all') next.set('tab', tab);
    if (status !== 'all') next.set('status', status);
    if (p > 1) next.set('page', String(p));
    const qs = next.toString();
    return qs ? `/admin/users?${qs}` : '/admin/users';
  };

  const applySearch = (): void => {
    router.push(buildUrl({ q: query, page: 1 }));
  };
  const selectTab = (tab: TabKey): void => {
    router.push(buildUrl({ tab, page: 1 }));
  };
  const selectStatus = (status: StatusKey): void => {
    router.push(buildUrl({ status, page: 1 }));
  };
  const goToPage = (p: number): void => {
    if (p < 1 || p > totalPages || p === page) return;
    router.push(buildUrl({ page: p }));
  };

  const openModal = (id: ModalKey): void => setOpenModalKey(id);
  const closeModal = (_id: ModalKey): void => setOpenModalKey(null);
  const doLogout = (): void => setOpenModalKey(null);
  const navigateTo = (path: string): void => {
    if (path === 'user-add.html') {
      router.push('/admin/user-add');
    } else {
      router.push('/' + path.replace('.html', ''));
    }
  };
  const showSuccess = (_title: string, _desc: string): void => setOpenModalKey('successModal');

  const visibleUsers = USERS;

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>일반 회원</h1>
          <p>코지워커 SHOP 일반 구매 회원 관리</p>
        </div>
        <div className="top-bar-right">
          <div className="search-box">
            <i className="icon-search search-icon"></i>
            <input type="text" placeholder="이름·이메일·연락처 검색" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); }} />
          </div>
          <a className="btn btn-outline" href="/cozycare/api/users/export" style={{ height: 40, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <i className="icon-download" />엑셀
          </a>
          <div className="bell-wrapper">
            <button className="bell-btn">
              <i className="icon-bell" style={{ color: '#4B5563', fontSize: '18px' }}></i>
              <span className="bell-dot"></span>
            </button>
            <div className="noti-dropdown">
              <div className="noti-header">
                <span className="noti-title">알림</span>
                <span className="noti-read-all">모두 읽음</span>
              </div>
              <div className="noti-item unread">
                <div className="noti-dot" style={{ background: '#84c140' }}></div>
                <div className="noti-body">
                  <span className="noti-badge" style={{ background: '#EEFBE2', color: '#84c140' }}>신규 가입</span>
                  <span className="noti-time">10분 전</span>
                  <div className="noti-text">송영미 회원이 신규 가입했습니다</div>
                </div>
              </div>
              <div className="noti-item unread">
                <div className="noti-dot" style={{ background: '#34C759' }}></div>
                <div className="noti-body">
                  <span className="noti-badge" style={{ background: '#EEFBF0', color: '#34C759' }}>신규 주문</span>
                  <span className="noti-time">1시간 전</span>
                  <div className="noti-text">임봉기 회원이 카본로얄파인더를 주문했습니다</div>
                </div>
              </div>
              <div className="noti-item">
                <div className="noti-dot" style={{ background: '#FF9500' }}></div>
                <div className="noti-body">
                  <span className="noti-badge" style={{ background: '#FFF8EE', color: '#FF9500' }}>문의 접수</span>
                  <span className="noti-time">3시간 전</span>
                  <div className="noti-text">박정수 보호자가 배송 문의를 남겼습니다</div>
                </div>
              </div>
              <Link href="/admin/shipping" className="noti-footer">알림 센터 전체 보기 →</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bot-area">
        <aside className="filter-side">
          <button className="add-btn" onClick={() => navigateTo('user-add.html')}>
            <i className="icon-plus"></i>회원 추가
          </button>
          <div className="seg-tab" id="agencyStatusTabs">
            <div
              className={`st${activeTab === 'all' ? ' active' : ''}`}
              data-status="all"
              onClick={() => selectTab('all')}
            >
              전체
            </div>
            <div
              className={`st${activeTab === 'on' ? ' active' : ''}`}
              data-status="on"
              onClick={() => selectTab('on')}
            >
              구매O
            </div>
            <div
              className={`st${activeTab === 'off' ? ' active' : ''}`}
              data-status="off"
              onClick={() => selectTab('off')}
            >
              구매X
            </div>
          </div>
          <div className="seg-tab" style={{ marginTop: 8 }}>
            <div className={`st${activeStatus === 'all' ? ' active' : ''}`} onClick={() => selectStatus('all')}>전체</div>
            <div className={`st${activeStatus === 'active' ? ' active' : ''}`} onClick={() => selectStatus('active')}>활성</div>
            <div className={`st${activeStatus === 'dormant' ? ' active' : ''}`} onClick={() => selectStatus('dormant')}>휴면</div>
            <div className={`st${activeStatus === 'withdrawn' ? ' active' : ''}`} onClick={() => selectStatus('withdrawn')}>탈퇴</div>
          </div>
          <div className="region-sec">
            <div className="rg-title">가입 월별</div>
            <div className="rg-row"><span className="rg-l">2025-05</span><span className="rg-v">1</span></div>
            <div className="rg-row"><span className="rg-l">2025-04</span><span className="rg-v">1</span></div>
            <div className="rg-row"><span className="rg-l">2025-03</span><span className="rg-v">1</span></div>
            <div className="rg-row"><span className="rg-l">2025-02</span><span className="rg-v">1</span></div>
            <div className="rg-row"><span className="rg-l">2025-01</span><span className="rg-v">1</span></div>
            <div className="rg-row"><span className="rg-l">2024-12</span><span className="rg-v">1</span></div>
            <div className="rg-row"><span className="rg-l">2024-11</span><span className="rg-v">1</span></div>
          </div>
        </aside>

        <div className="table-wrap">
          <div className="info-bar">
            <span className="info-txt">총 {total}명 회원</span>
            <button className="sort-frame"><i className="icon-arrow-up-down"></i>가입일순</button>
          </div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup>
                <col style={{ width: '52px' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '200px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '130px' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th><span className="ag-ck"></span></th>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>연락처</th>
                  <th>가입일</th>
                  <th>주문수</th>
                  <th>총구매액</th>
                  <th>최근 로그인</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((u) => (
                  <tr key={u.id} className={u.selected ? 'selected' : undefined}>
                    <td><span className={`ag-ck${u.selected ? ' on' : ''}`}></span></td>
                    <td>
                      <span className="ag-name">
                        <span className={`ag-av status-${u.statusVariant}`} title={u.statusLabel}><i className="icon-user"></i></span>
                        {u.name}
                      </span>
                    </td>
                    <td className="ag-country">{u.email}</td>
                    <td className="ag-mgr">{u.phone}</td>
                    <td className="ag-date">{u.joined}</td>
                    <td className="ag-num">{u.orders}</td>
                    <td className="ag-num">{u.total}</td>
                    <td className="ag-date">{u.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ag-pag">
            <span className="pag-info">{rangeStart}-{rangeEnd} / {total}</span>
            <div className="pag-btns">
              <button className="pb bd" onClick={() => goToPage(page - 1)} disabled={page <= 1}><i className="icon-chevron-left"></i></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={p === page ? 'pb active' : 'pb'}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              ))}
              <button className="pb bd" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}><i className="icon-chevron-right"></i></button>
            </div>
          </div>
        </div>
      </div>

      <div className={`modal-overlay${openModalKey === 'agencyRegisterModal' ? ' active' : ''}`} id="agencyRegisterModal">
        <div className="modal-content" style={{ width: '520px', padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--fg-primary)', fontFamily: "'Pretendard',sans-serif" }}>회원 추가</div>
            <i className="icon-x" style={{ fontSize: '20px', color: 'var(--fg-muted)', cursor: 'pointer' }} onClick={() => closeModal('agencyRegisterModal')}></i>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">이름 <span className="required">*</span></label>
                <input className="form-input" type="text" placeholder="회원 이름" />
              </div>
              <div className="form-group">
                <label className="form-label">사용자 구분 <span className="required">*</span></label>
                <select className="form-select"><option value="">구분 선택</option><option>본인</option><option>보호자</option></select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">이메일 <span className="required">*</span></label>
                <input className="form-input" type="text" placeholder="example@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">연락처</label>
                <input className="form-input" type="text" placeholder="010-0000-0000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">메모</label>
              <input className="form-input" type="text" placeholder="관리용 메모" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" style={{ flex: 1, height: '44px' }} onClick={() => closeModal('agencyRegisterModal')}>취소</button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, height: '44px' }}
              onClick={() => {
                closeModal('agencyRegisterModal');
                showSuccess('등록이 완료되었습니다', '회원이 정상적으로 등록되었습니다.');
              }}
            >
              등록하기
            </button>
          </div>
        </div>
      </div>

      <div className={`modal-overlay${openModalKey === 'unsavedModal' ? ' active' : ''}`} id="unsavedModal">
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

      <div className={`modal-overlay${openModalKey === 'logoutModal' ? ' active' : ''}`} id="logoutModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#F3F4F6' }}>
            <i className="icon-log-out" style={{ color: '#4B5563', fontSize: '24px' }}></i>
          </div>
          <div className="modal-title">로그아웃 하시겠습니까?</div>
          <div className="modal-desc">다시 로그인이 필요합니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('logoutModal')}>취소</button>
            <button className="btn btn-dark" onClick={doLogout}>로그아웃</button>
          </div>
        </div>
      </div>

      <div className={`modal-overlay${openModalKey === 'deleteModal' ? ' active' : ''}`} id="deleteModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}>
            <i className="icon-trash-2" style={{ color: '#FF3B30', fontSize: '24px' }}></i>
          </div>
          <div className="modal-title">정말 삭제하시겠습니까?</div>
          <div className="modal-desc">삭제된 데이터는 복구할 수 없습니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('deleteModal')}>취소</button>
            <button className="btn btn-danger" onClick={() => closeModal('deleteModal')}>삭제</button>
          </div>
        </div>
      </div>

      <div className={`modal-overlay${openModalKey === 'successModal' ? ' active' : ''}`} id="successModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#EEFBF0' }}>
            <i className="icon-check-circle" style={{ color: '#34C759', fontSize: '24px' }}></i>
          </div>
          <div className="modal-title">등록이 완료되었습니다</div>
          <div className="modal-desc">목록 페이지로 이동하거나 상세보기 할 수 있습니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('successModal')}>목록으로</button>
            <button className="btn btn-primary" onClick={() => closeModal('successModal')}>상세보기</button>
          </div>
        </div>
      </div>

      <div className={`modal-overlay${openModalKey === 'errorModal' ? ' active' : ''}`} id="errorModal">
        <div className="modal-content" style={{ width: '400px' }}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}>
            <i className="icon-alert-circle" style={{ color: '#FF3B30', fontSize: '24px' }}></i>
          </div>
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
