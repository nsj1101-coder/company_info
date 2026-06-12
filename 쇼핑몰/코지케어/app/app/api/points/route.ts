import { NextResponse } from "next/server";
import { Prisma, PointType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type CreateBody = {
  bizId?: number;
  type?: PointType;
  amount?: number;
  memo?: string | null;
};

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const bizIdParam = url.searchParams.get("bizId");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 100) || 100, 500);

  let bizId: number | null = null;
  if (session.role === "admin") {
    if (bizIdParam) {
      const parsed = Number(bizIdParam);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return NextResponse.json({ error: "invalid_bizId" }, { status: 400 });
      }
      bizId = parsed;
    }
  } else if (session.role === "biz") {
    if (!session.bizId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    bizId = session.bizId;
  } else {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const where: Prisma.PointLogWhereInput = {};
  if (bizId !== null) where.bizId = bizId;

  const logs = await prisma.pointLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  let balance: number | null = null;
  if (bizId !== null) {
    const biz = await prisma.bizMember.findUnique({
      where: { id: bizId },
      select: { pointBalance: true },
    });
    balance = biz?.pointBalance ?? null;
  }

  return NextResponse.json({ logs, balance }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as CreateBody | null;
  if (
    !body ||
    typeof body.bizId !== "number" ||
    typeof body.amount !== "number" ||
    body.amount <= 0 ||
    !body.type ||
    !["earn", "use", "expire"].includes(body.type)
  ) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const biz = await prisma.bizMember.findUnique({ where: { id: body.bizId } });
  if (!biz) {
    return NextResponse.json({ error: "biz_not_found" }, { status: 404 });
  }

  const delta = body.type === "earn" ? body.amount : -body.amount;
  const nextBalance = biz.pointBalance + delta;
  if (nextBalance < 0) {
    return NextResponse.json({ error: "insufficient_balance" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.bizMember.update({
      where: { id: body.bizId },
      data: { pointBalance: nextBalance },
    });
    const log = await tx.pointLog.create({
      data: {
        bizId: body.bizId!,
        type: body.type!,
        amount: body.amount!,
        balance: updated.pointBalance,
        memo: body.memo ?? null,
      },
    });
    return { log, balance: updated.pointBalance };
  });

  return NextResponse.json(
    { ok: true, id: result.log.id, balance: result.balance },
    { status: 200 }
  );
}
