import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';

type Body = {
  phone?: string | null;
  zonecode?: string | null;
  roadAddress?: string | null;
  detailAddress?: string | null;
};

export async function PATCH(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'user') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.sub } });
  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone: body.phone !== undefined ? body.phone : user.phone,
      zonecode: body.zonecode !== undefined ? body.zonecode : user.zonecode,
      roadAddress: body.roadAddress !== undefined ? body.roadAddress : user.roadAddress,
      detailAddress: body.detailAddress !== undefined ? body.detailAddress : user.detailAddress,
    },
  });
  return NextResponse.json({ ok: true });
}
