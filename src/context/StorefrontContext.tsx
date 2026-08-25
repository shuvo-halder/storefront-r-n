'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Product, 
  Cart, 
  UserProfile, 
  PublicSettings, 
  ProductFilterState,
  Order,
  Category,
  Brand
} from '../types/storefront';
import { ToastMessage, ToastOptions, ToastVariant, ToastAction } from '../types/feedback';
import { createToastPayload, sanitizeErrorMessage } from '../utils/feedback';
import { storefrontApi } from '../services/storefrontApi';
import { tokenStorage } from '../lib/tokenStorage';
import { trackGA4AddToWishlist } from '../utils/analytics';
import confetti from 'canvas-confetti';

export type { ToastMessage, ToastOptions, ToastVariant, ToastAction };

export type AppView = 
  | 'home' 
  | 'shop' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'account' 
  | 'orders' 
  | 'order-details'
  | 'return-request'
  | 'faq'
  | 'blog' 
  | 'article-detail' 
  | 'cms-page' 
  | 'deals'
  | 'order-confirmation'
  | 'checkout-success'
  | 'checkout-failed'
  | 'checkout-pending'
  | 'checkout-gateway'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'account'
  | 'profile'
  | 'addresses'
  | 'wishlist'
  | 'notifications'
  | 'activity'
  | 'search';

export interface ViewParams {
  id?: string;
  productSlug?: string;
  categorySlug?: string;
  brandSlug?: string;
  articleSlug?: string;
  cmsPageType?: 'shipping' | 'returns' | 'privacy' | 'terms' | 'faq' | 'contact' | 'about' | 'about-us' | 'contact-us';
  confirmedOrder?: Order;
  searchQuery?: string;
  orderId?: string;
  method?: string;
}

const DEFAULT_FILTERS: ProductFilterState = {
  searchQuery: '',
  categorySlug: null,
  brandSlugs: [],
  minPrice: 0,
  maxPrice: 1000,
  ratingMin: 0,
  inStockOnly: false,
  sortBy: 'featured',
  page: 1,
  pageSize: 12,
};

interface StorefrontContextType {
  // Navigation & view
  currentView: AppView;
  viewParams: ViewParams;
  navigateTo: (view: AppView, params?: ViewParams) => void;
  
  // Public settings, categories, brands
  publicSettings: PublicSettings | null;
  categories: Category[];
  brands: Brand[];
  
  // UI State
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  // Wishlist & Recently Viewed
  wishlist: string[]; // product IDs
  toggleWishlist: (productOrId: string | Product) => void;
  isInWishlist: (productId: string) => boolean;
  recentlyViewed: string[];
  trackRecentlyViewed: (productId: string) => void;
  
  // Quick View Modal
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  
  // Filters & Search
  filters: ProductFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ProductFilterState>>;
  resetFilters: () => void;
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  removeSearchHistoryItem: (query: string) => void;

  // Auth UI state
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  
  // Checkout & Orders
  createCheckoutOrder: (payload: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<Order>;
  userOrders: Order[];
  refreshOrders: () => Promise<void>;

  // Centralized Toasts & Feedback System
  toasts: ToastMessage[];
  addToast: (toast: (Partial<ToastMessage> & { title: string }) | Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  notifySuccess: (title: string, description?: string, options?: ToastOptions) => void;
  notifyError: (error: unknown, fallbackTitle?: string, fallbackMessage?: string, options?: ToastOptions) => void;
  notifyWarning: (title: string, description?: string, options?: ToastOptions) => void;
  notifyInfo: (title: string, description?: string, options?: ToastOptions) => void;
  notifyAddToCart: (payload: { productName: string; image?: string; quantity?: number; onViewCart?: () => void }) => void;
  notifyWishlist: (payload: { productName: string; image?: string; action: 'added' | 'removed'; onViewWishlist?: () => void }) => void;
  
  // Global loading
  isLoading: boolean;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

import { useRouter } from 'next/navigation';
import { useSettings } from './SettingsContext';

export const StorefrontProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { settings: publicSettings } = useSettings();
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [viewParams, setViewParams] = useState<ViewParams>({});
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('vyzobd_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('vyzobd_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('vyzobd_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_FILTERS);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const addSearchHistory = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('vyzobd_search_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('vyzobd_search_history');
    } catch {}
  };

  const removeSearchHistoryItem = (term: string) => {
    setSearchHistory(prev => {
      const updated = prev.filter(item => item !== term);
      try {
        localStorage.setItem('vyzobd_search_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Sync state & perform Next.js App Router navigation
  const navigateTo = (view: AppView, params: ViewParams = {}) => {
    setCurrentView(view);
    setViewParams(params);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (view === 'search' && params.searchQuery) {
      addSearchHistory(params.searchQuery);
    }

    let routePath = '/';
    switch (view) {
      case 'home':
        routePath = '/';
        break;
      case 'shop':
      case 'deals':
        routePath = params.categorySlug
          ? `/categories/${params.categorySlug}`
          : `/products${view === 'deals' ? '?deals=true' : ''}`;
        break;
      case 'product-detail':
        routePath = params.productSlug
          ? `/products/${params.productSlug}`
          : params.id
          ? `/products/${params.id}`
          : '/products';
        break;
      case 'cart':
        routePath = '/cart';
        break;
      case 'checkout':
      case 'checkout-gateway':
      case 'checkout-pending':
        routePath = '/checkout';
        break;
      case 'checkout-success':
      case 'order-confirmation':
        routePath = `/order-confirmation${(params.orderId || params.id) ? `?orderId=${params.orderId || params.id}` : ''}`;
        break;
      case 'checkout-failed':
        routePath = '/checkout';
        break;
      case 'login':
        routePath = '/login';
        break;
      case 'register':
        routePath = '/register';
        break;
      case 'forgot-password':
        routePath = '/forgot-password';
        break;
      case 'reset-password':
        routePath = '/reset-password';
        break;
      case 'account':
      case 'profile':
        routePath = '/account/profile';
        break;
      case 'addresses':
        routePath = '/account/addresses';
        break;
      case 'wishlist':
        routePath = '/account/wishlist';
        break;
      case 'notifications':
        routePath = '/account/notifications';
        break;
      case 'activity':
        routePath = '/account/activity';
        break;
      case 'orders':
        routePath = '/account/orders';
        break;
      case 'order-details':
        routePath = params.orderId || params.id ? `/account/orders/${params.orderId || params.id}` : '/account/orders';
        break;
      case 'return-request':
        routePath = '/account/returns';
        break;
      case 'blog':
        routePath = '/blog';
        break;
      case 'article-detail':
        routePath = params.articleSlug || params.id ? `/blog/${params.articleSlug || params.id}` : '/blog';
        break;
      case 'cms-page':
      case 'faq':
        routePath = view === 'faq' ? '/faq' : params.cmsPageType ? `/pages/${params.cmsPageType}` : '/pages/about';
        break;
      case 'search':
        routePath = `/search${params.searchQuery ? `?q=${encodeURIComponent(params.searchQuery)}` : ''}`;
        break;
      default:
        routePath = '/';
    }

    try {
      router.push(routePath);
    } catch {}
  };

  // Toast Notification & Centralized Feedback Engine
  const addToast = (toast: (Partial<ToastMessage> & { title: string }) | Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const payload = createToastPayload(
      toast.type || 'info',
      toast.title,
      toast.description || toast.message,
      toast as ToastOptions
    );
    setToasts(prev => [payload, ...prev].slice(0, 6));
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  const notifySuccess = (title: string, description?: string, options?: ToastOptions) => {
    const payload = createToastPayload('success', title, description, options);
    setToasts(prev => [payload, ...prev].slice(0, 6));
  };

  const notifyError = (error: unknown, fallbackTitle: string = 'Action Failed', fallbackMessage?: string, options?: ToastOptions) => {
    const sanitized = sanitizeErrorMessage(error, fallbackTitle, fallbackMessage);
    const payload = createToastPayload('error', sanitized.title, sanitized.message, {
      ...options,
      badge: options?.badge || 'Notice',
    });
    setToasts(prev => [payload, ...prev].slice(0, 6));
  };

  const notifyWarning = (title: string, description?: string, options?: ToastOptions) => {
    const payload = createToastPayload('warning', title, description, options);
    setToasts(prev => [payload, ...prev].slice(0, 6));
  };

  const notifyInfo = (title: string, description?: string, options?: ToastOptions) => {
    const payload = createToastPayload('info', title, description, options);
    setToasts(prev => [payload, ...prev].slice(0, 6));
  };

  const notifyAddToCart = (payload: { productName: string; image?: string; quantity?: number; onViewCart?: () => void }) => {
    const qty = payload.quantity || 1;
    const toast = createToastPayload(
      'success',
      'Added to Cart',
      `${qty}× ${payload.productName} added to your bag.`,
      {
        image: payload.image,
        badge: 'Cart',
        action: {
          label: 'View Cart',
          onClick: () => {
            if (payload.onViewCart) {
              payload.onViewCart();
            } else {
              setIsCartOpen(true);
            }
          }
        }
      }
    );
    setToasts(prev => [toast, ...prev].slice(0, 6));
  };

  const notifyWishlist = (payload: { productName: string; image?: string; action: 'added' | 'removed'; onViewWishlist?: () => void }) => {
    const isAdded = payload.action === 'added';
    const toast = createToastPayload(
      isAdded ? 'success' : 'info',
      isAdded ? 'Saved to Wishlist' : 'Removed from Wishlist',
      isAdded ? `${payload.productName} has been saved to your wishlist.` : `${payload.productName} was removed from your wishlist.`,
      {
        image: payload.image,
        badge: 'Wishlist',
        action: isAdded ? {
          label: 'View Wishlist',
          onClick: () => {
            if (payload.onViewWishlist) {
              payload.onViewWishlist();
            } else {
              navigateTo('wishlist');
            }
          }
        } : undefined
      }
    );
    setToasts(prev => [toast, ...prev].slice(0, 6));
  };

  // Initial Data Load
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const catsData = await storefrontApi.getCategories().catch(() => []);
        setCategories(catsData);
        
        const brandsData = await storefrontApi.getBrands().catch(() => []);
        setBrands(brandsData);
        
        const hasAuthToken = typeof window !== 'undefined' && tokenStorage.hasAccessToken();
        if (hasAuthToken) {
          const ordersData = await storefrontApi.getOrders().catch(() => []);
          setUserOrders(ordersData);
        } else {
          setUserOrders([]);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // Sync Hash/URL changes from browser
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash.replace('#', '');
      const pathname = window.location.pathname;
      const search = window.location.search;

      if (pathname === '/search' || hash.startsWith('search')) {
        let q = '';
        if (search) {
          const searchParams = new URLSearchParams(search);
          q = searchParams.get('q') || '';
        }
        if (!q && hash.includes('?')) {
          const hashParams = new URLSearchParams(hash.split('?')[1]);
          q = hashParams.get('q') || '';
        }
        setCurrentView('search');
        setViewParams({ searchQuery: q });
        if (q) addSearchHistory(q);
        return;
      }

      if (!hash) return;
      const [viewStr, queryStr] = hash.split('?');
      if (['home', 'shop', 'product-detail', 'cart', 'checkout', 'account', 'orders', 'blog', 'article-detail', 'cms-page', 'deals', 'search', 'login', 'register', 'forgot-password', 'profile', 'addresses', 'wishlist', 'notifications', 'activity', 'order-details', 'return-request', 'faq'].includes(viewStr)) {
        const params: ViewParams = {};
        if (queryStr) {
          const searchParams = new URLSearchParams(queryStr);
          if (searchParams.get('product')) params.productSlug = searchParams.get('product')!;
          if (searchParams.get('article')) params.articleSlug = searchParams.get('article')!;
          if (searchParams.get('page')) params.cmsPageType = searchParams.get('page') as any;
          if (searchParams.get('q')) {
            params.searchQuery = searchParams.get('q')!;
            addSearchHistory(params.searchQuery);
          }
        }
        setCurrentView(viewStr as AppView);
        setViewParams(params);
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    handleUrlChange();
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Wishlist
  const toggleWishlist = (productOrId: string | Product) => {
    const productId = typeof productOrId === 'string' ? productOrId : productOrId.id;
    const productName = typeof productOrId === 'string' ? 'Product' : productOrId.name;
    const productImage = typeof productOrId === 'string' ? undefined : (productOrId.images?.[0] || undefined);

    setWishlist(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('vyzobd_wishlist', JSON.stringify(updated));
      }
      
      notifyWishlist({
        productName: productName || 'Product',
        image: productImage,
        action: exists ? 'removed' : 'added',
        onViewWishlist: () => navigateTo('wishlist'),
      });

      if (!exists) {
        const currency = publicSettings?.general?.currency || 'BDT';
        if (typeof productOrId !== 'string') {
          trackGA4AddToWishlist(productOrId, currency);
        } else {
          storefrontApi.getProducts().then(res => {
            const found = (res.products || []).find(p => p.id === productOrId);
            if (found) {
              trackGA4AddToWishlist(found, currency);
            } else {
              trackGA4AddToWishlist({ id: productOrId, name: 'Product', price: 0 }, currency);
            }
          }).catch(() => {
            trackGA4AddToWishlist({ id: productOrId, name: 'Product', price: 0 }, currency);
          });
        }
      }

      return updated;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Recently viewed
  const trackRecentlyViewed = (productId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      const updated = [productId, ...filtered].slice(0, 8);
      localStorage.setItem('vyzobd_recently_viewed', JSON.stringify(updated));
      return updated;
    });
  };

  // Quick view
  const openQuickView = (product: Product) => setQuickViewProduct(product);
  const closeQuickView = () => setQuickViewProduct(null);

  // Reset filters
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Checkout
  const createCheckoutOrder = async (payload: any) => {
    const newOrder = await storefrontApi.checkout(payload);
    
    // Invalidate cart query to clear it in UI
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    refreshOrders();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f43f5e', '#fb7185', '#38bdf8', '#fbbf24'],
      });
    } catch {}

    navigateTo('order-confirmation', { confirmedOrder: newOrder });
    return newOrder;
  };

  const refreshOrders = async () => {
    const orders = await storefrontApi.getOrders();
    setUserOrders(orders);
  };

  const contextValue = useMemo(() => ({
    currentView,
    viewParams,
    navigateTo,
    publicSettings,
    categories,
    brands,
    isCartOpen,
    setIsCartOpen,
    wishlist,
    toggleWishlist,
    isInWishlist,
    recentlyViewed,
    trackRecentlyViewed,
    quickViewProduct,
    openQuickView,
    closeQuickView,
    filters,
    setFilters,
    resetFilters,
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
    removeSearchHistoryItem,
    isAuthModalOpen,
    setIsAuthModalOpen,
    createCheckoutOrder,
    userOrders,
    refreshOrders,
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyAddToCart,
    notifyWishlist,
    isLoading,
  }), [
    currentView,
    viewParams,
    publicSettings,
    categories,
    brands,
    isCartOpen,
    wishlist,
    recentlyViewed,
    quickViewProduct,
    filters,
    searchHistory,
    isAuthModalOpen,
    userOrders,
    toasts,
    isLoading
  ]);

  return (
    <StorefrontContext.Provider value={contextValue}>
      {children}
    </StorefrontContext.Provider>
  );
};

export const useStorefront = () => {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error('useStorefront must be used within a StorefrontProvider');
  }
  return context;
};
