import { portfolios, teamExperiences, portfolioNotice, type Portfolio as P } from "@/lib/data";

export function TeamExperience() {
  return (
    <div className="pf-group">
      <div className="pf-sub reveal">
        <h3>Team Experience</h3>
        <p>핵심 구성원의 이전 소속 기업 재직 당시 프로젝트 참여 이력</p>
      </div>
      <div className="te-grid">
        {teamExperiences.map((t) => (
          <article className="te" key={t.title}>
            <div className="b-meta">
              {t.category}
              <span className="status status-team">참여 이력</span>
              {t.link && (
                <a className="b-link" href={t.link} target="_blank" rel="noopener nofollow">
                  사이트 보기 →
                </a>
              )}
            </div>
            <h4>{t.title}</h4>
            <dl className="te-dl">
              <div><dt>고객</dt><dd>{t.client}</dd></div>
              <div><dt>담당 역할</dt><dd>{t.role}</dd></div>
              <div><dt>수행 범위</dt><dd><ul>{t.scope.map((s) => <li key={s}>{s}</li>)}</ul></dd></div>
            </dl>
            <p className="te-note">본 프로젝트는 당사 구성원이 이전 소속 기업 재직 당시 수행한 프로젝트이며, 당사의 직접 수주 실적이 아닙니다.</p>
          </article>
        ))}
      </div>
    </div>
  );
}

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
          <p>ERP · 쇼핑몰 · 숙박 · SaaS · 매칭 플랫폼 · 의료 · AI · 네이티브 앱 — 다양한 분야에서 성과를 만들어 왔습니다.</p>
        </div>

        <div className="pf-sub reveal">
          <h3>Company Projects</h3>
          <p>MaxImpact가 직접 수주하고 구축한 프로젝트</p>
        </div>
        <div className="bento stagger">
          {portfolios.map((p, idx) => {
            const style = p.size.w === 12 ? { gridColumn: "span 12" } : p.size.w === 6 && p.size.h === 1 ? { gridColumn: "span 6" } : undefined;
            return (
              <div className={`b ${sizeClasses(p.size)} b-${p.tone}`} key={idx} style={style}>
                <div className="b-meta">
                  {p.category} <span className="dot-sep" /> {p.year}
                  <span className={statusClass(p.status)}>{p.status}</span>
                  {p.link && (
                    <a className="b-link" href={p.link} target="_blank" rel="noopener">
                      데모 보기 →
                    </a>
                  )}
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

        <TeamExperience />

        <p className="pf-notice">{portfolioNotice}</p>
      </div>
    </section>
  );
}
