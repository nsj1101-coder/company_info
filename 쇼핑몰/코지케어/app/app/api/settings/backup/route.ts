import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const [products, orders, users, bizMembers] = await Promise.all([
    prisma.product.findMany({ orderBy: { id: "asc" } }),
    prisma.order.findMany({ orderBy: { id: "asc" } }),
    prisma.user.findMany({ orderBy: { id: "asc" } }),
    prisma.bizMember.findMany({ orderBy: { id: "asc" } }),
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(products.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))),
    "products"
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(orders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() }))),
    "orders"
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))
    ),
    "users"
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      bizMembers.map((b) => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
        approvedAt: b.approvedAt ? b.approvedAt.toISOString() : "",
      }))
    ),
    "bizMembers"
  );

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const now = new Date();

  await prisma.setting.upsert({
    where: { key: "data.lastBackupAt" },
    create: { key: "data.lastBackupAt", value: now.toISOString(), scope: "data" },
    update: { value: now.toISOString() },
  });

  const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="cozycare-backup-${stamp}.xlsx"`,
    },
  });
}
