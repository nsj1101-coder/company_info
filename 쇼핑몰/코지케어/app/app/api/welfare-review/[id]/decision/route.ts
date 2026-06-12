import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

type DecisionBody = {
  status?: "approved" | "rejected";
  note?: string;
};

export async function POST(req: Request, ctx: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as DecisionBody | null;
  if (!body || (body.status !== "approved" && body.status !== "rejected")) {
    return NextResponse.json({ error: "status must be approved|rejected" }, { status: 400 });
  }

  const existing = await prisma.welfareReview.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const reviewer = session.name ?? session.email ?? session.sub;

  const review = await prisma.welfareReview.update({
    where: { id },
    data: {
      status: body.status,
      note: body.note,
      reviewer,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ review }, { status: 200 });
}
