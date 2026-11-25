import Nav from "@/components/Nav";
import Medical from "@/components/Medical";
import { TeamExperience } from "@/components/Portfolio";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { medicalFaqs, portfolioNotice } from "@/lib/data";
import { medicalMetadata, jsonLdMedicalService, jsonLdMedicalFaq, jsonLdMedicalBreadcrumb } from "@/lib/seo";

export const metadata = medicalMetadata;

const steps = [
  { num: "STEP 01", title: "상담 · 구성 기획", desc: "진료과목, 주력 시술, 환자층을 듣고 메뉴 구조와 페이지 목록을 정리합니다." },
  { num: "STEP 02", title: "카피 · 디자인 시안", desc: "의료광고 기준을 고려한 문구와 시안을 먼저 보여 드리고 확정합니다." },
  { num: "STEP 03", title: "개발 · CMS", desc: "반응형 화면과 직원용 관리자, 상담 · 예약 연결을 개발하고 함께 테스트합니다." },
  { num: "STEP 04", title: "오픈 · 검색 등록", desc: "개원일에 맞춰 오픈하고 네이버 · 구글 등록, 사용 매뉴얼 전달, 유지보수로 이어집니다." },
];

export default function HospitalHomepage() {
  return (
    <>
      <JsonLd data={jsonLdMedicalService} />
      <JsonLd data={jsonLdMedicalFaq} />
      <JsonLd data={jsonLdMedicalBreadcrumb} />
      <Nav />
      <main className="med-page">
        <div className="crumb wrap" aria-label="breadcrumb">
          <a href="/">홈</a> <span aria-hidden="true">/</span> <span>병원 홈페이지 제작</span>
        </div>
        <Medical headingLevel="h1" showMoreLink={false} />

        <section id="process" aria-label="병원 홈페이지 제작 절차">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="eyebrow">Process</span>
              <h2>병원 홈페이지 제작 절차</h2>
            </div>
            <div className="process-grid">
              {steps.map((s) => (
                <div className="process-step" key={s.num}>
                  <span className="step-num">{s.num}</span>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" aria-label="의료 분야 참여 이력">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="eyebrow">Experience</span>
              <h2>의료 분야 경험</h2>
            </div>
            <TeamExperience />
            <p className="pf-notice">{portfolioNotice}</p>
          </div>
        </section>

        <Faq items={medicalFaqs} title="병원 홈페이지 FAQ" />
        <Contact />
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
