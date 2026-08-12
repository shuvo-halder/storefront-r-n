import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
import { Product, SearchFacetsResponse, SearchResponse } from '../types/storefront';
import { normalizeProduct } from './productService';

export const searchService = {
  // GET /search?q=...
  search: async (query: string, page = 1, limit = 20): Promise<ApiResult<SearchResponse>> => {
    try {
      const res = await apiClient.get('/search', {
        params: { q: query, page, limit }
      });
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        return {
          success: false,
          data: { products: [], total: 0, page: 1, pageSize: limit, totalPages: 0, query },
          error: unwrapped.error
        };
      }

      const rawList = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data.products || []);
      const products = rawList.map(normalizeProduct);
      const total = unwrapped.meta?.total || unwrapped.data.total || products.length;

      return {
        success: true,
        data: {
          products,
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit) || 1,
          query,
          suggestions: unwrapped.data.suggestions
        },
        error: null
      };
    } catch (err: any) {
      return {
        success: false,
        data: { products: [], total: 0, page: 1, pageSize: limit, totalPages: 0, query },
        error: { message: err.response?.data?.message || err.message || 'Search failed' }
      };
    }
  },

  // GET /search/facets
  getFacets: async (category?: string): Promise<ApiResult<SearchFacetsResponse>> => {
    try {
      const res = await apiClient.get('/search/facets', { params: { category } });
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        return {
          success: false,
          data: { categories: [], brands: [], priceRange: { min: 0, max: 1000 } },
          error: unwrapped.error
        };
      }

      return {
        success: true,
        data: {
          categories: unwrapped.data.categories || [],
          brands: unwrapped.data.brands || [],
          priceRange: unwrapped.data.priceRange || { min: 0, max: 1000 }
        },
        error: null
      };
    } catch (err: any) {
      return {
        success: false,
        data: { categories: [], brands: [], priceRange: { min: 0, max: 1000 } },
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch search facets' }
      };
    }
  }
};
