import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import DetailClient, {
  type DetailProduct,
  type DetailReview,
  type DetailQna,
} from './DetailClient';

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

export default async function ShopDetailPage({ params }: PageProps) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { order: 'asc' } },
      options: true,
      category: true,
      reviews: {
        where: { status: 'visible' },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      },
      qnas: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  if (!product) notFound();

  const session = await getCurrentSession();
  const isLoggedIn = session?.role === 'user';

  const detailProduct: DetailProduct = {
    id: product.id,
    code: product.code,
    name: product.name,
    price: product.price,
    welfarePrice: product.welfarePrice,
    description: product.description,
    detailContent: product.detailContent,
    kcCert: product.kcCert,
    categoryName: product.category.name,
    thumbnail: product.thumbnail,
    images: product.images.map((img) => img.url),
    options: product.options.map((o) => ({ id: o.id, name: o.name, value: o.value })),
  };

  const reviews: DetailReview[] = product.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    authorName: r.authorName,
    title: r.title,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    reply: r.reply,
  }));

  const qnas: DetailQna[] = product.qnas.map((q) => ({
    id: q.id,
    authorName: q.authorName,
    question: q.question,
    answer: q.answer,
    status: q.status,
    secret: q.secret,
    createdAt: q.createdAt.toISOString(),
  }));

  const reviewCount = reviews.length;
  const ratingAvg =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  return (
    <DetailClient
      product={detailProduct}
      reviews={reviews}
      qnas={qnas}
      ratingAvg={ratingAvg}
      reviewCount={reviewCount}
      isLoggedIn={isLoggedIn}
    />
  );
}
