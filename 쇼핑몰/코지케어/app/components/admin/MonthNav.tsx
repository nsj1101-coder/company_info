'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function MonthNav({ month }: { month: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();

  const navTo = (m: string): void => {
    const p = new URLSearchParams(sp.toString());
    if (m) p.set('month', m);
    else p.delete('month');
    router.push(`${pathname}?${p.toString()}`);
  };

  const shift = (delta: number): void => {
    const [y, mm] = month.split('-').map(Number);
    const d = new Date(y, mm - 1 + delta, 1);
    navTo(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <button className="btn-sm" type="button" onClick={() => shift(-1)}><i className="icon-chevron-left" /> 이전달</button>
      <input
        type="month"
        value={month}
        onChange={(e) => navTo(e.target.value)}
        style={{ height: 32, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, fontFamily: 'inherit' }}
      />
      <button className="btn-sm" type="button" onClick={() => shift(1)}>다음달 <i className="icon-chevron-right" /></button>
    </div>
  );
}
