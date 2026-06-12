import { NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type ImportRow = {
  code: string;
  name: string;
  categoryId: number;
  bizId?: number | null;
  price: number;
  welfarePrice?: number | null;
  stock?: number;
  status?: ProductStatus;
  thumbnail?: string | null;
  description?: string | null;
  kcCert?: string | null;
};

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "admin" && session.role !== "biz")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as ImportRow[] | null;
  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const codes = body.map((r) => r.code).filter(Boolean);
  const existing = await prisma.product.findMany({
    where: { code: { in: codes } },
    select: { code: true },
  });
  const existingCodes = new Set(existing.map((p) => p.code));

  const toInsert = body.filter(
    (r) =>
      r.code &&
      r.name &&
      r.categoryId &&
      r.price !== undefined &&
      !existingCodes.has(r.code),
  );

  const result = await prisma.$transaction(
    toInsert.map((r) =>
      prisma.product.create({
        data: {
          code: r.code,
          name: r.name,
          categoryId: Number(r.categoryId),
          bizId:
            session.role === "biz"
              ? session.bizId ?? null
              : r.bizId ?? null,
          price: Number(r.price),
          welfarePrice:
            r.welfarePrice !== undefined && r.welfarePrice !== null
              ? Number(r.welfarePrice)
              : null,
          stock: r.stock !== undefined ? Number(r.stock) : 0,
          status: r.status ?? "draft",
          thumbnail: r.thumbnail ?? null,
          description: r.description ?? null,
          kcCert: r.kcCert ?? null,
        },
      }),
    ),
  );

  return NextResponse.json(
    {
      inserted: result.length,
      skipped: body.length - result.length,
      skippedCodes: body
        .filter((r) => existingCodes.has(r.code))
        .map((r) => r.code),
    },
    { status: 200 },
  );
}
