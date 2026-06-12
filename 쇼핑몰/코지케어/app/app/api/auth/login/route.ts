import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { signJwt, COOKIE_NAME, Role } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type LoginBody = {
  id?: string;
  pw?: string;
  role?: Role;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as LoginBody | null;
  const id = body?.id ?? "";
  const pw = body?.pw ?? "";
  const role: Role = body?.role ?? "admin";

  let token: string | null = null;
  let resolvedRole: Role | null = null;
  let bizId: number | undefined;

  if (role === "admin") {
    const admin = await prisma.user.findUnique({ where: { loginId: id } });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "invalid" }, { status: 401 });
    }
    const ok = await bcrypt.compare(pw, admin.password);
    if (!ok) return NextResponse.json({ error: "invalid" }, { status: 401 });
    resolvedRole = "admin";
    token = signJwt({ sub: admin.email, role: "admin", name: admin.name });
  } else if (role === "biz") {
    let biz = await prisma.bizMember.findUnique({ where: { loginId: id } });
    if (!biz && id.includes("@")) {
      biz = await prisma.bizMember.findFirst({ where: { email: id.toLowerCase() } });
    }
    if (!biz) return NextResponse.json({ error: "invalid" }, { status: 401 });
    const ok = await bcrypt.compare(pw, biz.password);
    if (!ok) return NextResponse.json({ error: "invalid" }, { status: 401 });
    if (biz.status !== "approved") {
      return NextResponse.json({ error: biz.status === "rejected" ? "biz_rejected" : "biz_pending" }, { status: 403 });
    }
    resolvedRole = "biz";
    bizId = biz.id;
    token = signJwt({ sub: biz.loginId, role: "biz", bizId: biz.id, name: biz.companyName });
  } else if (role === "user") {
    const user = await prisma.user.findUnique({ where: { email: id } });
    if (!user) return NextResponse.json({ error: "invalid" }, { status: 401 });
    const ok = await bcrypt.compare(pw, user.password);
    if (!ok) return NextResponse.json({ error: "invalid" }, { status: 401 });
    resolvedRole = "user";
    token = signJwt({ sub: user.email, role: "user", name: user.name, email: user.email });
  } else {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  if (!token || !resolvedRole) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  const redirect = resolvedRole === "user" ? "/mypage" : "/admin/dashboard";
  return NextResponse.json(
    { ok: true, success: true, role: resolvedRole, bizId, redirect },
    { status: 200 }
  );
}
