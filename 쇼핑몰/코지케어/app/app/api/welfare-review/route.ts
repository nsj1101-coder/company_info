import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import type { Prisma, ReviewStatus } from "@prisma/client";

type CreateWelfareReviewBody = {
  orderId?: number;
  buyerId?: number;
  docUrl?: string;
};

const VALID_STATUS: ReviewStatus[] = ["pending", "gov", "approved", "rejected"];

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const orderIdParam = url.searchParams.get("orderId");

  const where: Prisma.WelfareReviewWhereInput = {};
  if (statusParam && (VALID_STATUS as string[]).includes(statusParam)) {
    where.status = statusParam as ReviewStatus;
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
    where.buyerId = Number(session.sub);
  }

  const reviews = await prisma.welfareReview.findMany({
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
      buyer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reviews }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as CreateWelfareReviewBody | null;
  if (!body || typeof body.orderId !== "number") {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: body.orderId } });
  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  if (session.role === "user" && order.buyerId !== Number(session.sub)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (session.role === "biz" && order.bizId !== session.bizId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const buyerId =
    session.role === "user" ? Number(session.sub) : body.buyerId ?? order.buyerId ?? undefined;

  const review = await prisma.welfareReview.upsert({
    where: { orderId: body.orderId },
    create: {
      orderId: body.orderId,
      buyerId,
      docUrl: body.docUrl,
      status: "pending",
    },
    update: {
      docUrl: body.docUrl,
      status: "pending",
      reviewedAt: null,
      reviewer: null,
      note: null,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
