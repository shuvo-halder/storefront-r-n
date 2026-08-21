import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { CheckoutFormData } from '../types/checkout';
import { Coupon, Order } from '../types/storefront';
import { getGA4ClientAndSessionId } from '../lib/ga4';

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
  // POST /checkout/session
  getCheckoutSession: async (payload?: {
    shippingAddress?: any;
    billingAddress?: any;
    couponCode?: string;
    shippingMethod?: string;
  }): Promise<ApiResponse<CheckoutSummary>> => {
    try {
      const res = await apiClient.post('/checkout/session', payload || {});
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error', message: unwrapped.message || 'Failed to initialize session', errors: unwrapped.errors, data: { subtotal: 0, discount: 0, shippingFee: 0, tax: 0, totalAmount: 0 } };
      }

      const sessionData = unwrapped.data?.session || unwrapped.data;

      return {
        status: 'success',
        data: {
          subtotal: Number(sessionData.subtotal ?? 0),
          discount: Number(sessionData.discount ?? 0),
          shippingFee: Number(sessionData.shippingFee ?? sessionData.shipping ?? 0),
          tax: Number(sessionData.tax ?? sessionData.estimatedTax ?? 0),
          totalAmount: Number(sessionData.totalAmount ?? sessionData.total ?? sessionData.grandTotal ?? 0),
          appliedCoupon: sessionData.appliedCoupon || sessionData.coupon,
          shippingMethods: sessionData.shippingMethods,
          paymentGateways: sessionData.paymentGateways
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
  completeCheckout: async (formData: CheckoutFormData & { [key: string]: any }): Promise<ApiResponse<Order>> => {
    try {
      const analyticsIds = getGA4ClientAndSessionId();

      // Format paymentMethod cleanly (e.g. 'cod' -> 'COD')
      let paymentMethodFormatted = formData.paymentMethod || 'COD';
      if (typeof paymentMethodFormatted === 'string' && paymentMethodFormatted.toLowerCase() === 'cod') {
        paymentMethodFormatted = 'COD';
      }

      const payload = {
        paymentMethod: paymentMethodFormatted,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddress,
        ...(formData.customer ? { customer: formData.customer } : {}),
        ...(formData.shippingMethod ? { shippingMethod: formData.shippingMethod } : {}),
        ...(formData.couponCode ? { couponCode: formData.couponCode } : {}),
        ...(formData.items ? { items: formData.items } : {}),
        ...(formData.subtotal !== undefined ? { subtotal: formData.subtotal } : {}),
        ...(formData.discount !== undefined ? { discount: formData.discount } : {}),
        ...(formData.shippingFee !== undefined ? { shippingFee: formData.shippingFee } : {}),
        ...(formData.tax !== undefined ? { tax: formData.tax } : {}),
        ...(formData.totalAmount !== undefined ? { totalAmount: formData.totalAmount } : {}),
        ...(analyticsIds.clientId ? { clientId: analyticsIds.clientId } : {}),
        ...(analyticsIds.sessionId ? { sessionId: analyticsIds.sessionId } : {}),
      };

      const res = await apiClient.post('/checkout/complete', payload);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'error', message: unwrapped.message || 'Checkout failed', errors: unwrapped.errors, data: null as any };
      }

      const rawOrder = unwrapped.data?.order || unwrapped.data;
      const order: Order = {
        id: String(rawOrder.id || rawOrder.orderId || `ORD-${Date.now()}`),
        orderNumber: rawOrder.orderNumber ? String(rawOrder.orderNumber) : (rawOrder.order_number ? String(rawOrder.order_number) : undefined),
        createdAt: rawOrder.createdAt || new Date().toISOString(),
        status: rawOrder.status || 'Placed',
        items: Array.isArray(rawOrder.items) ? rawOrder.items : [],
        shippingAddress: (typeof rawOrder.shippingAddress === 'object' && rawOrder.shippingAddress !== null ? rawOrder.shippingAddress : formData.shippingAddress) || rawOrder.shippingAddress,
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

