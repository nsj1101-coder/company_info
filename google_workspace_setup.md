# Google Workspace 기반 내부업무시스템 — 셋업 가이드 (라린느)

> 데모(maximpact.co.kr/excel)는 "보여주기용 웹 시뮬레이션"입니다.
> 실제 납품물은 아래처럼 **Google Workspace 위에서** 구성합니다. 이 문서는 실제 구축 절차입니다.

## 전체 구조

```
사용자(부서별 계정)
   │  로그인 (Google Workspace SSO)
   ▼
AppSheet 앱  ──읽기/쓰기──▶  Google Sheets (중심 원장/DB)
   │                              │  ▲
   │ 모바일+데스크톱 UI            │  │  Apps Script (자동화/연동)
   ▼                              ▼  │
Looker Studio (대시보드)      Cafe24 API · 더존(2차)
```

- **데이터** = Google Sheets (모듈별 시트 분리)
- **화면** = AppSheet (코딩 없이 폼/리스트/권한, 모바일 자동 지원)
- **자동화·외부연동** = Apps Script (재고 자동차감, Cafe24 동기화, 리포트 생성)
- **대시보드** = Looker Studio (Sheets 직접 연결)

---

## 0. 사전 준비 (발주처가 해줘야 하는 것)

1. **Google Workspace 구독** — Business Standard 이상 (계정당 월 과금). AppSheet Core가 포함되는 플랜 확인 필요.
   - ⚠️ AppSheet는 사용자 수만큼 라이선스가 듭니다. 현장 사용자 수를 먼저 확정.
2. **관리자(Admin) 권한** 1개 — 도메인/그룹/공유 설정용.
3. **부서·인원 목록** — 그룹 매핑용.

## 1. Google Workspace 조직/그룹 셋업

1. admin.google.com → **그룹 만들기**: `영업팀@`, `생산팀@`, `관리자@`
2. 각 직원 계정을 해당 그룹에 배정.
3. 공유 드라이브(Shared Drive) 1개 생성: "라린느-업무시스템" → 여기에 모든 Sheets 보관(개인 드라이브 X, 퇴사자 이슈 방지).

## 2. Google Sheets 원장 설계 (시트 분리)

공유 드라이브에 스프레드시트 1개, 탭을 모듈별로:

| 탭 | 성격 | 핵심 컬럼 |
|----|------|-----------|
| `상품마스터` | 마스터 | SKU, 브랜드, 상품명, 색, 사이즈, 원가, 판매가 |
| `거래처마스터` | 마스터 | 거래처코드, 상호, 사업자번호, 담당, 단가정책 |
| `생산지시` | 로그 | 지시번호, SKU, 수량, 납기, 상태 |
| `입고` / `출고` | 로그(append) | 일시, SKU, 수량, 거래처, 금액 |
| `주문` | 로그 | 주문번호, 유입경로, 거래처, SKU, 수량, 상태 |
| `현재고` | 자동계산 | SKU, =SUMIF(입고)-SUMIF(출고) |
| `정산` | 자동집계 | 기간, 채널별/거래처별 매출, 미수금 |

> 원칙: **재고 숫자는 사람이 직접 안 적는다.** 입·출고 로그의 합으로만 계산.

## 3. AppSheet 앱 만들기 (UI)

1. Sheets에서 **확장프로그램 → AppSheet → 앱 만들기** (시트가 자동으로 데이터소스로 등록됨).
2. 테이블별 뷰 구성: 상품(갤러리/표), 주문(폼+리스트), 재고(표), 거래처(상세).
3. **모바일/데스크톱 동시 지원** — AppSheet가 반응형으로 자동 생성.
4. 사진 첨부(검품/제품 사진)는 AppSheet의 Image 컬럼 → 드라이브 자동 저장.

## 4. 권한 매핑 (부서별 메뉴 권한)

AppSheet → **Security → Roles**:
- 생산팀: `생산지시`,`입고`,`현재고` 뷰만, 정산 숨김
- 영업팀: `주문`,`거래처`,`출고`, 원가 컬럼 숨김
- 관리자: 전체
- **Security Filter**로 "이 부서는 이 행만" 행단위 제어 가능.
- 로그인 = Google Workspace 계정(SSO), 별도 비번 관리 불필요.

## 5. Apps Script 자동화 (확장프로그램 → Apps Script)

핵심 트리거 4종:

1. **출고 시 재고 차감** — `주문` 상태가 '출고확정'으로 바뀌면 `출고` 로그 추가.
2. **생산완료 시 자동 입고** — `생산지시` 상태='완료' → `입고` 로그 생성.
3. **안전재고 알림** — 시간 트리거(매일 9시), 미달 SKU를 담당자에게 Gmail 발송.
4. **정산 리포트** — 매월 말 트리거, `정산` 탭 자동 집계 + PDF 생성.

```javascript
// 예시: 출고 시 재고 차감 (onEdit 트리거)
function onOrderShipped(e) {
  const sh = e.source.getActiveSheet();
  if (sh.getName() !== '주문') return;
  const row = e.range.getRow();
  const status = sh.getRange(row, COL_STATUS).getValue();
  if (status !== '출고확정') return;
  const sku = sh.getRange(row, COL_SKU).getValue();
  const qty = sh.getRange(row, COL_QTY).getValue();
  appendOutbound(sku, qty);   // '출고' 시트에 로그 추가 → 현재고 자동 반영
}
```

## 6. Cafe24 연동 (Apps Script ↔ Admin API)

1. Cafe24 개발자센터(developers.cafe24.com)에서 **앱 등록** → 자기 몰 전용이면 Private App, access/refresh 토큰 발급.
2. Apps Script에서:
   - **가져오기(주문)**: 시간 트리거 5~10분, `GET /api/v2/admin/orders` → `주문` 시트 적재.
   - **내보내기(재고/가격)**: 재고 변경 시 `PUT /api/v2/admin/products/{no}/inventory`.
3. **토큰 갱신**: refresh token으로 access token 자동 재발급 함수 필수(만료가 흔한 장애점).
4. 최신 API 버전 헤더: `X-Cafe24-Api-Version: 2026-03-01`.

## 7. 더존 연동 (2차, 점검 후)

- 제품 확인 먼저: SmartA / iCUBE / ERP-iU 중 무엇인지.
- iCUBE는 일부 REST API 제공(활성화 비용·사용량 제한). SmartA는 직접 API 제한적 → **CSV/엑셀 내보내기 우회** 또는 비즈플레이류 Agent.
- 방향: 우리 시스템 → 더존(매출전표/거래처 push) **단방향**.

## 8. Looker Studio 대시보드

1. lookerstudio.google.com → 데이터소스 = `정산`/`주문` 시트.
2. 채널별 매출, 브랜드별 매출, 거래처별 미수금, 안전재고 미달 위젯.
3. 실시간(시트 갱신 시 반영), 부서별 공유 링크.

---

## 비용·일정 요약 (제안 1차 범위)

| 항목 | 비용 성격 |
|------|-----------|
| Google Workspace 구독 | 발주처 부담(계정당 월 과금) |
| AppSheet 라이선스 | 발주처 부담(사용자당 월 과금) — **사용자 수 먼저 확정** |
| 구축(개발) | 제안 300만 원 / 3주 1차 |
| 더존 연동 | 2차/별도(API 비용·계약 발주처) |

> 데모에서 본 화면/자동흐름이 실제로는 위 Google Workspace 구성요소로 1:1 매핑됩니다.
> 데모 = "결과물 미리보기", 이 문서 = "그걸 구글 위에 어떻게 올리는지".
