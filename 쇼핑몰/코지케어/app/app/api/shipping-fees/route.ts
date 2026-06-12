import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Body = { name?: string; baseFee?: number; freeThreshold?: number; jejuFee?: number; islandFee?: number };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.name?.trim()) return NextResponse.json({ error: 'name 필수' }, { status: 400 });

  const count = await prisma.shippingFeePolicy.count();
  const p = await prisma.shippingFeePolicy.create({
    data: {
      name: body.name.trim(),
      baseFee: Number(body.baseFee) || 0,
      freeThreshold: body.freeThreshold ? Number(body.freeThreshold) : null,
      jejuFee: Number(body.jejuFee) || 0,
      islandFee: Number(body.islandFee) || 0,
      isDefault: count === 0,
    },
  });
  return NextResponse.json({ ok: true, id: p.id });
}
