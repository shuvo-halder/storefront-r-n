import { apiClient, unwrapApiResponse, normalizeCart, extractApiError, ApiResponse } from '../lib/api';
import { Cart } from '../types/storefront';

export const cartService = {
  // GET /cart
  getCart: async (): Promise<ApiResponse<Cart>> => {
    // If not authenticated, return empty cart locally to avoid HTTP 500 console noise
    if (typeof window !== 'undefined' && !localStorage.getItem('vyzobd_auth_token')) {
      return { status: 'success', message: null, data: normalizeCart(null) };
    }
    try {
      const res = await apiClient.get('/cart');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        // Safe empty cart guarantee on initial fetch or session init
        return {
          status: 'success', message: null, data: normalizeCart(null)
        };
      }

      const cart = normalizeCart(unwrapped.data);
      return { status: 'success', message: null, data: cart };
    } catch {
      return {
        status: 'success', message: null, data: normalizeCart(null)
      };
    }
  },

  // POST /cart/items
  addItem: async (productId: string, quantity = 1, variantId?: string): Promise<ApiResponse<Cart>> => {
    try {
      const res = await apiClient.post('/cart/items', {
        productId,
        quantity,
        variantId
      });
      const unwrapped = unwrapApiResponse<any>(res);
      const cart = normalizeCart(unwrapped.data);
      return { status: 'success', message: unwrapped.message || null, data: cart };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to add item to cart');
      return {
        status: 'error', message, errors, data: normalizeCart(null)
      };
    }
  },

  // PUT /cart/items/:itemId
  updateItem: async (itemId: string, quantity: number): Promise<ApiResponse<Cart>> => {
    try {
      const res = await apiClient.put(`/cart/items/${encodeURIComponent(itemId)}`, { quantity });
      const unwrapped = unwrapApiResponse<any>(res);
      const cart = normalizeCart(unwrapped.data);
      return { status: 'success', message: unwrapped.message || null, data: cart };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to update cart item');
      return {
        status: 'error', message, errors, data: normalizeCart(null)
      };
    }
  },

  // DELETE /cart/items/:itemId
  removeItem: async (itemId: string): Promise<ApiResponse<Cart>> => {
    try {
      const res = await apiClient.delete(`/cart/items/${encodeURIComponent(itemId)}`);
      const unwrapped = unwrapApiResponse<any>(res);
      const cart = normalizeCart(unwrapped.data);
      return { status: 'success', message: unwrapped.message || null, data: cart };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to remove cart item');
      return {
        status: 'error', message, errors, data: normalizeCart(null)
      };
    }
  },

  // DELETE /cart
  clearCart: async (): Promise<ApiResponse<Cart>> => {
    try {
      const res = await apiClient.delete('/cart');
      const unwrapped = unwrapApiResponse<any>(res);
      const cart = normalizeCart(unwrapped.data);
      return { status: 'success', message: unwrapped.message || null, data: cart };
    } catch {
      return {
        status: 'success', message: null, data: normalizeCart(null)
      };
    }
  }
};

