import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { Brand } from '../types/storefront';

export function normalizeBrand(raw: any, facetCountMap?: { bySlug?: Map<string, number>; byId?: Map<string, number> }): Brand {
  if (!raw) {
    return {
      id: '',
      slug: '',
      name: 'Brand',
      logo: '',
      itemCount: 0
    };
  }

  const id = String(raw.id || raw._id || '');
  const slug = String(raw.slug || raw.id || '');
  let itemCount = raw.itemCount ? Number(raw.itemCount) : 0;

  if (facetCountMap) {
    const slugKey = slug.toLowerCase();
    if (facetCountMap.bySlug && facetCountMap.bySlug.has(slugKey)) {
      itemCount = facetCountMap.bySlug.get(slugKey) ?? 0;
    } else if (facetCountMap.byId && facetCountMap.byId.has(id)) {
      itemCount = facetCountMap.byId.get(id) ?? 0;
    }
  }

  return {
    id,
    slug,
    name: String(raw.name || 'Brand'),
    logo: String(raw.logo || raw.logoUrl || raw.image || ''),
    description: raw.description || undefined,
    featuredProductCount: raw.featuredProductCount ? Number(raw.featuredProductCount) : undefined,
    itemCount
  };
}

export const brandService = {
  // GET /brands merged with GET /search/facets for itemCount
  getBrands: async (): Promise<ApiResponse<Brand[]>> => {
    try {
      const [brandsRes, facetsRes] = await Promise.allSettled([
        apiClient.get('/brands'),
        apiClient.get('/search/facets')
      ]);

      let rawBrands: any[] = [];
      if (brandsRes.status === 'fulfilled') {
        const unwrapped = unwrapApiResponse<any>(brandsRes.value);
        if (unwrapped.status === 'success' && unwrapped.data) {
          rawBrands = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.items || unwrapped.data?.brands || []);
        }
      }

      const bySlugMap = new Map<string, number>();
      const byIdMap = new Map<string, number>();

      if (facetsRes.status === 'fulfilled') {
        const unwrapped = unwrapApiResponse<any>(facetsRes.value);
        if (unwrapped.status === 'success' && unwrapped.data?.brands) {
          const facetBrands = Array.isArray(unwrapped.data.brands) ? unwrapped.data.brands : [];
          facetBrands.forEach((fb: any) => {
            const count = Number(fb.count || 0);
            if (fb.slug) bySlugMap.set(String(fb.slug).toLowerCase(), count);
            if (fb.id) byIdMap.set(String(fb.id), count);
          });
        }
      }

      const facetCountMap = { bySlug: bySlugMap, byId: byIdMap };
      const brands = rawBrands.map(raw => normalizeBrand(raw, facetCountMap));
      return { status: 'success', message: null, data: brands };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch brands');
      return {
        status: 'error', message, errors, data: []
      };
    }
  }
};

