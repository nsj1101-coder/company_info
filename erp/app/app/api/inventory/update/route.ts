import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// 재고 실사 보정 / 안전재고 변경 (관리자)
// body: { id, currentStock?, safeStock? }
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id, currentStock, safeStock } = await req.json().catch(() => ({}));
  const inv = await prisma.inventory.findUnique({ where: { id: Number(id) } });
  if (!inv) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const cur = currentStock === undefined || currentStock === null ? inv.currentStock : Math.trunc(Number(currentStock));
  const safe = safeStock === undefined || safeStock === null ? inv.safeStock : Math.trunc(Number(safeStock));
  if (!Number.isFinite(cur) || !Number.isFinite(safe))
    return NextResponse.json({ ok: false, error: "bad_value" }, { status: 400 });

  // 실사 보정: 현재고를 입력값으로 직접 맞추고, 차이를 초기재고에 반영(추적용)
  const initialStock = inv.initialStock + (cur - inv.currentStock);

  await prisma.inventory.update({
    where: { id: inv.id },
    data: {
      initialStock,
      currentStock: cur,
      safeStock: safe,
      status: cur <= 0 ? "품절" : cur < safe ? "부족" : "정상",
      shortageQty: Math.max(0, safe - cur),
      recommendQty: cur < safe ? Math.max(safe - cur, safe) : 0,
    },
  });

  return NextResponse.json({ ok: true, currentStock: cur, safeStock: safe });
}
