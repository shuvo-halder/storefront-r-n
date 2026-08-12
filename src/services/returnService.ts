import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
import { ReturnRequest } from '../types/storefront';

export const returnService = {
  // GET /returns
  getReturns: async (): Promise<ApiResult<ReturnRequest[]>> => {
    try {
      const res = await apiClient.get('/returns');
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success) {
        return { success: false, data: [], error: unwrapped.error };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : [];
      return { success: true, data: list, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: [],
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch return requests' }
      };
    }
  },

  // POST /returns/request
  requestReturn: async (payload: { orderId: string; items: any[]; reason: string }): Promise<ApiResult<ReturnRequest>> => {
    try {
      const res = await apiClient.post('/returns/request', payload);
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        return { success: false, data: null, error: unwrapped.error || { message: 'Failed to submit return request' } };
      }

      return { success: true, data: unwrapped.data, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { message: err.response?.data?.message || err.message || 'Failed to submit return request' }
      };
    }
  }
};
