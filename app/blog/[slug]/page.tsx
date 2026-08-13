import { ArticleDetailPage } from '../../../src/components/content/ArticleDetailPage';
import { getBlogDetailMetadata } from '../../../src/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return await getBlogDetailMetadata(resolvedParams.slug);
}

export default function BlogSlugRoutePage() {
  return <ArticleDetailPage />;
}

