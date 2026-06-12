import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type CategoryBody = {
  slug?: string;
  name?: string;
  parentId?: number | null;
  order?: number;
  visible?: boolean;
  badge?: string | null;
};

export async function GET() {
  await getCurrentSession();
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
  return NextResponse.json({ categories }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "admin" && session.role !== "biz")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as CategoryBody | null;
  if (!body?.slug || !body.name) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      slug: body.slug,
      name: body.name,
      parentId: body.parentId ?? null,
      order: body.order ?? 0,
      visible: body.visible ?? true,
      badge: body.badge ?? null,
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}
