import { ShopCatalogView } from '../../../src/components/shop/ShopCatalogView';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Products - Vyzobd Store`,
    description: `Shop the latest ${slug} products at Vyzobd.`,
  };
}

export default function CategorySlugPage() {
  return <ShopCatalogView />;
}
