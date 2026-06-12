'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import * as XLSX from 'xlsx';

type ProductStatus = 'draft' | 'published' | 'hidden' | 'soldout';

type ImportRow = {
  code: string;
  name: string;
  categorySlug: string;
  price: number;
  welfarePrice?: number;
  stock: number;
  status: ProductStatus;
  description?: string;
  thumbnail?: string;
  kcCert?: string;
  bizLoginId?: string;
};

type CategoryRef = { id: number; slug: string; name: string };
type BizRef = { id: number; loginId: string };

type StepKey = 1 | 2 | 3 | 4;

type ImportResult = {
  inserted: number;
  skipped: number;
  skippedCodes?: string[];
  error?: string;
};

const STATUS_VALUES: ProductStatus[] = ['draft', 'published', 'hidden', 'soldout'];

const PAGE_BODY: React.CSSProperties = { padding: '0 24px 24px', maxWidth: 1100, margin: '0 auto', width: '100%', flex: 1, overflowY: 'auto', minHeight: 0 };
const TITLE_AREA: React.CSSProperties = { marginBottom: 20 };
const TITLE_H1: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: 'var(--fg-primary)', marginBottom: 6 };
const TITLE_P: React.CSSProperties = { fontSize: 14, color: 'var(--fg-muted)' };
const PANEL: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: 24,
  marginBottom: 16,
};
const PANEL_TITLE: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: 'var(--fg-primary)',
  marginBottom: 14,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};
const STEPPER_WRAP: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 };
const STEPPER_LINE: React.CSSProperties = { flex: 1, height: 2, background: 'var(--border)' };
const STEPPER_LINE_ACTIVE: React.CSSProperties = { ...STEPPER_LINE, background: 'var(--accent)' };
const STEP_DOT_BASE: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 700,
  border: '2px solid var(--border)',
  background: 'var(--bg-card)',
  color: 'var(--fg-muted)',
};
const STEP_DOT_ACTIVE: React.CSSProperties = {
  ...STEP_DOT_BASE,
  borderColor: 'var(--accent)',
  background: 'var(--accent)',
  color: '#fff',
};
const STEP_DOT_DONE: React.CSSProperties = {
  ...STEP_DOT_BASE,
  borderColor: 'var(--accent)',
  color: 'var(--accent)',
};
const STEP_LABEL: React.CSSProperties = { fontSize: 12, color: 'var(--fg-muted)', marginTop: 6, textAlign: 'center', minWidth: 96 };
const STEP_LABEL_ACTIVE: React.CSSProperties = { ...STEP_LABEL, color: 'var(--fg-primary)', fontWeight: 600 };
const DROPZONE_BASE: React.CSSProperties = {
  position: 'relative',
  border: '2px dashed var(--border)',
  borderRadius: 10,
  padding: 40,
  textAlign: 'center',
  color: 'var(--fg-muted)',
  fontSize: 14,
  cursor: 'pointer',
  transition: 'all .15s',
};
const DROPZONE_ACTIVE: React.CSSProperties = {
  ...DROPZONE_BASE,
  borderColor: 'var(--accent)',
  background: 'rgba(132,193,64,0.08)',
  color: 'var(--accent)',
};
const DROPZONE_INPUT: React.CSSProperties = { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' };
const TABLE_WRAP: React.CSSProperties = { overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 };
const PREVIEW_TABLE: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12 };
const TH_STYLE: React.CSSProperties = {
  padding: '10px 8px',
  background: '#F9FAFB',
  borderBottom: '1px solid var(--border)',
  textAlign: 'left',
  fontWeight: 600,
  color: 'var(--fg-muted)',
  whiteSpace: 'nowrap',
};
const TD_STYLE: React.CSSProperties = {
  padding: '8px',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
};
const STATUS_PILL_OK: React.CSSProperties = {
  background: '#DCFCE7',
  color: '#16a34a',
  padding: '2px 8px',
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 700,
};
const STATUS_PILL_NG: React.CSSProperties = {
  background: '#FEE2E2',
  color: '#dc2626',
  padding: '2px 8px',
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 700,
};
const SUMMARY_BAR: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginBottom: 14,
  fontSize: 13,
  color: 'var(--fg-muted)',
};
const FOOTER_BAR: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  padding: '20px 24px',
  maxWidth: 1100,
  margin: '0 auto',
  width: '100%',
  borderTop: '1px solid var(--border)',
};
const BTN_PRIMARY: React.CSSProperties = {
  padding: '10px 18px',
  fontSize: 14,
  fontWeight: 600,
  background: 'var(--accent)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
};
const BTN_OUTLINE: React.CSSProperties = {
  padding: '10px 18px',
  fontSize: 14,
  fontWeight: 600,
  background: 'var(--bg-card)',
  color: 'var(--fg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  cursor: 'pointer',
};
const BTN_DISABLED: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

const REQUIRED_FIELDS: ReadonlyArray<keyof ImportRow> = ['code', 'name', 'categorySlug', 'price', 'stock', 'status'];

function toStr(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function toMaybeStr(v: unknown): string | undefined {
  const s = toStr(v);
  return s === '' ? undefined : s;
}

function toInt(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, '').trim());
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  return n;
}

function isProductStatus(v: string): v is ProductStatus {
  return (STATUS_VALUES as string[]).includes(v);
}

function normalizeRow(raw: Record<string, unknown>): ImportRow {
  const priceInt = toInt(raw.price);
  const stockInt = toInt(raw.stock);
  const welfareInt = toInt(raw.welfarePrice);
  const statusStr = toStr(raw.status);
  return {
    code: toStr(raw.code),
    name: toStr(raw.name),
    categorySlug: toStr(raw.categorySlug ?? raw.categoryslug ?? raw.category),
    price: priceInt ?? Number.NaN,
    welfarePrice: welfareInt === null ? undefined : welfareInt,
    stock: stockInt ?? Number.NaN,
    status: (isProductStatus(statusStr) ? statusStr : statusStr) as ProductStatus,
    description: toMaybeStr(raw.description),
    thumbnail: toMaybeStr(raw.thumbnail),
    kcCert: toMaybeStr(raw.kcCert ?? raw.kccert),
    bizLoginId: toMaybeStr(raw.bizLoginId ?? raw.bizloginid),
  };
}

function validateRow(
  row: ImportRow,
  idx: number,
  ctx: {
    categorySlugs: Set<string>;
    bizLoginIds: Set<string>;
    codesSeen: Map<string, number>;
  },
): string[] {
  const errors: string[] = [];

  for (const f of REQUIRED_FIELDS) {
    const v = row[f];
    if (v === undefined || v === null || (typeof v === 'string' && v === '') || (typeof v === 'number' && !Number.isFinite(v))) {
      errors.push(`${f} 누락`);
    }
  }

  if (row.code) {
    const firstSeen = ctx.codesSeen.get(row.code);
    if (firstSeen !== undefined && firstSeen !== idx) {
      errors.push(`code 중복 (행 ${firstSeen + 1})`);
    }
  }

  if (Number.isFinite(row.price) && !Number.isInteger(row.price)) {
    errors.push('price 정수 아님');
  }
  if (Number.isFinite(row.stock) && !Number.isInteger(row.stock)) {
    errors.push('stock 정수 아님');
  }
  if (row.welfarePrice !== undefined && !Number.isInteger(row.welfarePrice)) {
    errors.push('welfarePrice 정수 아님');
  }

  if (row.status && !isProductStatus(row.status)) {
    errors.push(`status 값 오류 (${row.status})`);
  }

  if (row.categorySlug && !ctx.categorySlugs.has(row.categorySlug)) {
    errors.push(`categorySlug 미존재 (${row.categorySlug})`);
  }

  if (row.bizLoginId && !ctx.bizLoginIds.has(row.bizLoginId)) {
    errors.push(`bizLoginId 미존재 (${row.bizLoginId})`);
  }

  return errors;
}

export default function ImportPage() {
  const [step, setStep] = useState<StepKey>(1);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [dragging, setDragging] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [bizMembers, setBizMembers] = useState<BizRef[]>([]);
  const [loadingRefs, setLoadingRefs] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      try {
        const [catRes, bizRes] = await Promise.all([
          fetch('/cozycare/api/categories'),
          fetch('/cozycare/api/biz-members'),
        ]);
        const catJson = catRes.ok ? ((await catRes.json()) as { categories?: CategoryRef[] }) : { categories: [] };
        const bizJson = bizRes.ok ? ((await bizRes.json()) as { members?: BizRef[] }) : { members: [] };
        if (cancelled) return;
        setCategories(catJson.categories ?? []);
        setBizMembers(bizJson.members ?? []);
      } finally {
        if (!cancelled) setLoadingRefs(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categorySlugMap = useMemo(() => {
    const m = new Map<string, number>();
    categories.forEach((c) => m.set(c.slug, c.id));
    return m;
  }, [categories]);

  const bizLoginIdMap = useMemo(() => {
    const m = new Map<string, number>();
    bizMembers.forEach((b) => m.set(b.loginId, b.id));
    return m;
  }, [bizMembers]);

  const validationCtx = useMemo(() => {
    const codesSeen = new Map<string, number>();
    rows.forEach((r, i) => {
      if (r.code && !codesSeen.has(r.code)) codesSeen.set(r.code, i);
    });
    return {
      categorySlugs: new Set(categorySlugMap.keys()),
      bizLoginIds: new Set(bizLoginIdMap.keys()),
      codesSeen,
    };
  }, [rows, categorySlugMap, bizLoginIdMap]);

  const rowErrors = useMemo(() => {
    return rows.map((r, i) => validateRow(r, i, validationCtx));
  }, [rows, validationCtx]);

  const validCount = rowErrors.filter((e) => e.length === 0).length;
  const errorCount = rowErrors.length - validCount;

  const handleFile = async (file: File): Promise<void> => {
    setFileName(file.name);
    setResult(null);
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const firstSheetName = wb.SheetNames[0];
    if (!firstSheetName) {
      setRows([]);
      return;
    }
    const ws = wb.Sheets[firstSheetName];
    if (!ws) {
      setRows([]);
      return;
    }
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
    const normalized: ImportRow[] = (json as Record<string, unknown>[]).map((r) => normalizeRow(r));
    setRows(normalized);
    setStep(3);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (): void => setDragging(false);

  const downloadTemplate = (): void => {
    window.location.href = '/cozycare/api/products/template';
  };

  const submitAll = async (): Promise<void> => {
    const payload = rows
      .map((row, idx) => ({ row, errs: rowErrors[idx] ?? [] }))
      .filter((x) => x.errs.length === 0)
      .map(({ row }) => {
        const categoryId = categorySlugMap.get(row.categorySlug);
        const bizId = row.bizLoginId ? bizLoginIdMap.get(row.bizLoginId) ?? null : null;
        return {
          code: row.code,
          name: row.name,
          categoryId: categoryId ?? 0,
          bizId,
          price: row.price,
          welfarePrice: row.welfarePrice ?? null,
          stock: row.stock,
          status: row.status,
          thumbnail: row.thumbnail ?? null,
          description: row.description ?? null,
          kcCert: row.kcCert ?? null,
        };
      });

    if (payload.length === 0) {
      setResult({ inserted: 0, skipped: rows.length, error: '등록할 유효 행이 없습니다.' });
      return;
    }

    setSubmitting(true);
    setStep(4);
    try {
      const res = await fetch('/cozycare/api/products/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        setResult({ inserted: 0, skipped: payload.length, error: `서버 오류 (${res.status}): ${txt}` });
        return;
      }
      const data = (await res.json()) as ImportResult;
      setResult({
        inserted: data.inserted ?? 0,
        skipped: (data.skipped ?? 0) + errorCount,
        skippedCodes: data.skippedCodes ?? [],
      });
    } catch (e) {
      setResult({ inserted: 0, skipped: payload.length, error: e instanceof Error ? e.message : '네트워크 오류' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = (): void => {
    setRows([]);
    setFileName('');
    setResult(null);
    setStep(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>엑셀 대량 업로드</h1>
          <p>양식을 받아 작성한 뒤 업로드하면 상품을 일괄 등록합니다.</p>
        </div>
        <div className="top-bar-right">
          <Link href="/admin/products" style={BTN_OUTLINE}>
            <i className="icon-arrow-left" style={{ marginRight: 6 }} />목록으로
          </Link>
        </div>
      </div>

      <div style={PAGE_BODY}>
        <div style={TITLE_AREA}>
          <h1 style={TITLE_H1}>상품 일괄 등록</h1>
          <p style={TITLE_P}>4단계로 진행합니다. 검증을 통과한 행만 등록됩니다.</p>
        </div>

        <div style={PANEL}>
          <Stepper step={step} />
        </div>

        <div style={PANEL}>
          <div style={PANEL_TITLE}>
            <span>① 양식 받기</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 14 }}>
            엑셀 양식을 내려받아 컬럼 헤더에 맞춰 데이터를 작성하세요. 헤더는 변경하지 마세요.
          </p>
          <button type="button" style={BTN_PRIMARY} onClick={downloadTemplate}>
            <i className="icon-download" style={{ marginRight: 6 }} />양식 다운로드
          </button>
        </div>

        <div style={PANEL}>
          <div style={PANEL_TITLE}>
            <span>② 파일 업로드</span>
          </div>
          <div
            style={dragging ? DROPZONE_ACTIVE : DROPZONE_BASE}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <i className="icon-upload" style={{ fontSize: 32, display: 'block', marginBottom: 8, color: 'var(--accent)' }} />
            <div>{fileName ? `선택됨: ${fileName}` : '여기에 파일을 드래그하거나 클릭해서 선택 (.xlsx, .xls, .csv)'}</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={DROPZONE_INPUT}
              onChange={onFileChange}
            />
          </div>
          {loadingRefs && (
            <p style={{ marginTop: 10, fontSize: 12, color: 'var(--fg-muted)' }}>카테고리·사업자 목록을 불러오는 중...</p>
          )}
        </div>

        <div style={PANEL}>
          <div style={PANEL_TITLE}>
            <span>③ 미리보기 · 검증</span>
          </div>
          {rows.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>업로드된 파일이 없습니다.</p>
          ) : (
            <>
              <div style={SUMMARY_BAR}>
                <span>총 {rows.length}건</span>
                <span style={{ color: '#16a34a' }}>유효 {validCount}건</span>
                <span style={{ color: '#dc2626' }}>오류 {errorCount}건</span>
              </div>
              <div style={TABLE_WRAP}>
                <table style={PREVIEW_TABLE}>
                  <thead>
                    <tr>
                      <th style={TH_STYLE}>#</th>
                      <th style={TH_STYLE}>상태</th>
                      <th style={TH_STYLE}>code</th>
                      <th style={TH_STYLE}>name</th>
                      <th style={TH_STYLE}>categorySlug</th>
                      <th style={TH_STYLE}>price</th>
                      <th style={TH_STYLE}>welfarePrice</th>
                      <th style={TH_STYLE}>stock</th>
                      <th style={TH_STYLE}>status</th>
                      <th style={TH_STYLE}>bizLoginId</th>
                      <th style={TH_STYLE}>오류 사유</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const errs = rowErrors[i] ?? [];
                      const bg = errs.length > 0 ? '#FEF2F2' : 'transparent';
                      return (
                        <tr key={`${row.code || 'row'}-${i}`} style={{ background: bg }}>
                          <td style={TD_STYLE}>{i + 1}</td>
                          <td style={TD_STYLE}>
                            <span style={errs.length === 0 ? STATUS_PILL_OK : STATUS_PILL_NG}>
                              {errs.length === 0 ? 'OK' : 'NG'}
                            </span>
                          </td>
                          <td style={TD_STYLE}>{row.code}</td>
                          <td style={TD_STYLE}>{row.name}</td>
                          <td style={TD_STYLE}>{row.categorySlug}</td>
                          <td style={TD_STYLE}>{Number.isFinite(row.price) ? row.price : '-'}</td>
                          <td style={TD_STYLE}>{row.welfarePrice ?? '-'}</td>
                          <td style={TD_STYLE}>{Number.isFinite(row.stock) ? row.stock : '-'}</td>
                          <td style={TD_STYLE}>{row.status}</td>
                          <td style={TD_STYLE}>{row.bizLoginId ?? '-'}</td>
                          <td style={{ ...TD_STYLE, color: '#dc2626', whiteSpace: 'normal' }}>
                            {errs.length === 0 ? '-' : errs.join(', ')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div style={PANEL}>
          <div style={PANEL_TITLE}>
            <span>④ 일괄 등록</span>
          </div>
          {result ? (
            <div>
              <div style={SUMMARY_BAR}>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>성공 {result.inserted}건</span>
                <span style={{ color: '#dc2626', fontWeight: 700 }}>실패 {result.skipped}건</span>
              </div>
              {result.error && (
                <p style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{result.error}</p>
              )}
              {result.skippedCodes && result.skippedCodes.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--fg-muted)' }}>
                  중복으로 제외된 code: {result.skippedCodes.join(', ')}
                </div>
              )}
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <button type="button" style={BTN_OUTLINE} onClick={resetAll}>
                  다시 업로드
                </button>
                <Link href="/admin/products" style={BTN_PRIMARY}>
                  상품 목록 보기
                </Link>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
              아래 [전체 등록] 버튼을 누르면 유효 행만 일괄 등록합니다.
            </p>
          )}
        </div>
      </div>

      <div style={FOOTER_BAR}>
        <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
          {rows.length > 0 ? `유효 ${validCount}건 / 오류 ${errorCount}건` : ''}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/products" style={BTN_OUTLINE}>
            취소
          </Link>
          <button
            type="button"
            style={{
              ...BTN_PRIMARY,
              ...(submitting || validCount === 0 ? BTN_DISABLED : {}),
            }}
            onClick={submitAll}
            disabled={submitting || validCount === 0}
          >
            {submitting ? '등록 중...' : `전체 등록 (${validCount}건)`}
          </button>
        </div>
      </div>
    </>
  );
}

function Stepper({ step }: { step: StepKey }) {
  const items: Array<{ k: StepKey; label: string }> = [
    { k: 1, label: '양식 받기' },
    { k: 2, label: '파일 업로드' },
    { k: 3, label: '미리보기·검증' },
    { k: 4, label: '일괄 등록' },
  ];
  return (
    <div>
      <div style={STEPPER_WRAP}>
        {items.map((it, idx) => {
          const dotStyle =
            it.k === step ? STEP_DOT_ACTIVE : it.k < step ? STEP_DOT_DONE : STEP_DOT_BASE;
          return (
            <span key={it.k} style={{ display: 'flex', alignItems: 'center', flex: idx === items.length - 1 ? '0 0 auto' : '1 1 auto' }}>
              <span style={dotStyle}>{it.k}</span>
              {idx < items.length - 1 && (
                <span style={it.k < step ? STEPPER_LINE_ACTIVE : STEPPER_LINE} />
              )}
            </span>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {items.map((it) => (
          <div key={`l-${it.k}`} style={it.k === step ? STEP_LABEL_ACTIVE : STEP_LABEL}>
            {it.label}
          </div>
        ))}
      </div>
    </div>
  );
}
