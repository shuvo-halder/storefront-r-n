import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { tokenStorage } from '../lib/tokenStorage';
import { Order } from '../types/storefront';

export function normalizeOrder(raw: any): Order {
  if (!raw) {
    return {
      id: '',
      createdAt: new Date().toISOString(),
      status: 'Placed',
      items: [],
      shippingAddress: {
        fullName: '',
        email: '',
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      },
      shippingMethod: 'Standard',
      paymentMethod: 'COD',
      subtotal: 0,
      discount: 0,
      shippingFee: 0,
      tax: 0,
      totalAmount: 0
    };
  }

  return {
    id: String(raw.id || raw.orderId || ''),
    orderNumber: raw.orderNumber ? String(raw.orderNumber) : (raw.order_number ? String(raw.order_number) : undefined),
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
  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    // If not authenticated, return empty array locally to avoid HTTP 500 console noise
    if (typeof window !== 'undefined' && !tokenStorage.hasAccessToken()) {
      return { status: 'success', message: null, data: [] };
    }
    try {
      const res = await apiClient.get('/orders');
      const unwrapped = unwrapApiResponse<any>(res);
      if (unwrapped.status === 'error') {
        return { status: 'error', message: unwrapped.message || 'Failed to fetch orders', errors: unwrapped.errors, data: [] };
      }
      const list = Array.isArray(unwrapped.data) ? unwrapped.data : (unwrapped.data?.orders || []);
      const orders = list.map(normalizeOrder);
      return { status: 'success', message: null, data: orders };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch orders');
      return {
        status: 'error', message, errors, data: []
      };
    }
  },

  // GET /orders/:id
  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    try {
      const res = await apiClient.get(`/orders/${encodeURIComponent(id)}`);
      const unwrapped = unwrapApiResponse<any>(res);
      if (unwrapped.status === 'error' || !unwrapped.data) {
        return { status: 'error', message: unwrapped.message || 'Order not found', errors: unwrapped.errors, data: null as any };
      }
      const order = normalizeOrder(unwrapped.data);
      return { status: 'success', message: null, data: order };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, `Failed to fetch order ${id}`);
      return {
        status: 'error', message, errors, data: null as any
      };
    }
  },

  // GET /orders/:id/shipments
  getOrderShipments: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient.get(`/orders/${encodeURIComponent(id)}/shipments`);
      const unwrapped = unwrapApiResponse<any>(res);
      return { status: unwrapped.status, data: unwrapped.data, message: unwrapped.message || null };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch shipment details');
      return {
        status: 'error', message, errors, data: null
      };
    }
  }
};

