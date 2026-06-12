import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import QuotesClient, { type QuoteView, type BizOpt, type ProductOpt } from './QuotesClient';

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const [quotes, bizList, products] = await Promise.all([
    prisma.quote.findMany({ include: { biz: { select: { companyName: true } }, items: true }, orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.bizMember.findMany({ where: { status: 'approved' }, select: { id: true, companyName: true }, orderBy: { companyName: 'asc' } }),
    prisma.product.findMany({ select: { id: true, name: true, supplierPrice: true, price: true }, orderBy: { name: 'asc' }, take: 500 }),
  ]);

  const rows: QuoteView[] = quotes.map((q) => ({
    id: q.id,
    quoteNo: q.quoteNo,
    date: fmt(q.createdAt),
    company: q.biz.companyName,
    title: q.title ?? '',
    status: q.status,
    totalAmount: q.totalAmount,
    itemCount: q.items.length,
    items: q.items.map((it) => ({ name: it.productName, qty: it.qty, unitPrice: it.unitPrice })),
  }));

  const bizOpts: BizOpt[] = bizList.map((b) => ({ id: b.id, name: b.companyName }));
  const productOpts: ProductOpt[] = products.map((p) => ({ id: p.id, name: p.name, price: p.supplierPrice ?? p.price }));

  return <QuotesClient rows={rows} bizOpts={bizOpts} productOpts={productOpts} />;
}
