import { ProductDetailPage } from '../../../src/components/product/ProductDetailPage';
import { getProductDetailMetadata } from '../../../src/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return await getProductDetailMetadata(resolvedParams.slug);
}

export default function ProductSlugPage() {
  return <ProductDetailPage />;
}

