import { NextResponse } from "next/server";
import { BizStatus, BizStep, NotificationChannel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type DecisionBody = {
  decision?: "approve" | "reject";
  note?: string;
  notify?: boolean;
  channel?: NotificationChannel;
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const bizId = Number(id);
  if (!Number.isInteger(bizId) || bizId <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as DecisionBody | null;
  if (!body || (body.decision !== "approve" && body.decision !== "reject")) {
    return NextResponse.json({ error: "invalid_decision" }, { status: 400 });
  }

  const member = await prisma.bizMember.findUnique({ where: { id: bizId } });
  if (!member) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const nextStatus: BizStatus = body.decision === "approve" ? "approved" : "rejected";
  const step: BizStep = body.decision === "approve" ? "approve" : "reject";

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.bizMember.update({
      where: { id: bizId },
      data: {
        status: nextStatus,
        approvedAt: nextStatus === "approved" ? new Date() : null,
        rejectReason: nextStatus === "rejected" ? body.note ?? null : null,
      },
    });
    const approval = await tx.bizApproval.create({
      data: {
        bizId,
        step,
        reviewer: session.sub,
        note: body.note ?? null,
      },
    });

    let notificationId: number | null = null;
    if (body.notify !== false) {
      const channel: NotificationChannel = body.channel ?? "kakao";
      const template =
        nextStatus === "approved"
          ? `[코지케어] ${member.companyName} 사업자 가입이 승인되었습니다.`
          : `[코지케어] ${member.companyName} 사업자 가입이 반려되었습니다.${body.note ? ` 사유: ${body.note}` : ""}`;
      const notif = await tx.notification.create({
        data: {
          audience: `biz:${bizId}`,
          channel,
          template,
          memo: `biz-approval#${approval.id}`,
        },
      });
      notificationId = notif.id;
    }

    return { member: updated, approval, notificationId };
  });

  return NextResponse.json(
    {
      ok: true,
      bizId: result.member.id,
      status: result.member.status,
      approvalId: result.approval.id,
      notificationId: result.notificationId,
    },
    { status: 200 }
  );
}
