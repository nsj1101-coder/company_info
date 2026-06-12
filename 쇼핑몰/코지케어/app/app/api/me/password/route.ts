import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type PatchPasswordBody = {
  currentPassword?: string;
  newPassword?: string;
};

async function resolveUser(sub: string, email?: string) {
  const numericId = Number(sub);
  if (Number.isInteger(numericId) && numericId > 0) {
    const byId = await prisma.user.findUnique({ where: { id: numericId } });
    if (byId) return byId;
  }
  const lookupEmail = email ?? sub;
  if (lookupEmail) {
    return prisma.user.findUnique({ where: { email: lookupEmail } });
  }
  return null;
}

export async function PATCH(req: Request) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "admin" && session.role !== "user")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as PatchPasswordBody | null;
  const currentPassword = body?.currentPassword ?? "";
  const newPassword = body?.newPassword ?? "";
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const user = await resolveUser(session.sub, session.email);
  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "invalid_current_password" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
