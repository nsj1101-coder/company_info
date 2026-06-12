import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, ts: process.uptime() }, { status: 200 });
}
