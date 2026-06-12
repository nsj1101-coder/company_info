import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { signJwt, COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type LoginBody = {
  id?: string;
  pw?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as LoginBody | null;
  const id = body?.id ?? "";
  const pw = body?.pw ?? "";

  const biz = await prisma.bizMember.findUnique({ where: { loginId: id } });
  if (!biz) return NextResponse.json({ error: "invalid" }, { status: 401 });

  const ok = await bcrypt.compare(pw, biz.password);
  if (!ok) return NextResponse.json({ error: "invalid" }, { status: 401 });

  const token = signJwt({
    sub: biz.loginId,
    role: "biz",
    bizId: biz.id,
    name: biz.companyName,
    email: biz.email ?? undefined,
  });

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  return NextResponse.json(
    { ok: true, success: true, role: "biz", bizId: biz.id, redirect: "/admin/dashboard" },
    { status: 200 }
  );
}
