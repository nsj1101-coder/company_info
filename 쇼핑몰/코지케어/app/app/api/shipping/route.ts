import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import type { Prisma, ShippingStatus } from "@prisma/client";

type CreateShippingBody = {
  orderId?: number;
  courier?: string;
  trackingNo?: string;
  status?: ShippingStatus;
};

const VALID_STATUS: ShippingStatus[] = ["pending", "in_transit", "delivered"];

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const orderIdParam = url.searchParams.get("orderId");

  const where: Prisma.ShippingWhereInput = {};
  if (statusParam && (VALID_STATUS as string[]).includes(statusParam)) {
    where.status = statusParam as ShippingStatus;
  }
  if (orderIdParam) {
    where.orderId = Number(orderIdParam);
  }

  if (session.role === "biz") {
    if (!session.bizId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    where.order = { bizId: session.bizId };
  } else if (session.role === "user") {
    where.order = { buyerId: Number(session.sub) };
  }

  const shippings = await prisma.shipping.findMany({
    where,
    include: {
      order: {
        select: {
          id: true,
          orderNo: true,
          status: true,
          buyerId: true,
          bizId: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  return NextResponse.json({ shippings }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.role === "user") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as CreateShippingBody | null;
  if (!body || typeof body.orderId !== "number") {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: body.orderId } });
  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }
  if (session.role === "biz" && order.bizId !== session.bizId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const status: ShippingStatus = body.status ?? "pending";
  if (!VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const now = new Date();
  const shipping = await prisma.shipping.upsert({
    where: { orderId: body.orderId },
    create: {
      orderId: body.orderId,
      courier: body.courier,
      trackingNo: body.trackingNo,
      status,
      shippedAt: status === "in_transit" ? now : undefined,
      deliveredAt: status === "delivered" ? now : undefined,
    },
    update: {
      courier: body.courier,
      trackingNo: body.trackingNo,
      status,
      shippedAt: status === "in_transit" ? now : undefined,
      deliveredAt: status === "delivered" ? now : undefined,
    },
  });

  return NextResponse.json({ shipping }, { status: 201 });
}
