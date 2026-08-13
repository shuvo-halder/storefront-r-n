import { apiClient, unwrapApiResponse, normalizeProduct, extractApiError, ApiResponse } from '../lib/api';
import { Product } from '../types/storefront';

export const wishlistService = {
  // GET /wishlist
  getWishlist: async (): Promise<ApiResponse<Product[]>> => {
    try {
      const res = await apiClient.get('/wishlist');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'success', message: null, data: [] };
      }

      const rawList = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.items || unwrapped.data?.products || []);
      const products = rawList.map((item: any) => normalizeProduct(item.product || item));
      return { status: 'success', message: null, data: products };
    } catch {
      return { status: 'success', message: null, data: [] };
    }
  },

  // POST /wishlist
  addToWishlist: async (productId: string): Promise<ApiResponse<boolean>> => {
    try {
      const res = await apiClient.post('/wishlist', { productId });
      const unwrapped = unwrapApiResponse<any>(res);
      return { status: unwrapped.status, data: unwrapped.status === 'success', message: unwrapped.message || null };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to add to wishlist');
      return {
        status: 'error', message, errors, data: false
      };
    }
  },

  // DELETE /wishlist/:id
  removeFromWishlist: async (productId: string): Promise<ApiResponse<boolean>> => {
    try {
      const res = await apiClient.delete(`/wishlist/${encodeURIComponent(productId)}`);
      const unwrapped = unwrapApiResponse<any>(res);
      return { status: unwrapped.status, data: unwrapped.status === 'success', message: unwrapped.message || null };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to remove from wishlist');
      return {
        status: 'error', message, errors, data: false
      };
    }
  }
};

