import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type CreateQnaBody = {
  productId?: number;
  question?: string;
  secret?: boolean;
};

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "user") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as CreateQnaBody | null;
  if (!body || typeof body.productId !== "number" || !body.question?.trim()) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.sub } });
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product) {
    return NextResponse.json({ error: "product_not_found" }, { status: 404 });
  }

  const qna = await prisma.productQna.create({
    data: {
      productId: product.id,
      userId: user.id,
      authorName: user.name,
      question: body.question.trim(),
      secret: body.secret === true,
      status: "pending",
    },
  });

  return NextResponse.json({ qna }, { status: 201 });
}
