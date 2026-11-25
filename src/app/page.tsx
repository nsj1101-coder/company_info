import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import Services from "@/components/Services";
import Medical from "@/components/Medical";
import Portfolio from "@/components/Portfolio";
import Process from "@/components/Process";
import Why from "@/components/Why";
import Team from "@/components/Team";
import Faq from "@/components/Faq";
import Cta from "@/components/Cta";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { generalFaqs, medicalFaqs } from "@/lib/data";
import { jsonLdHomeFaq, jsonLdHomeBreadcrumb, jsonLdPortfolio } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <JsonLd data={jsonLdHomeFaq} />
      <JsonLd data={jsonLdHomeBreadcrumb} />
      <JsonLd data={jsonLdPortfolio} />
      <Nav />
      <h1 className="sr-only">
        MaxImpact — 병원 홈페이지 제작 · 웹 개발 외주 · 쇼핑몰 제작 · AI SaaS 개발 전문 팀 | 홈페이지 제작, ERP·CRM, 모바일 앱 개발 외주 업체
      </h1>
      <Hero />
      <Metrics />
      <Services />
      <Medical />
      <Portfolio />
      <Process />
      <Why />
      <Team />
      <Faq items={[...generalFaqs, medicalFaqs[0], medicalFaqs[2]]} />
      <Cta />
      <Contact />
      <Footer />
      <Reveal />
    </>
  );
}
