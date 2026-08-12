import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
import { Order } from '../types/storefront';

export function normalizeOrder(raw: any): Order {
  return {
    id: String(raw.id || raw.orderId || ''),
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    status: raw.status || 'Placed',
    items: Array.isArray(raw.items) ? raw.items.map((item: any) => ({
      productId: String(item.productId || item.product_id || ''),
      productName: String(item.productName || item.name || 'Item'),
      productImage: String(item.productImage || item.image || ''),
      variantName: item.variantName || item.variant || undefined,
      quantity: Number(item.quantity ?? 1),
      unitPrice: Number(item.unitPrice ?? item.price ?? 0),
      totalPrice: Number(item.totalPrice ?? ((item.unitPrice ?? item.price ?? 0) * (item.quantity ?? 1)))
    })) : [],
    shippingAddress: raw.shippingAddress || {
      fullName: '',
      email: '',
      phone: '',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    shippingMethod: raw.shippingMethod || 'Standard',
    paymentMethod: raw.paymentMethod || 'COD',
    subtotal: Number(raw.subtotal ?? 0),
    discount: Number(raw.discount ?? 0),
    shippingFee: Number(raw.shippingFee ?? 0),
    tax: Number(raw.tax ?? 0),
    totalAmount: Number(raw.totalAmount ?? raw.total ?? 0),
    trackingNumber: raw.trackingNumber || undefined,
    trackingSteps: Array.isArray(raw.trackingSteps) ? raw.trackingSteps : [],
    estimatedDeliveryDate: raw.estimatedDeliveryDate || undefined,
    returnStatus: raw.returnStatus || 'Not Requested',
    refundStatus: raw.refundStatus || 'None'
  };
}

export const orderService = {
  // GET /orders
  getOrders: async (): Promise<ApiResult<Order[]>> => {
    try {
      const res = await apiClient.get('/orders');
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success) {
        return { success: false, data: [], error: unwrapped.error };
      }

      const list = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.orders || []);
      const orders = list.map(normalizeOrder);
      return { success: true, data: orders, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: [],
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch orders' }
      };
    }
  },

  // GET /orders/:id
  getOrderById: async (id: string): Promise<ApiResult<Order>> => {
    try {
      const res = await apiClient.get(`/orders/${encodeURIComponent(id)}`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (!unwrapped.success || !unwrapped.data) {
        return { success: false, data: null, error: unwrapped.error || { message: 'Order not found' } };
      }

      const order = normalizeOrder(unwrapped.data);
      return { success: true, data: order, error: null };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { message: err.response?.data?.message || err.message || `Failed to fetch order ${id}` }
      };
    }
  },

  // GET /orders/:id/shipments
  getOrderShipments: async (id: string): Promise<ApiResult<any>> => {
    try {
      const res = await apiClient.get(`/orders/${encodeURIComponent(id)}/shipments`);
      const unwrapped = unwrapApiResponse<any>(res);
      return { success: unwrapped.success, data: unwrapped.data, error: unwrapped.error };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch shipment details' }
      };
    }
  }
};
