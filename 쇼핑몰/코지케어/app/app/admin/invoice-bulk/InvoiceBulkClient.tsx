'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { LIST_STYLES } from '@/components/admin/listStyles';

type ParsedRow = { orderNo: string; courier: string; trackingNo: string };
type ResultRow = { orderNo: string; ok: boolean; reason?: string };

function parseCsv(text: string): ParsedRow[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('주문번호'))
    .map((l) => {
      const cols = l.split(/[,\t]/).map((c) => c.trim());
      return { orderNo: cols[0] ?? '', courier: cols[1] ?? '', trackingNo: cols[2] ?? '' };
    })
    .filter((r) => r.orderNo);
}

export default function InvoiceBulkClient() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState('');

  const parsed = useMemo(() => parseCsv(text), [text]);

  const onFile = async (file: File | null): Promise<void> => {
    if (!file) return;
    setFileName(file.name);
    setResults(null);
    const isExcel = /\.xlsx?$/i.test(file.name);
    if (isExcel) {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, blankrows: false });
      const lines = rows
        .map((r) => [r[0], r[1], r[2]].map((c) => (c == null ? '' : String(c).trim())).join(','))
        .filter((l) => l.replace(/,/g, '').length > 0);
      setText(lines.join('\n'));
    } else {
      setText(await file.text());
    }
  };

  const submit = async (): Promise<void> => {
    if (parsed.length === 0) return;
    setSubmitting(true);
    setResults(null);
    try {
      const res = await fetch('/cozycare/api/shipping/bulk', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rows: parsed }),
      });
      const j = (await res.json().catch(() => ({}))) as { success?: number; failed?: number; results?: ResultRow[]; error?: string };
      if (!res.ok) { setSummary(j.error ?? '실패'); return; }
      setResults(j.results ?? []);
      setSummary(`성공 ${j.success ?? 0}건 / 실패 ${j.failed ?? 0}건`);
      router.refresh();
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <style>{LIST_STYLES}</style>
      <div className="top-bar">
        <div className="top-bar-left"><h1>일괄 송장 등록</h1><p>CSV/엑셀 붙여넣기로 다건 송장 한번에 등록 (출고 처리 + 알림)</p></div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 600 }}>1. 송장 데이터 입력</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a className="btn btn-outline" href="/cozycare/api/shipping/template"><i className="icon-download" style={{ marginRight: 4 }} />양식 다운로드</a>
              <a className="btn btn-outline" href="/cozycare/api/orders/export"><i className="icon-download" style={{ marginRight: 4 }} />주문 엑셀 다운로드</a>
            </div>
          </div>
          <p className="ag-muted" style={{ fontSize: 13, marginBottom: 12 }}>형식: <code>주문번호, 택배사, 송장번호</code> (한 줄에 하나, 쉼표/탭 구분). 양식을 받아 채운 뒤 업로드하거나 직접 붙여넣기.</p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
              <i className="icon-upload" style={{ marginRight: 6 }} />파일 선택 (.csv/.xlsx)
              <input type="file" accept=".csv,.txt,.tsv,.xlsx,.xls" hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </label>
            {fileName && <span className="ag-muted" style={{ fontSize: 13 }}>선택됨: {fileName}</span>}
            <span className="ag-muted" style={{ fontSize: 13 }}>또는 아래에 붙여넣기</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setResults(null); }}
            placeholder={'CZ-20260610-001, CJ대한통운, 1234567890\nCZ-20260610-002, 한진택배, 9876543210'}
            style={{ width: '100%', minHeight: 160, padding: 12, border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 13, resize: 'vertical' }}
          />
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>2. 미리보기 ({parsed.length}건)</div>
            <button className="btn btn-dark" onClick={submit} disabled={submitting || parsed.length === 0}>{submitting ? '처리중...' : `${parsed.length}건 일괄 등록`}</button>
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 8 }}>
            <table className="ag-table">
              <colgroup><col style={{ width: '40px' }} /><col style={{ width: '200px' }} /><col style={{ width: '160px' }} /><col /><col style={{ width: '120px' }} /></colgroup>
              <thead><tr><th>#</th><th>주문번호</th><th>택배사</th><th>송장번호</th><th>결과</th></tr></thead>
              <tbody>
                {parsed.map((r, i) => {
                  const res = results?.find((x) => x.orderNo === r.orderNo);
                  return (
                    <tr key={i}>
                      <td className="ag-muted">{i + 1}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.orderNo}</td>
                      <td>{r.courier || '-'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.trackingNo || '-'}</td>
                      <td>{res ? <span className={`st-badge ${res.ok ? 'st-green' : 'st-red'}`}>{res.ok ? '등록' : res.reason}</span> : <span className="ag-muted">대기</span>}</td>
                    </tr>
                  );
                })}
                {parsed.length === 0 && <tr><td colSpan={5} className="empty-row">입력된 데이터가 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          {summary && <div style={{ marginTop: 12, fontWeight: 600 }}>{summary}</div>}
        </div>
      </div>
    </>
  );
}
