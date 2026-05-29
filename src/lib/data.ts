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
  { num: "06 / Web", title: ["반응형", "웹사이트"], desc: "회사 소개, 랜딩, 포트폴리오 등 세련된 디자인의 반응형 웹.", tags: ["Next.js", "SEO", "Modern"] },
];

export type Portfolio = {
  category: string;
  year: string;
  status: "LIVE" | "완료" | "제안중";
  title: string;
  desc?: string;
  features?: string[];
  tags: string[];
  size: { w: 4 | 6 | 8 | 12; h: 1 | 2 | 3 };
  tone: "amber" | "violet" | "blue" | "indigo" | "orange" | "green" | "pink" | "cyan" | "slate";
};

export const portfolios: Portfolio[] = [
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
  {
    category: "B2B E-Commerce", year: "2026", status: "제안중",
    title: "DentBiz — 치과 의료기기 B2B 쇼핑몰",
    desc: "치과 전용 의료기기·소모품 B2B 온라인 쇼핑몰. 9개 워크스트림, 38개 작업, 1,076h 공수 규모로 제안 진행중인 풀스택 프로젝트.",
    tags: ["PHP / Next.js", "MariaDB", "9 Work Streams", "1,076h"],
    size: { w: 12, h: 2 }, tone: "slate",
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
  { value: 50, unit: "+", label: "완료 프로젝트" },
  { value: 10, unit: "+", label: "진행중 유지보수" },
  { value: 15, unit: "+", label: "전문 개발 인력" },
  { value: 24, unit: "h", label: "평균 견적 응답" },
];

export const projectTypes = [
  "ERP / CRM / CMS",
  "쇼핑몰 / 마켓플레이스",
  "AI · SaaS",
  "네이티브 앱",
  "데이터 분석 시스템",
  "반응형 웹사이트",
  "기타",
];
