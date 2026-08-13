import { ShopCatalogView } from '../../../src/components/shop/ShopCatalogView';
import { getCategoryDetailMetadata } from '../../../src/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return await getCategoryDetailMetadata(resolvedParams.slug);
}

export default function CategorySlugPage() {
  return <ShopCatalogView />;
}

