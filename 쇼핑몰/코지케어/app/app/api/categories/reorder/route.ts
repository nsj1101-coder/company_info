import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type ReorderItem = { id: number; order: number };
type ReorderBody = { items?: ReorderItem[] };

function isValidItem(value: unknown): value is ReorderItem {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "number" &&
    Number.isInteger(record.id) &&
    record.id > 0 &&
    typeof record.order === "number" &&
    Number.isInteger(record.order)
  );
}

export async function PATCH(req: Request) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "admin" && session.role !== "biz")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as ReorderBody | null;
  if (!body || !Array.isArray(body.items) || !body.items.every(isValidItem)) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const items = body.items;
  if (items.length === 0) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  await prisma.$transaction(
    items.map((item) =>
      prisma.category.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    ),
  );

  return NextResponse.json({ success: true }, { status: 200 });
}
