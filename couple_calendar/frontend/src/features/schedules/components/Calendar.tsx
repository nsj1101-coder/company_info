import { useRef, useState, type TouchEvent } from 'react';
import type { Schedule } from '@/types';
import { CATEGORIES, WEEKDAYS } from '@/constants';
import { TODAY_KEY, pad } from '@/utils/date';
import styles from './Calendar.module.css';

interface Props {
  year: number;
  month: number; // 0-11
  selected: string;
  schedules: Schedule[];
  onSelect: (key: string) => void;
  onMove: (delta: number) => void;
}

export default function Calendar({ year, month, selected, schedules, onSelect, onMove }: Props) {
  const byDate = new Map<string, Schedule[]>();
  schedules.forEach((s) => {
    const arr = byDate.get(s.date) ?? [];
    arr.push(s);
    byDate.set(s.date, arr);
  });

  const key = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const startDow = new Date(year, month, 1).getDay();
  const daysIn = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  type Cell = { k: string; d: number; dim: boolean };
  const cells: Cell[] = [];
  for (let i = startDow - 1; i >= 0; i--)
    cells.push({ k: key(year, month - 1, prevDays - i), d: prevDays - i, dim: true });
  for (let d = 1; d <= daysIn; d++) cells.push({ k: key(year, month, d), d, dim: false });
  const tail = (startDow + daysIn) % 7;
  if (tail) for (let d = 1; d <= 7 - tail; d++) cells.push({ k: key(year, month + 1, d), d, dim: true });

  // ===== 스와이프(드래그) 제스처 =====
  const wrapRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const widthRef = useRef(320);
  const axis = useRef<'none' | 'h' | 'v'>('none');
  const moved = useRef(false);
  const locked = useRef(false); // 애니메이션 중 입력 잠금
  const [dx, setDx] = useState(0);
  const [trans, setTrans] = useState(false);

  const onTouchStart = (e: TouchEvent) => {
    if (locked.current) return;
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
    widthRef.current = wrapRef.current?.offsetWidth || 320;
    axis.current = 'none';
    moved.current = false;
    setTrans(false);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (locked.current) return;
    const t = e.touches[0];
    const ddx = t.clientX - startX.current;
    const ddy = t.clientY - startY.current;
    if (axis.current === 'none' && (Math.abs(ddx) > 10 || Math.abs(ddy) > 10)) {
      axis.current = Math.abs(ddx) > Math.abs(ddy) ? 'h' : 'v';
    }
    if (axis.current === 'h') {
      moved.current = true;
      setDx(ddx);
    }
  };

  const onTouchEnd = () => {
    if (locked.current || axis.current !== 'h') {
      setDx(0);
      return;
    }
    const w = widthRef.current;
    const threshold = Math.min(64, w * 0.18);
    if (Math.abs(dx) <= threshold) {
      setTrans(true);
      setDx(0); // 스냅백
      return;
    }
    const delta = dx < 0 ? 1 : -1;
    locked.current = true;
    setTrans(true);
    setDx(dx < 0 ? -w : w); // 현재 달 슬라이드 아웃
    window.setTimeout(() => {
      onMove(delta);
      setTrans(false);
      setDx(dx < 0 ? w : -w); // 새 달을 반대편에 배치
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setTrans(true);
          setDx(0); // 슬라이드 인
          window.setTimeout(() => {
            locked.current = false;
          }, 230);
        }),
      );
    }, 200);
  };

  // 드래그 중에는 날짜 클릭 무시
  const handleSelect = (k: string) => {
    if (moved.current) return;
    onSelect(k);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.nav}>
        <button onClick={() => onMove(-1)} aria-label="이전 달">
          ‹
        </button>
        <div className={styles.ym}>
          {year}년 {month + 1}월
        </div>
        <button onClick={() => onMove(1)} aria-label="다음 달">
          ›
        </button>
      </div>

      <div className={styles.week}>
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`${styles.wd} ${i === 0 ? styles.sun : i === 6 ? styles.sat : ''}`}>
            {w}
          </div>
        ))}
      </div>

      <div
        className={styles.swipe}
        ref={wrapRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div
          className={styles.days}
          style={{ transform: `translateX(${dx}px)`, transition: trans ? 'transform 0.22s cubic-bezier(0.22,0.61,0.36,1)' : 'none' }}
        >
          {cells.map((c) => {
            const evs = byDate.get(c.k) ?? [];
            const dow = new Date(c.k).getDay();
            const cls = [styles.cell];
            if (c.dim) cls.push(styles.dim);
            if (!c.dim && c.k === TODAY_KEY) cls.push(styles.today);
            if (!c.dim && c.k === selected) cls.push(styles.sel);
            if (dow === 0) cls.push(styles.sunCell);
            if (dow === 6) cls.push(styles.satCell);
            return (
              <button key={c.k} className={cls.join(' ')} onClick={() => handleSelect(c.k)}>
                <span className={styles.dnum}>{c.d}</span>
                <span className={styles.previews}>
                  {evs.slice(0, 2).map((e) => (
                    <span
                      key={e.id}
                      className={styles.chip}
                      style={{ background: CATEGORIES[e.category].shade }}
                    >
                      {e.title}
                    </span>
                  ))}
                  {evs.length > 2 && <span className={styles.more}>+{evs.length - 2}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
