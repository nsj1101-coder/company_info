import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type ExportType = "products" | "orders" | "members";

function isExportType(v: string | null): v is ExportType {
  return v === "products" || v === "orders" || v === "members";
}

async function buildProductRows(): Promise<Record<string, string | number>[]> {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { id: "asc" },
  });
  return products.map((p) => ({
    code: p.code,
    name: p.name,
    category: p.category.name,
    price: p.price,
    welfarePrice: p.welfarePrice ?? "",
    stock: p.stock,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  }));
}

async function buildOrderRows(): Promise<Record<string, string | number>[]> {
  const orders = await prisma.order.findMany({
    include: { buyer: true, biz: true },
    orderBy: { id: "asc" },
  });
  return orders.map((o) => ({
    orderNo: o.orderNo,
    buyer: o.buyer?.name ?? o.biz?.companyName ?? "",
    type: o.bizId ? "사업자" : "일반",
    status: o.status,
    totalPrice: o.totalPrice,
    paymentMethod: o.paymentMethod ?? "",
    createdAt: o.createdAt.toISOString(),
  }));
}

async function buildMemberRows(): Promise<Record<string, string | number>[]> {
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  const bizMembers = await prisma.bizMember.findMany({ orderBy: { id: "asc" } });
  const userRows = users.map((u) => ({
    type: "일반",
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    status: u.role,
    createdAt: u.createdAt.toISOString(),
  }));
  const bizRows = bizMembers.map((b) => ({
    type: "사업자",
    name: b.companyName,
    email: b.email ?? "",
    phone: b.phone,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }));
  return [...userRows, ...bizRows];
}

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  if (!isExportType(type)) {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  const rows =
    type === "products"
      ? await buildProductRows()
      : type === "orders"
        ? await buildOrderRows()
        : await buildMemberRows();

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, type);
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="cozycare-${type}-${stamp}.xlsx"`,
    },
  });
}
