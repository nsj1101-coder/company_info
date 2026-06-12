import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Row = { code?: string; author?: string; rating?: number; title?: string; content?: string };
type Body = { rows?: Row[] };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !Array.isArray(body.rows) || body.rows.length === 0) {
    return NextResponse.json({ error: 'rows 필수' }, { status: 400 });
  }

  const codes = [...new Set(body.rows.map((r) => (r.code ?? '').trim()).filter(Boolean))];
  const products = await prisma.product.findMany({ where: { code: { in: codes } }, select: { id: true, code: true } });
  const byCode = new Map(products.map((p) => [p.code, p.id]));

  let created = 0;
  let skipped = 0;
  const data: { productId: number; authorName: string; rating: number; title: string | null; content: string; status: string }[] = [];
  for (const r of body.rows) {
    const code = (r.code ?? '').trim();
    const pid = byCode.get(code);
    if (!pid || !r.content?.trim()) { skipped += 1; continue; }
    data.push({
      productId: pid,
      authorName: (r.author ?? '').trim() || '익명',
      rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
      title: (r.title ?? '').trim() || null,
      content: String(r.content),
      status: 'visible',
    });
  }
  if (data.length > 0) {
    const res = await prisma.productReview.createMany({ data });
    created = res.count;
  }
  return NextResponse.json({ ok: true, created, skipped });
}
