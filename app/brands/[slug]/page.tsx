import { ShopCatalogView } from '../../../src/components/shop/ShopCatalogView';
import { getBrandDetailMetadata } from '../../../src/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return await getBrandDetailMetadata(resolvedParams.slug);
}

export default function BrandSlugPage() {
  return <ShopCatalogView />;
}

