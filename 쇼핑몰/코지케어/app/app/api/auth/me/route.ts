import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt, COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      sub: payload.sub,
      role: payload.role,
      bizId: payload.bizId,
    },
    { status: 200 }
  );
}
