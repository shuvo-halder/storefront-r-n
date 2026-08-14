import { apiClient, unwrapApiResponse, normalizeProduct, extractApiError, ApiResponse } from '../lib/api';
import { SearchFacetsResponse, SearchResponse, Product, Category } from '../types/storefront';
import { smartFilterAndRankProducts, SmartSearchOptions } from '../lib/searchUtils';

// In-memory catalog cache with 60s TTL for snappy search experience
let catalogCache: { products: Product[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

async function getCachedCatalog(): Promise<Product[]> {
  const now = Date.now();
  if (catalogCache && now - catalogCache.timestamp < CACHE_TTL_MS && catalogCache.products.length > 0) {
    return catalogCache.products;
  }

  try {
    const res = await apiClient.get('/products', { params: { limit: 100 } });
    const unwrapped = unwrapApiResponse<any>(res);
    let rawList: any[] = [];
    if (Array.isArray(unwrapped.data)) {
      rawList = unwrapped.data;
    } else if (unwrapped.data && Array.isArray(unwrapped.data.items)) {
      rawList = unwrapped.data.items;
    } else if (unwrapped.data && Array.isArray(unwrapped.data.products)) {
      rawList = unwrapped.data.products;
    } else if (unwrapped.data && typeof unwrapped.data === 'object') {
      if (unwrapped.data.id || unwrapped.data.name || unwrapped.data.slug || unwrapped.data.title) {
        rawList = [unwrapped.data];
      }
    }
    const products = rawList.map(normalizeProduct);
    catalogCache = { products, timestamp: now };
    return products;
  } catch (err) {
    // If cache exists even if expired, return it as fallback
    if (catalogCache && catalogCache.products.length > 0) {
      return catalogCache.products;
    }
    return [];
  }
}

export const searchService = {
  // Smart partial, multi-field product search
  search: async (
    query: string, 
    page = 1, 
    limit = 20, 
    options?: SmartSearchOptions
  ): Promise<ApiResponse<SearchResponse>> => {
    try {
      const q = (query || '').trim();
      const combinedOptions: SmartSearchOptions = {
        ...options,
        page,
        pageSize: limit,
        limit
      };

      // 1. Fetch catalog in parallel with backend search query (if query provided)
      const catalogPromise = getCachedCatalog();
      let backendSearchPromise: Promise<any> = Promise.resolve(null);

      if (q.length > 0) {
        backendSearchPromise = apiClient.get('/search', {
          params: { q, page: 1, limit: 100 }
        }).catch(() => null);
      }

      const [catalogProducts, backendSearchRes] = await Promise.all([
        catalogPromise,
        backendSearchPromise
      ]);

      // Collect all candidate products (deduplicated by ID or slug)
      const productMap = new Map<string, Product>();

      // Add backend search results if available
      if (backendSearchRes) {
        const unwrapped = unwrapApiResponse<any>(backendSearchRes);
        if (unwrapped.status !== 'error' && unwrapped.data) {
          const rawList = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data.items || unwrapped.data.products || []);
          rawList.forEach((raw: any) => {
            const p = normalizeProduct(raw);
            if (p.id || p.slug) {
              productMap.set(p.id || p.slug, p);
            }
          });
        }
      }

      // Add catalog products
      catalogProducts.forEach((p) => {
        if (p.id || p.slug) {
          productMap.set(p.id || p.slug, p);
        }
      });

      const allCandidates = Array.from(productMap.values());

      // 2. Perform smart partial, multi-field scoring and ranking
      const searchResult = smartFilterAndRankProducts(allCandidates, q, combinedOptions);

      // 3. Extract category suggestions matching the query
      let categorySuggestions: Category[] = [];
      if (q.length >= 2) {
        const qLower = q.toLowerCase();
        const seenCategories = new Set<string>();
        
        allCandidates.forEach(p => {
          const catName = typeof p.category === 'string' ? p.category : (p.category as any)?.name;
          const catSlug = p.categoryId || (p.category as any)?.slug || catName?.toLowerCase().replace(/\s+/g, '-');
          if (catName && catSlug && catName.toLowerCase().includes(qLower) && !seenCategories.has(catSlug)) {
            seenCategories.add(catSlug);
            categorySuggestions.push({
              id: catSlug,
              name: catName,
              slug: catSlug,
              description: '',
              image: '',
              itemCount: 1
            });
          }
        });
      }

      return {
        status: 'success',
        data: {
          products: searchResult.products,
          total: searchResult.total,
          page: searchResult.page,
          pageSize: searchResult.pageSize,
          totalPages: searchResult.totalPages,
          query: q,
          suggestions: {
            categories: categorySuggestions
          }
        },
        message: null
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Search failed');
      return {
        status: 'error', 
        message, 
        errors, 
        data: { products: [], total: 0, page: 1, pageSize: limit, totalPages: 0, query }
      };
    }
  },

  // GET /search/facets
  getFacets: async (category?: string): Promise<ApiResponse<SearchFacetsResponse>> => {
    try {
      const res = await apiClient.get('/search/facets', { params: { category } }).catch(() => null);
      let apiCategories: any[] = [];
      let apiBrands: any[] = [];
      let apiPriceRange = { min: 0, max: 1000 };

      if (res) {
        const unwrapped = unwrapApiResponse<any>(res);
        if (unwrapped.status !== 'error' && unwrapped.data) {
          apiCategories = unwrapped.data.categories || [];
          apiBrands = unwrapped.data.brands || [];
          if (unwrapped.data.priceRange) {
            apiPriceRange = unwrapped.data.priceRange;
          }
        }
      }

      // Enrich with cached catalog if API facets are sparse
      const catalog = await getCachedCatalog();
      if (catalog.length > 0) {
        const catMap = new Map<string, { id: string; name: string; slug: string; itemCount: number }>();
        const brandMap = new Map<string, { id: string; name: string; slug: string; itemCount: number }>();
        let minPrice = apiPriceRange.min ?? 0;
        let maxPrice = apiPriceRange.max ?? 1000;

        apiCategories.forEach(c => {
          const key = c.slug || c.id || c.name;
          catMap.set(key, { ...c, itemCount: c.itemCount ?? 0 });
        });

        apiBrands.forEach(b => {
          const key = b.slug || b.id || b.name;
          brandMap.set(key, { ...b, itemCount: b.itemCount ?? 0 });
        });

        catalog.forEach(p => {
          if (p.price !== undefined && p.price !== null) {
            if (p.price < minPrice) minPrice = p.price;
            if (p.price > maxPrice) maxPrice = p.price;
          }

          const catName = typeof p.category === 'string' ? p.category : (p.category as any)?.name;
          const catSlug = p.categoryId || (p.category as any)?.slug || catName?.toLowerCase().replace(/\s+/g, '-');
          if (catName && catSlug) {
            const existing = catMap.get(catSlug) || { id: catSlug, name: catName, slug: catSlug, itemCount: 0 };
            existing.itemCount = (existing.itemCount || 0) + 1;
            catMap.set(catSlug, existing);
          }

          const brandName = typeof p.brand === 'string' ? p.brand : (p.brand as any)?.name;
          const brandSlug = p.brandId || (p.brand as any)?.slug || brandName?.toLowerCase().replace(/\s+/g, '-');
          if (brandName && brandSlug) {
            const existing = brandMap.get(brandSlug) || { id: brandSlug, name: brandName, slug: brandSlug, itemCount: 0 };
            existing.itemCount = (existing.itemCount || 0) + 1;
            brandMap.set(brandSlug, existing);
          }
        });

        return {
          status: 'success',
          data: {
            categories: Array.from(catMap.values()).map(c => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              count: c.itemCount ?? 0
            })),
            brands: Array.from(brandMap.values()).map(b => ({
              id: b.id,
              name: b.name,
              slug: b.slug,
              count: b.itemCount ?? 0
            })),
            priceRange: { min: minPrice, max: maxPrice }
          },
          message: null
        };
      }

      return {
        status: 'success',
        data: {
          categories: apiCategories,
          brands: apiBrands,
          priceRange: apiPriceRange
        },
        message: null
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch search facets');
      return {
        status: 'error', 
        message, 
        errors, 
        data: { categories: [], brands: [], priceRange: { min: 0, max: 1000 } }
      };
    }
  }
};


