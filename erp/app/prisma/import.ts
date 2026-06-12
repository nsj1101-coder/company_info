import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  readWorkbookFromFile, sheetRows,
  parseProducts, parseCustomers, parseOrders, parseInventory,
  parseProduction, parsePurchase, parseReturns, parseRawOrders,
} from "../lib/excel";

const prisma = new PrismaClient();
const XLSX_PATH = path.resolve(process.cwd(), "..", "검토용_라린느_ERP_v45 (1).xlsx");

async function main() {
  console.log("📂 엑셀 로드:", XLSX_PATH);
  const wb = readWorkbookFromFile(XLSX_PATH);
  const S = (name: string) => {
    const ws = wb.Sheets[name];
    if (!ws) throw new Error(`시트 없음: ${name}`);
    return sheetRows(ws);
  };

  // 초기화
  await prisma.$transaction([
    prisma.rawOrder.deleteMany(), prisma.uploadBatch.deleteMany(),
    prisma.order.deleteMany(), prisma.return.deleteMany(),
    prisma.productionOrder.deleteMany(), prisma.purchaseOrder.deleteMany(),
    prisma.inventory.deleteMany(), prisma.product.deleteMany(),
    prisma.customer.deleteMany(), prisma.user.deleteMany(),
  ]);

  // 관리자 계정
  await prisma.user.create({
    data: { loginId: "admin", name: "관리자", passwordHash: bcrypt.hashSync("admin1234", 10), role: "admin", department: "경영" },
  });

  // 마스터
  const products = parseProducts(S("제품SKU"));
  // SKU 중복 제거 (엑셀에 중복 가능)
  const seenSku = new Set<string>();
  const uniqProducts = products.filter((p) => p.sku && !seenSku.has(p.sku!) && seenSku.add(p.sku!));
  await prisma.product.createMany({ data: uniqProducts.map((p) => ({ ...p, sku: p.sku! })) });

  const customers = parseCustomers(S("고객관리"));
  const seenCode = new Set<string>();
  const uniqCustomers = customers.filter((c) => c.code && !seenCode.has(c.code!) && seenCode.add(c.code!));
  await prisma.customer.createMany({ data: uniqCustomers.map((c) => ({ ...c, code: c.code! })) });

  // 주문 원장
  const orders = parseOrders(S("주문관리"));
  await prisma.order.createMany({ data: orders });

  // 운영
  const inv = parseInventory(S("재고관리"));
  const seenInv = new Set<string>();
  const uniqInv = inv.filter((i) => i.sku && !seenInv.has(i.sku!) && seenInv.add(i.sku!));
  await prisma.inventory.createMany({ data: uniqInv.map((i) => ({ ...i, sku: i.sku! })) });

  await prisma.productionOrder.createMany({ data: parseProduction(S("생산관리")) });
  await prisma.purchaseOrder.createMany({ data: parsePurchase(S("발주관리")) });
  await prisma.return.createMany({ data: parseReturns(S("반품관리")) });

  // 원천 주문 (카페_26 / 주문서_26) — 업로드 배치로 기록
  for (const [sheet, type] of [["카페_26", "cafe"], ["주문서_26", "offline"]] as const) {
    const raw = parseRawOrders(S(sheet), type);
    const batch = await prisma.uploadBatch.create({
      data: { filename: `${sheet} (초기 임포트)`, sheetType: type, rowCount: raw.length },
    });
    // createMany 배치
    const data = raw.map((r) => ({ ...r, batchId: batch.id }));
    for (let i = 0; i < data.length; i += 500) {
      await prisma.rawOrder.createMany({ data: data.slice(i, i + 500) });
    }
  }

  // 재고 현재고 재계산: 현재고 = 초기 + 입고 - 출고(주문) + 반품
  const allInv = await prisma.inventory.findMany();
  const orderOut = await prisma.order.groupBy({ by: ["sku"], _sum: { qty: true } });
  const retIn = await prisma.return.groupBy({ by: ["sku"], _sum: { returnQty: true } });
  const outMap = new Map(orderOut.map((o) => [o.sku, o._sum.qty ?? 0]));
  const retMap = new Map(retIn.map((r) => [r.sku, r._sum.returnQty ?? 0]));
  for (const it of allInv) {
    const out = outMap.get(it.sku) ?? 0;
    const ret = retMap.get(it.sku) ?? 0;
    const current = it.initialStock + it.inbound - out + ret;
    const shortage = Math.max(0, it.safeStock - current);
    await prisma.inventory.update({
      where: { id: it.id },
      data: {
        outbound: out, currentStock: current, shortageQty: shortage,
        recommendQty: shortage > 0 ? Math.max(shortage, it.safeStock) : 0,
        status: current <= 0 ? "품절" : current < it.safeStock ? "부족" : "정상",
      },
    });
  }

  const counts = {
    상품: await prisma.product.count(), 고객: await prisma.customer.count(),
    주문: await prisma.order.count(), 재고: await prisma.inventory.count(),
    생산: await prisma.productionOrder.count(), 발주: await prisma.purchaseOrder.count(),
    반품: await prisma.return.count(), 원천주문: await prisma.rawOrder.count(),
  };
  console.log("✅ 임포트 완료:", counts);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
