import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  | 'blog' 
  | 'article-detail' 
  | 'cms-page' 
  | 'deals'
  | 'order-confirmation';

export interface ViewParams {
  productSlug?: string;
  articleSlug?: string;
  cmsPageType?: 'shipping' | 'returns' | 'privacy' | 'terms' | 'faq' | 'contact' | 'about';
  confirmedOrder?: Order;
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
  
  // Cart
  cart: Cart;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateCartQuantity: (itemId: string, qty: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  
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
  
  // Auth
  user: UserProfile | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginUser: (email: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  
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

export const StorefrontProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [viewParams, setViewParams] = useState<ViewParams>({});
  
  const [publicSettings, setPublicSettings] = useState<PublicSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    discount: 0,
    shippingFee: 0,
    estimatedTax: 0,
    total: 0,
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('auratech_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('auratech_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_FILTERS);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync hash state with URL
  const navigateTo = (view: AppView, params: ViewParams = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let hash = `#${view}`;
    if (params.productSlug) hash += `?product=${params.productSlug}`;
    else if (params.articleSlug) hash += `?article=${params.articleSlug}`;
    else if (params.cmsPageType) hash += `?page=${params.cmsPageType}`;
    
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
        const [settingsData, catsData, brandsData, cartData, userData, ordersData] = await Promise.all([
          storefrontApi.getPublicSettings(),
          storefrontApi.getCategories(),
          storefrontApi.getBrands(),
          storefrontApi.getCart(),
          storefrontApi.getCurrentUser(),
          storefrontApi.getOrders(),
        ]);

        setPublicSettings(settingsData);
        setCategories(catsData);
        setBrands(brandsData);
        setCart(cartData);
        setUser(userData);
        setUserOrders(ordersData);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // Sync Hash changes from URL bar
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      const [viewStr, queryStr] = hash.split('?');
      if (['home', 'shop', 'product-detail', 'cart', 'checkout', 'account', 'orders', 'blog', 'article-detail', 'cms-page', 'deals'].includes(viewStr)) {
        const params: ViewParams = {};
        if (queryStr) {
          const searchParams = new URLSearchParams(queryStr);
          if (searchParams.get('product')) params.productSlug = searchParams.get('product')!;
          if (searchParams.get('article')) params.articleSlug = searchParams.get('article')!;
          if (searchParams.get('page')) params.cmsPageType = searchParams.get('page') as any;
        }
        setCurrentView(viewStr as AppView);
        setViewParams(params);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Cart actions
  const addToCart = async (productId: string, quantity: number = 1, variantId?: string) => {
    try {
      const updatedCart = await storefrontApi.addToCart(productId, quantity, variantId);
      setCart(updatedCart);
      
      const item = updatedCart.items.find(i => i.productId === productId);
      if (item) {
        addToast({
          title: 'Added to Cart',
          description: `${item.product.name} (x${quantity})`,
          type: 'success',
          image: item.product.images[0],
        });
      }
      setIsCartOpen(true);
    } catch (err: any) {
      addToast({
        title: 'Error adding item',
        description: err.message || 'Could not add product to cart',
        type: 'error',
      });
    }
  };

  const updateCartQuantity = async (itemId: string, qty: number) => {
    try {
      const updatedCart = await storefrontApi.updateCartItem(itemId, qty);
      setCart(updatedCart);
    } catch (err: any) {
      addToast({ title: 'Cart update failed', description: err.message, type: 'error' });
    }
  };

  const removeCartItem = async (itemId: string) => {
    try {
      const updatedCart = await storefrontApi.removeCartItem(itemId);
      setCart(updatedCart);
      addToast({ title: 'Item removed from cart', type: 'info' });
    } catch (err: any) {
      addToast({ title: 'Error removing item', description: err.message, type: 'error' });
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const updatedCart = await storefrontApi.applyCoupon(code);
      setCart(updatedCart);
      addToast({ title: 'Coupon Applied!', description: `Discount code ${code.toUpperCase()} is active`, type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Invalid Coupon', description: err.message, type: 'error' });
      throw err;
    }
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('auratech_wishlist', JSON.stringify(updated));
      
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
      localStorage.setItem('auratech_recently_viewed', JSON.stringify(updated));
      return updated;
    });
  };

  // Quick view
  const openQuickView = (product: Product) => setQuickViewProduct(product);
  const closeQuickView = () => setQuickViewProduct(null);

  // Reset filters
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Auth
  const loginUser = async (email: string) => {
    try {
      const { user: userData } = await storefrontApi.login(email);
      setUser(userData);
      setIsAuthModalOpen(false);
      addToast({ title: 'Welcome back!', description: `Logged in as ${userData.email}`, type: 'success' });
      refreshOrders();
    } catch (err: any) {
      addToast({ title: 'Login failed', description: err.message, type: 'error' });
    }
  };

  const logoutUser = async () => {
    await storefrontApi.logout();
    setUser(null);
    addToast({ title: 'Signed out', description: 'You have been logged out.', type: 'info' });
    navigateTo('home');
  };

  // Checkout
  const createCheckoutOrder = async (payload: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder = await storefrontApi.checkout(payload);
    
    // Refresh cart
    const freshCart = await storefrontApi.getCart();
    setCart(freshCart);
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

  return (
    <StorefrontContext.Provider
      value={{
        currentView,
        viewParams,
        navigateTo,
        publicSettings,
        categories,
        brands,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeCartItem,
        applyCoupon,
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
        user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginUser,
        logoutUser,
        createCheckoutOrder,
        userOrders,
        refreshOrders,
        toasts,
        addToast,
        removeToast,
        isLoading,
      }}
    >
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
