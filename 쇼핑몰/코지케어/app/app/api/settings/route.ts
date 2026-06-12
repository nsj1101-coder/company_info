import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type UpsertEntry = {
  key?: string;
  value?: string;
  scope?: string;
};

type UpsertBody = UpsertEntry | { items?: UpsertEntry[] };

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const scope = url.searchParams.get("scope");

  const settings = await prisma.setting.findMany({
    where: scope ? { scope } : undefined,
    orderBy: { key: "asc" },
  });

  return NextResponse.json({ settings }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as UpsertBody | null;
  if (!body) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const items: UpsertEntry[] =
    "items" in body && Array.isArray(body.items) ? body.items : [body as UpsertEntry];

  const valid = items.filter(
    (it): it is Required<Pick<UpsertEntry, "key" | "value">> & { scope?: string } =>
      typeof it.key === "string" && it.key.length > 0 && typeof it.value === "string"
  );
  if (!valid.length) {
    return NextResponse.json({ error: "no_valid_entries" }, { status: 400 });
  }

  const upserts = valid.map((it) =>
    prisma.setting.upsert({
      where: { key: it.key },
      create: { key: it.key, value: it.value, scope: it.scope ?? "global" },
      update: { value: it.value, ...(it.scope ? { scope: it.scope } : {}) },
    })
  );

  const results = await prisma.$transaction(upserts);
  return NextResponse.json({ ok: true, count: results.length }, { status: 200 });
}
