import { WEEKDAYS } from '@/constants';

export const pad = (n: number) => String(n).padStart(2, '0');

export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const TODAY_KEY = toKey(new Date());

export const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const fmtDateKR = (key: string) => {
  const d = parseKey(key);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
};

export const dowOf = (key: string) => parseKey(key).getDay();

// 사귄 날 = 1일 (D+n)
export const ddayFrom = (anniversary: string): number | null => {
  if (!anniversary) return null;
  const a = parseKey(anniversary).getTime();
  const t = parseKey(TODAY_KEY).getTime();
  return Math.floor((t - a) / 86400000) + 1;
};
