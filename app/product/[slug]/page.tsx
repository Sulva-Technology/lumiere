import { ProductPageClient } from './product-page-client';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
