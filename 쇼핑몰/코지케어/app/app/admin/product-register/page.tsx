'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, ChangeEvent } from 'react';
import RichEditor from '@/components/admin/RichEditor';

type ColorChip = {
  name: string;
  color: string;
  border?: string;
};

type CategoryRef = { id: number; slug: string; name: string };

type ProductStatusValue = 'draft' | 'published' | 'hidden' | 'soldout';

type SubImage = {
  file: File;
  preview: string;
} | null;

const COLORS: ColorChip[] = [
  { name: '레드', color: '#dc2626' },
  { name: '블랙', color: '#1f2937' },
  { name: '블루', color: '#3b82f6' },
  { name: '옐로우', color: '#f59e0b' },
  { name: '그린', color: '#10b981' },
  { name: '실버', color: '#e5e7eb', border: '1px solid #ccc' },
];

const REG_BODY_STYLE: React.CSSProperties = { padding: '0 24px 24px', maxWidth: 1100, margin: '0 auto', width: '100%' };
const REG_TITLE_AREA_STYLE: React.CSSProperties = { marginBottom: 20 };
const REG_TITLE_H1: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: 'var(--fg-primary)', marginBottom: 6 };
const REG_TITLE_P: React.CSSProperties = { fontSize: 14, color: 'var(--fg-muted)' };
const REG_FORM_STYLE: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 };
const PANEL_STYLE: React.CSSProperties = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 };
const PANEL_TITLE_STYLE: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: 'var(--fg-primary)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 };
const NUM_STYLE: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 700 };
const COLOR_CHIPS_STYLE: React.CSSProperties = { display: 'flex', gap: 10, flexWrap: 'wrap' };
const COLOR_CHIP_BASE: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 20, background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 13 };
const COLOR_CHIP_SELECTED: React.CSSProperties = { borderColor: 'var(--accent)', background: 'rgba(132,193,64,0.08)' };
const DOT_BASE: React.CSSProperties = { width: 14, height: 14, borderRadius: '50%' };
const IMG_DROP_STYLE: React.CSSProperties = { position: 'relative', border: '2px dashed var(--border)', borderRadius: 10, padding: 32, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13, cursor: 'pointer', transition: 'all .15s', overflow: 'hidden' };
const IMG_DROP_ICON: React.CSSProperties = { fontSize: 32, display: 'block', marginBottom: 8, color: 'var(--accent)' };
const IMG_DROP_INPUT: React.CSSProperties = { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' };
const MAIN_PREVIEW_BASE: React.CSSProperties = { marginTop: 12 };
const MAIN_PREVIEW_IMG: React.CSSProperties = { maxWidth: 240, borderRadius: 8, border: '1px solid var(--border)' };
const REMOVE_BTN_STYLE: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 10, fontSize: 12, color: '#ef4444', cursor: 'pointer', verticalAlign: 'top', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-card)' };
const IMG_GRID_STYLE: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 12 };
const IMG_SLOT_BASE: React.CSSProperties = { position: 'relative', aspectRatio: '1', border: '1.5px dashed var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-muted)', fontSize: 20, cursor: 'pointer', overflow: 'hidden' };
const IMG_SLOT_FILLED: React.CSSProperties = { borderStyle: 'solid', borderColor: 'var(--border)' };
const IMG_SLOT_IMG: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const IMG_SLOT_INPUT: React.CSSProperties = { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' };
const SLOT_REMOVE_BASE: React.CSSProperties = { position: 'absolute', top: 4, right: 4, width: 20, height: 20, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'pointer', zIndex: 2 };
const TOGGLE_ROW_STYLE: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' };
const TOGGLE_ROW_LAST: React.CSSProperties = { ...TOGGLE_ROW_STYLE, borderBottom: 0 };
const L_TITLE_STYLE: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)' };
const L_DESC_STYLE: React.CSSProperties = { fontSize: 12, color: 'var(--fg-muted)', marginTop: 3 };
const SWITCH_BASE: React.CSSProperties = { position: 'relative', width: 44, height: 24, background: '#ccc', borderRadius: 12, cursor: 'pointer', transition: '.2s' };
const SWITCH_ON_BG: React.CSSProperties = { background: 'var(--accent)' };
const SWITCH_KNOB: React.CSSProperties = { content: '""', position: 'absolute', top: 2, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: '.2s' };
const EDITOR_AREA: React.CSSProperties = { minHeight: 180 };
const POINT_HINT: React.CSSProperties = { fontSize: 12, color: 'var(--accent)', marginTop: 4, display: 'block' };
const REG_FOOTER_STYLE: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '20px 24px', maxWidth: 1100, margin: '0 auto', width: '100%', borderTop: '1px solid var(--border)' };
const REG_FOOTER_BTN: React.CSSProperties = { minWidth: 120, padding: '12px 0', fontSize: 15 };

function SwitchToggle({ on, onClick, small }: { on: boolean; onClick: () => void; small?: boolean }) {
  const style: React.CSSProperties = {
    ...SWITCH_BASE,
    ...(on ? SWITCH_ON_BG : {}),
    ...(small ? { width: 32, height: 18 } : {}),
  };
  const knobStyle: React.CSSProperties = {
    ...SWITCH_KNOB,
    ...(small ? { width: 14, height: 14 } : {}),
    left: on ? (small ? 16 : 22) : 2,
  };
  return (
    <div className={`switch${on ? ' on' : ''}`} onClick={onClick} style={style}>
      <span style={knobStyle} />
    </div>
  );
}

export default function Page() {
  const router = useRouter();

  const [selectedColors, setSelectedColors] = useState<number[]>([0, 1]);
  const [priceValue, setPriceValue] = useState<string>('');
  const [welfareValue, setWelfareValue] = useState<string>('');
  const [autoCalc, setAutoCalc] = useState<boolean>(true);
  const [mainImage, setMainImage] = useState<{ file: File; preview: string } | null>(null);
  const [subImages, setSubImages] = useState<SubImage[]>([null, null, null, null, null]);
  const [exposeOn, setExposeOn] = useState<boolean>(true);
  const [welfareOn, setWelfareOn] = useState<boolean>(true);
  const [bizOnly, setBizOnly] = useState<boolean>(false);
  const [unsavedOpen, setUnsavedOpen] = useState<boolean>(false);
  const [logoutOpen, setLogoutOpen] = useState<boolean>(false);
  const [successOpen, setSuccessOpen] = useState<boolean>(false);

  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [detailContent, setDetailContent] = useState<string>('');
  const [supplierValue, setSupplierValue] = useState<string>('');
  const [pointValue, setPointValue] = useState<string>('');
  const [manager, setManager] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      const res = await fetch('/cozycare/api/categories');
      if (!res.ok) return;
      const data = (await res.json()) as { categories?: CategoryRef[] };
      if (!cancelled) setCategories(data.categories ?? []);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const parseNumeric = (raw: string): number | null => {
    const digits = raw.replace(/[^0-9]/g, '');
    if (!digits) return null;
    return parseInt(digits, 10);
  };

  const submitProduct = async (): Promise<void> => {
    setSubmitError('');
    const price = parseNumeric(priceValue);
    const stockNum = parseNumeric(stock);
    const categoryNum = categoryId ? parseInt(categoryId, 10) : null;

    if (!name.trim() || !code.trim() || !categoryNum || price === null) {
      setSubmitError('상품명, 모델번호, 카테고리, 정가는 필수 항목입니다.');
      return;
    }

    const welfareNum = parseNumeric(welfareValue);
    const supplierNum = parseNumeric(supplierValue);
    const pointNum = parseNumeric(pointValue);
    const status: ProductStatusValue = exposeOn ? 'published' : 'hidden';

    const options = selectedColors.map((idx) => ({ name: '색상', value: COLORS[idx].name }));

    setSubmitting(true);
    try {
      const res = await fetch('/cozycare/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          name: name.trim(),
          categoryId: categoryNum,
          bizOnly,
          price,
          welfarePrice: welfareOn ? welfareNum : null,
          supplierPrice: supplierNum,
          pointRate: pointNum,
          manager: manager.trim() || null,
          stock: stockNum ?? 0,
          status,
          thumbnail: mainImage?.preview ?? null,
          description: description.trim() || null,
          detailContent: detailContent.trim() || null,
          kcCert: null,
          images: subImages
            .filter((s): s is { file: File; preview: string } => s !== null)
            .map((s, idx) => ({ url: s.preview, order: idx })),
          options,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setSubmitError(data?.error === 'missing_fields' ? '필수 항목이 누락되었습니다.' : '등록에 실패했습니다.');
        return;
      }
      setSuccessOpen(true);
    } catch {
      setSubmitError('네트워크 오류로 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleColor = (idx: number): void => {
    setSelectedColors((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= 3) return prev;
      return [...prev, idx];
    });
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw) {
      const num = parseInt(raw, 10);
      setPriceValue(num.toLocaleString('ko-KR'));
      if (autoCalc) {
        setWelfareValue(Math.round(num * 0.15).toLocaleString('ko-KR'));
      }
    } else {
      setPriceValue('');
      if (autoCalc) setWelfareValue('');
    }
  };

  const handleWelfareChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setWelfareValue(e.target.value);
  };

  const handleSupplierChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setSupplierValue(raw ? parseInt(raw, 10).toLocaleString('ko-KR') : '');
  };

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        setMainImage({ file: f, preview: result });
      }
    };
    reader.readAsDataURL(f);
  };

  const removeMain = (): void => {
    setMainImage(null);
  };

  const handleSubImageChange = (idx: number, e: ChangeEvent<HTMLInputElement>): void => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        setSubImages((prev) => {
          const next = [...prev];
          next[idx] = { file: f, preview: result };
          return next;
        });
      }
    };
    reader.readAsDataURL(f);
  };

  const removeSub = (e: React.MouseEvent, idx: number): void => {
    e.stopPropagation();
    setSubImages((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  };

  const navigateTo = (path: string): void => {
    router.push(path);
  };

  const doLogout = (): void => {
    setLogoutOpen(false);
    router.push('/admin/login');
  };

  const mainPreviewStyle = useMemo<React.CSSProperties>(
    () => ({ ...MAIN_PREVIEW_BASE, display: mainImage ? 'block' : 'none' }),
    [mainImage]
  );

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>상품 등록</h1>
          <p>새 코지워커 제품 또는 외부 복지용구를 등록합니다</p>
        </div>
        <div className="top-bar-right">
          <Link href="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--fg-muted)', textDecoration: 'none' }}>
            <i className="icon-chevron-left" style={{ fontSize: 16 }}></i> 상품 목록
          </Link>
        </div>
      </div>

      <div className="content-scroll">
        <div className="reg-body" style={REG_BODY_STYLE}>
          <div className="reg-form" style={REG_FORM_STYLE}>
            {/* 1. 기본 정보 */}
            <div className="panel" style={PANEL_STYLE}>
              <div className="panel-title" style={PANEL_TITLE_STYLE}>
                <span className="num" style={NUM_STYLE}>1</span> 기본 정보
              </div>
              <div className="form-group">
                <label className="form-label">상품명 <span className="required">*</span></label>
                <input className="form-input" placeholder="예: 코지워커 카본로얄파인더" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">모델번호 <span className="required">*</span></label>
                  <input className="form-input" placeholder="예: CW-P04" value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">브랜드</label>
                  <input className="form-input" defaultValue="코지케어" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">카테고리 <span className="required">*</span></label>
                  <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">카테고리 선택</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">담당자</label>
                  <select className="form-select" value={manager} onChange={(e) => setManager(e.target.value)}>
                    <option value="">담당자 선택</option>
                    <option value="김민수">김민수</option>
                    <option value="박서연">박서연</option>
                    <option value="이지훈">이지훈</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. 가격 정보 */}
            <div className="panel" style={PANEL_STYLE}>
              <div className="panel-title" style={PANEL_TITLE_STYLE}>
                <span className="num" style={NUM_STYLE}>2</span> 가격 정보
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">정가 <span className="required">*</span></label>
                  <input
                    className="form-input"
                    placeholder="350,000"
                    type="text"
                    id="priceInput"
                    value={priceValue}
                    onChange={handlePriceChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    복지부담금 (15% 자동)
                    <span style={{ float: 'right', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'var(--fg-muted)' }}>
                      자동 계산
                      <SwitchToggle on={autoCalc} onClick={() => setAutoCalc((v) => !v)} small />
                    </span>
                  </label>
                  <input
                    className="form-input"
                    placeholder="52,500"
                    id="welfareInput"
                    value={welfareValue}
                    onChange={handleWelfareChange}
                  />
                  <span className="point-hint" style={POINT_HINT}>정가의 15% 자동 계산, 직접 수정 가능</span>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">사업자 공급가</label>
                  <input className="form-input" placeholder="280,000" value={supplierValue} onChange={handleSupplierChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">적립 포인트</label>
                  <input className="form-input" placeholder="3,500" value={pointValue} onChange={(e) => setPointValue(e.target.value.replace(/[^0-9]/g, ''))} />
                  <span className="point-hint" style={POINT_HINT}>사업자 회원 주문 시 적립</span>
                </div>
              </div>
            </div>

            {/* 3. 옵션 */}
            <div className="panel" style={PANEL_STYLE}>
              <div className="panel-title" style={PANEL_TITLE_STYLE}>
                <span className="num" style={NUM_STYLE}>3</span> 옵션
              </div>
              <div className="form-group">
                <label className="form-label">색상 (최대 3개)</label>
                <div className="color-chips" id="colorChips" style={COLOR_CHIPS_STYLE}>
                  {COLORS.map((c, idx) => {
                    const isSelected = selectedColors.includes(idx);
                    return (
                      <div
                        key={c.name}
                        className={`color-chip${isSelected ? ' selected' : ''}`}
                        style={{ ...COLOR_CHIP_BASE, ...(isSelected ? COLOR_CHIP_SELECTED : {}) }}
                        onClick={() => toggleColor(idx)}
                      >
                        <span
                          className="dot"
                          style={{ ...DOT_BASE, background: c.color, ...(c.border ? { border: c.border } : {}) }}
                        />
                        {c.name}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">재고 수량 <span className="required">*</span></label>
                <input className="form-input" placeholder="100" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>
            </div>

            {/* 4. 이미지 */}
            <div className="panel" style={PANEL_STYLE}>
              <div className="panel-title" style={PANEL_TITLE_STYLE}>
                <span className="num" style={NUM_STYLE}>4</span> 이미지
              </div>
              <div className="form-group">
                <label className="form-label">메인 이미지 <span className="required">*</span></label>
                <div
                  className="img-drop"
                  id="mainDrop"
                  style={{ ...IMG_DROP_STYLE, display: mainImage ? 'none' : 'block' }}
                >
                  <i className="icon-upload-cloud" style={IMG_DROP_ICON}></i>
                  파일을 드래그하거나 클릭해서 업로드<br />
                  <span style={{ fontSize: 11 }}>JPG, PNG · 권장 1000×1000px</span>
                  <input
                    type="file"
                    id="mainImg"
                    accept="image/*"
                    style={IMG_DROP_INPUT}
                    onChange={handleMainImageChange}
                  />
                </div>
                <div className={`main-preview${mainImage ? ' show' : ''}`} id="mainPreview" style={mainPreviewStyle}>
                  {mainImage && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img id="mainPreviewImg" alt="미리보기" src={mainImage.preview} style={MAIN_PREVIEW_IMG} />
                      <span className="remove-btn" onClick={removeMain} style={REMOVE_BTN_STYLE}>
                        <i className="icon-x" style={{ fontSize: 12 }}></i> 삭제
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">추가 이미지 (최대 5장)</label>
                <div className="img-grid" id="subGrid" style={IMG_GRID_STYLE}>
                  {subImages.map((sub, idx) => {
                    const filled = sub !== null;
                    return (
                      <div
                        key={idx}
                        className={`img-slot${filled ? ' filled' : ''}`}
                        data-idx={idx}
                        style={{ ...IMG_SLOT_BASE, ...(filled ? IMG_SLOT_FILLED : {}) }}
                      >
                        {filled && sub && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={sub.preview} alt={`추가 이미지 ${idx + 1}`} style={IMG_SLOT_IMG} />
                        )}
                        {!filled && <span className="slot-plus">+</span>}
                        <input
                          type="file"
                          accept="image/*"
                          className="sub-input"
                          style={IMG_SLOT_INPUT}
                          onChange={(e) => handleSubImageChange(idx, e)}
                        />
                        <span
                          className="slot-remove"
                          onClick={(e) => removeSub(e, idx)}
                          style={{ ...SLOT_REMOVE_BASE, display: filled ? 'flex' : 'none' }}
                        >
                          ×
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. 상세 설명 */}
            <div className="panel" style={PANEL_STYLE}>
              <div className="panel-title" style={PANEL_TITLE_STYLE}>
                <span className="num" style={NUM_STYLE}>5</span> 상세 설명
              </div>
              <div className="form-group">
                <label className="form-label">요약 설명 (목록·검색 노출용)</label>
                <textarea
                  className="form-textarea editor-area"
                  placeholder="제품의 특징을 한두 문장으로 요약하세요"
                  style={EDITOR_AREA}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">상세페이지 (이미지·내용)</label>
                <RichEditor value={detailContent} onChange={setDetailContent} placeholder="상세 설명과 상세컷 이미지를 등록하세요. 이미지 버튼으로 사진을 추가할 수 있습니다." />
              </div>
            </div>

            {/* 6. 노출 설정 */}
            <div className="panel" style={PANEL_STYLE}>
              <div className="panel-title" style={PANEL_TITLE_STYLE}>
                <span className="num" style={NUM_STYLE}>6</span> 노출 설정
              </div>
              <div className="toggle-row" style={TOGGLE_ROW_STYLE}>
                <div className="label-area">
                  <div className="l-title" style={L_TITLE_STYLE}>상품 노출</div>
                  <div className="l-desc" style={L_DESC_STYLE}>쇼핑몰에 상품을 노출합니다</div>
                </div>
                <SwitchToggle on={exposeOn} onClick={() => setExposeOn((v) => !v)} />
              </div>
              <div className="toggle-row" style={TOGGLE_ROW_STYLE}>
                <div className="label-area">
                  <div className="l-title" style={L_TITLE_STYLE}>복지용구 등록</div>
                  <div className="l-desc" style={L_DESC_STYLE}>공단 복지용구 코드로 등록된 상품 (인정번호 필요)</div>
                </div>
                <SwitchToggle on={welfareOn} onClick={() => setWelfareOn((v) => !v)} />
              </div>
              <div className="toggle-row" style={TOGGLE_ROW_LAST}>
                <div className="label-area">
                  <div className="l-title" style={L_TITLE_STYLE}>사업자 전용</div>
                  <div className="l-desc" style={L_DESC_STYLE}>사업자 회원에게만 노출 (일반 회원 비공개)</div>
                </div>
                <SwitchToggle on={bizOnly} onClick={() => setBizOnly((v) => !v)} />
              </div>
            </div>
          </div>

          {submitError && (
            <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 24px', color: '#ef4444', fontSize: 13, fontWeight: 600 }}>
              {submitError}
            </div>
          )}

          {/* Footer */}
          <div className="reg-footer" style={REG_FOOTER_STYLE}>
            <button
              className="btn btn-secondary"
              style={REG_FOOTER_BTN}
              onClick={() => navigateTo('/admin/products')}
            >
              취소
            </button>
            <button className="btn btn-secondary" style={REG_FOOTER_BTN}>임시저장</button>
            <button
              className="btn btn-primary"
              style={REG_FOOTER_BTN}
              onClick={submitProduct}
              disabled={submitting}
            >
              <i className="icon-check" style={{ fontSize: 16 }}></i> {submitting ? '등록 중...' : '등록'}
            </button>
          </div>
        </div>
      </div>

      {/* Shared Modals */}
      <div
        className={`modal-overlay${unsavedOpen ? ' show' : ''}`}
        id="unsavedModal"
        style={{ display: unsavedOpen ? 'flex' : 'none' }}
      >
        <div className="modal-content" style={{ width: 400 }}>
          <div className="modal-icon" style={{ background: '#FFF8EE' }}>
            <i className="icon-alert-triangle" style={{ color: '#FF9500', fontSize: 24 }}></i>
          </div>
          <div className="modal-title">저장하지 않은 변경사항이 있습니다</div>
          <div className="modal-desc">
            이 페이지를 떠나면 변경사항이 사라집니다.<br />
            정말 나가시겠습니까?
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setUnsavedOpen(false)}>나가기</button>
            <button className="btn btn-dark" onClick={() => setUnsavedOpen(false)}>저장 후 나가기</button>
          </div>
        </div>
      </div>

      <div
        className={`modal-overlay${logoutOpen ? ' show' : ''}`}
        id="logoutModal"
        style={{ display: logoutOpen ? 'flex' : 'none' }}
      >
        <div className="modal-content" style={{ width: 400 }}>
          <div className="modal-icon" style={{ background: '#F3F4F6' }}>
            <i className="icon-log-out" style={{ color: '#4B5563', fontSize: 24 }}></i>
          </div>
          <div className="modal-title">로그아웃 하시겠습니까?</div>
          <div className="modal-desc">다시 로그인이 필요합니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setLogoutOpen(false)}>취소</button>
            <button className="btn btn-dark" onClick={doLogout}>로그아웃</button>
          </div>
        </div>
      </div>

      <div
        className={`modal-overlay${successOpen ? ' show' : ''}`}
        id="successModal"
        style={{ display: successOpen ? 'flex' : 'none' }}
      >
        <div className="modal-content" style={{ width: 400 }}>
          <div className="modal-icon" style={{ background: '#EEFBF0' }}>
            <i className="icon-check-circle" style={{ color: '#34C759', fontSize: 24 }}></i>
          </div>
          <div className="modal-title">등록이 완료되었습니다</div>
          <div className="modal-desc">목록 페이지로 이동하거나 상세보기 할 수 있습니다.</div>
          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSuccessOpen(false);
                router.push('/admin/products');
                router.refresh();
              }}
            >
              목록으로
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSuccessOpen(false);
                router.push('/admin/products');
                router.refresh();
              }}
            >
              상세보기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
