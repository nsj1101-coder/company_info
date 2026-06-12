import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import type { Prisma } from "@prisma/client";

type CreateOrderItem = {
  productId: number;
  qty: number;
  unitPrice?: number;
  optionLabel?: string;
};

type CreateOrderBody = {
  buyerId?: number;
  bizId?: number;
  paymentMethod?: string;
  items?: CreateOrderItem[];
  listPrice?: number;
  insuranceSupport?: number;
  selfPay?: number;
};

function generateOrderNo(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${yyyy}${mm}${dd}-${rand}`;
}

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const bizIdParam = url.searchParams.get("bizId");

  const where: Prisma.OrderWhereInput = {};

  if (session.role === "biz") {
    if (!session.bizId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    where.bizId = session.bizId;
  } else if (session.role === "user") {
    const user = await prisma.user.findUnique({ where: { email: session.sub } });
    where.buyerId = user?.id ?? -1;
  } else if (session.role === "admin") {
    if (bizIdParam) where.bizId = Number(bizIdParam);
  }

  if (statusParam) {
    const allowed = ["ready", "shipping", "delivered", "confirmed"] as const;
    if ((allowed as readonly string[]).includes(statusParam)) {
      where.status = statusParam as (typeof allowed)[number];
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: true } },
      shipping: true,
      welfareReview: true,
      buyer: { select: { id: true, name: true, email: true } },
      biz: { select: { id: true, companyName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as CreateOrderBody | null;
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items required" }, { status: 400 });
  }

  const productIds = body.items.map((it) => it.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const itemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];
  let totalPrice = 0;
  for (const it of body.items) {
    const product = productMap.get(it.productId);
    if (!product) {
      return NextResponse.json(
        { error: `product not found: ${it.productId}` },
        { status: 400 }
      );
    }
    const unitPrice = it.unitPrice ?? product.price;
    totalPrice += unitPrice * it.qty;
    itemsData.push({
      product: { connect: { id: product.id } },
      qty: it.qty,
      unitPrice,
      optionLabel: it.optionLabel,
    });
  }

  let buyerId: number | undefined;
  let bizId: number | undefined;

  if (session.role === "user") {
    const user = await prisma.user.findUnique({ where: { email: session.sub } });
    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }
    buyerId = user.id;
  } else if (session.role === "biz") {
    bizId = session.bizId;
    buyerId = body.buyerId;
  } else if (session.role === "admin") {
    buyerId = body.buyerId;
    bizId = body.bizId;
  }

  const order = await prisma.order.create({
    data: {
      orderNo: generateOrderNo(),
      buyerId,
      bizId,
      status: "ready",
      totalPrice,
      listPrice: body.listPrice,
      insuranceSupport: body.insuranceSupport,
      selfPay: body.selfPay,
      paymentMethod: body.paymentMethod,
      items: { create: itemsData },
    },
    include: {
      items: true,
      shipping: true,
      welfareReview: true,
    },
  });

  return NextResponse.json({ order }, { status: 201 });
}
