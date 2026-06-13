import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// 데모용 채널 동기화 — 실제 API 통신 없이 더미 주문 5건을 생성해 전체 흐름(원천주문→통합주문→고객→재고/분석)에 반영.
const CHANNELS: Record<string, { label: string; source: string; channel: string }> = {
  cafe24: { label: "Cafe24", source: "Cafe24", channel: "온라인" },
  smartstore: { label: "스마트스토어", source: "스마트스토어", channel: "온라인" },
  mall: { label: "자사몰", source: "자사몰", channel: "자사몰" },
};

const PRODUCTS = [
  { name: "뉴블러썸 반팔 블랙", sku: "LJKT-BLOBK-M", price: 88000 },
  { name: "메디린 V넥 스크럽 네이비", sku: "MED-SCR-NV-L", price: 58000 },
  { name: "드윈 블랙 (벨트포함)", sku: "LJKT-DWNBK-66", price: 149000 },
  { name: "올밴딩 팬츠 그레이", sku: "LPNT-ALLGY-77", price: 43000 },
  { name: "제노 반팔 베이지", sku: "LJKT-ZENBG-M", price: 114000 },
  { name: "더꼬모 카페 앞치마 카키", sku: "COMO-APR-KH-FR", price: 21000 },
  { name: "베르 긴팔 블랙", sku: "LJKT-VERBK-L", price: 145000 },
  { name: "블랙스커트 C", sku: "LSKT-BLKC-66", price: 79000 },
];
const STATUSES = ["접수", "출고완료", "생산중", "자수대기"];
const OPTIONS = ["블랙 / S(55)", "네이비 / M(66)", "그레이 / L(77)", "베이지 / XL(88)", "화이트 / Free"];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { channel } = await req.json().catch(() => ({}));
  const ch = CHANNELS[channel as string];
  if (!ch) return NextResponse.json({ ok: false, error: "bad_channel" }, { status: 400 });

  const stamp = Date.now().toString().slice(-8);
  const prefix = channel === "cafe24" ? "CF" : channel === "smartstore" ? "SS" : "ML";

  // 고객 노성준 보장 (없으면 생성)
  let customer = await prisma.customer.findFirst({ where: { name: "노성준" } });
  if (!customer) {
    const all = await prisma.customer.findMany({ select: { code: true } });
    let maxNum = 0;
    for (const c of all) { const m = /^A(\d+)$/.exec(c.code); if (m) maxNum = Math.max(maxNum, +m[1]); }
    customer = await prisma.customer.create({
      data: { code: `A${String(maxNum + 1).padStart(3, "0")}`, name: "노성준", type: "개인", channel: ch.channel },
    });
  }

  // 더미 5건 생성
  const N = 5;
  const batch = await prisma.uploadBatch.create({
    data: { filename: `[동기화] ${ch.label}`, sheetType: channel === "mall" ? "online" : "cafe", rowCount: N },
  });

  const rawData = [];
  const orderData = [];
  const sample = [];
  for (let i = 0; i < N; i++) {
    const p = pick(PRODUCTS);
    const qty = 1 + Math.floor(Math.random() * 5);
    const unit = p.price + Math.floor(Math.random() * 5) * 1000; // 약간의 변동
    const amount = qty * unit;
    const status = pick(STATUSES);
    const orderNo = `${prefix}-${stamp}-${String(i + 1).padStart(2, "0")}`;
    rawData.push({
      batchId: batch.id, sheetType: channel === "mall" ? "online" : "cafe",
      source: ch.source, orderNo, ordererName: "노성준", payer: "노성준",
      productName: p.name, option: pick(OPTIONS), qty, optionPrice: unit,
      purchaseAmount: amount, totalPayAmount: amount, finalPayAmount: amount,
      channel: ch.channel, orderStatus: status, orderMonth: "2026-06", customerCode: customer.code,
    });
    orderData.push({
      orderNo, orderDate: new Date(), customerCode: customer.code, customerName: "노성준",
      customerType: "개인", channel: ch.channel, sku: p.sku, productName: `${p.name} (${"옵션"})`,
      qty, unitPrice: unit, totalAmount: amount, returnQty: 0, netQty: qty, status,
    });
    sample.push({ orderNo, product: p.name, qty, amount, status });
  }
  await prisma.rawOrder.createMany({ data: rawData });
  await prisma.order.createMany({ data: orderData });

  const total = await prisma.order.aggregate({ where: { customerCode: customer.code }, _sum: { totalAmount: true } });
  const cum = total._sum.totalAmount ?? 0;
  const grade = cum >= 5000000 ? "VIP" : cum >= 1000000 ? "우수" : "일반";

  return NextResponse.json({
    ok: true, channel: ch.label, inserted: N, batchId: batch.id, sample,
    customer: { name: "노성준", code: customer.code, cumulative: cum, grade },
  });
}
