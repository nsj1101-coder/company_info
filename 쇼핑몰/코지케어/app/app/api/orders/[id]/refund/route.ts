import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

type RefundBody = {
  reason?: string;
  amount?: number;
};

export async function POST(req: Request, ctx: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin" && session.role !== "biz") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { refund: true },
  });
  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (session.role === "biz" && order.bizId !== session.bizId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (order.refund) {
    return NextResponse.json({ error: "already refunded" }, { status: 409 });
  }

  const body = (await req.json().catch(() => null)) as RefundBody | null;
  const reason =
    body && typeof body.reason === "string" && body.reason.trim()
      ? body.reason.trim()
      : "관리자 환불 처리";
  const amount =
    body && typeof body.amount === "number" && body.amount > 0
      ? body.amount
      : order.selfPay ?? order.totalPrice;

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const refund = await tx.refund.create({
      data: {
        orderId: id,
        amount,
        reason,
        status: "done",
        createdAt: now,
      },
    });
    const updated = await tx.order.update({
      where: { id },
      data: { status: "refunded" },
    });
    await tx.orderEvent.create({
      data: {
        orderId: id,
        type: "refunded",
        note: `환불 처리 완료 (${reason})`,
        at: now,
      },
    });
    return { refund, order: updated };
  });

  return NextResponse.json(result, { status: 200 });
}
