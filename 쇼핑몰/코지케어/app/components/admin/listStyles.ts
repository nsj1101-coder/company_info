// 어드민 리스트/관리 페이지 공통 스타일 (PointsClient 패턴 기반 확장)
export const LIST_STYLES = `
.lp-grid{display:flex;flex-direction:column;gap:16px;padding:16px 24px 0}
.tier{display:flex;gap:16px;flex-wrap:wrap}
.stat-c{flex:1;min-width:160px;border-radius:var(--radius-lg);padding:16px 20px;display:flex;align-items:center;gap:14px}
.stat-c .s-ic{width:40px;height:40px;border-radius:9999px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.stat-c .s-val{font-family:var(--font-mono);font-size:22px;font-weight:700;color:var(--fg-primary)}
.stat-c .s-lbl{font-size:14px;color:var(--fg-muted);margin-top:2px}
.filter-bar{display:flex;gap:10px;align-items:center;padding:0 24px;flex-wrap:wrap}
.filter-bar .f-sel{height:38px;padding:0 32px 0 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-card);font-size:14px;color:var(--fg-primary);appearance:none;cursor:pointer}
.filter-bar .f-search{flex:1;min-width:180px;display:flex;align-items:center;gap:8px;height:38px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-card)}
.filter-bar .f-search i{color:var(--fg-muted);font-size:16px}
.filter-bar .f-search input{flex:1;border:none;outline:none;background:transparent;font-size:14px;color:var(--fg-primary)}
.table-wrap{flex:1;min-width:0;background:var(--bg-card);display:flex;flex-direction:column;margin:0 24px 24px;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
.info-bar{display:flex;align-items:center;justify-content:space-between;padding:10px 20px;border-bottom:1px solid var(--border-light)}
.info-bar .info-txt{font-size:14px;color:var(--fg-muted)}
.ag-table-scroll{flex:1;overflow-y:auto}
.ag-table{width:100%;border-collapse:collapse;table-layout:fixed}
.ag-table thead th{background:var(--bg-secondary);height:44px;padding:0 0 0 12px;font-size:14px;font-weight:600;color:var(--fg-muted);text-align:left;border-bottom:1px solid var(--border-light);white-space:nowrap}
.ag-table thead th:first-child{padding-left:24px}
.ag-table thead th:last-child{padding-right:24px}
.ag-table tbody td{height:52px;padding:0 0 0 12px;font-size:14px;color:var(--fg-primary);border-bottom:1px solid var(--border-light);vertical-align:middle}
.ag-table tbody td:first-child{padding-left:24px}
.ag-table tbody td:last-child{padding-right:24px}
.ag-table tbody tr:hover{background:var(--bg-secondary)}
.ag-date{font-family:var(--font-mono);color:var(--fg-muted);font-size:13px}
.ag-name{font-weight:500}
.ag-num{font-family:var(--font-mono);font-weight:600}
.ag-muted{color:var(--fg-muted)}
.ag-clip{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.st-badge{display:inline-flex;align-items:center;padding:4px 10px;border-radius:9999px;font-size:13px;font-weight:600;white-space:nowrap}
.st-gray{background:#F3F4F6;color:#4B5563}
.st-green{background:#EEFBF0;color:#16a34a}
.st-red{background:#FEE2E2;color:#dc2626}
.st-amber{background:#FEF3C7;color:#b45309}
.st-blue{background:#E0F2FE;color:#0369a1}
.st-navy{background:#E8EDF7;color:#334e9e}
.btn-sm{height:32px;padding:0 12px;font-size:13px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-card);color:var(--fg-secondary);cursor:pointer;display:inline-flex;align-items:center;gap:4px}
.btn-sm:hover{border-color:var(--gray-900);color:var(--gray-900)}
.btn-sm.primary{background:var(--gray-900);color:#fff;border-color:var(--gray-900)}
.btn-sm.green{background:var(--green-600);color:#fff;border-color:var(--green-600)}
.btn-sm.red{background:var(--red-500);color:#fff;border-color:var(--red-500)}
.row-actions{display:flex;gap:6px;flex-wrap:wrap}
.ag-pag{display:flex;align-items:center;justify-content:center;position:relative;height:48px;padding:0 24px;border-top:1px solid var(--border-light);flex-shrink:0}
.ag-pag .pag-info{position:absolute;left:24px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--fg-muted)}
.toolbar{display:flex;gap:8px;align-items:center;padding:0 24px;flex-wrap:wrap}
.mform{display:flex;flex-direction:column;gap:14px;text-align:left}
.mform .fld{display:flex;flex-direction:column;gap:6px}
.mform label{font-size:13px;font-weight:600;color:var(--fg-secondary)}
.mform input,.mform select,.mform textarea{height:40px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;color:var(--fg-primary);background:#fff;font-family:inherit}
.mform textarea{height:auto;min-height:84px;padding:10px 12px;resize:vertical}
.mform .row2{display:flex;gap:12px}
.mform .row2 .fld{flex:1}
.modal-wide{width:560px;max-width:92vw}
.dt-list{display:flex;flex-direction:column;gap:8px;text-align:left}
.dt-list .dt-row{display:flex;justify-content:space-between;gap:16px;font-size:14px;padding:6px 0;border-bottom:1px dashed var(--border-light)}
.dt-list .dt-row .k{color:var(--fg-muted)}
.dt-list .dt-row .v{color:var(--fg-primary);font-weight:500;text-align:right}
.empty-row{text-align:center;padding:48px 0;color:var(--fg-muted)}
.star-on{color:var(--warning)}
.star-off{color:var(--border)}
`;
