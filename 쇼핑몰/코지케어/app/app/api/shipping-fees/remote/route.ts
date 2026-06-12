import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Body = { zipFrom?: string; zipTo?: string; region?: string; extraFee?: number };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.zipFrom?.trim() || !body.zipTo?.trim() || !body.region?.trim()) {
    return NextResponse.json({ error: 'zipFrom, zipTo, region 필수' }, { status: 400 });
  }
  const r = await prisma.remoteArea.create({
    data: { zipFrom: body.zipFrom.trim(), zipTo: body.zipTo.trim(), region: body.region.trim(), extraFee: Number(body.extraFee) || 0 },
  });
  return NextResponse.json({ ok: true, id: r.id });
}
