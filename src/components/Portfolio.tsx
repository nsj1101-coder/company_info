import { portfolios, type Portfolio as P } from "@/lib/data";

function statusClass(s: P["status"]) {
  if (s === "LIVE") return "status status-live";
  if (s === "완료") return "status status-completed";
  return "status status-progress";
}

function sizeClasses(size: P["size"]) {
  const w = size.w === 12 ? "" : ` b-w${size.w === 4 ? "" : size.w}`.trim();
  const wClass = size.w === 4 ? "" : `b-w${size.w}`;
  const hClass = `b-h${size.h}`;
  return [wClass, hClass].filter(Boolean).join(" ");
}

export default function Portfolio() {
  return (
    <section id="portfolio">
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow">Selected Work</span>
          <h2>
            Real projects,<br />
            <span className="italic">real impact.</span>
          </h2>
          <p>SaaS · 매칭 플랫폼 · 의료 · 핀테크 · AI · 네이티브 앱 — 다양한 분야에서 성과를 만들어 왔습니다.</p>
        </div>

        <div className="bento stagger">
          {portfolios.map((p, idx) => {
            const style = p.size.w === 12 ? { gridColumn: "span 12" } : p.size.w === 6 && p.size.h === 1 ? { gridColumn: "span 6" } : undefined;
            return (
              <div className={`b ${sizeClasses(p.size)} b-${p.tone}`} key={idx} style={style}>
                <div className="b-meta">
                  {p.category} <span className="dot-sep" /> {p.year}
                  <span className={statusClass(p.status)}>{p.status}</span>
                </div>
                <h3 style={p.size.h === 1 ? { fontSize: 20 } : undefined}>{p.title}</h3>
                {p.desc && <p>{p.desc}</p>}
                {p.features && (
                  <ul className="b-feat-list">
                    {p.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                )}
                {p.tags.length > 0 && (
                  <div className="b-tags">
                    {p.tags.map((t, i) => (
                      <span key={t} className={i === 0 ? "primary" : undefined}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
