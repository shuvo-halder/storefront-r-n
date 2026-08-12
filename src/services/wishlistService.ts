import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
import { Product } from '../types/storefront';
import { normalizeProduct } from './productService';

export const wishlistService = {
  // GET /wishlist
  getWishlist: async (): Promise<ApiResult<Product[]>> => {
    try {
      const res = await apiClient.get('/wishlist');
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success) {
        return { success: false, data: [], error: unwrapped.error };
      }

      const rawList = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.items || unwrapped.data?.products || []);
      const products = rawList.map((item: any) => normalizeProduct(item.product || item));
      return { success: true, data: products, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: [],
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch wishlist' }
      };
    }
  },

  // POST /wishlist
  addToWishlist: async (productId: string): Promise<ApiResult<boolean>> => {
    try {
      const res = await apiClient.post('/wishlist', { productId });
      const unwrapped = unwrapApiResponse<any>(res);
      return { success: unwrapped.success, data: unwrapped.success, error: unwrapped.error };
    } catch (err: any) {
      return {
        success: false,
        data: false,
        error: { message: err.response?.data?.message || err.message || 'Failed to add to wishlist' }
      };
    }
  },

  // DELETE /wishlist/:id
  removeFromWishlist: async (productId: string): Promise<ApiResult<boolean>> => {
    try {
      const res = await apiClient.delete(`/wishlist/${encodeURIComponent(productId)}`);
      const unwrapped = unwrapApiResponse<any>(res);
      return { success: unwrapped.success, data: unwrapped.success, error: unwrapped.error };
    } catch (err: any) {
      return {
        success: false,
        data: false,
        error: { message: err.response?.data?.message || err.message || 'Failed to remove from wishlist' }
      };
    }
  }
};
