import { medicalFeatures, medicalTargets } from "@/lib/data";
import { MEDICAL_PATH } from "@/lib/seo";

type Props = { headingLevel?: "h1" | "h2"; showMoreLink?: boolean };

export default function Medical({ headingLevel = "h2", showMoreLink = true }: Props) {
  const Heading = headingLevel;
  return (
    <section id="medical" aria-label="병의원 홈페이지 개설">
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow">For Clinics · 병의원 홈페이지 개설</span>
          <Heading className="med-title">
            병원 홈페이지,<br />
            <span className="italic">개원부터 운영까지.</span>
          </Heading>
          <p>
            MaxImpact는 병의원 홈페이지를 기획부터 디자인, 개발, 검색 등록까지 한 팀이 맡습니다.
            의료광고 기준을 고려한 카피와, 시술 가격 · 이벤트를 병원 직원이 직접 수정하는 관리자(CMS)를 함께 만듭니다.
          </p>
        </div>

        <ul className="med-targets reveal" aria-label="제작 가능 진료과">
          {medicalTargets.map((t) => <li key={t}>{t}</li>)}
        </ul>

        <div className="med-grid stagger">
          {medicalFeatures.map((f, i) => (
            <div className="med-item" key={f.title}>
              <span className="med-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="med-actions reveal">
          <a href="/#contact" className="btn btn-dark">병원 홈페이지 상담 신청</a>
          {showMoreLink && (
            <a href={MEDICAL_PATH} className="btn btn-light">병원 홈페이지 제작 자세히 보기 →</a>
          )}
        </div>
      </div>
    </section>
  );
}
