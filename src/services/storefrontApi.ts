import { apiClient } from './apiClient';
import { 
  Product, 
  Category, 
  Brand, 
  Cart, 
  CartItem, 
  Order, 
  UserProfile, 
  Coupon, 
  PublicSettings, 
  BlogArticle,
  ProductFilterState 
} from '../types/storefront';
import { 
  MOCK_PRODUCTS, 
  MOCK_CATEGORIES, 
  MOCK_BRANDS, 
  MOCK_PUBLIC_SETTINGS, 
  MOCK_BLOG_ARTICLES, 
  MOCK_COUPONS 
} from '../data/mockProducts';

// Helper for local persistent mock cart state
const LOCAL_CART_KEY = 'auratech_storefront_cart_v2';
const LOCAL_ORDERS_KEY = 'auratech_storefront_orders_v2';
const LOCAL_USER_KEY = 'auratech_storefront_user_v2';

export const storefrontApi = {
  // Public Settings API: GET /api/storefront/v1/settings/public
  getPublicSettings: async (): Promise<PublicSettings> => {
    try {
      const res = await apiClient.get('/settings/public');
      return res.data?.data || res.data;
    } catch {
      return MOCK_PUBLIC_SETTINGS;
    }
  },

  // Products API: GET /api/storefront/v1/products
  getProducts: async (filters?: Partial<ProductFilterState>): Promise<{ products: Product[]; total: number }> => {
    try {
      const res = await apiClient.get('/products', { params: filters });
      return res.data?.data || { products: res.data, total: res.data.length };
    } catch {
      let filtered = [...MOCK_PRODUCTS];

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
            return brandNames.includes(p.brand);
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
          if (filters.sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
          else if (filters.sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
          else if (filters.sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
          else if (filters.sortBy === 'newest') filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        }
      }

      return { products: filtered, total: filtered.length };
    }
  },

  // Single Product API: GET /api/storefront/v1/products/:slug
  getProductBySlug: async (slug: string): Promise<Product | null> => {
    try {
      const res = await apiClient.get(`/products/${slug}`);
      return res.data?.data || res.data;
    } catch {
      return MOCK_PRODUCTS.find(p => p.slug === slug || p.id === slug) || null;
    }
  },

  // Categories API: GET /api/storefront/v1/categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await apiClient.get('/categories');
      return res.data?.data || res.data;
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  // Brands API: GET /api/storefront/v1/brands
  getBrands: async (): Promise<Brand[]> => {
    try {
      const res = await apiClient.get('/brands');
      return res.data?.data || res.data;
    } catch {
      return MOCK_BRANDS;
    }
  },

  // Cart APIs: GET /api/storefront/v1/cart
  getCart: async (): Promise<Cart> => {
    try {
      const res = await apiClient.get('/cart');
      return res.data?.data || res.data;
    } catch {
      const raw = localStorage.getItem(LOCAL_CART_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          // ignore error
        }
      }
      return {
        items: [],
        subtotal: 0,
        discount: 0,
        shippingFee: 0,
        estimatedTax: 0,
        total: 0,
      };
    }
  },

  // Add Item to Cart: POST /api/storefront/v1/cart/items
  addToCart: async (productId: string, quantity: number = 1, variantId?: string): Promise<Cart> => {
    try {
      const res = await apiClient.post('/cart/items', { productId, quantity, variantId });
      return res.data?.data || res.data;
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
      return res.data?.data || res.data;
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
      return res.data?.data || res.data;
    } catch {
      const cart = await storefrontApi.getCart();
      const newItems = cart.items.filter(i => i.id !== itemId);
      return calculateCartTotals(newItems, cart.appliedCoupon);
    }
  },

  // Coupon API: POST /api/storefront/v1/cart/coupons
  applyCoupon: async (code: string): Promise<Cart> => {
    try {
      const res = await apiClient.post('/cart/coupons', { code });
      return res.data?.data || res.data;
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
  login: async (email: string): Promise<{ token: string; user: UserProfile }> => {
    try {
      const res = await apiClient.post('/auth/login', { email });
      return res.data?.data || res.data;
    } catch {
      const user: UserProfile = {
        id: 'usr-101',
        fullName: email.split('@')[0].toUpperCase(),
        email,
        phone: '+1 (555) 234-5678',
        defaultAddress: {
          fullName: email.split('@')[0].toUpperCase(),
          email,
          phone: '+1 (555) 234-5678',
          addressLine1: '742 Evergreen Terrace',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94107',
          country: 'United States',
        },
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      localStorage.setItem('auratech_auth_token', 'mock_jwt_token_8892');
      return { token: 'mock_jwt_token_8892', user };
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
      localStorage.removeItem('auratech_auth_token');
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
        },
      ];
    }
  },

  // Blog API
  getArticles: async (): Promise<BlogArticle[]> => {
    try {
      const res = await apiClient.get('/blog');
      return res.data?.data || res.data;
    } catch {
      return MOCK_BLOG_ARTICLES;
    }
  },

  getArticleBySlug: async (slug: string): Promise<BlogArticle | null> => {
    try {
      const res = await apiClient.get(`/blog/${slug}`);
      return res.data?.data || res.data;
    } catch {
      return MOCK_BLOG_ARTICLES.find(a => a.slug === slug || a.id === slug) || null;
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

  const freeThreshold = MOCK_PUBLIC_SETTINGS.freeShippingThreshold;
  const shippingFee = subtotal > 0 && subtotal < freeThreshold ? 12.00 : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const estimatedTax = taxableAmount * 0.08; // 8% sales tax
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
