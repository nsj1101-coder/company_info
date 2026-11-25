import type { Metadata } from "next";
import { generalFaqs, medicalFaqs, portfolios, type Faq } from "@/lib/data";

export const SITE_URL = "https://maximpact.co.kr";
export const MEDICAL_PATH = "/hospital-homepage";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MaxImpact | 병원 홈페이지 제작 · 웹 개발 외주 · 쇼핑몰 · AI SaaS 개발",
    template: "%s | MaxImpact",
  },
  description:
    "MaxImpact는 병의원 홈페이지, 기업 홈페이지, 쇼핑몰, ERP/CRM, AI SaaS, 앱까지 기획부터 배포·유지보수까지 한 팀이 맡는 AI·웹 개발 외주팀입니다. 의료광고 기준을 고려한 병원 홈페이지와 직원이 직접 수정하는 CMS를 만듭니다.",
  keywords: [
    "병원 홈페이지 제작", "의원 홈페이지 제작", "병의원 홈페이지", "피부과 홈페이지 제작", "성형외과 홈페이지 제작",
    "치과 홈페이지 제작", "한의원 홈페이지 제작", "개원 홈페이지", "병원 홈페이지 리뉴얼", "의료 홈페이지 CMS",
    "웹 개발", "웹사이트 제작", "홈페이지 제작", "외주 개발", "외주 개발팀", "웹 외주",
    "프리랜서 개발자", "프리랜서 웹 개발", "쇼핑몰 제작", "쇼핑몰 개발", "커머스 개발",
    "소프트웨어 개발", "앱 개발", "모바일 앱 개발", "ERP 개발", "CRM 개발", "CMS 개발",
    "AI 개발", "AI SaaS", "챗봇 개발", "OpenAI 개발", "Claude API",
    "풀스택 개발", "Next.js 개발", "React 개발", "Node.js 개발",
    "숙박 예약 사이트", "반응형 웹", "랜딩페이지 제작",
    "기업 홈페이지", "IT 외주", "개발 에이전시", "스타트업 MVP", "유지보수", "MaxImpact", "맥스임팩트",
  ],
  authors: [{ name: "MaxImpact" }],
  creator: "MaxImpact",
  publisher: "MaxImpact",
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: "/" },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    siteName: "MaxImpact",
    title: "MaxImpact | 병원 홈페이지 제작 · 웹 개발 외주 · 쇼핑몰 · AI SaaS 개발",
    description: "기획부터 배포·유지보수까지 한 팀이 맡는 AI·웹 개발 외주팀. 병의원 홈페이지, 쇼핑몰, ERP, 숙박 예약, AI SaaS, 앱 개발.",
    url: "/",
    locale: "ko_KR",
    alternateLocale: ["en_US"],
    images: [{ url: "/maximpact_logo.png", width: 1200, height: 630, alt: "MaxImpact - AI · 웹 개발 전문팀" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MaxImpact | 병원 홈페이지 제작 · 웹 개발 외주 · 쇼핑몰 · AI SaaS 개발",
    description: "기획부터 배포·유지보수까지 한 팀이 맡는 AI·웹 개발 외주팀. 병의원 홈페이지, 쇼핑몰, ERP, AI SaaS, 앱 개발.",
    images: ["/maximpact_logo.png"],
  },
  other: {
    "geo.region": "KR-11",
    "geo.country": "South Korea",
    "geo.placename": "Seoul, Republic of Korea",
    ICBM: "37.5665, 126.9780",
    language: "Korean",
    "dcterms.subject": "병원 홈페이지 제작, 웹 개발, 쇼핑몰 제작, AI SaaS, 외주 개발팀",
  },
  icons: { icon: "/favicon.ico", apple: "/maximpact_logo.png" },
};

const ORG_ID = SITE_URL + "/#organization";

export const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: "MaxImpact",
  alternateName: ["맥스임팩트", "MaxImpact AI"],
  url: SITE_URL + "/",
  logo: SITE_URL + "/maximpact_logo.png",
  image: SITE_URL + "/maximpact_logo.png",
  description: "AI · 웹 개발 외주팀. 병의원 · 기업 홈페이지, 쇼핑몰, ERP/CRM, 숙박 예약, AI SaaS, 모바일 앱까지 기획부터 배포 · 유지보수까지 한 팀이 맡습니다.",
  email: "maximpact.it@gmail.com",
  foundingDate: "2024",
  areaServed: { "@type": "Country", name: "South Korea" },
  address: { "@type": "PostalAddress", addressCountry: "KR", addressRegion: "Seoul" },
  knowsAbout: ["병원 홈페이지 제작", "의료광고 기준", "CMS", "쇼핑몰 개발", "ERP 개발", "AI SaaS", "Next.js", "NestJS", "SEO"],
  contactPoint: { "@type": "ContactPoint", contactType: "sales", email: "maximpact.it@gmail.com", availableLanguage: ["Korean", "English"] },
};

export const jsonLdProfessionalService = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "MaxImpact - 웹 개발 외주 전문팀",
  parentOrganization: { "@id": ORG_ID },
  image: SITE_URL + "/maximpact_logo.png",
  url: SITE_URL + "/",
  email: "maximpact.it@gmail.com",
  priceRange: "₩₩",
  address: { "@type": "PostalAddress", addressCountry: "KR", addressRegion: "Seoul", addressLocality: "서울" },
  geo: { "@type": "GeoCoordinates", latitude: 37.5665, longitude: 126.978 },
  areaServed: ["South Korea", "대한민국", "서울", "경기", "전국"],
  serviceType: ["병원 홈페이지 제작", "웹사이트 제작", "홈페이지 제작", "쇼핑몰 제작", "ERP 개발", "CRM 개발", "AI SaaS 개발", "모바일 앱 개발", "유지보수"],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00", closes: "19:00",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "웹/앱 개발 서비스",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "병의원 홈페이지 개설 · 리뉴얼 (CMS · 예약 연동)", url: SITE_URL + MEDICAL_PATH } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "기업용 ERP·CRM·CMS 통합 관리 시스템 개발" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "쇼핑몰·마켓플레이스 커머스 플랫폼 개발" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI 기반 SaaS 플랫폼 개발 (OpenAI · Claude API)" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "데이터 분석 · 처리 엔진 개발" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "iOS · Android 네이티브 앱 개발" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "기업 홈페이지 · 랜딩페이지 제작" } },
    ],
  },
};

export const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MaxImpact",
  url: SITE_URL + "/",
  inLanguage: "ko-KR",
  publisher: { "@id": ORG_ID },
};

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem", position: i + 1, name: it.name, item: SITE_URL + it.path,
    })),
  };
}

export const jsonLdHomeFaq = faqJsonLd([...generalFaqs, medicalFaqs[0], medicalFaqs[2]]);
export const jsonLdHomeBreadcrumb = breadcrumbJsonLd([{ name: "홈", path: "/" }]);

export const jsonLdPortfolio = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "MaxImpact 프로젝트 포트폴리오",
  itemListElement: portfolios.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "CreativeWork",
      name: p.title,
      genre: p.category,
      dateCreated: p.year,
      ...(p.desc ? { description: p.desc } : {}),
      ...(p.link ? { url: SITE_URL + p.link } : {}),
      creator: { "@id": ORG_ID },
    },
  })),
};

export const medicalMetadata: Metadata = {
  title: "병원 홈페이지 제작 · 개원 홈페이지 개설 | 피부과 · 성형외과 · 치과 · 한의원",
  description:
    "개원 준비부터 리뉴얼까지 병의원 홈페이지를 기획·디자인·개발합니다. 의료법 제56조 광고 기준을 고려한 카피, 시술 가격·이벤트를 직원이 직접 수정하는 CMS, 상담·예약 연동, 네이버·구글 검색 노출까지 한 팀이 맡습니다.",
  keywords: [
    "병원 홈페이지 제작", "의원 홈페이지 제작", "개원 홈페이지", "병원 홈페이지 리뉴얼", "피부과 홈페이지 제작",
    "성형외과 홈페이지 제작", "치과 홈페이지 제작", "한의원 홈페이지 제작", "안과 홈페이지", "병원 CMS",
    "의료광고 홈페이지", "병원 예약 연동", "병원 SEO", "외국인 환자 다국어 홈페이지",
  ],
  alternates: { canonical: MEDICAL_PATH },
  openGraph: {
    type: "website",
    siteName: "MaxImpact",
    url: MEDICAL_PATH,
    locale: "ko_KR",
    title: "병원 홈페이지 제작 · 개원 홈페이지 개설 | MaxImpact",
    description: "의료광고 기준을 고려한 카피, 직원이 직접 수정하는 CMS, 상담·예약 연동, 검색 노출까지. 병의원 홈페이지를 한 팀이 끝까지 맡습니다.",
    images: [{ url: "/maximpact_logo.png", width: 1200, height: 630, alt: "MaxImpact 병원 홈페이지 제작" }],
  },
};

export const jsonLdMedicalService = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "병의원 홈페이지 개설 · 리뉴얼",
  serviceType: "병원 홈페이지 제작",
  url: SITE_URL + MEDICAL_PATH,
  provider: { "@id": ORG_ID, "@type": "Organization", name: "MaxImpact", url: SITE_URL + "/" },
  areaServed: { "@type": "Country", name: "South Korea" },
  audience: { "@type": "BusinessAudience", audienceType: "병원 · 의원 · 치과 · 한의원 등 의료기관" },
  description:
    "진료과목·의료진·시술 안내 페이지, 시술 가격·이벤트를 직원이 직접 수정하는 CMS, 상담·예약 연동, 의료광고 기준을 고려한 카피, 검색 노출(SEO), 개인정보 처리방침, 외국인 환자용 다국어 페이지를 포함한 병의원 홈페이지 제작 서비스.",
  offers: { "@type": "Offer", priceCurrency: "KRW", availability: "https://schema.org/InStock", description: "상담 후 기능 목록과 일정이 적힌 견적서 무료 제공" },
};

export const jsonLdMedicalFaq = faqJsonLd(medicalFaqs);
export const jsonLdMedicalBreadcrumb = breadcrumbJsonLd([
  { name: "홈", path: "/" },
  { name: "병원 홈페이지 제작", path: MEDICAL_PATH },
]);
