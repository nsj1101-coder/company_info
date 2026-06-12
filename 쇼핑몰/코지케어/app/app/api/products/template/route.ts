import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getCurrentSession } from "@/lib/session";

const HEADERS = [
  "code",
  "name",
  "categoryId",
  "price",
  "welfarePrice",
  "stock",
  "status",
  "thumbnail",
  "description",
  "kcCert",
];

const SAMPLE_ROW = [
  "CZ-0001",
  "코지케어 프리미엄 성인용 기저귀 L (30매)",
  1,
  32000,
  19200,
  120,
  "published",
  "https://example.com/thumb.jpg",
  "프리미엄 성인용 기저귀",
  "KC-AB-123",
];

export async function GET() {
  const session = await getCurrentSession();
  if (!session || (session.role !== "admin" && session.role !== "biz")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const ws = XLSX.utils.aoa_to_sheet([HEADERS, SAMPLE_ROW]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "products");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="products-template.xlsx"',
    },
  });
}
