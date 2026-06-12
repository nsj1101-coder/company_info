import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import type { Prisma } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

type PatchOrderBody = {
  paymentMethod?: string;
  totalPrice?: number;
};

async function loadOrderForSession(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      shipping: true,
      welfareReview: true,
      buyer: { select: { id: true, name: true, email: true } },
      biz: { select: { id: true, companyName: true } },
    },
  });
}

function canAccess(
  order: { buyerId: number | null; bizId: number | null },
  session: { role: string; sub: string; bizId?: number }
): boolean {
  if (session.role === "admin") return true;
  if (session.role === "biz") return order.bizId === session.bizId;
  if (session.role === "user") return order.buyerId === Number(session.sub);
  return false;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const order = await loadOrderForSession(id);
  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (!canAccess(order, session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ order }, { status: 200 });
}

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (!canAccess(existing, session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as PatchOrderBody | null;
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const data: Prisma.OrderUpdateInput = {};
  if (typeof body.paymentMethod === "string") data.paymentMethod = body.paymentMethod;
  if (typeof body.totalPrice === "number") data.totalPrice = body.totalPrice;

  const order = await prisma.order.update({
    where: { id },
    data,
    include: { items: true, shipping: true, welfareReview: true },
  });

  return NextResponse.json({ order }, { status: 200 });
}
