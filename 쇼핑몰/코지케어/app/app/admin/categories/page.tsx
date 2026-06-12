import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import CategoriesClient, { type CategoryView } from './CategoriesClient';

const ICON_MAP: Record<string, string> = {
  보행기: 'icon-footprints',
  휠체어: 'icon-armchair',
  목욕의자: 'icon-bath',
  이동변기: 'icon-toilet',
  전동침대: 'icon-bed-double',
  미끄럼방지: 'icon-shield',
  기타용품: 'icon-package',
};

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    redirect('/admin/login');
  }

  const rows = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      parent: { select: { name: true } },
    },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  });

  const categories: CategoryView[] = rows.map((c, idx) => ({
    id: c.id,
    order: c.order || idx + 1,
    icon: ICON_MAP[c.name] ?? 'icon-package',
    name: c.name,
    count: c._count.products,
    slug: c.slug,
    visible: c.visible,
    parentId: c.parentId,
    parentName: c.parent?.name ?? null,
  }));

  return <CategoriesClient categories={categories} />;
}
