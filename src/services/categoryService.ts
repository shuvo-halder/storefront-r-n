import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { Category } from '../types/storefront';

export function normalizeCategory(raw: any, facetCountMap?: { bySlug?: Map<string, number>; byId?: Map<string, number> }): Category {
  if (!raw) {
    return {
      id: '',
      slug: '',
      name: 'Category',
      description: '',
      image: '',
      itemCount: 0
    };
  }

  const id = String(raw.id || raw._id || '');
  const slug = String(raw.slug || raw.id || '');
  let itemCount = Number(raw.itemCount ?? raw.productCount ?? raw.count ?? 0);

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
    name: String(raw.name || 'Category'),
    description: String(raw.description || ''),
    image: String(raw.image || raw.imageUrl || raw.thumbnail || ''),
    itemCount,
    iconName: raw.icon || raw.iconName || undefined,
    parentId: raw.parentId || raw.parent_id || (raw.parent ? (typeof raw.parent === 'object' ? raw.parent.id : raw.parent) : null) || null,
    subcategories: Array.isArray(raw.children) ? raw.children.map((child: any) => ({
      id: String(child.id || child.slug || ''),
      name: String(child.name || child.title || ''),
      slug: String(child.slug || child.id || '')
    })) : (Array.isArray(raw.subcategories) ? raw.subcategories.map((sub: any) => ({
      id: String(sub.id || sub.slug || ''),
      name: String(sub.name || sub.title || ''),
      slug: String(sub.slug || sub.id || '')
    })) : [])
  };
}

export const categoryService = {
  // GET /categories merged with GET /search/facets for itemCount
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const [categoriesRes, facetsRes] = await Promise.allSettled([
        apiClient.get('/categories'),
        apiClient.get('/search/facets')
      ]);

      let rawCategories: any[] = [];
      if (categoriesRes.status === 'fulfilled') {
        const unwrapped = unwrapApiResponse<any>(categoriesRes.value);
        if (unwrapped.status === 'success' && unwrapped.data) {
          rawCategories = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.items || unwrapped.data?.categories || []);
        }
      }

      const bySlugMap = new Map<string, number>();
      const byIdMap = new Map<string, number>();

      if (facetsRes.status === 'fulfilled') {
        const unwrapped = unwrapApiResponse<any>(facetsRes.value);
        if (unwrapped.status === 'success' && unwrapped.data?.categories) {
          const facetCategories = Array.isArray(unwrapped.data.categories) ? unwrapped.data.categories : [];
          facetCategories.forEach((fc: any) => {
            const count = Number(fc.count || 0);
            if (fc.slug) bySlugMap.set(String(fc.slug).toLowerCase(), count);
            if (fc.id) byIdMap.set(String(fc.id), count);
          });
        }
      }

      const facetCountMap = { bySlug: bySlugMap, byId: byIdMap };
      const categories = rawCategories.map(raw => normalizeCategory(raw, facetCountMap));
      return { status: 'success', message: null, data: categories };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch categories');
      return {
        status: 'error', message, errors, data: []
      };
    }
  }
};

