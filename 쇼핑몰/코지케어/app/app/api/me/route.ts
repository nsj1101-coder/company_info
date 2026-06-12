import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

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

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const user = await resolveUser(session.sub, session.email);
  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const loginLogs = await prisma.loginLog.findMany({
    where: { userId: user.id },
    orderBy: { at: "desc" },
    take: 5,
    select: { id: true, ip: true, userAgent: true, at: true },
  });

  return NextResponse.json(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      loginLogs: loginLogs.map((log) => ({
        id: log.id,
        ip: log.ip,
        userAgent: log.userAgent,
        at: log.at.toISOString(),
      })),
    },
    { status: 200 }
  );
}
