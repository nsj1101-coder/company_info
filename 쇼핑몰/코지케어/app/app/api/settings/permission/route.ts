import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type SaveBody = {
  matrix?: unknown;
  otpRequired?: unknown;
};

const ROLE_KEYS = ["superadmin", "ordermanager", "reviewer", "productmanager", "cs"] as const;

function isMatrix(v: unknown): boolean {
  if (!Array.isArray(v)) return false;
  return v.every(
    (row) =>
      row !== null &&
      typeof row === "object" &&
      ROLE_KEYS.every((k) => typeof (row as Record<string, unknown>)[k] === "boolean")
  );
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const [matrixRow, otpRow] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "permission.matrix" } }),
    prisma.setting.findUnique({ where: { key: "permission.otpRequired" } }),
  ]);

  const matrix: unknown = matrixRow ? JSON.parse(matrixRow.value) : null;

  return NextResponse.json(
    {
      matrix,
      otpRequired: otpRow ? otpRow.value === "true" : true,
    },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as SaveBody | null;
  if (!body || !isMatrix(body.matrix) || typeof body.otpRequired !== "boolean") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: "permission.matrix" },
      create: { key: "permission.matrix", value: JSON.stringify(body.matrix), scope: "permission" },
      update: { value: JSON.stringify(body.matrix) },
    }),
    prisma.setting.upsert({
      where: { key: "permission.otpRequired" },
      create: { key: "permission.otpRequired", value: String(body.otpRequired), scope: "permission" },
      update: { value: String(body.otpRequired) },
    }),
  ]);

  return NextResponse.json({ ok: true }, { status: 200 });
}
