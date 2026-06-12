import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Body = { code?: string; name?: string; discountRate?: number; pointRate?: number; memo?: string };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.code?.trim() || !body.name?.trim()) {
    return NextResponse.json({ error: 'code, name 필수' }, { status: 400 });
  }
  try {
    const g = await prisma.bizGroup.create({
      data: {
        code: body.code.trim(),
        name: body.name.trim(),
        discountRate: Number.isFinite(body.discountRate) ? Number(body.discountRate) : 0,
        pointRate: Number.isFinite(body.pointRate) ? Number(body.pointRate) : null,
        memo: body.memo?.trim() || null,
      },
    });
    return NextResponse.json({ ok: true, id: g.id });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ error: '이미 존재하는 코드입니다.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'create_failed' }, { status: 500 });
  }
}
