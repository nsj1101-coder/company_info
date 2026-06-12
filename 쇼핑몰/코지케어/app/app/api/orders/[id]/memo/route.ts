import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

type PatchMemoBody = {
  memo?: string;
};

export async function PATCH(req: Request, ctx: RouteContext) {
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

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (session.role === "biz" && existing.bizId !== session.bizId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as PatchMemoBody | null;
  if (!body || typeof body.memo !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { memo: body.memo },
  });

  return NextResponse.json({ order }, { status: 200 });
}
