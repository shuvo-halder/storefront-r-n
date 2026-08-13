import { CMSPage } from '../../../src/components/content/CMSPage';
import { getCMSPageMetadata } from '../../../src/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return await getCMSPageMetadata(resolvedParams.slug);
}

export default function CMSPageSlugRoutePage() {
  return <CMSPage />;
}

