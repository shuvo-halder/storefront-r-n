import { apiClient, unwrapApiResponse, normalizeCart, ApiResult } from '../lib/api';
import { Cart } from '../types/storefront';

export const cartService = {
  // GET /cart
  getCart: async (): Promise<ApiResult<Cart>> => {
    try {
      const res = await apiClient.get('/cart');
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success) {
        // If 404/500/empty or guest session missing, interpret as empty cart safely
        return {
          success: true,
          data: normalizeCart(null),
          error: null
        };
      }

      // If data is null or undefined (empty cart)
      const cart = normalizeCart(unwrapped.data);
      return { success: true, data: cart, error: null };
    } catch {
      // Return normalized empty cart instead of throwing
      return {
        success: true,
        data: normalizeCart(null),
        error: null
      };
    }
  },

  // POST /cart/items
  addItem: async (productId: string, quantity = 1, variantId?: string): Promise<ApiResult<Cart>> => {
    try {
      const res = await apiClient.post('/cart/items', {
        productId,
        quantity,
        variantId
      });
      const unwrapped = unwrapApiResponse<any>(res);
      const cart = normalizeCart(unwrapped.data);
      return { success: true, data: cart, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: normalizeCart(null),
        error: { message: err.response?.data?.message || err.message || 'Failed to add item to cart' }
      };
    }
  },

  // PUT /cart/items/:itemId
  updateItem: async (itemId: string, quantity: number): Promise<ApiResult<Cart>> => {
    try {
      const res = await apiClient.put(`/cart/items/${encodeURIComponent(itemId)}`, { quantity });
      const unwrapped = unwrapApiResponse<any>(res);
      const cart = normalizeCart(unwrapped.data);
      return { success: true, data: cart, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: normalizeCart(null),
        error: { message: err.response?.data?.message || err.message || 'Failed to update cart item' }
      };
    }
  },

  // DELETE /cart/items/:itemId
  removeItem: async (itemId: string): Promise<ApiResult<Cart>> => {
    try {
      const res = await apiClient.delete(`/cart/items/${encodeURIComponent(itemId)}`);
      const unwrapped = unwrapApiResponse<any>(res);
      const cart = normalizeCart(unwrapped.data);
      return { success: true, data: cart, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: normalizeCart(null),
        error: { message: err.response?.data?.message || err.message || 'Failed to remove cart item' }
      };
    }
  },

  // DELETE /cart
  clearCart: async (): Promise<ApiResult<Cart>> => {
    try {
      const res = await apiClient.delete('/cart');
      const unwrapped = unwrapApiResponse<any>(res);
      const cart = normalizeCart(unwrapped.data);
      return { success: true, data: cart, error: null };
    } catch {
      return {
        success: true,
        data: normalizeCart(null),
        error: null
      };
    }
  }
};
