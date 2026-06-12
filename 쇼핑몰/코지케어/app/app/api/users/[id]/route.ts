import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type PatchUserBody = {
  email?: string;
  password?: string;
  name?: string;
  phone?: string | null;
  zonecode?: string | null;
  roadAddress?: string | null;
  detailAddress?: string | null;
  role?: Role;
  userType?: string | null;
  birthDate?: string | null;
  memo?: string | null;
  status?: string;
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as PatchUserBody | null;
  if (!body) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const data: Prisma.UserUpdateInput = {};
  if (body.email !== undefined) data.email = body.email;
  if (body.name !== undefined) data.name = body.name;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.zonecode !== undefined) data.zonecode = body.zonecode;
  if (body.roadAddress !== undefined) data.roadAddress = body.roadAddress;
  if (body.detailAddress !== undefined) data.detailAddress = body.detailAddress;
  if (body.role !== undefined) data.role = body.role;
  if (body.userType !== undefined) data.userType = body.userType;
  if (body.birthDate !== undefined) data.birthDate = body.birthDate;
  if (body.memo !== undefined) data.memo = body.memo;
  if (body.status !== undefined) data.status = body.status;
  if (body.password) data.password = await bcrypt.hash(body.password, 10);

  try {
    const user = await prisma.user.update({ where: { id: userId }, data });
    return NextResponse.json({ ok: true, id: user.id }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") return NextResponse.json({ error: "not_found" }, { status: 404 });
      if (e.code === "P2002") return NextResponse.json({ error: "duplicate" }, { status: 409 });
    }
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
