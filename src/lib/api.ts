import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Cart, Product, ProductVariant } from '../types/storefront';

// Base URL from environment or default
const getRawApiUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim();
  }
  return 'https://admin.vyzobd.com/api/storefront/v1';
};

const sanitizeBaseUrl = (url: string): string => {
  return url.replace(/\/+$/, '');
};

export const API_BASE_URL = sanitizeBaseUrl(getRawApiUrl());

export interface ApiPagination {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface ApiFieldError {
  field?: string;
  message: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string | null;
  data: T;
  pagination?: ApiPagination;
  errors?: ApiFieldError[];
}

export interface ApiError {
  status: 'error';
  message: string;
  errors?: ApiFieldError[];
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
  (response) => {
    if (typeof window !== 'undefined') {
      const sessionId = response.headers['x-cart-session-id'];
      if (sessionId) {
        localStorage.setItem('vyzobd_cart_session_id', sessionId);
      }
    }
    return response;
  },
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
          const res = await axios.post<ApiResponse>(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const newToken = res.data?.data?.token;

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
    
    // Normalize error response to standardized ApiError format
    if (error.response?.data) {
      const data = error.response.data;
      if (data.status === 'error') {
        return Promise.reject(data);
      }
    }
    
    return Promise.reject({
      status: 'error',
      message: error.message || 'An unknown network error occurred',
      data: null
    });
  }
);

/**
 * Universal Response Unwrapper for the backend API contract.
 * Safely handles null, undefined, arrays, and objects.
 */
export function unwrapApiResponse<T>(res: AxiosResponse<any>, defaultValue: T | null = null): ApiResponse<T> {
  if (!res || !res.data) {
    return {
      status: 'error',
      message: 'No response data received from server',
      data: defaultValue as unknown as T
    };
  }

  const body = res.data;
  
  if (body.status === 'error') {
    return {
      status: 'error',
      message: body.message || 'An unexpected API error occurred',
      data: (body.data !== undefined && body.data !== null) ? body.data : defaultValue,
      errors: body.errors
    };
  }

  // Handle successful standardized response
  if (body.status === 'success') {
    return {
      status: 'success',
      message: body.message || null,
      data: (body.data !== undefined && body.data !== null) ? body.data : defaultValue,
      pagination: body.pagination
    };
  }

  // Fallback for non-standardized responses
  return {
    status: 'success',
    message: null,
    data: (body.data !== undefined && body.data !== null) ? body.data : (body || defaultValue),
    pagination: body.pagination
  };
}

/**
 * Safely extract error message and field validation errors.
 */
export function extractApiError(err: any, fallbackMessage: string): { message: string; errors?: ApiFieldError[] } {
  if (err && typeof err === 'object') {
    if (err.status === 'error') {
      return {
        message: err.message || fallbackMessage,
        errors: err.errors
      };
    }
    if (err.response?.data) {
      const data = err.response.data;
      return {
        message: data.message || fallbackMessage,
        errors: data.errors
      };
    }
    if (err.message && typeof err.message === 'string') {
      return { message: err.message };
    }
  }
  return { message: fallbackMessage };
}

/**
 * Canonical Product Normalizer Strategy
 * Safely normalizes product data and computes stock / availability across product and variants.
 */
export function normalizeProduct(raw: any): Product {
  if (!raw) {
    return {
      id: '',
      slug: '',
      name: '',
      brand: '',
      category: '',
      categoryId: '',
      price: 0,
      rating: 5,
      reviewCount: 0,
      images: [],
      description: '',
      features: [],
      specifications: [],
      stock: 0
    };
  }

  const categoryName = typeof raw.category === 'string' 
    ? raw.category 
    : (raw.category?.name || raw.category?.title || raw.categoryName || raw.category_name || (Array.isArray(raw.categories) && (raw.categories[0]?.name || raw.categories[0]?.title)) || '');
  const categoryId = typeof raw.category === 'object' 
    ? (raw.category?.id || raw.category?.slug || '') 
    : (raw.categoryId || raw.category_id || (Array.isArray(raw.categories) && (raw.categories[0]?.id || raw.categories[0]?.slug)) || '');
  const categorySlug = typeof raw.category === 'object'
    ? (raw.category?.slug || raw.category?.id || '')
    : (raw.categorySlug || raw.category_slug || (Array.isArray(raw.categories) && (raw.categories[0]?.slug || raw.categories[0]?.id)) || '');

  const brandName = typeof raw.brand === 'string' 
    ? raw.brand 
    : (raw.brand?.name || raw.brand?.title || raw.brandName || raw.brand_name || '');
  const brandId = typeof raw.brand === 'object' 
    ? (raw.brand?.id || raw.brand?.slug || '') 
    : (raw.brandId || raw.brand_id || '');
  const brandSlug = typeof raw.brand === 'object'
    ? (raw.brand?.slug || raw.brand?.id || '')
    : (raw.brandSlug || raw.brand_slug || '');

  let rawImages: string[] = [];
  const candidateList = raw.images || raw.gallery || raw.photos || raw.pictures;
  if (Array.isArray(candidateList) && candidateList.length > 0) {
    rawImages = candidateList.map((img: any) => {
      if (typeof img === 'string') return img;
      if (!img) return '';
      return img.url || img.src || img.imageUrl || img.image_url || img.path || img.originalUrl || '';
    }).filter(Boolean);
  } else {
    const singleImg = 
      raw.imageUrl || 
      raw.image_url || 
      raw.image || 
      raw.primaryImage?.url || 
      raw.primaryImage?.src || 
      (typeof raw.primaryImage === 'string' ? raw.primaryImage : '') ||
      raw.thumbnail?.url || 
      raw.thumbnail?.src || 
      (typeof raw.thumbnail === 'string' ? raw.thumbnail : '') ||
      raw.featuredImage?.url || 
      raw.featuredImage?.src || 
      (typeof raw.featuredImage === 'string' ? raw.featuredImage : '') ||
      raw.photo || 
      raw.picture;
      
    if (typeof singleImg === 'string' && singleImg.trim() !== '') {
      rawImages = [singleImg.trim()];
    } else if (singleImg && typeof singleImg === 'object' && (singleImg.url || singleImg.src)) {
      rawImages = [singleImg.url || singleImg.src];
    }
  }

  const id = String(raw.id || raw._id || raw.productId || raw.product_id || raw.sku || '');
  const slug = String(raw.slug || raw.handle || raw.url_slug || raw.urlSlug || id);

  const productName = 
    raw.name || 
    raw.title || 
    raw.productName || 
    raw.product_name || 
    raw.title_en || 
    raw.name_en || 
    raw.heading || 
    raw.label || 
    raw.seoTitle || 
    (slug ? slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '');

  const rawPrice = raw.price ?? raw.regularPrice ?? raw.regular_price ?? raw.unit_price ?? raw.unitPrice ?? raw.sale_price ?? raw.salePrice ?? raw.amount ?? raw.cost;
  const price = (rawPrice !== undefined && rawPrice !== null && !isNaN(Number(rawPrice))) ? Number(rawPrice) : 0;

  const rawCompare = raw.compareAtPrice ?? raw.compare_at_price ?? raw.originalPrice ?? raw.original_price ?? raw.mrp ?? raw.old_price ?? raw.oldPrice ?? raw.listPrice ?? raw.list_price;
  const compareAtPrice = (rawCompare !== undefined && rawCompare !== null && !isNaN(Number(rawCompare)) && Number(rawCompare) > price) ? Number(rawCompare) : undefined;

  const rawDiscount = raw.discountPercent ?? raw.discount_percent ?? raw.discount_percentage ?? raw.discount;
  let discountPercent: number | undefined = (rawDiscount !== undefined && rawDiscount !== null && !isNaN(Number(rawDiscount))) ? Number(rawDiscount) : undefined;
  if (discountPercent === undefined && compareAtPrice && compareAtPrice > price && price > 0) {
    discountPercent = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  }

  const variants: ProductVariant[] = Array.isArray(raw.variants) ? raw.variants.map((v: any) => {
    const vInStock = v.inStock ?? v.in_stock ?? v.is_in_stock ?? v.isAvailable ?? v.is_available;
    const rawVStock = v.stock ?? v.quantity ?? v.inventory ?? v.stock_quantity ?? v.inventory_quantity ?? v.stockQuantity ?? v.inventoryQuantity;
    let vStock = 0;
    if (rawVStock !== undefined && rawVStock !== null && !isNaN(Number(rawVStock))) {
      vStock = Number(rawVStock);
    } else if (vInStock === false) {
      vStock = 0;
    } else if (vInStock === true) {
      vStock = 10;
    }
    const vName = v.name || v.title || v.variant_name || v.variantName || v.sku || 'Variant';
    const vPrice = Number(v.price ?? v.unit_price ?? v.regular_price ?? price ?? 0);
    const vImg = v.image ? (typeof v.image === 'string' ? v.image : (v.image.url || v.image.src || v.image.imageUrl)) : undefined;
    return {
      id: String(v.id || v._id || v.sku || ''),
      name: String(vName),
      sku: String(v.sku || ''),
      price: vPrice,
      compareAtPrice: (v.compareAtPrice || v.compare_at_price || v.originalPrice) ? Number(v.compareAtPrice || v.compare_at_price || v.originalPrice) : undefined,
      stock: vStock,
      image: vImg,
      colorHex: v.colorHex || v.color_hex || v.hex || undefined
    };
  }) : [];

  // Determine product-level stock from raw fields & variants
  const rawStock = raw.stock ?? raw.quantity ?? raw.inventory ?? raw.stock_quantity ?? raw.inventory_quantity ?? raw.stockQuantity ?? raw.inventoryQuantity;
  const rawInStock = raw.inStock ?? raw.in_stock ?? raw.is_in_stock ?? raw.isAvailable ?? raw.is_available;

  let stock = 0;

  if (rawStock !== undefined && rawStock !== null && !isNaN(Number(rawStock))) {
    stock = Number(rawStock);
  } else if (variants.length > 0) {
    // Fall back to variant sum only if product-level stock is missing
    stock = variants.reduce((sum, v) => sum + v.stock, 0);
  } else if (rawInStock === false) {
    stock = 0;
  } else if (rawInStock === true) {
    stock = 10;
  }

  return {
    id,
    slug,
    name: String(productName),
    subtitle: raw.subtitle || raw.shortDescription || raw.short_description || raw.subheading || raw.summary || undefined,
    brand: brandName,
    brandId: brandId || undefined,
    brandSlug: brandSlug || undefined,
    category: categoryName,
    categoryId: categoryId,
    categorySlug: categorySlug || undefined,
    price,
    compareAtPrice,
    discountPercent,
    rating: Number(raw.rating ?? raw.average_rating ?? raw.avg_rating ?? 5),
    reviewCount: Number(raw.reviewCount ?? raw.reviews_count ?? raw.review_count ?? 0),
    images: rawImages.filter(Boolean),
    description: String(raw.description || raw.details || raw.shortDescription || raw.short_description || raw.body || raw.content || ''),
    features: Array.isArray(raw.features) ? raw.features : [],
    specifications: Array.isArray(raw.specifications) ? raw.specifications : [],
    stock,
    isNew: Boolean(raw.isNew || raw.is_new),
    isFeatured: Boolean(raw.isFeatured || raw.is_featured),
    isBestSeller: Boolean(raw.isBestSeller || raw.is_best_seller || raw.isBestseller),
    isDealOfDay: Boolean(raw.isDealOfDay || raw.is_deal_of_day || raw.isDeal),
    dealEndTime: raw.dealEndTime || raw.deal_end_time || undefined,
    variants,
    reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
    tags: Array.isArray(raw.tags) ? raw.tags : []
  };
}

/**
 * Canonical Cart Normalizer Strategy
 * Guarantees UI always receives a valid Cart object with items array and calculated totals.
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
    let p = item.product || item.productData;
    
    // If the product object is completely missing from the API response but flat fields exist
    if (!p || Object.keys(p).length === 0) {
      p = {
        id: item.productId || item.product_id || '',
        name: item.productName || item.product_name || item.name || item.title || '',
        slug: item.productSlug || item.slug || '',
        images: item.productImage ? [item.productImage] : (item.image || item.imageUrl || item.image_url ? [item.image || item.imageUrl || item.image_url] : []),
        price: item.unitPrice || item.price || 0,
      };
    }

    const unitPrice = Number(item.unitPrice ?? item.price ?? p.price ?? 0);
    const qty = Number(item.quantity ?? item.qty ?? 1);
    const totalPrice = Number(item.totalPrice ?? (unitPrice * qty));

    return {
      id: String(item.id || item._id || `cart-item-${idx}`),
      productId: String(item.productId || p.id || item.product_id || ''),
      product: normalizeProduct(p),
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

