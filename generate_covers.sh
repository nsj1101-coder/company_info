#!/bin/bash
set -e
DIR="/Users/j/workspace/company_info"
TEMPLATE="$DIR/cover_template.html"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

make_cover() {
  local KEY=$1
  local JSON=$2

  local HTML="$DIR/cover_${KEY}.html"
  local PNG="$DIR/cover_${KEY}.png"

  # Inject window.COVER_DATA before the existing script
  python3 - <<PYEOF
import json
with open("$TEMPLATE","r") as f: t = f.read()
data = $JSON
inject = "<script>window.COVER_DATA = " + json.dumps(data, ensure_ascii=False) + ";</script>\n"
t = t.replace("<script>\n  // Data injected via template", inject + "<script>\n  // Data injected via template")
with open("$HTML","w") as f: f.write(t)
PYEOF

  "$CHROME" --headless --disable-gpu --window-size=1200,800 --screenshot="$PNG" --hide-scrollbars "file://$HTML" 2>/dev/null
}

# 1. I-Fit - blue
make_cover "ifit" '{
  "accent": "#2563EB", "accentBg": "#EFF6FF",
  "category": "AI · FULLSTACK", "year": "2025",
  "en": "I-FIT",
  "title": "AI 가상 피팅 풀스택 플랫폼",
  "desc": "AWS Bedrock 기반 이미지 생성 모델을 활용해 의류·헤어 스타일을 가상으로 합성합니다. NestJS + React+Vite 모노레포 구조.",
  "tagsHtml": "<span class=\"tag accent\">NestJS</span><span class=\"tag\">React+Vite</span><span class=\"tag\">TypeORM</span><span class=\"tag\">AWS Bedrock</span><span class=\"tag\">S3</span>",
  "badgeIco": "AI", "badgeText": "VIRTUAL FITTING",
  "statLbl": "STACK", "statVal": "FULL",
  "codeHtml": "<div><span class=\"k\">backend</span> NestJS · TypeORM</div><div><span class=\"k\">frontend</span> React · Vite</div><div><span class=\"k\">infra</span> AWS · S3 · Bedrock</div>"
}'

# 2. EMR/CRM - dark blue
make_cover "emr" '{
  "accent": "#1E40AF", "accentBg": "#EFF6FF",
  "category": "HEALTHCARE · EMR", "year": "2025",
  "en": "EMR / CRM",
  "title": "안과 EMR · CRM<br>통합 솔루션",
  "desc": "환자 진료 차트, 동공 측정값 시계열 기록, 처방 이력을 통합 관리하는 안과 의료기관 전용 시스템.",
  "tagsHtml": "<span class=\"tag accent\">Next.js 15</span><span class=\"tag\">React 19</span><span class=\"tag\">Prisma 7</span><span class=\"tag\">MariaDB</span><span class=\"tag\">Tailwind 4</span>",
  "badgeIco": "Rx", "badgeText": "MEDICAL CHART",
  "statLbl": "USERS", "statVal": "B2B",
  "codeHtml": "<div><span class=\"k\">schema</span> Prisma · MariaDB</div><div><span class=\"k\">auth</span> RBAC · JWT</div><div><span class=\"k\">alert</span> KakaoTalk Biz</div>"
}'

# 3. AI Content SaaS - orange
make_cover "aisaas" '{
  "accent": "#EA580C", "accentBg": "#FFF7ED",
  "category": "SAAS · AI CONTENT", "year": "2025",
  "en": "CONTENT . AI",
  "title": "AI 마케팅 콘텐츠<br>자동 생성 SaaS",
  "desc": "광고·마케팅 카피를 멀티 LLM(OpenAI · Claude)으로 자동 생성. 토큰 사용량 기반 구독 결제 시스템.",
  "tagsHtml": "<span class=\"tag accent\">NestJS</span><span class=\"tag\">Next.js</span><span class=\"tag\">MongoDB</span><span class=\"tag\">PostgreSQL</span><span class=\"tag\">Redis</span>",
  "badgeIco": "Σ", "badgeText": "PROMPT ENGINE",
  "statLbl": "MODEL", "statVal": "MULTI-LLM",
  "codeHtml": "<div><span class=\"k\">llm</span> OpenAI · Claude</div><div><span class=\"k\">queue</span> BullMQ · Redis</div><div><span class=\"k\">billing</span> Subscription</div>"
}'

# 4. Mecaiver - green
make_cover "mecaiver" '{
  "accent": "#059669", "accentBg": "#ECFDF5",
  "category": "PLATFORM · MATCHING", "year": "2024",
  "en": "MECAIVER",
  "title": "전문가 매칭<br>중계 플랫폼",
  "desc": "전문가-고객 매칭 + 견적 비교 + 메시지 + 평가/리뷰 일체형 중계 플랫폼. 카카오 알림톡으로 실시간 알림.",
  "tagsHtml": "<span class=\"tag accent\">NestJS</span><span class=\"tag\">Next.js</span><span class=\"tag\">TypeScript</span><span class=\"tag\">PostgreSQL</span><span class=\"tag\">Kakao Biz</span>",
  "badgeIco": "M+", "badgeText": "MATCHING HUB",
  "statLbl": "TYPE", "statVal": "C2B2C",
  "codeHtml": "<div><span class=\"k\">match</span> Expert ↔ Client</div><div><span class=\"k\">chat</span> Realtime WS</div><div><span class=\"k\">notify</span> AlimTalk API</div>"
}'

# 5. Dating app - rose
make_cover "dating" '{
  "accent": "#DB2777", "accentBg": "#FDF2F8",
  "category": "NATIVE APP · DATING", "year": "2024",
  "en": "VALUE-MATCH",
  "title": "가치관 기반<br>네이티브 소개팅 앱",
  "desc": "외모가 아닌 가치관 · 라이프스타일 · MBTI 기반의 정교한 매칭 알고리즘. iOS / Android 네이티브 앱.",
  "tagsHtml": "<span class=\"tag accent\">React Native</span><span class=\"tag\">NestJS</span><span class=\"tag\">TypeScript</span><span class=\"tag\">PostgreSQL</span><span class=\"tag\">Socket.IO</span>",
  "badgeIco": "♥", "badgeText": "VALUE MATCH",
  "statLbl": "ALGO", "statVal": "VALUES",
  "codeHtml": "<div><span class=\"k\">match</span> Value-based</div><div><span class=\"k\">chat</span> Socket.IO</div><div><span class=\"k\">push</span> FCM · APNs</div>"
}'

ls -la $DIR/cover_*.png
