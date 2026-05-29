import type { Metadata } from "next";

export const SITE_URL = "https://maximpact.co.kr";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MaxImpact | 웹 개발 외주 · 쇼핑몰 제작 · AI SaaS 개발 전문팀",
    template: "%s | MaxImpact",
  },
  description:
    "MaxImpact는 웹사이트·쇼핑몰·ERP/CRM·AI SaaS·앱까지 기획부터 배포·유지보수까지 책임지는 20인 규모의 AI·웹 개발 외주팀입니다. 프리랜서 단가로 에이전시 품질, 평균 24시간 내 견적 회신. 50+ 프로젝트 완수.",
  keywords: [
    "웹 개발", "웹사이트 제작", "홈페이지 제작", "외주 개발", "외주 개발팀", "웹 외주",
    "프리랜서 개발자", "프리랜서 웹 개발", "쇼핑몰 제작", "쇼핑몰 개발", "커머스 개발",
    "소프트웨어 개발", "앱 개발", "모바일 앱 개발", "ERP 개발", "CRM 개발", "CMS 개발",
    "AI 개발", "AI SaaS", "챗봇 개발", "OpenAI 개발", "Claude API",
    "풀스택 개발", "Next.js 개발", "React 개발", "Node.js 개발",
    "백엔드 개발", "프론트엔드 개발", "반응형 웹", "랜딩페이지 제작",
    "기업 홈페이지", "IT 외주", "개발 에이전시", "스타트업 MVP", "시스템 통합",
    "유지보수", "웹 호스팅", "MaxImpact", "맥스임팩트",
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
    title: "MaxImpact | 웹 개발 외주 · 쇼핑몰 제작 · AI SaaS 개발 전문팀",
    description: "기획부터 배포·유지보수까지 한 팀이 끝까지 책임지는 AI·웹 개발 외주 전문팀. 웹사이트·쇼핑몰·ERP·AI SaaS·앱 개발. 평균 24시간 내 견적 회신.",
    url: "/",
    locale: "ko_KR",
    alternateLocale: ["en_US"],
    images: [{ url: "/maximpact_logo.png", width: 1200, height: 630, alt: "MaxImpact - AI · 웹 개발 전문팀" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MaxImpact | 웹 개발 외주 · 쇼핑몰 제작 · AI SaaS 개발 전문팀",
    description: "기획부터 배포·유지보수까지 책임지는 AI·웹 개발 외주 전문팀. 웹사이트·쇼핑몰·ERP·AI SaaS·앱 개발 전문.",
    images: ["/maximpact_logo.png"],
  },
  other: {
    "geo.region": "KR",
    "geo.country": "South Korea",
    "geo.placename": "Seoul, Republic of Korea",
    ICBM: "37.5665, 126.9780",
    language: "Korean",
    "naver-site-verification": "",
    "dcterms.subject": "웹 개발, 쇼핑몰 제작, AI SaaS, 외주 개발팀",
  },
  icons: { icon: "/favicon.ico", apple: "/maximpact_logo.png" },
};

export const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MaxImpact",
  alternateName: ["맥스임팩트", "MaxImpact AI"],
  url: SITE_URL + "/",
  logo: SITE_URL + "/maximpact_logo.png",
  image: SITE_URL + "/maximpact_logo.png",
  description: "AI · 웹 개발 전문 외주팀. 웹사이트, 쇼핑몰, ERP/CRM, AI SaaS, 모바일 앱까지 기획부터 배포·유지보수까지 한 팀이 책임집니다.",
  email: "maximpact.it@gmail.com",
  foundingDate: "2024",
  numberOfEmployees: { "@type": "QuantitativeValue", value: 20 },
  areaServed: { "@type": "Country", name: "South Korea" },
  address: { "@type": "PostalAddress", addressCountry: "KR", addressRegion: "Seoul" },
  sameAs: [SITE_URL + "/"],
};

export const jsonLdProfessionalService = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "MaxImpact - 웹 개발 외주 전문팀",
  image: SITE_URL + "/maximpact_logo.png",
  url: SITE_URL + "/",
  telephone: "",
  priceRange: "₩₩",
  address: { "@type": "PostalAddress", addressCountry: "KR", addressRegion: "Seoul", addressLocality: "서울" },
  geo: { "@type": "GeoCoordinates", latitude: 37.5665, longitude: 126.978 },
  areaServed: ["South Korea", "대한민국", "서울", "경기", "전국"],
  serviceType: ["웹사이트 제작", "홈페이지 제작", "쇼핑몰 제작", "ERP 개발", "CRM 개발", "AI SaaS 개발", "모바일 앱 개발", "유지보수"],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00", closes: "19:00",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "웹/앱 개발 서비스",
    itemListElement: [
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
  publisher: { "@type": "Organization", name: "MaxImpact" },
};

export const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "MaxImpact는 어떤 외주 개발팀인가요?",
      acceptedAnswer: { "@type": "Answer", text: "MaxImpact는 AI·웹 개발을 전문으로 하는 20인 규모의 외주 개발팀입니다. 단순 외주가 아닌 장기 파트너 관점에서 기획·디자인·풀스택 개발·배포·유지보수까지 한 팀이 끝까지 책임집니다." } },
    { "@type": "Question", name: "어떤 종류의 프로젝트를 개발하나요?",
      acceptedAnswer: { "@type": "Answer", text: "기업용 ERP·CRM·CMS 시스템, 쇼핑몰·마켓플레이스, AI 기반 SaaS 플랫폼, 데이터 분석 엔진, iOS/Android 네이티브 앱, 기업 홈페이지·랜딩페이지 등 웹/앱 전 영역을 개발합니다." } },
    { "@type": "Question", name: "프리랜서와 비교했을 때 어떤 장점이 있나요?",
      acceptedAnswer: { "@type": "Answer", text: "프리랜서 개인은 한 명이 모든 영역을 커버하기 어렵고, 중도 이탈 리스크가 있습니다. MaxImpact는 기획·디자인·프론트엔드·백엔드·인프라까지 분야별 전문가 20명이 협업하여 안정성과 속도를 모두 확보합니다." } },
    { "@type": "Question", name: "쇼핑몰 제작도 가능한가요?",
      acceptedAnswer: { "@type": "Answer", text: "네, PG 결제 연동, 포인트·쿠폰, 입찰·매칭, 리뷰 시스템까지 갖춘 본격 커머스 플랫폼과 마켓플레이스 개발 경험이 풍부합니다." } },
    { "@type": "Question", name: "견적 회신은 얼마나 빨리 받을 수 있나요?",
      acceptedAnswer: { "@type": "Answer", text: "평균 24시간 이내에 견적과 일정 회신을 드립니다. 프로젝트 문의는 사이트 하단의 문의 폼 또는 maximpact.it@gmail.com 으로 보내주세요." } },
    { "@type": "Question", name: "AI 서비스 개발도 가능한가요?",
      acceptedAnswer: { "@type": "Answer", text: "OpenAI GPT, Anthropic Claude API 등 최신 멀티 LLM 기반 SaaS 서비스, 챗봇, RAG 시스템, 구독 결제 모델까지 AI 제품을 풀스택으로 구축합니다." } },
    { "@type": "Question", name: "유지보수도 진행하나요?",
      acceptedAnswer: { "@type": "Answer", text: "네, 현재 10건 이상의 프로젝트에 대해 장기 유지보수를 진행 중입니다. 개발 완료 후 인수인계로 끝나는 것이 아니라 운영 단계까지 함께합니다." } },
  ],
};

export const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL + "/" },
  ],
};
