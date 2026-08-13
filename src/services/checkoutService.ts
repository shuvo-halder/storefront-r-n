import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { CheckoutFormData } from '../types/checkout';
import { Coupon, Order } from '../types/storefront';

export interface CheckoutSummary {
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  appliedCoupon?: Coupon;
  shippingMethods?: { id: string; name: string; price: number; estimatedDays: string }[];
  paymentGateways?: { id: string; name: string; icon?: string }[];
}

export const checkoutService = {
  // GET /checkout/session
  getCheckoutSession: async (): Promise<ApiResponse<CheckoutSummary>> => {
    try {
      const res = await apiClient.get('/checkout/session');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error', message: unwrapped.message || 'Failed to initialize session', errors: unwrapped.errors, data: { subtotal: 0, discount: 0, shippingFee: 0, tax: 0, totalAmount: 0 } };
      }

      return {
        status: 'success',
        data: {
          subtotal: Number(unwrapped.data.subtotal ?? 0),
          discount: Number(unwrapped.data.discount ?? 0),
          shippingFee: Number(unwrapped.data.shippingFee ?? 0),
          tax: Number(unwrapped.data.tax ?? unwrapped.data.estimatedTax ?? 0),
          totalAmount: Number(unwrapped.data.totalAmount ?? unwrapped.data.total ?? 0),
          appliedCoupon: unwrapped.data.appliedCoupon,
          shippingMethods: unwrapped.data.shippingMethods,
          paymentGateways: unwrapped.data.paymentGateways
        },
        message: null
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to initialize checkout session');
      return {
        status: 'error', message, errors, data: { subtotal: 0, discount: 0, shippingFee: 0, tax: 0, totalAmount: 0 }
      };
    }
  },

  // POST /checkout/coupon
  applyCoupon: async (couponCode: string): Promise<ApiResponse<Coupon>> => {
    try {
      const res = await apiClient.post('/checkout/coupon', { code: couponCode });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'error', message: unwrapped.message || 'Invalid coupon code', errors: unwrapped.errors, data: null as any };
      }

      return {
        status: 'success',
        data: {
          code: unwrapped.data.code || couponCode,
          discountPercent: unwrapped.data.discountPercent,
          discountAmount: unwrapped.data.discountAmount,
          description: unwrapped.data.description || 'Coupon applied'
        },
        message: unwrapped.message || null
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to apply coupon');
      return {
        status: 'error', message, errors, data: null as any
      };
    }
  },

  // POST /checkout/complete
  completeCheckout: async (formData: CheckoutFormData): Promise<ApiResponse<Order>> => {
    try {
      const res = await apiClient.post('/checkout/complete', formData);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'error', message: unwrapped.message || 'Checkout failed', errors: unwrapped.errors, data: null as any };
      }

      const rawOrder = unwrapped.data;
      const order: Order = {
        id: String(rawOrder.id || rawOrder.orderId || `ORD-${Date.now()}`),
        createdAt: rawOrder.createdAt || new Date().toISOString(),
        status: rawOrder.status || 'Placed',
        items: Array.isArray(rawOrder.items) ? rawOrder.items : [],
        shippingAddress: rawOrder.shippingAddress || formData.shippingAddress,
        shippingMethod: rawOrder.shippingMethod || formData.shippingMethod,
        paymentMethod: rawOrder.paymentMethod || formData.paymentMethod,
        subtotal: Number(rawOrder.subtotal ?? 0),
        discount: Number(rawOrder.discount ?? 0),
        shippingFee: Number(rawOrder.shippingFee ?? 0),
        tax: Number(rawOrder.tax ?? 0),
        totalAmount: Number(rawOrder.totalAmount ?? rawOrder.total ?? 0),
        trackingNumber: rawOrder.trackingNumber,
        trackingSteps: rawOrder.trackingSteps
      };

      return { status: 'success', message: unwrapped.message || null, data: order };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Checkout failed');
      return {
        status: 'error', message, errors, data: null as any
      };
    }
  }
};

