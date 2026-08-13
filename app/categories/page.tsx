import { CategoriesIndexView } from '../../src/components/shop/CategoriesIndexView';
import { getCategoriesIndexMetadata } from '../../src/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return await getCategoriesIndexMetadata();
}

export default function CategoriesPage() {
  return <CategoriesIndexView />;
}



