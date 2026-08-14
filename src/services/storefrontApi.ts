import { authService } from './authService';
import { productService } from './productService';
import { categoryService } from './categoryService';
import { brandService } from './brandService';
import { searchService } from './searchService';
import { cartService } from './cartService';
import { wishlistService } from './wishlistService';
import { checkoutService, CheckoutSummary } from './checkoutService';
import { paymentService } from './paymentService';
import { orderService } from './orderService';
import { returnService } from './returnService';
import { refundService } from './refundService';
import { contentService } from './contentService';
import { settingsService } from './settingsService';
import { analyticsService } from './analyticsService';
import { normalizeCart } from '../lib/api';
import { LoginFormData, RegisterFormData, AuthResponse, RegisterResponse } from '../types/auth';
import { CheckoutFormData } from '../types/checkout';
import { 
  AnalyticsConfig,
  Banner, 
  BlogArticle, 
  Brand, 
  Cart, 
  Category, 
  CMSPage, 
  Order, 
  Product, 
  ProductFilterState, 
  PublicSettings, 
  Refund, 
  ReturnRequest, 
  UserProfile,
  SearchFacetsResponse,
  Coupon
} from '../types/storefront';

export const storefrontApi = {
  // ANALYTICS & MARKETING
  getAnalyticsConfig: async (): Promise<AnalyticsConfig> => {
    const res = await analyticsService.getAnalyticsConfig();
    return res.data;
  },

  // SETTINGS
  getPublicSettings: async (): Promise<PublicSettings> => {
    const res = await settingsService.getPublicSettings();
    if (res.data) return res.data;
    throw new Error(res.message || 'Failed to fetch public settings');
  },

  // BANNERS & CONTENT
  getBanners: async (type?: 'hero' | 'promo' | 'offer'): Promise<Banner[]> => {
    const res = await contentService.getBanners(type);
    return res.data || [];
  },

  getPopups: async (): Promise<any[]> => {
    const res = await contentService.getPopups();
    return res.data || [];
  },

  getFAQs: async (): Promise<any[]> => {
    const res = await contentService.getFAQs();
    return res.data || [];
  },

  getArticles: async (): Promise<BlogArticle[]> => {
    const res = await contentService.getBlogPosts();
    return res.data || [];
  },

  getArticleBySlug: async (slug: string): Promise<BlogArticle | null> => {
    const res = await contentService.getBlogPostBySlug(slug);
    return res.data;
  },

  getCMSPageBySlug: async (slug: string): Promise<CMSPage | null> => {
    const res = await contentService.getPageBySlug(slug);
    return res.data;
  },

  // PRODUCTS
  getProducts: async (filters?: Partial<ProductFilterState>): Promise<{ products: Product[]; total: number }> => {
    const res = await productService.getProducts(filters);
    return res.data || { products: [], total: 0 };
  },

  getProductBySlug: async (slug: string): Promise<Product | null> => {
    const res = await productService.getProductBySlug(slug);
    return res.data;
  },

  // CATEGORIES & BRANDS
  getCategories: async (): Promise<Category[]> => {
    const res = await categoryService.getCategories();
    return res.data || [];
  },

  getBrands: async (): Promise<Brand[]> => {
    const res = await brandService.getBrands();
    return res.data || [];
  },

  // SEARCH
  search: async (params?: {
    query?: string;
    searchQuery?: string;
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    inStockOnly?: boolean;
    ratingMin?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; totalPages?: number; suggestions?: any }> => {
    const q = params?.q || params?.searchQuery || params?.query || '';
    const page = params?.page || 1;
    const pageSize = params?.pageSize || params?.limit || 20;
    const res = await searchService.search(q, page, pageSize, {
      category: params?.category,
      brand: params?.brand,
      minPrice: params?.minPrice,
      maxPrice: params?.maxPrice,
      inStock: params?.inStock ?? params?.inStockOnly,
      ratingMin: params?.ratingMin,
      sort: params?.sort,
      page,
      pageSize
    });
    return {
      products: res.data?.products || [],
      total: res.data?.total || 0,
      totalPages: res.data?.totalPages || 1,
      suggestions: res.data?.suggestions
    };
  },

  getSearchFacets: async (query?: string): Promise<SearchFacetsResponse> => {
    const res = await searchService.getFacets(query);
    return res.data || { categories: [], brands: [], priceRange: { min: 0, max: 1000 } };
  },

  // CART
  getCart: async (): Promise<Cart> => {
    const res = await cartService.getCart();
    return res.data || normalizeCart(null);
  },

  addToCart: async (productId: string, quantity = 1, variantId?: string): Promise<Cart> => {
    const res = await cartService.addItem(productId, quantity, variantId);
    return res.data || normalizeCart(null);
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const res = await cartService.updateItem(itemId, quantity);
    return res.data || normalizeCart(null);
  },

  removeCartItem: async (itemId: string): Promise<Cart> => {
    const res = await cartService.removeItem(itemId);
    return res.data || normalizeCart(null);
  },

  clearCart: async (): Promise<Cart> => {
    const res = await cartService.clearCart();
    return res.data || normalizeCart(null);
  },

  applyCoupon: async (code: string): Promise<Coupon | null> => {
    const res = await checkoutService.applyCoupon(code);
    return res.data;
  },

  // WISHLIST
  getWishlist: async (): Promise<Product[]> => {
    const res = await wishlistService.getWishlist();
    return res.data || [];
  },

  addToWishlist: async (productId: string): Promise<boolean> => {
    const res = await wishlistService.addToWishlist(productId);
    return Boolean(res.data);
  },

  removeFromWishlist: async (productId: string): Promise<boolean> => {
    const res = await wishlistService.removeFromWishlist(productId);
    return Boolean(res.data);
  },

  // AUTH
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const res = await authService.login(data);
    if (res.status === 'error' || !res.data) {
      const errorObj: any = new Error(res.message || 'Login failed');
      errorObj.errors = res.errors;
      throw errorObj;
    }
    return res.data;
  },

  register: async (data: RegisterFormData): Promise<RegisterResponse> => {
    const res = await authService.register(data);
    if (res.status === 'error' || !res.data) {
      const errorObj: any = new Error(res.message || 'Registration failed');
      errorObj.errors = res.errors;
      throw errorObj;
    }
    return res.data;
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    const res = await authService.me();
    return res.data;
  },

  logout: async (): Promise<void> => {
    await authService.logout();
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await authService.updateProfile(data);
    if (res.data) return res.data;
    const current = await authService.me();
    if (current.data) return current.data;
    throw new Error('Failed to update profile');
  },

  forgotPassword: async (email: string): Promise<boolean> => {
    return true;
  },

  resetPassword: async (password: string, token: string): Promise<boolean> => {
    return true;
  },

  // CHECKOUT & ORDERS
  getCheckoutSession: async (): Promise<CheckoutSummary> => {
    const res = await checkoutService.getCheckoutSession();
    return res.data || { subtotal: 0, discount: 0, shippingFee: 0, tax: 0, totalAmount: 0 };
  },

  checkout: async (payload: CheckoutFormData): Promise<Order> => {
    const res = await checkoutService.completeCheckout(payload);
    if (res.status === 'error' || !res.data) {
      throw new Error(res.message || 'Checkout failed');
    }
    return res.data;
  },

  checkoutComplete: async (payload: CheckoutFormData): Promise<Order> => {
    const res = await checkoutService.completeCheckout(payload);
    if (res.status === 'error' || !res.data) {
      throw new Error(res.message || 'Checkout failed');
    }
    return res.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const res = await orderService.getOrders();
    return res.data || [];
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    const res = await orderService.getOrderById(id);
    return res.data;
  },

  // PAYMENT
  initiatePayment: async (orderId: string, method: string) => {
    const res = await paymentService.initiatePayment(orderId, method);
    return res.data;
  },

  verifyPayment: async (transactionId: string) => {
    const res = await paymentService.verifyPayment(transactionId, 'gateway');
    return res.data;
  },

  // RETURNS & REFUNDS
  getReturns: async (): Promise<ReturnRequest[]> => {
    const res = await returnService.getReturns();
    return res.data || [];
  },

  requestReturn: async (orderId: string, payload: any): Promise<ReturnRequest | null> => {
    const res = await returnService.requestReturn({ orderId, ...payload });
    return res.data;
  },

  getRefunds: async (): Promise<Refund[]> => {
    const res = await refundService.getRefunds();
    return res.data || [];
  },

  getRefundByOrderId: async (orderId: string): Promise<Refund | null> => {
    const res = await refundService.getRefunds();
    if (!res.data) return null;
    return res.data.find(r => r.orderId === orderId) || null;
  }
};
