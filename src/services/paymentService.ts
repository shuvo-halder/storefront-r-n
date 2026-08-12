import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
import { PaymentInitiationResponse } from '../types/checkout';

export const paymentService = {
  // POST /payment/initiate
  initiatePayment: async (orderId: string, paymentMethod: string): Promise<ApiResult<PaymentInitiationResponse>> => {
    try {
      const res = await apiClient.post('/payment/initiate', { orderId, paymentMethod });
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        return {
          success: false,
          data: null,
          error: unwrapped.error || { message: 'Payment initiation failed' }
        };
      }

      return {
        success: true,
        data: {
          orderId: unwrapped.data.orderId || orderId,
          status: unwrapped.data.status || 'pending',
          paymentUrl: unwrapped.data.paymentUrl || unwrapped.data.redirectUrl,
          transactionId: unwrapped.data.transactionId
        },
        error: null
      };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { message: err.response?.data?.message || err.message || 'Payment initiation failed' }
      };
    }
  },

  // POST /payment/verify
  verifyPayment: async (transactionId: string, provider: string): Promise<ApiResult<{ verified: boolean; orderId?: string }>> => {
    try {
      const res = await apiClient.post('/payment/verify', { transactionId, provider });
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        return {
          success: false,
          data: { verified: false },
          error: unwrapped.error
        };
      }

      return {
        success: true,
        data: {
          verified: Boolean(unwrapped.data.verified ?? unwrapped.data.status === 'success'),
          orderId: unwrapped.data.orderId
        },
        error: null
      };
    } catch (err: any) {
      return {
        success: false,
        data: { verified: false },
        error: { message: err.response?.data?.message || err.message || 'Payment verification failed' }
      };
    }
  }
};
