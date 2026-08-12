import { ProductDetailPage } from '../../../src/components/product/ProductDetailPage';
import { storefrontApi } from '../../../src/services/storefrontApi';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  try {
    const product = await storefrontApi.getProductBySlug(slug);
    if (product) {
      return {
        title: `${product.name} - Vyzobd Store`,
        description: product.description ? product.description.substring(0, 160) : `Buy ${product.name} at Vyzobd.`,
        openGraph: {
          title: `${product.name} - Vyzobd Store`,
          images: product.images.length > 0 ? [{ url: product.images[0] }] : [],
        }
      };
    }
  } catch (err) {
    // Silent fail for build-time if API is unavailable
  }
  
  return {
    title: 'Product - Vyzobd Store',
  };
}

export default function ProductSlugPage() {
  return <ProductDetailPage />;
}
