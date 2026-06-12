import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function ShopDetailRedirect() {
  const product = await prisma.product.findFirst({
    where: { status: 'published' },
    orderBy: { id: 'asc' },
    select: { id: true },
  });
  const fallback = await prisma.product.findFirst({
    orderBy: { id: 'asc' },
    select: { id: true },
  });
  const target = product ?? fallback;
  redirect(target ? `/shop/${target.id}` : '/shop/list');
}
