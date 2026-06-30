# 우리 캘린더 (커플 캘린더)

커플용 캘린더 · 리마인더 · 계획표 모바일 웹앱. 흑백(블랙앤화이트) 테마, 모바일 전용.

- **첫 화면**: 월간 캘린더(셀마다 일정 미리보기) → 날짜 선택 시 하단에 그날 일정
- **일정**: 다가오는 약속 날짜별 모아보기
- **계획표**: 둘이 같이 하고 싶은 버킷리스트 체크
- **리마인더**: 알림 설정 일정 모아보기 + 브라우저 알림
- **우리**: 이름·기념일(D+day) 설정
- 일정 등록 시 **다음(카카오) 우편번호**로 주소 검색, 상세에서 카카오맵 연결

## 기술 스택 (회사 표준)

- **백엔드**: NestJS + TypeORM + MariaDB (`backend/`, 도메인: schedules / plans / couple)
- **프론트**: React + Vite + TypeScript, CSS Modules, React Router (`frontend/`)

## 실행

```bash
# 백엔드 (port 4500)
cd backend
cp .env.example .env   # DB 값 입력
npm install
npm run start:dev

# 프론트 (port 5173, /couple 서브패스)
cd frontend
npm install
npm run dev
```

## 배포

maximpact.co.kr 서버(116.124.128.70)에 **서브패스 `/couple`** 로 배포.
maximpact 본체 소스는 건드리지 않음(nginx location 블록만 추가).

- 프론트 정적: `/var/www/couple` (nginx alias)
- 백엔드 API: PM2 `couple-api` (127.0.0.1:4500) ← nginx `/couple/api/` 프록시
- DB: MariaDB `couple`
- 접속: https://maximpact.co.kr/couple/

> 서버 접속·DB 비밀번호 등 운영 정보는 `_DEPLOY.md`(git 제외)에 기록.
