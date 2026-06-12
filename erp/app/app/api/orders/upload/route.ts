import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { readWorkbookFromBuffer, sheetRows, parseRawOrders } from "@/lib/excel";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const sheetType = (form.get("sheetType") as string) === "offline" ? "offline" : "cafe";
  if (!file) return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  let wb;
  try {
    wb = readWorkbookFromBuffer(buf);
  } catch {
    return NextResponse.json({ ok: false, error: "parse_failed" }, { status: 400 });
  }

  // 첫 시트 또는 카페_26/주문서_26 시트 우선
  const preferred = sheetType === "cafe" ? "카페_26" : "주문서_26";
  const sheetName = wb.SheetNames.includes(preferred) ? preferred : wb.SheetNames[0];
  const rows = sheetRows(wb.Sheets[sheetName]);
  const parsed = parseRawOrders(rows, sheetType);

  if (parsed.length === 0) {
    return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });
  }

  const batch = await prisma.uploadBatch.create({
    data: { filename: file.name, sheetType, rowCount: parsed.length },
  });
  const data = parsed.map((r) => ({ ...r, batchId: batch.id }));
  for (let i = 0; i < data.length; i += 500) {
    await prisma.rawOrder.createMany({ data: data.slice(i, i + 500) });
  }

  // 신규 고객 자동등록 (결제자명 기준, 중복 제외) — 엑셀의 "결제자→고객관리" 자동등록 재현
  const allCustomers = await prisma.customer.findMany({ select: { code: true, name: true } });
  const existing = new Set(allCustomers.map((c) => c.name));
  // 코드 채번은 기존 A### 코드의 최대 숫자 기준 (count 기준이면 충돌 — 코드가 비순차)
  let maxNum = 0;
  for (const c of allCustomers) {
    const m = /^A(\d+)$/.exec(c.code);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  const newNames = [...new Set(parsed.map((r) => r.payer).filter((n): n is string => !!n && !existing.has(n)))];
  let newCustomers = 0;
  if (newNames.length) {
    await prisma.customer.createMany({
      data: newNames.map((name, i) => ({ code: `A${String(maxNum + i + 1).padStart(3, "0")}`, name, channel: sheetType === "cafe" ? "온라인" : "오프라인", type: "개인" })),
    });
    newCustomers = newNames.length;
  }

  return NextResponse.json({
    ok: true,
    batchId: batch.id,
    inserted: parsed.length,
    newCustomers,
    sample: parsed.slice(0, 5).map((r) => ({ orderNo: r.orderNo, payer: r.payer, product: r.productName, qty: r.qty, amount: r.totalPayAmount })),
  });
}
