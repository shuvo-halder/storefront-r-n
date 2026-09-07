import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { Refund } from '../types/storefront';

export const refundService = {
  // GET /refund
  getRefunds: async (): Promise<ApiResponse<Refund[]>> => {
    try {
      let res: any;
      try {
        res = await apiClient.get('/refund');
      } catch (err: any) {
        if (err.response?.status === 404) {
          res = await apiClient.get('/refunds');
        } else {
          throw err;
        }
      }
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'success', message: null, data: [] };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.refunds || []);
      return { status: 'success', message: null, data: list };
    } catch {
      return { status: 'success', message: null, data: [] };
    }
  },

  // POST /refund/request
  requestRefund: async (payload: { orderId: string; amount?: number; reason: string; items?: any[]; method?: string }): Promise<ApiResponse<Refund>> => {
    try {
      let res: any;
      try {
        res = await apiClient.post('/refund/request', payload);
      } catch (err: any) {
        if (err.response?.status === 404) {
          res = await apiClient.post('/refunds/request', payload);
        } else {
          throw err;
        }
      }
      const unwrapped = unwrapApiResponse<any>(res);
      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to submit refund request',
          errors: unwrapped.errors,
          data: null as any
        };
      }
      return { status: 'success', message: unwrapped.message || null, data: unwrapped.data };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to submit refund request');
      return { status: 'error', message, errors, data: null as any };
    }
  }
};

