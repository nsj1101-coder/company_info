import { NextResponse } from "next/server";
import { Prisma, NotificationChannel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type CreateBody = {
  audience?: string;
  channel?: NotificationChannel;
  template?: string;
  memo?: string | null;
};

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const channel = url.searchParams.get("channel") as NotificationChannel | null;
  const audience = url.searchParams.get("audience");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 100) || 100, 500);

  const where: Prisma.NotificationWhereInput = {};
  if (channel && ["sms", "kakao", "email"].includes(channel)) where.channel = channel;
  if (audience) where.audience = audience;

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { sentAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ notifications }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as CreateBody | null;
  if (
    !body?.audience ||
    !body?.template ||
    !body?.channel ||
    !["sms", "kakao", "email"].includes(body.channel)
  ) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const notif = await prisma.notification.create({
    data: {
      audience: body.audience,
      channel: body.channel,
      template: body.template,
      memo: body.memo ?? null,
    },
  });

  return NextResponse.json({ ok: true, id: notif.id }, { status: 200 });
}
