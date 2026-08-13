import { apiClient, unwrapApiResponse, normalizeProduct, extractApiError, ApiResponse } from '../lib/api';
import { Product, ProductFilterState } from '../types/storefront';

export { normalizeProduct };

export const productService = {
  // GET /products
  getProducts: async (filters?: Partial<ProductFilterState>): Promise<ApiResponse<{ products: Product[]; total: number }>> => {
    try {
      const params: Record<string, any> = {};
      if (filters) {
        if (filters.searchQuery) params.q = filters.searchQuery;
        if (filters.categorySlug) params.category = filters.categorySlug;
        if (filters.brandSlugs && filters.brandSlugs.length > 0) params.brand = filters.brandSlugs.join(',');
        if (filters.minPrice !== undefined && filters.minPrice > 0) params.minPrice = filters.minPrice;
        if (filters.maxPrice !== undefined && filters.maxPrice < 100000) params.maxPrice = filters.maxPrice;
        if (filters.ratingMin !== undefined && filters.ratingMin > 0) params.minRating = filters.ratingMin;
        if (filters.inStockOnly) params.inStock = true;
        if (filters.sortBy) params.sort = filters.sortBy;
        if (filters.page) params.page = filters.page;
        if (filters.pageSize) params.limit = filters.pageSize;
      }

      const res = await apiClient.get('/products', { params });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'error', message: unwrapped.message || 'Failed to fetch products', data: { products: [], total: 0 } };
      }

      let rawList: any[] = [];
      let totalCount = 0;

      if (Array.isArray(unwrapped.data)) {
        rawList = unwrapped.data;
        totalCount = unwrapped.pagination?.total || rawList.length;
      } else if (unwrapped.data && Array.isArray(unwrapped.data.products)) {
        rawList = unwrapped.data.products;
        totalCount = unwrapped.data.total ?? unwrapped.pagination?.total ?? rawList.length;
      } else if (unwrapped.data && typeof unwrapped.data === 'object') {
        rawList = [unwrapped.data];
        totalCount = 1;
      }

      const products = rawList.map(normalizeProduct);
      return {
        status: 'success', message: null, data: { products, total: totalCount },
        pagination: unwrapped.pagination
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch products');
      return {
        status: 'error', message, errors, data: { products: [], total: 0 }
      };
    }
  },

  // GET /products/:slug
  getProductBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
    try {
      const res = await apiClient.get(`/products/${encodeURIComponent(slug)}`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'error', message: unwrapped.message || 'Product not found', data: null as any };
      }

      const rawObj = Array.isArray(unwrapped.data) ? unwrapped.data[0] : unwrapped.data;
      if (!rawObj) {
        return { status: 'error', message: 'Product not found', data: null as any };
      }

      const product = normalizeProduct(rawObj);
      return { status: 'success', message: null, data: product };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, `Failed to fetch product '${slug}'`);
      return {
        status: 'error', message, errors, data: null as any
      };
    }
  }
};

