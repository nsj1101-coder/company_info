import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sign, COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { loginId, password } = await req.json().catch(() => ({}));
  if (!loginId || !password) {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { loginId: String(loginId).trim() } });
  if (!user || !bcrypt.compareSync(String(password), user.passwordHash)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }
  const token = sign({ uid: user.id, name: user.name, role: user.role });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 43200 });
  return res;
}
