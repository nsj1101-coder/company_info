import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type CreateUserBody = {
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
};

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const role = url.searchParams.get("role") as Role | null;
  const q = url.searchParams.get("q");

  const where: Prisma.UserWhereInput = {};
  if (role && ["admin", "biz", "user"].includes(role)) {
    where.role = role;
  }
  if (q) {
    where.OR = [
      { email: { contains: q } },
      { name: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      zonecode: true,
      roadAddress: true,
      detailAddress: true,
      role: true,
      userType: true,
      birthDate: true,
      memo: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as CreateUserBody | null;
  if (!body?.email || !body?.password || !body?.name) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const password = await bcrypt.hash(body.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password,
        name: body.name,
        phone: body.phone ?? null,
        zonecode: body.zonecode ?? null,
        roadAddress: body.roadAddress ?? null,
        detailAddress: body.detailAddress ?? null,
        role: body.role ?? "user",
        userType: body.userType ?? null,
        birthDate: body.birthDate ?? null,
        memo: body.memo ?? null,
      },
    });
    return NextResponse.json({ ok: true, id: user.id }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "duplicate" }, { status: 409 });
    }
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
