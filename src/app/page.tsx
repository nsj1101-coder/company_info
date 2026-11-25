import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Process from "@/components/Process";
import Why from "@/components/Why";
import Team from "@/components/Team";
import Cta from "@/components/Cta";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export default function HomePage() {
  return (
    <>
      <Nav />
      <h1 className="sr-only">
        MaxImpact — 웹 개발 외주 · 쇼핑몰 제작 · AI SaaS 개발 전문 팀 | 홈페이지 제작, ERP·CRM, 모바일 앱 개발 외주 업체
      </h1>
      <Hero />
      <Metrics />
      <Services />
      <Portfolio />
      <Process />
      <Why />
      <Team />
      <Cta />
      <Contact />
      <Footer />
      <Reveal />
    </>
  );
}
