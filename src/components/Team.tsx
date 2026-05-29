import { teamItems, type TeamItem } from "@/lib/data";

function classFor(item: TeamItem) {
  const cls = ["t"];
  if (item.size.w === 6) cls.push("t-w6");
  if (item.size.w === 8) cls.push("t-w8");
  if (item.size.h === 1) cls.push("t-h1");
  if (item.size.h === 3) cls.push("t-h3");
  if (item.size.h === 2) cls.push("t-h2" as never); // base default but kept for clarity
  if (item.variant === "dark") cls.push("t-dark");
  if (item.variant === "accent") cls.push("t-accent");
  if (item.stat) cls.push("t-stat");
  return cls.join(" ").replace(" t-h2", "");
}

export default function Team() {
  return (
    <section id="team">
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow">The Team · 20 People</span>
          <h2>
            20명의 전문가,<br />
            <span className="italic">하나의 팀.</span>
          </h2>
          <p>기획·개발·디자인·보안·운영까지 — 각 분야 6년 이상 경력의 전문가 20명이 프로젝트마다 최적 조합으로 투입됩니다.</p>
        </div>

        <div className="team-bento stagger">
          {teamItems.map((t, idx) => (
            <div className={classFor(t)} key={idx}>
              <div className="t-count">
                {t.count}
                <span className="unit">명</span>
              </div>
              <div className="t-role">{t.role}</div>
              <h4>{t.title}</h4>
              <p>{t.desc}</p>
              {t.skills.length > 0 && (
                <div className="t-skills">
                  {t.skills.map((s) => <span key={s}>{s}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
