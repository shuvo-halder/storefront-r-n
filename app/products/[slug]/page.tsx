import { notFound } from 'next/navigation';
import { ProductDetailPage } from '../../../src/components/product/ProductDetailPage';
import { getProductDetailMetadata } from '../../../src/lib/seo';
import { storefrontApi } from '../../../src/services/storefrontApi';
import { getProductSchema, getBreadcrumbSchema } from '../../../src/utils/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return await getProductDetailMetadata(resolvedParams.slug);
}

export default async function ProductSlugPage({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let product = null;
  let publicSettings = null;

  try {
    const [fetchedProduct, fetchedSettings] = await Promise.all([
      storefrontApi.getProductBySlug(slug),
      storefrontApi.getPublicSettings().catch(() => null)
    ]);
    product = fetchedProduct;
    publicSettings = fetchedSettings;
  } catch (err) {
    console.error('Error fetching product for SSR metadata:', err);
  }

  if (!product) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vyzobd.com';
  const currency = publicSettings?.general?.currency || 'BDT';
  const productJsonLd = getProductSchema(product, currency, baseUrl);
  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Products', url: `${baseUrl}/products` },
    { name: product.name, url: `${baseUrl}/products/${product.slug}` }
  ]);

  return (
    <>
      <script
        id="json-ld-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productJsonLd, breadcrumbJsonLd])
        }}
      />
      <ProductDetailPage />
    </>
  );
}

