import { apiClient, unwrapApiResponse, normalizeProduct, extractApiError, ApiResponse } from '../lib/api';
import { SearchFacetsResponse, SearchResponse } from '../types/storefront';

export const searchService = {
  // GET /search?q=...
  search: async (query: string, page = 1, limit = 20): Promise<ApiResponse<SearchResponse>> => {
    try {
      const res = await apiClient.get('/search', {
        params: { q: query, page, limit }
      });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error', message: unwrapped.message || 'Search failed', data: { products: [], total: 0, page: 1, pageSize: limit, totalPages: 0, query } };
      }

      const rawList = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data.products || []);
      const products = rawList.map(normalizeProduct);
      const total = unwrapped.pagination?.total || unwrapped.data.total || products.length;

      return {
        status: 'success',
        data: {
          products,
          total,
          page,
          pageSize: limit,
          totalPages: unwrapped.pagination?.totalPages || Math.ceil(total / limit) || 1,
          query,
          suggestions: unwrapped.data.suggestions
        },
        message: null
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Search failed');
      return {
        status: 'error', message, errors, data: { products: [], total: 0, page: 1, pageSize: limit, totalPages: 0, query }
      };
    }
  },

  // GET /search/facets
  getFacets: async (category?: string): Promise<ApiResponse<SearchFacetsResponse>> => {
    try {
      const res = await apiClient.get('/search/facets', { params: { category } });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error', message: unwrapped.message || 'Failed to fetch facets', data: { categories: [], brands: [], priceRange: { min: 0, max: 1000 } } };
      }

      return {
        status: 'success',
        data: {
          categories: unwrapped.data.categories || [],
          brands: unwrapped.data.brands || [],
          priceRange: unwrapped.data.priceRange || { min: 0, max: 1000 }
        },
        message: null
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch search facets');
      return {
        status: 'error', message, errors, data: { categories: [], brands: [], priceRange: { min: 0, max: 1000 } }
      };
    }
  }
};

