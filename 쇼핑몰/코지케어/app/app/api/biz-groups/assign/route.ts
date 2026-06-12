import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Body = { bizId?: number; groupId?: number | null };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || typeof body.bizId !== 'number') {
    return NextResponse.json({ error: 'bizId 필수' }, { status: 400 });
  }
  const groupId = typeof body.groupId === 'number' ? body.groupId : null;
  if (groupId !== null) {
    const g = await prisma.bizGroup.findUnique({ where: { id: groupId } });
    if (!g) return NextResponse.json({ error: 'group_not_found' }, { status: 404 });
  }
  await prisma.bizMember.update({ where: { id: body.bizId }, data: { groupId } });
  return NextResponse.json({ ok: true });
}
