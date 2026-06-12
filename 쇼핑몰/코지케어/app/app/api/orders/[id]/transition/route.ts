import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import type { OrderStatus, ShippingStatus } from "@prisma/client";
import { ORDER_CHAIN, chainIndex, STATUS_LABEL } from "@/lib/orderStatus";

type RouteContext = { params: Promise<{ id: string }> };

type TransitionBody = {
  to?: OrderStatus;
  courier?: string;
  trackingNo?: string;
};

export async function POST(req: Request, ctx: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as TransitionBody | null;
  const to = body?.to;
  if (!to || !ORDER_CHAIN.includes(to)) {
    return NextResponse.json({ error: "invalid target status" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { shipping: true, welfareReview: true },
  });
  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const fromIdx = chainIndex(order.status);
  const toIdx = chainIndex(to);
  if (fromIdx < 0) {
    return NextResponse.json({ error: `cannot transition from ${order.status}` }, { status: 400 });
  }
  // 인접한 단계로만 이동 (한 칸 앞/뒤)
  if (Math.abs(toIdx - fromIdx) !== 1) {
    return NextResponse.json({ error: `non-adjacent transition ${order.status} -> ${to}` }, { status: 400 });
  }
  // 복지용구 서류가 없는 주문은 서류 단계로 이동 불가
  if (!order.welfareReview && (to === "doc_review" || to === "doc_approved")) {
    return NextResponse.json({ error: "no welfare review on this order" }, { status: 400 });
  }

  if (session.role === "biz") {
    if (order.bizId !== session.bizId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (to === "confirmed") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  } else if (session.role === "user") {
    if (order.buyerId !== Number(session.sub)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (to !== "confirmed") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const now = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.order.update({
      where: { id },
      data: { status: to },
    });

    if (to === "shipping") {
      const shippingStatus: ShippingStatus = "in_transit";
      if (order.shipping) {
        await tx.shipping.update({
          where: { orderId: id },
          data: {
            status: shippingStatus,
            shippedAt: order.shipping.shippedAt ?? now,
            courier: body?.courier ?? order.shipping.courier,
            trackingNo: body?.trackingNo ?? order.shipping.trackingNo,
          },
        });
      } else {
        await tx.shipping.create({
          data: { orderId: id, status: shippingStatus, shippedAt: now, courier: body?.courier, trackingNo: body?.trackingNo },
        });
      }
    } else if (to === "delivered") {
      if (order.shipping) {
        await tx.shipping.update({ where: { orderId: id }, data: { status: "delivered", deliveredAt: now } });
      } else {
        await tx.shipping.create({ data: { orderId: id, status: "delivered", deliveredAt: now } });
      }
    }

    // 복지용구 서류 검토 상태 동기화
    if (order.welfareReview) {
      if (to === "doc_approved") {
        await tx.welfareReview.update({
          where: { orderId: id },
          data: { status: "approved", reviewer: order.welfareReview.reviewer || "관리자", reviewedAt: order.welfareReview.reviewedAt ?? now },
        });
      } else if (to === "doc_review") {
        await tx.welfareReview.update({ where: { orderId: id }, data: { status: "pending" } });
      }
    }

    const forward = toIdx > fromIdx;
    await tx.orderEvent.create({
      data: { orderId: id, type: to, note: `${STATUS_LABEL[to]}${forward ? "" : " (되돌림)"}`, at: now },
    });

    return next;
  });

  const result = await prisma.order.findUnique({
    where: { id: updated.id },
    include: { items: true, shipping: true, welfareReview: true },
  });

  return NextResponse.json({ order: result }, { status: 200 });
}
