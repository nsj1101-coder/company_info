import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, BizStatus, BizStep } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type PatchBody = {
  password?: string;
  companyName?: string;
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
  rejectReason?: string | null;
  note?: string;
};

const statusToStep: Record<BizStatus, BizStep> = {
  pending: "review",
  approved: "approve",
  rejected: "reject",
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
  const bizId = Number(id);
  if (!Number.isInteger(bizId) || bizId <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const current = await prisma.bizMember.findUnique({ where: { id: bizId } });
  if (!current) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const data: Prisma.BizMemberUpdateInput = {};
  if (body.companyName !== undefined) data.companyName = body.companyName;
  if (body.owner !== undefined) data.owner = body.owner;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.email !== undefined) data.email = body.email;
  if (body.zonecode !== undefined) data.zonecode = body.zonecode;
  if (body.roadAddress !== undefined) data.roadAddress = body.roadAddress;
  if (body.detailAddress !== undefined) data.detailAddress = body.detailAddress;
  if (body.businessType !== undefined) data.businessType = body.businessType;
  if (body.memo !== undefined) data.memo = body.memo;
  if (body.licenseUrl !== undefined) data.licenseUrl = body.licenseUrl;
  if (body.password) data.password = await bcrypt.hash(body.password, 10);

  let statusChanged = false;
  if (body.status && body.status !== current.status) {
    data.status = body.status;
    statusChanged = true;
    if (body.status === "approved") {
      data.approvedAt = new Date();
      data.rejectReason = null;
    } else if (body.status === "rejected") {
      data.rejectReason = body.rejectReason ?? null;
    } else {
      data.approvedAt = null;
      data.rejectReason = null;
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const member = await tx.bizMember.update({ where: { id: bizId }, data });
    if (statusChanged && body.status) {
      await tx.bizApproval.create({
        data: {
          bizId,
          step: statusToStep[body.status],
          reviewer: session.sub,
          note: body.note ?? null,
        },
      });
    }
    return member;
  });

  return NextResponse.json({ ok: true, id: updated.id, status: updated.status }, { status: 200 });
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
  const bizId = Number(id);
  if (!Number.isInteger(bizId) || bizId <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  try {
    await prisma.$transaction([
      prisma.bizApproval.deleteMany({ where: { bizId } }),
      prisma.pointLog.deleteMany({ where: { bizId } }),
      prisma.bizMember.delete({ where: { id: bizId } }),
    ]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
