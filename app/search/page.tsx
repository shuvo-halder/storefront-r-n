import { SearchPageView } from '../../src/components/search/SearchPageView';
import { getSearchPageMetadata } from '../../src/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string; query?: string; searchQuery?: string } | Promise<{ q?: string; query?: string; searchQuery?: string }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const q = resolvedParams?.q || resolvedParams?.query || resolvedParams?.searchQuery;
  return await getSearchPageMetadata(q);
}

export default function SearchPage() {
  return <SearchPageView />;
}

