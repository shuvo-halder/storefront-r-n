import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { PaymentInitiationResponse } from '../types/checkout';

export const paymentService = {
  // POST /payment/initiate
  initiatePayment: async (orderId: string, paymentMethod: string): Promise<ApiResponse<PaymentInitiationResponse>> => {
    try {
      const res = await apiClient.post('/payment/initiate', { orderId, paymentMethod });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'error', message: unwrapped.message || 'Payment initiation failed', errors: unwrapped.errors, data: null as any };
      }

      return {
        status: 'success',
        data: {
          orderId: unwrapped.data.orderId || orderId,
          status: unwrapped.data.status || 'pending',
          paymentUrl: unwrapped.data.paymentUrl || unwrapped.data.redirectUrl,
          transactionId: unwrapped.data.transactionId
        },
        message: unwrapped.message || null
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Payment initiation failed');
      return {
        status: 'error', message, errors, data: null as any
      };
    }
  },

  // POST /payment/verify
  verifyPayment: async (transactionId: string, provider: string): Promise<ApiResponse<{ verified: boolean; orderId?: string }>> => {
    try {
      const res = await apiClient.post('/payment/verify', { transactionId, provider });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error', message: unwrapped.message || 'Payment verification failed', errors: unwrapped.errors, data: { verified: false } };
      }

      return {
        status: 'success',
        data: {
          verified: Boolean(unwrapped.data.verified ?? unwrapped.data.status === 'success'),
          orderId: unwrapped.data.orderId
        },
        message: unwrapped.message || null
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Payment verification failed');
      return {
        status: 'error', message, errors, data: { verified: false }
      };
    }
  }
};

