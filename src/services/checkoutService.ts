import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
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
  getCheckoutSession: async (): Promise<ApiResult<CheckoutSummary>> => {
    try {
      const res = await apiClient.get('/checkout/session');
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        return {
          success: false,
          data: { subtotal: 0, discount: 0, shippingFee: 0, tax: 0, totalAmount: 0 },
          error: unwrapped.error
        };
      }

      return {
        success: true,
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
        error: null
      };
    } catch (err: any) {
      return {
        success: false,
        data: { subtotal: 0, discount: 0, shippingFee: 0, tax: 0, totalAmount: 0 },
        error: { message: err.response?.data?.message || err.message || 'Failed to initialize checkout session' }
      };
    }
  },

  // POST /checkout/coupon
  applyCoupon: async (couponCode: string): Promise<ApiResult<Coupon>> => {
    try {
      const res = await apiClient.post('/checkout/coupon', { code: couponCode });
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        return {
          success: false,
          data: null,
          error: unwrapped.error || { message: 'Invalid or expired coupon code' }
        };
      }

      return {
        success: true,
        data: {
          code: unwrapped.data.code || couponCode,
          discountPercent: unwrapped.data.discountPercent,
          discountAmount: unwrapped.data.discountAmount,
          description: unwrapped.data.description || 'Coupon applied'
        },
        error: null
      };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { message: err.response?.data?.message || err.message || 'Failed to apply coupon' }
      };
    }
  },

  // POST /checkout/complete
  completeCheckout: async (formData: CheckoutFormData): Promise<ApiResult<Order>> => {
    try {
      const res = await apiClient.post('/checkout/complete', formData);
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        return {
          success: false,
          data: null,
          error: unwrapped.error || { message: 'Failed to complete order' }
        };
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

      return { success: true, data: order, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { message: err.response?.data?.message || err.message || 'Checkout failed' }
      };
    }
  }
};
