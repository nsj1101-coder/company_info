export type Service = {
  num: string;
  title: string[];
  desc: string;
  tags: string[];
};

export const services: Service[] = [
  { num: "01 / ERP · CRM · CMS", title: ["기업용", "통합 관리 시스템"], desc: "재무·인사·고객·콘텐츠 관리까지 기업 맞춤형 올인원 시스템.", tags: ["대시보드", "RBAC", "분석"] },
  { num: "02 / E-Commerce", title: ["쇼핑몰 ·", "마켓플레이스"], desc: "PG 결제, 포인트, 입찰, 리뷰 시스템을 갖춘 본격 커머스 플랫폼.", tags: ["PG 연동", "포인트", "매칭"] },
  { num: "03 / AI · SaaS", title: ["AI 기반", "SaaS 플랫폼"], desc: "OpenAI · Claude API 활용 멀티 LLM 서비스, 구독 결제 모델까지.", tags: ["OpenAI", "Claude", "Subscription"] },
  { num: "04 / Data Engine", title: ["데이터 분석 ·", "처리 엔진"], desc: "PDF 파싱, 수식 엔진, 재무 분석 등 복잡한 데이터 처리 전문.", tags: ["PDF 파싱", "수식 엔진", "리포트"] },
  { num: "05 / Native App", title: ["iOS · Android", "네이티브 앱"], desc: "React Native 기반 크로스 플랫폼 또는 풀 네이티브 앱 개발.", tags: ["React Native", "FCM", "Socket.IO"] },
  { num: "06 / Web", title: ["반응형", "웹사이트"], desc: "병의원 · 기업 소개, 랜딩, 포트폴리오 등 검색에 잘 걸리는 반응형 웹.", tags: ["병의원 홈페이지", "SEO", "CMS"] },
];

export type Portfolio = {
  category: string;
  year: string;
  status: "LIVE" | "완료" | "제안중";
  title: string;
  desc?: string;
  features?: string[];
  tags: string[];
  link?: string;
  size: { w: 4 | 6 | 8 | 12; h: 1 | 2 | 3 };
  tone: "amber" | "violet" | "blue" | "indigo" | "orange" | "green" | "pink" | "cyan" | "slate";
};

export const portfolios: Portfolio[] = [
  {
    category: "ERP", year: "2026", status: "완료",
    title: "라린느 통합 ERP",
    desc: "Cafe24 · 스마트스토어 · 자사몰 3개 채널 주문을 한곳에서 처리하는 의류 제조·유통 통합 업무 시스템. 시트 24개짜리 엑셀 ERP를 웹 시스템으로 전환.",
    features: ["채널별 주문 엑셀 업로드 · 통합 주문", "생산 · 발주 · 재고 · 반품 관리", "상품/SKU · 고객 · 정산 분석"],
    tags: ["Next.js 16", "Prisma", "Excel 연동"],
    link: "/lalune-erp/manual",
    size: { w: 4, h: 3 }, tone: "slate",
  },
  {
    category: "E-Commerce", year: "2026", status: "완료",
    title: "코지케어 복지용구 쇼핑몰",
    desc: "어르신 복지용구 본사 직영몰. 장기요양 인정자 본인부담금 가격 표시, 일반 · 사업자 회원 분리, 입점사 모집까지 갖춘 B2C · B2B 커머스.",
    features: ["카테고리 · 베스트 · 장바구니 · 주문", "사업자 회원 승인 · 포인트 · 정산", "주문 · 반품 · 세금계산서 관리자"],
    tags: ["Next.js 16", "Prisma", "관리자 페이지"],
    link: "/cozycare",
    size: { w: 4, h: 3 }, tone: "green",
  },
  {
    category: "Hospitality", year: "2026", status: "완료",
    title: "하늘별바다 힐링스테이",
    desc: "무안 황토갯벌 웰니스 숙박 플랫폼. 객실 · 체험 · 렌트카 · 굿즈를 한 사이트에서 소개하고 예약 상담으로 연결하는 반응형 숙박 사이트.",
    features: ["객실 · 체험 · 부대시설 소개", "예약 검색 · 상담 신청", "한국어 · 영어 · 중국어 전환"],
    tags: ["반응형", "다국어", "예약 동선 설계"],
    link: "/3spension/",
    size: { w: 4, h: 3 }, tone: "amber",
  },
  {
    category: "Enterprise SaaS", year: "2026", status: "LIVE",
    title: "세무 종합 플랫폼",
    desc: "세무 전문가를 위한 올인원 세무검진 솔루션. PDF 재무제표를 업로드하면 1,100개+ 수식 엔진이 자동으로 재무 건전성을 분석합니다.",
    features: ["PDF 자동 파싱 & 데이터 추출 엔진", "1,100개+ 수식 기반 재무분석", "업종별 벤치마킹 & 등급 판정", "역할 기반 접근제어 시스템"],
    tags: ["PHP MVC", "MariaDB", "Jenkins CI/CD", "Kakao Biz"],
    size: { w: 6, h: 3 }, tone: "amber",
  },
  {
    category: "Marketplace", year: "2026", status: "LIVE",
    title: "인테리어 중개 매칭 플랫폼",
    desc: "고객과 인테리어 업체를 연결하는 견적 비교 플랫폼. 입찰·실시간 채팅·PG 결제까지 풀스택으로 구현한 C2B 매칭 서비스. 36개 테이블, 38개 컨트롤러 규모.",
    tags: ["PHP MVC", "MySQL", "Tailwind", "NicePay", "OAuth 2.0"],
    size: { w: 6, h: 2 }, tone: "violet",
  },
  {
    category: "B2B CRM", year: "2026", status: "완료",
    title: "B2B 영업 파이프라인 CRM",
    tags: [],
    size: { w: 6, h: 1 }, tone: "cyan",
  },
  {
    category: "AI Fullstack", year: "2025", status: "완료",
    title: "I-FIT",
    desc: "AWS Bedrock 기반 이미지 생성 모델로 의류·헤어 스타일을 가상으로 합성. NestJS + React+Vite 모노레포.",
    tags: ["NestJS", "AWS Bedrock", "S3"],
    size: { w: 4, h: 2 }, tone: "blue",
  },
  {
    category: "Healthcare", year: "2025", status: "완료",
    title: "안과 EMR · CRM",
    desc: "환자 진료 차트, 동공 측정값 시계열 기록, 처방 이력을 통합 관리하는 안과 의료기관 전용 시스템.",
    tags: ["Next.js 16", "Prisma 7", "MariaDB"],
    size: { w: 4, h: 2 }, tone: "indigo",
  },
  {
    category: "AI SaaS", year: "2025", status: "완료",
    title: "AI 마케팅 SaaS",
    desc: "광고·마케팅 카피를 멀티 LLM(OpenAI · Claude)으로 자동 생성. 토큰 기반 구독 결제.",
    tags: ["NestJS", "OpenAI", "Claude"],
    size: { w: 4, h: 2 }, tone: "orange",
  },
  {
    category: "Matching Platform", year: "2024", status: "완료",
    title: "Mecaiver — 전문가 매칭",
    desc: "전문가-고객 매칭 + 견적 비교 + 실시간 메시지 + 평가/리뷰 일체형 중계 플랫폼. 카카오 알림톡 실시간 알림 연동.",
    tags: ["NestJS", "Next.js", "PostgreSQL", "Kakao Biz"],
    size: { w: 6, h: 2 }, tone: "green",
  },
  {
    category: "Native App", year: "2024", status: "완료",
    title: "Value Match — 가치관 소개팅 앱",
    desc: "외모가 아닌 가치관 · 라이프스타일 · MBTI 기반의 정교한 매칭 알고리즘. iOS / Android 네이티브 앱.",
    tags: ["React Native", "NestJS", "Socket.IO", "FCM · APNs"],
    size: { w: 6, h: 2 }, tone: "pink",
  },
];

export type ProcessStep = {
  num: string;
  title: string;
  desc: string;
  icon: "lightbulb" | "layout" | "code" | "rocket";
};

export const processSteps: ProcessStep[] = [
  { num: "STEP 01", title: "상담 & 기획", desc: "요구사항을 듣고 솔루션을 제안합니다. 무료 견적과 화면설계 포함.", icon: "lightbulb" },
  { num: "STEP 02", title: "설계 & 디자인", desc: "DB 스키마, API 설계, UI/UX를 확정합니다. Figma 기반 프로토타입 제공.", icon: "layout" },
  { num: "STEP 03", title: "개발 & 테스트", desc: "2주 스프린트 단위로 개발. 매주 데모와 QA를 진행합니다.", icon: "code" },
  { num: "STEP 04", title: "배포 & 유지보수", desc: "CI/CD 자동 배포 후 3개월 무상 유지보수를 기본 포함합니다.", icon: "rocket" },
];

export type WhyItem = { num: string; title: string; desc: string };
export const whyItems: WhyItem[] = [
  { num: "01", title: "한 팀이 끝까지 책임", desc: "기획·디자인·프론트·백엔드·인프라를 외주로 쪼개지 않습니다. 한 팀이 처음부터 운영까지 끝까지 함께합니다." },
  { num: "02", title: "실제 납품된 검증된 코드", desc: "1,100개+ 수식 엔진, 38개 컨트롤러 규모 매칭 플랫폼, AI SaaS 등 실서비스로 검증된 패턴을 빠르게 적용합니다." },
  { num: "03", title: "최신 안정 기술 스택", desc: "Next.js 16 · React 19 · Prisma 7 · NestJS · Tailwind 4 등 검증된 최신 stable API만을 사용합니다. 레거시 부담 없음." },
  { num: "04", title: "장기 파트너십", desc: "납품 후 끝이 아닙니다. 클라이언트가 먼저 유지보수를 요청하는 팀 — 한 번 함께하면 계속 함께합니다." },
];

export type TeamItem = {
  count: number;
  role: string;
  title: string;
  desc: string;
  skills: string[];
  size: { w: 4 | 6 | 8; h: 1 | 2 | 3 };
  variant?: "dark" | "accent";
  stat?: boolean;
};

export const teamItems: TeamItem[] = [
  { count: 20, role: "Total Headcount", title: "풀스택 인하우스 팀", desc: "외주 분산 없이 한 팀이 끝까지. 기획부터 운영까지 모든 단계를 자체 인력으로 진행합니다.", skills: [], size: { w: 6, h: 2 }, variant: "dark", stat: true },
  { count: 5, role: "Backend Engineers", title: "백엔드 개발자", desc: "API 설계, DB 최적화, 비즈니스 로직 구현. 복잡한 도메인을 단단한 시스템으로.", skills: ["NestJS", "PHP", "Node.js", "PostgreSQL", "MariaDB"], size: { w: 6, h: 2 }, variant: "accent" },
  { count: 4, role: "Frontend", title: "프론트엔드 개발자", desc: "반응형 UI, 인터랙션, 퍼포먼스 최적화 전담.", skills: ["Next.js", "React", "TypeScript", "Tailwind"], size: { w: 4, h: 2 } },
  { count: 4, role: "PM · Planner", title: "기획자 / PM", desc: "요구사항 분석, 일정 관리, 스프린트 운영, 클라이언트 커뮤니케이션.", skills: ["Jira", "Notion", "유스케이스"], size: { w: 4, h: 2 } },
  { count: 2, role: "UI · UX Design", title: "디자이너", desc: "사용자 중심 인터페이스 설계, Figma 디자인 시스템 구축.", skills: ["Figma", "UI/UX", "Prototype"], size: { w: 4, h: 2 } },
  { count: 1, role: "Security Lead", title: "보안 책임자", desc: "OWASP 기반 보안 점검, RBAC 권한 설계, 침투 테스트 전담.", skills: ["OWASP", "RBAC", "OAuth 2.0"], size: { w: 4, h: 2 } },
  { count: 1, role: "DevOps · Infra", title: "인프라 엔지니어", desc: "CI/CD 파이프라인, AWS · 클라우드 배포, 무중단 운영 전담.", skills: ["AWS", "Jenkins", "Docker"], size: { w: 4, h: 2 } },
  { count: 1, role: "AI Engineer", title: "AI 엔지니어", desc: "OpenAI · Claude API · AWS Bedrock 활용, LLM 파이프라인 설계.", skills: ["OpenAI", "Claude", "Bedrock"], size: { w: 4, h: 2 } },
  { count: 1, role: "QA · Tester", title: "QA 엔지니어", desc: "테스트 시나리오 작성, 자동화 테스트, 릴리스 품질 보증 전담.", skills: ["Playwright", "Jest", "QA"], size: { w: 4, h: 2 } },
  { count: 1, role: "CEO · Lead", title: "대표 / 총괄", desc: "프로젝트 총괄, 기술 의사결정, 클라이언트 최종 책임자.", skills: ["Full-Stack", "전 영역"], size: { w: 4, h: 2 } },
];

export type Metric = { value: number; unit: string; label: string };
export const metrics: Metric[] = [
  { value: 50, unit: "+", label: "구성원 누적 프로젝트" },
  { value: 10, unit: "+", label: "진행중 유지보수" },
  { value: 15, unit: "+", label: "전문 개발 인력" },
];

export type TeamExperience = {
  category: string;
  title: string;
  client: string;
  role: string;
  scope: string[];
  link?: string;
};

// 구성원이 이전 소속 기업 재직 당시 참여한 프로젝트 (당사 직접 수주 실적 아님)
export const teamExperiences: TeamExperience[] = [
  {
    category: "Medical · 피부과",
    title: "리파인의원 홈페이지 · CMS",
    client: "강남 압구정 피부과",
    role: "기획 · 구축 · CMS 설계",
    scope: [
      "시술 · 가격 · 이벤트 · 배너를 병원 직원이 직접 수정하는 CMS",
      "의료광고 기준을 고려한 카피 · 노출 정책 정의",
      "반응형 화면 · 상담 예약 동선 설계",
    ],
    link: "https://refine-clinic.com",
  },
];

export const portfolioNotice =
  "본 포트폴리오에는 당사가 직접 수행한 프로젝트와 당사 구성원이 이전 소속 기업에서 수행한 프로젝트 참여 이력이 포함되어 있습니다. 구성원의 이전 프로젝트 참여 이력은 당사의 직접 수주 및 납품 실적과 구분하여 제공하며, 각 프로젝트의 저작권 및 지식재산권은 해당 권리자에게 귀속됩니다.";

export type MedicalFeature = { title: string; desc: string };
export const medicalFeatures: MedicalFeature[] = [
  { title: "진료 · 의료진 · 시술 안내", desc: "진료과목, 의료진 약력, 시술별 안내 페이지를 환자가 찾기 쉬운 구조로 설계합니다." },
  { title: "직원이 직접 수정하는 CMS", desc: "시술 가격, 이벤트, 배너, 공지를 개발자 없이 병원 직원이 바로 바꿀 수 있습니다." },
  { title: "상담 · 예약 연결", desc: "상담 신청 폼, 카카오톡 채널, 네이버 예약 등 병원 운영 방식에 맞춰 연결합니다." },
  { title: "의료광고 기준 고려", desc: "의료법 제56조 금지 광고 유형(치료 경험담, 과장 · 비교 표현 등)을 피하는 카피와 노출 정책을 함께 잡습니다." },
  { title: "검색 노출 (SEO · AEO)", desc: "네이버 · 구글 등록, 병원 구조화 데이터, 진료과목별 검색어에 맞춘 페이지 구성을 기본으로 합니다." },
  { title: "개인정보 · 보안", desc: "상담 신청 개인정보 수집 동의, 개인정보 처리방침, SSL 적용까지 오픈 전에 점검합니다." },
  { title: "외국인 환자 다국어", desc: "영어 · 중국어 · 일본어 페이지로 외국인 환자 상담까지 받을 수 있습니다." },
  { title: "오픈 후 운영", desc: "개원 일정에 맞춘 오픈, 오픈 후 콘텐츠 업데이트와 유지보수를 이어서 맡습니다." },
];

export const medicalTargets = ["피부과", "성형외과", "치과", "한의원", "안과", "정형외과", "내과 · 소아과", "검진센터"];

export type Faq = { q: string; a: string };

export const medicalFaqs: Faq[] = [
  { q: "병원 홈페이지 제작 비용은 얼마인가요?", a: "페이지 수, 관리자(CMS) 범위, 예약 연동, 다국어 여부에 따라 달라집니다. 상담 후 기능 목록과 단계별 일정이 적힌 견적서를 무료로 드립니다." },
  { q: "개원 전인데 홈페이지를 미리 준비할 수 있나요?", a: "네. 개원일을 기준으로 오픈 일정을 역산해 기획, 디자인, 개발, 검색 등록 순서로 진행합니다. 인테리어나 촬영 일정이 늦어지면 임시 페이지를 먼저 열 수도 있습니다." },
  { q: "병원 홈페이지도 의료광고 규정을 지켜야 하나요?", a: "의료기관 홈페이지에 싣는 광고성 내용도 의료법 제56조의 금지 광고 기준을 지켜야 합니다. 사전심의 대상 여부는 매체와 이용자 수에 따라 달라지므로, 제작 단계에서 카피와 이미지 노출 방식을 함께 점검합니다." },
  { q: "시술 가격이나 이벤트를 병원에서 직접 바꿀 수 있나요?", a: "네. 시술 가격, 이벤트, 배너, 공지, 의료진 정보를 직원이 직접 수정하는 관리자(CMS)를 함께 만들어 드립니다." },
  { q: "온라인 예약이나 상담 신청도 연동되나요?", a: "상담 신청 폼, 카카오톡 채널, 네이버 예약 링크 등 병원에서 이미 쓰는 예약 방식에 맞춰 연결합니다." },
  { q: "기존 병원 홈페이지 리뉴얼도 가능한가요?", a: "네. 기존 콘텐츠와 검색 노출을 유지하면서 디자인과 구조를 새로 만들고, 기존 주소에서 새 주소로 연결(리다이렉트)까지 처리합니다." },
];

export const generalFaqs: Faq[] = [
  { q: "MaxImpact는 어떤 외주 개발팀인가요?", a: "MaxImpact는 AI · 웹 개발을 전문으로 하는 외주 개발팀입니다. 기획, 디자인, 풀스택 개발, 배포, 유지보수까지 한 팀이 끝까지 맡습니다." },
  { q: "어떤 종류의 프로젝트를 개발하나요?", a: "병의원 · 기업 홈페이지, 쇼핑몰, ERP · CRM · CMS, 숙박 · 예약 사이트, AI 기반 SaaS, 데이터 분석 엔진, iOS · Android 앱을 개발합니다." },
  { q: "프리랜서와 비교했을 때 어떤 장점이 있나요?", a: "기획 · 디자인 · 프론트엔드 · 백엔드 · 인프라 담당이 나뉘어 협업하므로, 한 사람에게 모든 영역을 맡길 때 생기는 공백과 중도 이탈 위험이 적습니다." },
  { q: "쇼핑몰 제작도 가능한가요?", a: "네. PG 결제 연동, 회원 등급 · 사업자 회원, 포인트 · 쿠폰, 주문 · 반품 관리자까지 갖춘 쇼핑몰을 만듭니다." },
  { q: "AI 서비스 개발도 가능한가요?", a: "OpenAI, Anthropic Claude API 등을 활용한 SaaS, 챗봇, RAG 검색, 구독 결제 모델까지 풀스택으로 구축합니다." },
  { q: "유지보수도 진행하나요?", a: "네. 현재 10건 이상의 프로젝트를 유지보수하고 있으며, 납품 후 운영 단계까지 함께합니다." },
  { q: "견적은 어떻게 받나요?", a: "사이트 하단 문의 폼이나 maximpact.it@gmail.com 으로 만들고 싶은 서비스와 참고 사이트를 보내 주시면 검토 후 기능 목록과 일정이 적힌 견적서를 드립니다." },
];

export const projectTypes = [
  "병의원 홈페이지",
  "ERP / CRM / CMS",
  "쇼핑몰 / 마켓플레이스",
  "AI · SaaS",
  "네이티브 앱",
  "데이터 분석 시스템",
  "반응형 웹사이트",
  "기타",
];
