'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export type QuoteProduct = { id: number; name: string; price: number };

type Line = { key: number; productId: number | ''; qty: number };

export default function QuoteRequestClient({ bizId, products }: { bizId: number; products: QuoteProduct[] }) {
  const router = useRouter();
  const priceMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const [title, setTitle] = useState('');
  const [lines, setLines] = useState<Line[]>([{ key: Date.now(), productId: '', qty: 1 }]);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<string | null>(null);

  const addLine = () => setLines((ls) => [...ls, { key: Date.now() + ls.length, productId: '', qty: 1 }]);
  const removeLine = (key: number) => setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.key !== key)));
  const updateLine = (key: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const total = lines.reduce((sum, l) => {
    const p = l.productId === '' ? undefined : priceMap.get(l.productId);
    return sum + (p ? p.price * l.qty : 0);
  }, 0);

  const submit = async () => {
    setErr('');
    const items = lines
      .filter((l) => l.productId !== '' && l.qty > 0)
      .map((l) => {
        const p = priceMap.get(l.productId as number)!;
        return { productId: p.id, productName: p.name, qty: l.qty, unitPrice: p.price };
      });
    if (items.length === 0) {
      setErr('상품과 수량을 1개 이상 선택해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/cozycare/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bizId, title: title.trim() || undefined, items }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; quoteNo?: string; error?: string };
      if (res.ok && data.ok) {
        setDone(data.quoteNo ?? '');
        return;
      }
      setErr(data.error ?? '견적 요청에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } catch {
      setErr('견적 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done !== null) {
    return (
      <div className="qt-done">
        <div className="qt-done-mark">✓</div>
        <h2>견적 요청이 접수되었습니다</h2>
        {done && <p className="qt-done-no">접수번호 <b>{done}</b></p>}
        <p className="qt-done-desc">담당자가 확인 후 견적서를 회신해드립니다. 진행 현황은 관리자 페이지에서 확인하실 수 있습니다.</p>
        <button type="button" className="qt-submit" onClick={() => router.push('/admin/quotes')}>
          견적 현황 보기
        </button>
      </div>
    );
  }

  return (
    <div className="qt-form">
      {err && <div className="qt-err">{err}</div>}

      <div className="qt-field">
        <label htmlFor="qt-title">견적 제목 (선택)</label>
        <input
          id="qt-title"
          type="text"
          className="qt-input"
          placeholder="예: 2026년 1분기 복지용구 정기 발주"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="qt-lines">
        {lines.map((l) => {
          const p = l.productId === '' ? undefined : priceMap.get(l.productId);
          return (
            <div key={l.key} className="qt-line">
              <select
                className="qt-input qt-line-product"
                value={l.productId}
                onChange={(e) => updateLine(l.key, { productId: e.target.value === '' ? '' : Number(e.target.value) })}
              >
                <option value="">상품 선택</option>
                {products.map((pr) => (
                  <option key={pr.id} value={pr.id}>{pr.name}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                className="qt-input qt-line-qty"
                value={l.qty}
                onChange={(e) => updateLine(l.key, { qty: Math.max(1, Number(e.target.value) || 1) })}
              />
              <span className="qt-line-amt">{p ? `${(p.price * l.qty).toLocaleString()}원` : '-'}</span>
              <button type="button" className="qt-line-del" onClick={() => removeLine(l.key)} aria-label="품목 삭제">×</button>
            </div>
          );
        })}
      </div>

      <button type="button" className="qt-add" onClick={addLine}>+ 품목 추가</button>

      <div className="qt-total">
        <span>예상 합계</span>
        <strong>{total.toLocaleString()}원</strong>
      </div>
      <p className="qt-total-note">* 표시 금액은 정가 기준 예상액이며, 실제 견적가는 담당자 검토 후 확정됩니다.</p>

      <button type="button" className="qt-submit" onClick={submit} disabled={submitting}>
        {submitting ? '요청 중...' : '견적 요청하기'}
      </button>
    </div>
  );
}
