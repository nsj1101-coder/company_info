import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// 주문 상태 변경 / 취소·환불 — 재고·반품과 연동
// body: { id, op: "status"|"cancel", status?: string }
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id, op, status } = await req.json().catch(() => ({}));
  const order = await prisma.order.findUnique({ where: { id: Number(id) } });
  if (!order) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const prev = order.status ?? "";
  const newStatus = op === "cancel" ? "반품/취소" : String(status ?? "");
  if (!newStatus) return NextResponse.json({ ok: false, error: "bad_status" }, { status: 400 });

  // 재고 연동 (SKU 매칭되는 경우만): 출고완료 진입=차감, 출고완료 이탈=복원
  let stockNote = "재고 SKU 미매칭";
  if (order.sku) {
    const inv = await prisma.inventory.findUnique({ where: { sku: order.sku } });
    if (inv) {
      const wasShipped = prev === "출고완료";
      const willShip = newStatus === "출고완료";
      let delta = 0;
      if (!wasShipped && willShip) delta = -order.qty;      // 출고 → 차감
      if (wasShipped && !willShip) delta = order.qty;       // 출고취소 → 복원
      if (delta !== 0) {
        const cur = inv.currentStock + delta;
        await prisma.inventory.update({
          where: { id: inv.id },
          data: {
            outbound: inv.outbound - delta,
            currentStock: cur,
            status: cur <= 0 ? "품절" : cur < inv.safeStock ? "부족" : "정상",
            shortageQty: Math.max(0, inv.safeStock - cur),
          },
        });
        stockNote = delta < 0 ? `재고 ${order.qty} 차감` : `재고 ${order.qty} 복원`;
      } else stockNote = "재고 변동 없음";
    }
  }

  // 취소/환불이면 반품 기록 생성
  if (op === "cancel") {
    await prisma.return.create({
      data: {
        returnNo: `RTN-${Date.now().toString().slice(-6)}`,
        returnDate: new Date(),
        returnPlace: order.channel,
        orderNo: order.orderNo,
        sku: order.sku,
        productName: order.productName,
        returnQty: order.qty,
        reason: "취소/환불",
      },
    });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: newStatus, ...(op === "cancel" ? { returnQty: order.qty, netQty: 0 } : {}) },
  });

  return NextResponse.json({ ok: true, status: newStatus, stockNote });
}
