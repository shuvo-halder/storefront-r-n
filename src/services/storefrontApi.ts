import { apiClient } from './apiClient';
import { LoginFormData, RegisterFormData } from '../types/auth';
import { BlogArticle, CMSPage, Refund, ReturnRequest, SearchFacetsResponse, SearchResponse, ProductFilterState, Banner, PublicSettings, Coupon, UserProfile, Order, CartItem, Cart, Brand, Category, Product } from '../types/storefront';
import { 
  MOCK_PRODUCTS, 
  MOCK_CATEGORIES, 
  MOCK_BRANDS, 
  MOCK_PUBLIC_SETTINGS, 
  MOCK_BLOG_ARTICLES, 
  MOCK_COUPONS,
  MOCK_BANNERS,
  MOCK_CMS_PAGES,
  MOCK_FAQ
} from '../data/mockProducts';

// Helper for local persistent mock cart state
const LOCAL_CART_KEY = 'vyzobd_storefront_cart_v2';
const LOCAL_ORDERS_KEY = 'vyzobd_storefront_orders_v2';
const LOCAL_USER_KEY = 'vyzobd_storefront_user_v2';

/**
 * Normalizes API responses to handle both:
 * 1. Standard envelopes: { success: boolean, data: T }
 * 2. Raw data: T
 * 3. Empty/Null data: returns null or safe default
 */
const normalizeResponse = <T>(res: any, defaultValue: T): T => {
  if (!res || !res.data) return defaultValue;
  
  // If response is the envelope { success, data, ... }
  if (res.data.hasOwnProperty('data') && res.data.hasOwnProperty('success')) {
    return res.data.data ?? defaultValue;
  }
  
  // Otherwise assume res.data is the payload itself
  return res.data ?? defaultValue;
};

export const storefrontApi = {
  // Public Settings API: GET /api/storefront/v1/settings/public
  getPublicSettings: async (): Promise<PublicSettings> => {
    try {
      const res = await apiClient.get('/settings/public');
      return normalizeResponse(res, MOCK_PUBLIC_SETTINGS);
    } catch {
      return MOCK_PUBLIC_SETTINGS;
    }
  },

  // Banners API: GET /api/storefront/v1/banners
  getBanners: async (type?: 'hero' | 'promo' | 'offer'): Promise<Banner[]> => {
    try {
      const res = await apiClient.get('/banners', { params: { type } });
      return normalizeResponse(res, MOCK_BANNERS);
    } catch {
      if (type) {
        return MOCK_BANNERS.filter(b => b.type === type);
      }
      return MOCK_BANNERS;
    }
  },

  // Products API: GET /api/storefront/v1/products
  getProducts: async (filters?: Partial<ProductFilterState>): Promise<{ products: Product[]; total: number }> => {
    try {
      const res = await apiClient.get('/products', { params: filters });
      const data = normalizeResponse(res, null);
      
      if (data && Array.isArray(data)) {
        return { products: data, total: data.length };
      }
      
      if (data && data.products) {
        return { products: data.products, total: data.total ?? data.products.length };
      }

      return { products: [], total: 0 };
    } catch {
      let filtered = [...MOCK_PRODUCTS];
      // ... (rest of mock logic remains same)

      if (filters) {
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          );
        }

        if (filters.categorySlug) {
          filtered = filtered.filter(p => {
            const catObj = MOCK_CATEGORIES.find(c => c.slug === filters.categorySlug);
            return p.category === catObj?.name || p.categoryId === catObj?.id;
          });
        }

        if (filters.brandSlugs && filters.brandSlugs.length > 0) {
          filtered = filtered.filter(p => {
            const brandObjs = MOCK_BRANDS.filter(b => filters.brandSlugs?.includes(b.slug));
            const brandNames = brandObjs.map(b => b.name);
            return brandNames.includes(p.brand) || filters.brandSlugs?.includes(p.brand.toLowerCase());
          });
        }

        if (filters.minPrice !== undefined && filters.minPrice > 0) {
          filtered = filtered.filter(p => p.price >= filters.minPrice!);
        }

        if (filters.maxPrice !== undefined && filters.maxPrice < 1000) {
          filtered = filtered.filter(p => p.price <= filters.maxPrice!);
        }

        if (filters.ratingMin !== undefined && filters.ratingMin > 0) {
          filtered = filtered.filter(p => p.rating >= filters.ratingMin!);
        }

        if (filters.inStockOnly) {
          filtered = filtered.filter(p => p.stock > 0);
        }

        if (filters.sortBy) {
          const s = filters.sortBy;
          if (s === 'price-asc' || s === 'price_asc') {
            filtered.sort((a, b) => a.price - b.price);
          } else if (s === 'price-desc' || s === 'price_desc') {
            filtered.sort((a, b) => b.price - a.price);
          } else if (s === 'name-asc' || s === 'name_asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
          } else if (s === 'name-desc' || s === 'name_desc') {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
          } else if (s === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
          } else if (s === 'newest') {
            filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          } else if (s === 'oldest') {
            filtered.sort((a, b) => (a.isNew ? 1 : 0) - (b.isNew ? 1 : 0));
          } else if (s === 'featured') {
            filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          }
        }
      }

      const total = filtered.length;
      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 9;

      const startIndex = (page - 1) * pageSize;
      const paginated = filtered.slice(startIndex, startIndex + pageSize);

      return { products: paginated, total };
    }
  },

  // Production Search API: GET /api/storefront/v1/search
  search: async (params: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    ratingMin?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
  }): Promise<SearchResponse> => {
    try {
      const res = await apiClient.get('/search', { params });
      const data = res.data?.data || res.data;
      if (data && Array.isArray(data.products)) {
        return data;
      }
      throw new Error('Invalid response structure');
    } catch {
      let filtered = [...MOCK_PRODUCTS];
      const query = (params.q || '').toLowerCase().trim();

      if (query) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
        );
      }

      if (params.category) {
        const catObj = MOCK_CATEGORIES.find(c => c.slug === params.category || c.name.toLowerCase() === params.category?.toLowerCase());
        const catName = catObj ? catObj.name : params.category;
        filtered = filtered.filter(p => p.category === catName || p.categoryId === params.category || p.category.toLowerCase() === params.category?.toLowerCase());
      }

      if (params.brand) {
        const brandsArr = params.brand.split(',').map(b => b.trim().toLowerCase());
        filtered = filtered.filter(p => {
          const brandObj = MOCK_BRANDS.find(b => brandsArr.includes(b.slug));
          return brandsArr.includes(p.brand.toLowerCase()) || (brandObj && p.brand === brandObj.name);
        });
      }

      if (typeof params.minPrice === 'number' && !isNaN(params.minPrice)) {
        filtered = filtered.filter(p => p.price >= params.minPrice!);
      }

      if (typeof params.maxPrice === 'number' && !isNaN(params.maxPrice)) {
        filtered = filtered.filter(p => p.price <= params.maxPrice!);
      }

      if (params.inStock) {
        filtered = filtered.filter(p => p.stock > 0);
      }

      if (params.ratingMin) {
        filtered = filtered.filter(p => p.rating >= params.ratingMin!);
      }

      if (params.sort) {
        const s = params.sort;
        if (s === 'price_asc' || s === 'price-asc') filtered.sort((a, b) => a.price - b.price);
        else if (s === 'price_desc' || s === 'price-desc') filtered.sort((a, b) => b.price - a.price);
        else if (s === 'name_asc' || s === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
        else if (s === 'name_desc' || s === 'name-desc') filtered.sort((a, b) => b.name.localeCompare(a.name));
        else if (s === 'rating') filtered.sort((a, b) => b.rating - a.rating);
        else if (s === 'newest') filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        else if (s === 'oldest') filtered.sort((a, b) => (a.isNew ? 1 : 0) - (b.isNew ? 1 : 0));
        else if (s === 'featured') filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      }

      const total = filtered.length;
      const page = params.page || 1;
      const pageSize = params.pageSize || 12;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      const startIndex = (page - 1) * pageSize;
      const paginated = filtered.slice(startIndex, startIndex + pageSize);

      const matchingCategories = query 
        ? MOCK_CATEGORIES.filter(c => c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)) 
        : [];
      const matchingBrands = query 
        ? MOCK_BRANDS.filter(b => b.name.toLowerCase().includes(query)) 
        : [];

      return {
        products: paginated,
        total,
        page,
        pageSize,
        totalPages,
        query: params.q || '',
        suggestions: {
          categories: matchingCategories,
          brands: matchingBrands,
        }
      };
    }
  },

  // Facets API: GET /api/storefront/v1/search/facets
  getSearchFacets: async (q?: string): Promise<SearchFacetsResponse> => {
    try {
      const res = await apiClient.get('/search/facets', { params: { q } });
      return res.data?.data || res.data;
    } catch {
      const query = (q || '').toLowerCase().trim();
      const baseList = query 
        ? MOCK_PRODUCTS.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query) || 
            p.brand.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
          )
        : MOCK_PRODUCTS;

      const categoryCounts: Record<string, number> = {};
      const brandCounts: Record<string, number> = {};
      let min = Infinity;
      let max = -Infinity;

      baseList.forEach(p => {
        const catSlug = MOCK_CATEGORIES.find(c => c.name === p.category)?.slug || p.category.toLowerCase();
        categoryCounts[catSlug] = (categoryCounts[catSlug] || 0) + 1;

        const brandSlug = MOCK_BRANDS.find(b => b.name === p.brand)?.slug || p.brand.toLowerCase();
        brandCounts[brandSlug] = (brandCounts[brandSlug] || 0) + 1;

        if (p.price < min) min = p.price;
        if (p.price > max) max = p.price;
      });

      const categoriesFacet = MOCK_CATEGORIES.map(c => ({
        slug: c.slug,
        name: c.name,
        count: categoryCounts[c.slug] || 0,
      }));

      const brandsFacet = MOCK_BRANDS.map(b => ({
        slug: b.slug,
        name: b.name,
        count: brandCounts[b.slug] || 0,
      }));

      return {
        categories: categoriesFacet,
        brands: brandsFacet,
        priceRange: {
          min: min === Infinity ? 0 : Math.floor(min),
          max: max === -Infinity ? 1000 : Math.ceil(max),
        }
      };
    }
  },

  // Single Product API: GET /api/storefront/v1/products/:slug
  getProductBySlug: async (slug: string): Promise<Product | null> => {
    try {
      const res = await apiClient.get(`/products/${slug}`);
      return normalizeResponse(res, null);
    } catch {
      return MOCK_PRODUCTS.find(p => p.slug === slug || p.id === slug) || null;
    }
  },

  // Categories API: GET /api/storefront/v1/categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await apiClient.get('/categories');
      return normalizeResponse(res, MOCK_CATEGORIES);
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  // Brands API: GET /api/storefront/v1/brands
  getBrands: async (): Promise<Brand[]> => {
    try {
      const res = await apiClient.get('/brands');
      return normalizeResponse(res, MOCK_BRANDS);
    } catch {
      return MOCK_BRANDS;
    }
  },

  // Cart APIs: GET /api/storefront/v1/cart
  getCart: async (): Promise<Cart> => {
    const defaultCart: Cart = {
      items: [],
      subtotal: 0,
      discount: 0,
      shippingFee: 0,
      estimatedTax: 0,
      total: 0,
    };

    try {
      const res = await apiClient.get('/cart');
      return normalizeResponse(res, defaultCart);
    } catch {
      const raw = localStorage.getItem(LOCAL_CART_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          // ignore error
        }
      }
      return defaultCart;
    }
  },

  // Add Item to Cart: POST /api/storefront/v1/cart/items
  addToCart: async (productId: string, quantity: number = 1, variantId?: string): Promise<Cart> => {
    try {
      const res = await apiClient.post('/cart/items', { productId, quantity, variantId });
      return normalizeResponse(res, await storefrontApi.getCart());
    } catch {
      const cart = await storefrontApi.getCart();
      const product = MOCK_PRODUCTS.find(p => p.id === productId);
      if (!product) return cart;

      const variant = product.variants?.find(v => v.id === variantId);
      const unitPrice = variant ? variant.price : product.price;
      const itemId = `${product.id}-${variantId || 'default'}`;

      const existingIndex = cart.items.findIndex(i => i.id === itemId);
      let newItems = [...cart.items];

      if (existingIndex >= 0) {
        const existing = newItems[existingIndex];
        const newQty = existing.quantity + quantity;
        newItems[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
      } else {
        newItems.push({
          id: itemId,
          productId: product.id,
          product,
          selectedVariant: variant,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
        });
      }

      return calculateCartTotals(newItems, cart.appliedCoupon);
    }
  },

  // Update Cart Quantity: PUT /api/storefront/v1/cart/items/:id
  updateCartItem: async (itemId: string, quantity: number): Promise<Cart> => {
    try {
      const res = await apiClient.put(`/cart/items/${itemId}`, { quantity });
      return normalizeResponse(res, await storefrontApi.getCart());
    } catch {
      const cart = await storefrontApi.getCart();
      let newItems = [...cart.items];
      if (quantity <= 0) {
        newItems = newItems.filter(i => i.id !== itemId);
      } else {
        const idx = newItems.findIndex(i => i.id === itemId);
        if (idx >= 0) {
          newItems[idx] = {
            ...newItems[idx],
            quantity,
            totalPrice: quantity * newItems[idx].unitPrice,
          };
        }
      }
      return calculateCartTotals(newItems, cart.appliedCoupon);
    }
  },

  // Remove Cart Item: DELETE /api/storefront/v1/cart/items/:id
  removeCartItem: async (itemId: string): Promise<Cart> => {
    try {
      const res = await apiClient.delete(`/cart/items/${itemId}`);
      return normalizeResponse(res, await storefrontApi.getCart());
    } catch {
      const cart = await storefrontApi.getCart();
      const newItems = cart.items.filter(i => i.id !== itemId);
      return calculateCartTotals(newItems, cart.appliedCoupon);
    }
  },

  // Clear Entire Cart: DELETE /api/storefront/v1/cart
  clearCart: async (): Promise<Cart> => {
    try {
      const res = await apiClient.delete('/cart');
      return normalizeResponse(res, await storefrontApi.getCart());
    } catch {
      const emptyCart: Cart = {
        items: [],
        subtotal: 0,
        discount: 0,
        shippingFee: 0,
        estimatedTax: 0,
        total: 0,
      };
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(emptyCart));
      return emptyCart;
    }
  },

  // Coupon API: POST /api/storefront/v1/cart/coupons
  applyCoupon: async (code: string): Promise<Cart> => {
    try {
      const res = await apiClient.post('/cart/coupons', { code });
      return normalizeResponse(res, await storefrontApi.getCart());
    } catch {
      const cart = await storefrontApi.getCart();
      const matched = MOCK_COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
      if (!matched) {
        throw new Error('Invalid coupon code. Try TECH20 or WELCOME10');
      }
      return calculateCartTotals(cart.items, matched.code);
    }
  },

  // Auth APIs: POST /api/storefront/v1/auth/login, /register, /me
  login: async (data: LoginFormData): Promise<{ token: string; user: UserProfile }> => {
    try {
      const res = await apiClient.post('/auth/login', data);
      return res.data?.data || res.data;
    } catch {
      const user: UserProfile = {
        id: 'usr-101',
        fullName: data.email.split('@')[0].toUpperCase(),
        email: data.email,
        phone: '+1 (555) 234-5678',
        defaultAddress: {
          fullName: data.email.split('@')[0].toUpperCase(),
          email: data.email,
          phone: '+1 (555) 234-5678',
          addressLine1: '742 Evergreen Terrace',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94107',
          country: 'United States',
        },
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      localStorage.setItem('vyzobd_auth_token', 'mock_jwt_token_8892');
      return { token: 'mock_jwt_token_8892', user };
    }
  },

  register: async (data: RegisterFormData): Promise<{ token: string; user: UserProfile }> => {
    try {
      const res = await apiClient.post('/auth/register', data);
      return res.data?.data || res.data;
    } catch {
      const user: UserProfile = {
        id: 'usr-' + Math.random().toString(36).substr(2, 5),
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      localStorage.setItem('vyzobd_auth_token', 'mock_jwt_token_8892');
      return { token: 'mock_jwt_token_8892', user };
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch {
      // Mock success
      return Promise.resolve();
    }
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const res = await apiClient.patch('/auth/profile', data);
      return res.data?.data || res.data;
    } catch {
      const current = await storefrontApi.getCurrentUser();
      const updated = { ...current!, ...data };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      return updated;
    }
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data?.data || res.data;
    } catch {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem('vyzobd_auth_token');
    }
  },

  // Checkout API: POST /api/storefront/v1/orders
  checkout: async (orderPayload: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> => {
    try {
      const res = await apiClient.post('/orders', orderPayload);
      return res.data?.data || res.data;
    } catch {
      const newOrder: Order = {
        ...orderPayload,
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString(),
        status: 'Processing',
        trackingNumber: `TRK-AURA-${Math.floor(10000000 + Math.random() * 90000000)}`,
        estimatedDeliveryDate: new Date(Date.now() + 86400000 * 3).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        trackingSteps: [
          { status: 'Placed', label: 'Order Placed', timestamp: 'Just now', description: 'Order confirmed and sent to warehouse', completed: true, current: false },
          { status: 'Processing', label: 'Payment & Quality Check', timestamp: 'In progress', description: 'Item being prepared and packaged', completed: false, current: true },
          { status: 'Shipped', label: 'Dispatched to Carrier', description: 'Carrier tracking updated', completed: false, current: false },
          { status: 'Out for Delivery', label: 'Out for Delivery', description: 'Package is with local courier driver', completed: false, current: false },
          { status: 'Delivered', label: 'Delivered', description: 'Package delivered to doorstep', completed: false, current: false },
        ],
        returnStatus: 'Not Requested',
        refundStatus: 'None',
      };

      // Save order
      const existingOrdersRaw = localStorage.getItem(LOCAL_ORDERS_KEY);
      const existingOrders: Order[] = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([newOrder, ...existingOrders]));

      // Clear local cart
      const emptyCart: Cart = {
        items: [],
        subtotal: 0,
        discount: 0,
        shippingFee: 0,
        estimatedTax: 0,
        total: 0,
      };
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(emptyCart));

      return newOrder;
    }
  },

  // Checkout: POST /api/storefront/v1/checkout/complete
  checkoutComplete: async (data: any): Promise<any> => {
    try {
      const res = await apiClient.post('/checkout/complete', data);
      return res.data?.data || res.data;
    } catch {
      // Mock production-grade response
      const orderId = `ORD-${Math.floor(Math.random() * 900000) + 100000}`;
      const newOrder: Order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        status: 'Pending',
        ...data,
        totalAmount: data.totalAmount || 0,
        returnStatus: 'Not Requested',
        refundStatus: 'None',
      };

      const orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
      orders.unshift(newOrder);
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));

      // Reset cart
      const emptyCart: Cart = {
        items: [],
        subtotal: 0,
        discount: 0,
        shippingFee: 0,
        estimatedTax: 0,
        total: 0,
      };
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(emptyCart));

      // Mock payment initiation
      let paymentUrl: string | undefined;
      if (['bkash', 'nagad', 'sslcommerz', 'stripe'].includes(data.paymentMethod)) {
        paymentUrl = `/checkout/gateway?orderId=${orderId}&method=${data.paymentMethod}`;
      }

      return {
        order: newOrder,
        paymentUrl,
        status: paymentUrl ? 'pending' : 'success'
      };
    }
  },

  // Verify Payment: GET /api/storefront/v1/checkout/verify/:orderId
  verifyPayment: async (orderId: string): Promise<any> => {
    try {
      const res = await apiClient.get(`/checkout/verify/${orderId}`);
      return res.data?.data || res.data;
    } catch {
      const orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
      const order = orders.find((o: any) => o.id === orderId);
      if (order) {
        order.status = 'Paid';
        localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
        return { status: 'success', order };
      }
      return { status: 'failed' };
    }
  },

  // Get User Orders: GET /api/storefront/v1/orders
  getOrders: async (): Promise<Order[]> => {
    try {
      const res = await apiClient.get('/orders');
      return res.data?.data || res.data;
    } catch {
      const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      return [
        {
          id: 'ORD-849201',
          createdAt: '2026-08-01T14:22:00Z',
          status: 'Delivered',
          items: [
            {
              productId: 'prod-1',
              productName: 'Aura Studio Pro ANC Wireless Headphones',
              productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
              variantName: 'Midnight Black',
              quantity: 1,
              unitPrice: 299.99,
              totalPrice: 299.99,
            },
          ],
          shippingAddress: {
            fullName: 'Alex Miller',
            email: 'alex@example.com',
            phone: '+1 555-0192',
            addressLine1: '100 Market Street',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
            country: 'United States',
          },
          shippingMethod: 'Express Air (2 Days)',
          paymentMethod: 'Credit Card (**** 4242)',
          subtotal: 299.99,
          discount: 20,
          shippingFee: 0,
          tax: 22.40,
          totalAmount: 302.39,
          trackingNumber: 'TRK-AURA-9920182',
          estimatedDeliveryDate: 'Aug 3, 2026',
          returnStatus: 'Not Requested',
          refundStatus: 'Processed',
        },
        {
          id: 'ORD-112233',
          createdAt: '2026-08-05T10:00:00Z',
          status: 'Delivered',
          items: [
            {
              productId: 'prod-2',
              productName: 'Aura Pulse Ultra Titanium Smartwatch',
              productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
              variantName: 'Raw Titanium',
              quantity: 1,
              unitPrice: 349.00,
              totalPrice: 349.00,
            },
          ],
          shippingAddress: {
            fullName: 'Alex Miller',
            email: 'alex@example.com',
            phone: '+1 555-0192',
            addressLine1: '100 Market Street',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
            country: 'United States',
          },
          shippingMethod: 'Express Air (2 Days)',
          paymentMethod: 'Credit Card (**** 4242)',
          subtotal: 349.00,
          discount: 0,
          shippingFee: 0,
          tax: 27.92,
          totalAmount: 376.92,
          trackingNumber: 'TRK-AURA-1122334',
          estimatedDeliveryDate: 'Aug 7, 2026',
          returnStatus: 'Pending',
          refundStatus: 'None',
        },
      ];
    }
  },

  // Get Single Order: GET /api/storefront/v1/orders/:id
  getOrderById: async (id: string): Promise<Order | null> => {
    try {
      const res = await apiClient.get(`/orders/${id}`);
      return res.data?.data || res.data;
    } catch {
      const orders = await storefrontApi.getOrders();
      return orders.find(o => o.id === id) || null;
    }
  },

  // Return Request: POST /api/storefront/v1/orders/:id/returns
  requestReturn: async (orderId: string, data: any): Promise<ReturnRequest> => {
    try {
      const res = await apiClient.post(`/orders/${orderId}/returns`, data);
      return res.data?.data || res.data;
    } catch {
      const returnRequest: ReturnRequest = {
        id: `RET-${Math.floor(100000 + Math.random() * 900000)}`,
        orderId,
        items: data.items,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      
      // Update order status in mock storage
      const orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
      const orderIdx = orders.findIndex((o: any) => o.id === orderId);
      if (orderIdx >= 0) {
        orders[orderIdx].returnStatus = 'Pending';
        localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
      }
      
      return returnRequest;
    }
  },

  // Refund API: GET /api/storefront/v1/orders/:id/refunds
  getRefundByOrderId: async (orderId: string): Promise<Refund | null> => {
    try {
      const res = await apiClient.get(`/orders/${orderId}/refunds`);
      return res.data?.data || res.data;
    } catch {
      const orders = await storefrontApi.getOrders();
      const order = orders.find(o => o.id === orderId);
      if (!order || order.refundStatus === 'None') return null;

      return {
        id: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        orderId,
        amount: order.totalAmount,
        status: order.refundStatus === 'Processed' ? 'Processed' : 'Pending',
        provider: order.paymentMethod,
        reason: 'Customer Request / Item Return',
        createdAt: new Date().toISOString(),
      };
    }
  },

  // Blog API
  getArticles: async (): Promise<BlogArticle[]> => {
    try {
      const res = await apiClient.get('/blog');
      return normalizeResponse(res, MOCK_BLOG_ARTICLES);
    } catch {
      return MOCK_BLOG_ARTICLES;
    }
  },

  getArticleBySlug: async (slug: string): Promise<BlogArticle | null> => {
    try {
      const res = await apiClient.get(`/blog/${slug}`);
      return normalizeResponse(res, null);
    } catch {
      return MOCK_BLOG_ARTICLES.find(a => a.slug === slug || a.id === slug) || null;
    }
  },

  // CMS Pages API
  getCMSPageBySlug: async (slug: string): Promise<CMSPage | null> => {
    try {
      const res = await apiClient.get(`/pages/${slug}`);
      return normalizeResponse(res, null);
    } catch {
      return MOCK_CMS_PAGES.find(p => p.slug === slug) || null;
    }
  },

  // FAQ API
  getFAQs: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/faq');
      return normalizeResponse(res, MOCK_FAQ);
    } catch {
      return MOCK_FAQ;
    }
  },
};

// Helper function to calculate cart subtotal, shipping, discounts, tax
function calculateCartTotals(items: CartItem[], couponCode?: string): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  let discount = 0;
  if (couponCode) {
    const matched = MOCK_COUPONS.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (matched) {
      if (matched.discountPercent) {
        discount = (subtotal * matched.discountPercent) / 100;
      } else if (matched.discountAmount) {
        discount = Math.min(matched.discountAmount, subtotal);
      }
    }
  }

  const freeThreshold = MOCK_PUBLIC_SETTINGS.shipping.freeShippingThreshold;
  const flatRate = MOCK_PUBLIC_SETTINGS.shipping.flatRateShippingFee;
  const shippingFee = subtotal > 0 && subtotal < freeThreshold ? flatRate : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxRate = MOCK_PUBLIC_SETTINGS.tax.taxEnabled ? MOCK_PUBLIC_SETTINGS.tax.taxRate : 0;
  const estimatedTax = taxableAmount * taxRate;
  const total = taxableAmount + shippingFee + estimatedTax;

  const cart: Cart = {
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    appliedCoupon: couponCode,
    shippingFee: Math.round(shippingFee * 100) / 100,
    estimatedTax: Math.round(estimatedTax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };

  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  return cart;
}
