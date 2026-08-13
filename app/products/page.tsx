import { ShopCatalogView } from '../../src/components/shop/ShopCatalogView';
import { getProductsListingMetadata } from '../../src/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return await getProductsListingMetadata();
}

export default function ProductsPage() {
  return <ShopCatalogView />;
}

