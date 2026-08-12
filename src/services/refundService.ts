import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
import { Refund } from '../types/storefront';

export const refundService = {
  // GET /refunds
  getRefunds: async (): Promise<ApiResult<Refund[]>> => {
    try {
      const res = await apiClient.get('/refunds');
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
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch refunds' }
      };
    }
  }
};
