import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Cart } from '../types/storefront';

// Get base URL from environment or default to admin.vyzobd.com storefront API
const getRawApiUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim();
  }
  return 'https://admin.vyzobd.com/api/storefront/v1';
};

// Ensure URL does not end with trailing slash or duplicate endpoint prefixes
const sanitizeBaseUrl = (url: string): string => {
  let cleaned = url.replace(/\/+$/, '');
  return cleaned;
};

export const API_BASE_URL = sanitizeBaseUrl(getRawApiUrl());

export interface ApiSuccessEnvelope<T> {
  success?: boolean;
  status?: string;
  data: T;
  meta?: any;
  ga4?: any;
  message?: string;
}

export interface ApiErrorDetail {
  code?: string;
  message: string;
  details?: any;
}

export interface ApiErrorEnvelope {
  success: false;
  error?: ApiErrorDetail;
  message?: string;
}

export interface ApiResult<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorDetail | null;
  meta?: any;
}

// Axios Instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Auth Token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vyzobd_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const sessionId = localStorage.getItem('vyzobd_cart_session_id');
    if (sessionId) {
      config.headers['X-Cart-Session-Id'] = sessionId;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Automatic 401 Token Refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string | null) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 && 
      originalRequest && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('vyzobd_refresh_token') : null;
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const newToken = res.data?.token || res.data?.data?.token;
          if (newToken) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('vyzobd_auth_token', newToken);
            }
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('vyzobd_auth_token');
          localStorage.removeItem('vyzobd_refresh_token');
        }
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Universal Response Unwrapper
 * Unwraps data safely from envelopes like:
 * - { success: true, data: ... }
 * - { status: 'success', data: ... }
 * - { data: ... }
 * - Raw data payload
 */
export function unwrapApiResponse<T>(res: AxiosResponse<any>, defaultValue: T | null = null): ApiResult<T> {
  if (!res || !res.data) {
    return {
      success: false,
      data: defaultValue,
      error: { message: 'No response data received from server' }
    };
  }

  const body = res.data;

  // Handle explicit success = false or error envelope
  if (body.success === false || body.status === 'error' || body.status === 'fail') {
    const errorMsg = body.error?.message || body.message || 'An unexpected API error occurred';
    const errorCode = body.error?.code || String(res.status);
    return {
      success: false,
      data: defaultValue,
      error: { code: errorCode, message: errorMsg, details: body.error?.details || body.details },
      meta: body.meta
    };
  }

  // Handle { data: ... } standard pattern
  if (Object.prototype.hasOwnProperty.call(body, 'data')) {
    const rawData = body.data;
    return {
      success: true,
      data: rawData !== undefined && rawData !== null ? rawData : defaultValue,
      error: null,
      meta: body.meta
    };
  }

  // Raw payload fallback
  return {
    success: true,
    data: body !== undefined && body !== null ? body : defaultValue,
    error: null,
    meta: body.meta
  };
}

/**
 * Cart Normalizer Guarantee
 * Guarantees cart.items is always a valid CartItem[] array.
 * Fixes "Cannot read properties of undefined (reading 'reduce')"
 */
export function normalizeCart(rawCart: any): Cart {
  if (!rawCart) {
    return {
      items: [],
      subtotal: 0,
      discount: 0,
      appliedCoupon: undefined,
      shippingFee: 0,
      estimatedTax: 0,
      total: 0
    };
  }

  const rawItems = Array.isArray(rawCart.items)
    ? rawCart.items
    : (Array.isArray(rawCart.cartItems) ? rawCart.cartItems : []);

  const items = rawItems.map((item: any, idx: number) => {
    const p = item.product || item.productData || {};
    const unitPrice = Number(item.unitPrice ?? item.price ?? p.price ?? 0);
    const qty = Number(item.quantity ?? item.qty ?? 1);
    const totalPrice = Number(item.totalPrice ?? (unitPrice * qty));

    return {
      id: String(item.id || item._id || `cart-item-${idx}`),
      productId: String(item.productId || p.id || item.product_id || ''),
      product: {
        id: String(p.id || item.productId || ''),
        slug: String(p.slug || p.id || ''),
        name: String(p.name || item.productName || 'Product'),
        brand: String(p.brand || p.brandName || ''),
        brandId: p.brandId,
        category: String(p.category || p.categoryName || ''),
        categoryId: String(p.categoryId || ''),
        price: Number(p.price ?? unitPrice),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
        discountPercent: p.discountPercent ? Number(p.discountPercent) : undefined,
        rating: Number(p.rating ?? 5),
        reviewCount: Number(p.reviewCount ?? 0),
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
        description: String(p.description || ''),
        features: Array.isArray(p.features) ? p.features : [],
        specifications: Array.isArray(p.specifications) ? p.specifications : [],
        stock: Number(p.stock ?? 99),
        variants: p.variants,
        reviews: p.reviews,
        tags: p.tags
      },
      selectedVariant: item.selectedVariant || item.variant,
      quantity: qty,
      unitPrice,
      totalPrice
    };
  });

  const subtotal = Number(rawCart.subtotal ?? items.reduce((sum: number, it: any) => sum + it.totalPrice, 0));
  const discount = Number(rawCart.discount ?? 0);
  const shippingFee = Number(rawCart.shippingFee ?? 0);
  const estimatedTax = Number(rawCart.estimatedTax ?? rawCart.tax ?? 0);
  const total = Number(rawCart.total ?? rawCart.totalAmount ?? Math.max(0, subtotal - discount + shippingFee + estimatedTax));

  return {
    items,
    subtotal,
    discount,
    appliedCoupon: rawCart.appliedCoupon || rawCart.couponCode || undefined,
    shippingFee,
    estimatedTax,
    total
  };
}
