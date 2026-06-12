# 라린느 통합 ERP (MVP)

엑셀(`검토용_라린느_ERP_v45`) 기반 통합 업무 시스템을 웹으로 구현한 MVP.
Cafe24·스마트스토어·자사몰 3개 어드민으로 분산된 주문/재고를 하나로 통합.

## 스택
Next.js 16 (App Router) · React 19 · TypeScript · Prisma 6 · SQLite · Tailwind 4 · xlsx(sheetjs)

## 실행

```bash
npm install
npx prisma generate && npx prisma db push   # dev.db 생성
npm run import                                # 엑셀 실데이터 임포트 (../검토용_라린느_ERP_v45 (1).xlsx)
npm run dev                                   # http://localhost:4200
```

로그인: **admin / admin1234**

## 구조
- `prisma/schema.prisma` — 12개 모델 (Customer, Product, RawOrder, UploadBatch, Order, Inventory, ProductionOrder, PurchaseOrder, Return, User)
- `lib/excel.ts` — 엑셀 파서 (시드 임포트 + 업로드 API 공용). 채널/상태 정규화 포함
- `prisma/import.ts` — 실데이터 시드 (엑셀 → SQLite). 재고 현재고 재계산 포함
- `app/(app)/*` — 인증 보호 페이지 (대시보드/주문/업로드/출고/생산/발주/재고/반품/상품/고객/분석)
- `app/api/orders/upload` — 채널 주문 엑셀 업로드 (라린느가 쇼핑몰에서 받은 파일 그대로 업로드)

## 구현된 기능 (MVP)
- 대시보드: 매출/주문/SKU/고객 KPI, 채널별 매출, 주문상태, 최근주문, 발주필요
- 통합 주문: 채널·상태 필터, 검색, 페이지네이션
- **채널 주문 수집(엑셀 업로드)**: 쇼핑몰 다운로드 파일 업로드 → 자동 적재 + 신규 고객 자동등록
- 출고/생산/발주/재고/반품: 리스트 + 검색 + KPI
- 상품·고객 마스터: 검색, 고객 등급(VIP/우수/일반) 자동
- 정산·분석: 채널별 매출 비중, 월별 추이, 고객등급 분포, SKU TOP10

## 2차 과제 (제안서 기준)
- 채널 API 자동수집 (Cafe24 Admin API 등) — 현재는 엑셀 업로드
- **SKU 표준화** — 원본 주문 SKU가 채널마다 체계가 달라 원가·손익 매칭률 낮음 → 표준화 후 채널별 P&L 정확 산출
- 부서별 세부 권한, 생산↔재고 자동연동, 더존(회계) 연동, Looker급 대시보드
