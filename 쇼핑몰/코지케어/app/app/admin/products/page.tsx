import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import ProductsClient, { type ProductView } from './ProductsClient';
import type { Prisma } from '@prisma/client';

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    redirect('/admin/login');
  }

  const where: Prisma.ProductWhereInput =
    session.role === 'biz'
      ? { OR: [{ bizId: null }, { bizId: session.bizId }] }
      : {};

  const rows = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: [{ createdAt: 'desc' }],
    take: 200,
  });

  const products: ProductView[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category?.name ?? '-',
    price: `${p.price.toLocaleString('ko-KR')}원`,
    welfare: p.welfarePrice !== null ? `${p.welfarePrice.toLocaleString('ko-KR')}원` : '—',
    stock: String(p.stock),
    visible: p.status === 'published',
    image: p.thumbnail ?? '',
    bizId: p.bizId,
  }));

  return (
    <ProductsClient
      products={products}
      role={session.role}
      bizName={session.bizName}
    />
  );
}
