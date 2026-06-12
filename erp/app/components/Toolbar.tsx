import Link from "next/link";

export function SearchForm({ q, placeholder, action }: { q?: string; placeholder?: string; action: string }) {
  return (
    <form action={action} method="get" style={{ display: "flex", gap: 8 }}>
      <input className="f" name="q" defaultValue={q ?? ""} placeholder={placeholder ?? "검색…"} style={{ width: 240 }} />
      <button className="btn ghost" type="submit">검색</button>
    </form>
  );
}

export function Pager({ base, page, pages, q, extra }: { base: string; page: number; pages: number; q?: string; extra?: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const qs = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (extra) for (const [k, v] of Object.entries(extra)) if (v) sp.set(k, v);
    sp.set("page", String(p));
    return `${base}?${sp.toString()}`;
  };
  const win = [];
  const from = Math.max(1, page - 2), to = Math.min(pages, page + 2);
  for (let i = from; i <= to; i++) win.push(i);
  return (
    <div style={{ display: "flex", gap: 6, padding: 14, justifyContent: "center", alignItems: "center" }}>
      {page > 1 && <Link className="btn ghost" href={qs(page - 1)} style={{ padding: "6px 10px" }}>‹</Link>}
      {from > 1 && <span style={{ color: "var(--sub)" }}>…</span>}
      {win.map((i) => (
        <Link key={i} href={qs(i)} className={"btn " + (i === page ? "primary" : "ghost")} style={{ padding: "6px 11px" }}>{i}</Link>
      ))}
      {to < pages && <span style={{ color: "var(--sub)" }}>…</span>}
      {page < pages && <Link className="btn ghost" href={qs(page + 1)} style={{ padding: "6px 10px" }}>›</Link>}
    </div>
  );
}
