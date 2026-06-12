import { NextResponse } from "next/server";
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type ProductBody = {
  code?: string;
  name?: string;
  categoryId?: number;
  bizId?: number | null;
  bizOnly?: boolean;
  price?: number;
  welfarePrice?: number | null;
  supplierPrice?: number | null;
  pointRate?: number | null;
  manager?: string | null;
  stock?: number;
  status?: ProductStatus;
  thumbnail?: string | null;
  description?: string | null;
  detailContent?: string | null;
  kcCert?: string | null;
  images?: { url: string; order?: number }[];
  options?: { name: string; value: string }[];
};

export async function GET() {
  const session = await getCurrentSession();

  const where: Prisma.ProductWhereInput =
    session?.role === "biz" && session.bizId
      ? { OR: [{ bizId: session.bizId }, { bizId: null }] }
      : {};

  const products = await prisma.product.findMany({
    where,
    include: { images: true, category: true },
    orderBy: { id: "desc" },
  });

  return NextResponse.json({ products }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "admin" && session.role !== "biz")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as ProductBody | null;
  if (!body?.code || !body.name || !body.categoryId || body.price === undefined) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const bizId =
    session.role === "biz"
      ? session.bizId ?? null
      : body.bizId ?? null;

  const product = await prisma.product.create({
    data: {
      code: body.code,
      name: body.name,
      categoryId: body.categoryId,
      bizId,
      bizOnly: session.role === "admin" ? body.bizOnly ?? false : false,
      price: body.price,
      welfarePrice: body.welfarePrice ?? null,
      supplierPrice: body.supplierPrice ?? null,
      pointRate: body.pointRate ?? null,
      manager: body.manager ?? null,
      stock: body.stock ?? 0,
      status: body.status ?? "draft",
      thumbnail: body.thumbnail ?? null,
      description: body.description ?? null,
      detailContent: body.detailContent ?? null,
      kcCert: body.kcCert ?? null,
      images: body.images?.length
        ? {
            create: body.images.map((img, idx) => ({
              url: img.url,
              order: img.order ?? idx,
            })),
          }
        : undefined,
      options: body.options?.length
        ? {
            create: body.options.map((opt) => ({
              name: opt.name,
              value: opt.value,
            })),
          }
        : undefined,
    },
    include: { images: true, category: true, options: true },
  });

  return NextResponse.json({ product }, { status: 201 });
}
