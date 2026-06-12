import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import type { Prisma, ShippingStatus } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

type PatchShippingBody = {
  courier?: string;
  trackingNo?: string;
  status?: ShippingStatus;
};

const VALID_STATUS: ShippingStatus[] = ["pending", "in_transit", "delivered"];

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.role === "user") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const shipping = await prisma.shipping.findUnique({
    where: { id },
    include: { order: true },
  });
  if (!shipping) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (session.role === "biz" && shipping.order.bizId !== session.bizId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as PatchShippingBody | null;
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const data: Prisma.ShippingUpdateInput = {};
  if (typeof body.courier === "string") data.courier = body.courier;
  if (typeof body.trackingNo === "string") data.trackingNo = body.trackingNo;

  const now = new Date();
  let nextOrderStatus: "shipping" | "delivered" | null = null;

  if (body.status) {
    if (!VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    data.status = body.status;
    if (body.status === "in_transit") {
      if (!shipping.shippedAt) data.shippedAt = now;
      if (shipping.order.status === "ready") nextOrderStatus = "shipping";
    } else if (body.status === "delivered") {
      if (!shipping.deliveredAt) data.deliveredAt = now;
      if (shipping.order.status !== "delivered" && shipping.order.status !== "confirmed") {
        nextOrderStatus = "delivered";
      }
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.shipping.update({ where: { id }, data });
    if (nextOrderStatus) {
      await tx.order.update({
        where: { id: shipping.orderId },
        data: { status: nextOrderStatus },
      });
    }
    return next;
  });

  return NextResponse.json({ shipping: updated }, { status: 200 });
}
