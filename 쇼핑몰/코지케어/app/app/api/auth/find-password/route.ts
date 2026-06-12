import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string; name?: string } | null;
  const email = (body?.email ?? '').trim().toLowerCase();
  const name = (body?.name ?? '').trim();
  if (!email) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email }, select: { name: true } });
  const found = !!user && (!name || user.name === name);
  // 데모 환경: 실제 메일 발송은 미연동. 계정 존재 여부만 반환.
  if (!found) {
    return NextResponse.json({ found: false }, { status: 404 });
  }
  return NextResponse.json({ ok: true, found: true });
}
