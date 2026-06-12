import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type ItemBody = { productId?: number | null; productName?: string; qty?: number; unitPrice?: number };
type Body = { bizId?: number; title?: string; items?: ItemBody[] };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'items 필수' }, { status: 400 });
  }
  // 사업자는 본인 bizId로 강제, 관리자는 body.bizId 지정
  const bizId = session.role === 'biz' ? session.bizId : body.bizId;
  if (typeof bizId !== 'number') {
    return NextResponse.json({ error: 'bizId 필수' }, { status: 400 });
  }
  const biz = await prisma.bizMember.findUnique({ where: { id: bizId } });
  if (!biz) return NextResponse.json({ error: 'biz_not_found' }, { status: 404 });

  const items = body.items
    .filter((it) => it.productName?.trim() && (it.qty ?? 0) > 0)
    .map((it) => ({
      productId: typeof it.productId === 'number' ? it.productId : null,
      productName: it.productName!.trim(),
      qty: it.qty!,
      unitPrice: it.unitPrice ?? 0,
    }));
  if (items.length === 0) return NextResponse.json({ error: '유효한 품목이 없습니다.' }, { status: 400 });

  const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const quoteNo = `Q-${Date.now().toString(36).toUpperCase()}`;

  const quote = await prisma.quote.create({
    data: {
      quoteNo,
      bizId,
      title: body.title?.trim() || null,
      status: 'requested',
      totalAmount: total,
      items: { create: items },
    },
  });
  return NextResponse.json({ ok: true, id: quote.id, quoteNo });
}
