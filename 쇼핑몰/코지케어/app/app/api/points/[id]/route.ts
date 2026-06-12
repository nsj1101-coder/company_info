import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const logId = Number(id);
  if (!Number.isInteger(logId) || logId <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const log = await prisma.pointLog.findUnique({ where: { id: logId } });
  if (!log) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const biz = await prisma.bizMember.findUnique({ where: { id: log.bizId } });
  if (!biz) {
    return NextResponse.json({ error: "biz_not_found" }, { status: 404 });
  }

  const reverseDelta = log.type === "earn" ? -log.amount : log.amount;
  const nextBalance = biz.pointBalance + reverseDelta;
  if (nextBalance < 0) {
    return NextResponse.json({ error: "cannot_cancel_negative_balance" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.bizMember.update({
        where: { id: biz.id },
        data: { pointBalance: nextBalance },
      });
      await tx.pointLog.delete({ where: { id: logId } });
      return updated.pointBalance;
    });
    return NextResponse.json({ ok: true, balance: result }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
