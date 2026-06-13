import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getSession } from "@/lib/auth";

// 라린느 주문 업로드 양식 (카페_26 입력 컬럼 A~T 기준). 시스템이 채널/상태/고객코드는 자동 분류.
const HEADERS = [
  "주문몰", "교환/반품", "출고여부", "출고일", "주문번호", "주문일시", "주문자명", "주문자 상세 주소",
  "결제수단", "결제자", "주문상품명", "옵션", "수량", "옵션+판매가", "상품 구매금액",
  "사용한 적립금액", "총 실결제금액", "실제 환불금액", "총 결제금액", "연락처",
];

const SAMPLES = [
  ["단독몰", "", "", "", "20260613-0000001", "2026-06-13 10:00:00", "홍길동", "서울 강남구 …", "신용카드", "홍길동", "뉴블러썸 반팔 블랙", "자켓=블랙 M(66)", 2, 88000, 176000, 0, 176000, 0, 176000, "010-1234-5678"],
  ["통합몰", "", "제작중", "", "20260613-0000002", "2026-06-13 11:30:00", "김간호", "부산 해운대구 …", "무통장입금", "○○병원", "메디린 V넥 스크럽 네이비", "여성 상의=네이비 L", 5, 58000, 290000, 0, 290000, 0, 290000, "010-2222-3333"],
];

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...SAMPLES]);
  ws["!cols"] = HEADERS.map((h) => ({ wch: Math.max(10, h.length * 2) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "주문업로드");
  const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const filename = "라린느_주문업로드_양식.xlsx";
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="lalune_order_template.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
