import { ShopCatalogView } from '../../../src/components/shop/ShopCatalogView';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} - Vyzobd Store`,
    description: `Shop products from ${slug} at Vyzobd.`,
  };
}

export default function BrandSlugPage() {
  return <ShopCatalogView />;
}
