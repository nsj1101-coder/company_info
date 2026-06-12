import { notFound, redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import ProductEditClient, { type ProductEditData } from './ProductEditClient';

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    redirect('/admin/login');
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, options: true },
  });
  if (!product) notFound();

  if (session.role === 'biz' && product.bizId !== null && product.bizId !== session.bizId) {
    redirect('/admin/products');
  }

  const initial: ProductEditData = {
    id: product.id,
    code: product.code,
    name: product.name,
    categoryId: product.categoryId,
    bizOnly: product.bizOnly,
    price: product.price,
    welfarePrice: product.welfarePrice,
    supplierPrice: product.supplierPrice,
    pointRate: product.pointRate,
    manager: product.manager,
    stock: product.stock,
    status: product.status,
    thumbnail: product.thumbnail,
    description: product.description,
    detailContent: product.detailContent,
    images: product.images.map((img) => ({ url: img.url, order: img.order })),
    options: product.options.map((opt) => ({ name: opt.name, value: opt.value })),
  };

  return <ProductEditClient initial={initial} />;
}
