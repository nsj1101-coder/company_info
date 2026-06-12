import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

type CategoryPatch = {
  slug?: string;
  name?: string;
  parentId?: number | null;
  order?: number;
  visible?: boolean;
  badge?: string | null;
};

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: Request, { params }: Params) {
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  await getCurrentSession();
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ category }, { status: 200 });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "admin" && session.role !== "biz")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as CategoryPatch | null;
  if (!body) return NextResponse.json({ error: "bad_body" }, { status: 400 });

  const category = await prisma.category.update({
    where: { id },
    data: {
      slug: body.slug ?? undefined,
      name: body.name ?? undefined,
      parentId: body.parentId === undefined ? undefined : body.parentId,
      order: body.order ?? undefined,
      visible: body.visible ?? undefined,
      badge: body.badge === undefined ? undefined : body.badge,
    },
  });

  return NextResponse.json({ category }, { status: 200 });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "admin" && session.role !== "biz")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  const fallback = await prisma.category.findUnique({ where: { slug: "etc" } });
  if (!fallback) {
    return NextResponse.json({ error: "no_fallback" }, { status: 409 });
  }
  if (fallback.id === id) {
    return NextResponse.json({ error: "cannot_delete_fallback" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: fallback.id },
    }),
    prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    }),
    prisma.category.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true }, { status: 200 });
}
