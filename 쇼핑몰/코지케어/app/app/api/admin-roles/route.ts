import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import {
  ROLE_COLUMN_KEYS,
  ROLE_KEY_BY_COLUMN,
  matrixToPermissions,
  type MatrixRow,
  type RoleKey,
} from "@/app/admin/settings/permission/permissionMatrix";

const PERMISSION_ROW_COUNT = 10;

type SaveBody = {
  matrix?: unknown;
  otpRequired?: unknown;
};

function isMatrix(v: unknown): v is MatrixRow[] {
  if (!Array.isArray(v) || v.length !== PERMISSION_ROW_COUNT) return false;
  return v.every(
    (row) =>
      row !== null &&
      typeof row === "object" &&
      ROLE_COLUMN_KEYS.every(
        (k) => typeof (row as Record<string, unknown>)[k] === "boolean"
      )
  );
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const roles = await prisma.adminRole.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ roles }, { status: 200 });
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

  const matrix = body.matrix;
  const otpRequired = body.otpRequired;
  const OTP_COLUMNS: RoleKey[] = ["superadmin", "ordermanager", "reviewer"];

  const updates = ROLE_COLUMN_KEYS.map((column) =>
    prisma.adminRole.update({
      where: { key: ROLE_KEY_BY_COLUMN[column] },
      data: {
        permissions: JSON.stringify(matrixToPermissions(matrix, column)),
        otpRequired: OTP_COLUMNS.includes(column) ? otpRequired : false,
      },
    })
  );

  await prisma.$transaction(updates);

  return NextResponse.json({ ok: true }, { status: 200 });
}
