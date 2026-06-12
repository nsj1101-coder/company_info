import { NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

type ProductPatch = {
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

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: Request, { params }: Params) {
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  const session = await getCurrentSession();
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, category: true, options: true },
  });
  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (
    session?.role === "biz" &&
    product.bizId !== null &&
    product.bizId !== session.bizId
  ) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({ product }, { status: 200 });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "admin" && session.role !== "biz")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (session.role === "biz" && existing.bizId !== session.bizId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as ProductPatch | null;
  if (!body) return NextResponse.json({ error: "bad_body" }, { status: 400 });

  const product = await prisma.$transaction(async (tx) => {
    if (body.images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
    }
    if (body.options) {
      await tx.productOption.deleteMany({ where: { productId: id } });
    }
    return tx.product.update({
      where: { id },
      data: {
        code: body.code ?? undefined,
        name: body.name ?? undefined,
        categoryId: body.categoryId ?? undefined,
        bizId: session.role === "admin" ? body.bizId ?? undefined : undefined,
        bizOnly: session.role === "admin" ? body.bizOnly ?? undefined : undefined,
        price: body.price ?? undefined,
        welfarePrice: body.welfarePrice ?? undefined,
        supplierPrice: body.supplierPrice ?? undefined,
        pointRate: body.pointRate ?? undefined,
        manager: body.manager ?? undefined,
        stock: body.stock ?? undefined,
        status: body.status ?? undefined,
        thumbnail: body.thumbnail ?? undefined,
        description: body.description ?? undefined,
        detailContent: body.detailContent ?? undefined,
        kcCert: body.kcCert ?? undefined,
        images: body.images
          ? {
              create: body.images.map((img, idx) => ({
                url: img.url,
                order: img.order ?? idx,
              })),
            }
          : undefined,
        options: body.options
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
  });

  return NextResponse.json({ product }, { status: 200 });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "admin" && session.role !== "biz")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (session.role === "biz" && existing.bizId !== session.bizId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true }, { status: 200 });
}
