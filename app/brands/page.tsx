import { BrandsIndexView } from '../../src/components/shop/BrandsIndexView';
import { getBrandsIndexMetadata } from '../../src/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return await getBrandsIndexMetadata();
}

export default function BrandsPage() {
  return <BrandsIndexView />;
}



