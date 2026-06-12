export const won = (n: number | null | undefined) => (n ?? 0).toLocaleString("ko-KR") + "원";
export const num = (n: number | null | undefined) => (n ?? 0).toLocaleString("ko-KR");
export const eok = (n: number | null | undefined) => {
  const v = n ?? 0;
  if (v >= 100000000) return (v / 100000000).toFixed(1) + "억";
  if (v >= 10000) return Math.round(v / 10000).toLocaleString() + "만";
  return v.toLocaleString();
};
export const ymd = (d: Date | string | null | undefined) => {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "-";
  return dt.toISOString().slice(0, 10);
};
