import { HomePage } from '../src/components/home/HomePage';
import { getHomepageMetadata } from '../src/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return await getHomepageMetadata();
}

export default function Page() {
  return <HomePage />;
}

