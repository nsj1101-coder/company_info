#!/bin/bash
set -e
DIR="/Users/j/workspace/company_info"
TEMPLATE="$DIR/cover_square_template.html"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

make_cover() {
  local KEY=$1
  local JSON=$2
  local HTML="$DIR/cover_sq_${KEY}.html"
  local PNG="$DIR/cover_sq_${KEY}.png"

  python3 - <<PYEOF
import json
with open("$TEMPLATE","r") as f: t = f.read()
data = $JSON
inject = "<script>window.COVER_DATA = " + json.dumps(data, ensure_ascii=False) + ";</script>\n"
t = t.replace("<script>\n  const DATA = window.COVER_DATA || {};", inject + "<script>\n  const DATA = window.COVER_DATA || {};")
with open("$HTML","w") as f: f.write(t)
PYEOF

  "$CHROME" --headless --disable-gpu --window-size=800,800 --screenshot="$PNG" --hide-scrollbars "file://$HTML" 2>/dev/null
}

make_cover "ifit" '{
  "accent": "#2563EB",
  "category": "AI · FULLSTACK", "year": "2025",
  "en": "I-FIT",
  "title": "AI 가상 피팅<br>풀스택 플랫폼",
  "desc": "AWS Bedrock 기반 이미지 생성 모델로 의류·헤어 스타일을 가상 합성. NestJS + React+Vite 모노레포 구조.",
  "tagsHtml": "<span class=\"tag accent\">NestJS</span><span class=\"tag\">React</span><span class=\"tag\">TypeORM</span><span class=\"tag\">AWS S3</span>",
  "badgeIco": "AI", "badgeText": "VIRTUAL FITTING"
}'

make_cover "emr" '{
  "accent": "#1E40AF",
  "category": "HEALTHCARE · EMR", "year": "2025",
  "en": "EMR / CRM",
  "title": "안과 EMR · CRM<br>통합 솔루션",
  "desc": "환자 진료 차트, 동공 측정값 시계열, 처방 이력을 통합 관리하는 안과 의료기관 전용 시스템.",
  "tagsHtml": "<span class=\"tag accent\">Next.js 15</span><span class=\"tag\">React 19</span><span class=\"tag\">Prisma 7</span><span class=\"tag\">MariaDB</span>",
  "badgeIco": "Rx", "badgeText": "MEDICAL CHART"
}'

make_cover "aisaas" '{
  "accent": "#EA580C",
  "category": "SAAS · AI CONTENT", "year": "2025",
  "en": "CONTENT . AI",
  "title": "AI 마케팅 콘텐츠<br>자동 생성 SaaS",
  "desc": "광고·마케팅 카피를 멀티 LLM(OpenAI · Claude)으로 자동 생성. 토큰 사용량 기반 구독 결제.",
  "tagsHtml": "<span class=\"tag accent\">NestJS</span><span class=\"tag\">Next.js</span><span class=\"tag\">MongoDB</span><span class=\"tag\">Redis</span>",
  "badgeIco": "Σ", "badgeText": "PROMPT ENGINE"
}'

make_cover "mecaiver" '{
  "accent": "#059669",
  "category": "PLATFORM · MATCHING", "year": "2024",
  "en": "MECAIVER",
  "title": "전문가 매칭<br>중계 플랫폼",
  "desc": "전문가-고객 매칭 + 견적 비교 + 채팅 + 평가/리뷰 일체형 중계 플랫폼. 카카오 알림톡 실시간 알림.",
  "tagsHtml": "<span class=\"tag accent\">NestJS</span><span class=\"tag\">Next.js</span><span class=\"tag\">PostgreSQL</span><span class=\"tag\">Kakao Biz</span>",
  "badgeIco": "M+", "badgeText": "MATCHING HUB"
}'

make_cover "dating" '{
  "accent": "#DB2777",
  "category": "NATIVE APP · DATING", "year": "2024",
  "en": "VALUE-MATCH",
  "title": "가치관 기반<br>네이티브 소개팅 앱",
  "desc": "외모가 아닌 가치관 · 라이프스타일 · MBTI 기반 매칭 알고리즘. iOS / Android 네이티브.",
  "tagsHtml": "<span class=\"tag accent\">React Native</span><span class=\"tag\">NestJS</span><span class=\"tag\">PostgreSQL</span><span class=\"tag\">Socket.IO</span>",
  "badgeIco": "♥", "badgeText": "VALUE MATCH"
}'

ls -la $DIR/cover_sq_*.png
