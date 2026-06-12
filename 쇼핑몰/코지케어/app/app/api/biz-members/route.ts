import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, BizStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type CreateBody = {
  loginId?: string;
  password?: string;
  companyName?: string;
  bizNo?: string;
  owner?: string;
  phone?: string;
  email?: string | null;
  zonecode?: string | null;
  roadAddress?: string | null;
  detailAddress?: string | null;
  businessType?: string | null;
  memo?: string | null;
  licenseUrl?: string | null;
  status?: BizStatus;
};

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") as BizStatus | null;
  const q = url.searchParams.get("q");

  const where: Prisma.BizMemberWhereInput = {};
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    where.status = status;
  }
  if (q) {
    where.OR = [
      { companyName: { contains: q } },
      { bizNo: { contains: q } },
      { loginId: { contains: q } },
      { owner: { contains: q } },
    ];
  }

  const members = await prisma.bizMember.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      loginId: true,
      companyName: true,
      bizNo: true,
      owner: true,
      phone: true,
      email: true,
      businessType: true,
      memo: true,
      licenseUrl: true,
      status: true,
      approvedAt: true,
      rejectReason: true,
      pointBalance: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ members }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as CreateBody | null;
  if (!body?.loginId || !body?.password || !body?.companyName || !body?.bizNo || !body?.owner || !body?.phone) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const password = await bcrypt.hash(body.password, 10);

  try {
    const member = await prisma.bizMember.create({
      data: {
        loginId: body.loginId,
        password,
        companyName: body.companyName,
        bizNo: body.bizNo,
        owner: body.owner,
        phone: body.phone,
        email: body.email ?? null,
        zonecode: body.zonecode ?? null,
        roadAddress: body.roadAddress ?? null,
        detailAddress: body.detailAddress ?? null,
        businessType: body.businessType ?? null,
        memo: body.memo ?? null,
        licenseUrl: body.licenseUrl ?? null,
        status: body.status ?? "pending",
      },
    });
    return NextResponse.json({ ok: true, id: member.id }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "duplicate" }, { status: 409 });
    }
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
