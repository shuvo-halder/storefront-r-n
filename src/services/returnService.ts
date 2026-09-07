import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { ReturnRequest } from '../types/storefront';

export const returnService = {
  // GET /return
  getReturns: async (): Promise<ApiResponse<ReturnRequest[]>> => {
    try {
      let res: any;
      try {
        res = await apiClient.get('/return');
      } catch (err: any) {
        if (err.response?.status === 404) {
          res = await apiClient.get('/returns');
        } else {
          throw err;
        }
      }
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return { status: 'success', message: null, data: [] };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.returns || []);
      return { status: 'success', message: null, data: list };
    } catch {
      return { status: 'success', message: null, data: [] };
    }
  },

  // POST /return/request
  requestReturn: async (payload: { orderId: string; items: any[]; reason: string }): Promise<ApiResponse<ReturnRequest>> => {
    try {
      let res: any;
      try {
        res = await apiClient.post('/return/request', payload);
      } catch (err: any) {
        if (err.response?.status === 404) {
          res = await apiClient.post('/returns/request', payload);
        } else {
          throw err;
        }
      }
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'error', message: unwrapped.message || 'Failed to submit return request', errors: unwrapped.errors, data: null as any };
      }

      return { status: 'success', message: unwrapped.message || null, data: unwrapped.data };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to submit return request');
      return {
        status: 'error', message, errors, data: null as any
      };
    }
  }
};

