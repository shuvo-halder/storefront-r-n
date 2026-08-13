import { BlogPage } from '../../src/components/content/BlogPage';
import { getBlogIndexMetadata } from '../../src/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return await getBlogIndexMetadata();
}

export default function BlogRoutePage() {
  return <BlogPage />;
}

