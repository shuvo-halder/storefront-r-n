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
import { storefrontApi } from '../services/storefrontApi';
import confetti from 'canvas-confetti';

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
  productSlug?: string;
  articleSlug?: string;
  cmsPageType?: 'shipping' | 'returns' | 'privacy' | 'terms' | 'faq' | 'contact' | 'about';
  confirmedOrder?: Order;
  searchQuery?: string;
  orderId?: string;
  method?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
  image?: string;
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
  pageSize: 9,
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
  toggleWishlist: (productId: string) => void;
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

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Global loading
  isLoading: boolean;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

import { useSettings } from './SettingsContext';

export const StorefrontProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings: publicSettings } = useSettings();
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [viewParams, setViewParams] = useState<ViewParams>({});
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vyzobd_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vyzobd_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vyzobd_search_history');
      return saved ? JSON.parse(saved) : ['wireless headphones', 'smartwatch', 'gaming laptop', 'anc earphone'];
    } catch {
      return ['wireless headphones', 'smartwatch', 'gaming laptop', 'anc earphone'];
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

  // Sync hash state with URL
  const navigateTo = (view: AppView, params: ViewParams = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'search' && params.searchQuery) {
      addSearchHistory(params.searchQuery);
    }

    let hash = `#${view}`;
    if (params.productSlug) hash += `?product=${params.productSlug}`;
    else if (params.articleSlug) hash += `?article=${params.articleSlug}`;
    else if (params.cmsPageType) hash += `?page=${params.cmsPageType}`;
    else if (params.searchQuery) hash += `?q=${encodeURIComponent(params.searchQuery)}`;
    
    try {
      window.history.pushState(null, '', hash);
    } catch {}
  };

  // Toast Notification
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [newToast, ...prev].slice(0, 5));

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial Data Load
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [catsData, brandsData, ordersData] = await Promise.all([
          storefrontApi.getCategories(),
          storefrontApi.getBrands(),
          storefrontApi.getOrders(),
        ]);

        setCategories(catsData);
        setBrands(brandsData);
        setUserOrders(ordersData);
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
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('vyzobd_wishlist', JSON.stringify(updated));
      
      addToast({
        title: exists ? 'Removed from Wishlist' : 'Saved to Wishlist',
        type: 'info',
      });
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
  const createCheckoutOrder = async (payload: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
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
