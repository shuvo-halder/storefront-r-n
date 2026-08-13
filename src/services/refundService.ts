import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { Refund } from '../types/storefront';

export const refundService = {
  // GET /refunds
  getRefunds: async (): Promise<ApiResponse<Refund[]>> => {
    try {
      const res = await apiClient.get('/refunds');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'success', message: null, data: [] };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.refunds || []);
      return { status: 'success', message: null, data: list };
    } catch {
      return { status: 'success', message: null, data: [] };
    }
  }
};

