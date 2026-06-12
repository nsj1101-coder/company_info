import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type CreateReviewBody = {
  productId?: number;
  rating?: number;
  title?: string;
  content?: string;
};

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "user") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as CreateReviewBody | null;
  if (!body || typeof body.productId !== "number" || !body.content?.trim()) {
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

  const rating =
    typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5
      ? Math.round(body.rating)
      : 5;

  const review = await prisma.productReview.create({
    data: {
      productId: product.id,
      userId: user.id,
      authorName: user.name,
      rating,
      title: body.title?.trim() ? body.title.trim() : null,
      content: body.content.trim(),
      status: "visible",
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
