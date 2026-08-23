'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { SmartImage } from './SmartImage';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useStorefront } from '../../context/StorefrontContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  ChevronDown, 
  ChevronRight,
  Menu, 
  X, 
  Sparkles,
  Zap,
  PhoneCall,
  Mail,
  ArrowRight,
  LogOut,
  Package,
  Loader2,
  LayoutGrid,
  Star,
  ShieldCheck,
  Truck,
  HelpCircle,
  Box
} from 'lucide-react';
import { storefrontApi } from '../../services/storefrontApi';
import { Product } from '../../types/storefront';
import { Badge } from '../ui/Badge';
import { Drawer } from '../ui/Drawer';
import { MegaMenu } from './MegaMenu';
import { motion, AnimatePresence } from 'motion/react';

import { formatPrice } from '../../utils/formatters';

function HeaderContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { 
    publicSettings, 
    categories, 
    setIsCartOpen, 
    wishlist, 
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
    removeSearchHistoryItem
  } = useStorefront();

  const { user, logout } = useAuth();
  const { cart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchInput, setSearchInput] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState<boolean>(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);

  const lastScrollYRef = useRef<number>(0);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Focus mobile search input when opened
  useEffect(() => {
    if (isMobileSearchOpen) {
      const timer = setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMobileSearchOpen]);

  // Header scroll-direction listener (scroll down hides, scroll up shows, top visible)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 15) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollYRef.current + 8) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollYRef.current - 8) {
        setIsHeaderVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset dropdowns on route or searchParam change
  useEffect(() => {
    setIsMegaMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
  }, [pathname, searchParams]);

  // Search suggestion state
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<{ id?: string; name: string; slug: string }[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Sync initial query input from searchParams
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchInput(q);
    }
  }, [searchParams]);

  // Debounced search fetching
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setCategorySuggestions([]);
      setIsSearching(false);
      return;
    }

    let isCurrent = true;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const catSlug = selectedCategory !== 'All Categories'
          ? categories.find(c => c.name === selectedCategory)?.slug
          : undefined;

        const res = await storefrontApi.search({
          q: trimmed,
          category: catSlug,
          pageSize: 5,
        });

        if (!isCurrent) return;

        setSearchResults(res.products || []);
        if (res.suggestions?.categories && res.suggestions.categories.length > 0) {
          setCategorySuggestions(res.suggestions.categories);
        } else {
          const matchedCats = categories.filter(c => c.name.toLowerCase().includes(trimmed.toLowerCase()));
          setCategorySuggestions(matchedCats);
        }
      } catch (err) {
        if (isCurrent) {
          console.error('Failed to fetch search suggestions:', err);
        }
      } finally {
        if (isCurrent) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [searchInput, selectedCategory, categories]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideDesktop = searchContainerRef.current?.contains(target);
      const isInsideMobile = mobileSearchContainerRef.current?.contains(target);
      if (!isInsideDesktop && !isInsideMobile) {
        setIsSearchFocused(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setIsAccountMenuOpen(false);
      }
      if (navContainerRef.current && !navContainerRef.current.contains(target)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for search suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchFocused(false);
      return;
    }

    if (!isSearchFocused) return;

    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        e.preventDefault();
        const selected = searchResults[selectedIndex];
        router.push(`/products/${selected.slug}`);
        setIsSearchFocused(false);
      } else {
        handleSearchSubmit(e);
      }
      return;
    }

    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim();
    let url = `/search${query ? `?q=${encodeURIComponent(query)}` : ''}`;
    
    if (selectedCategory !== 'All Categories') {
      const cat = categories.find(c => c.name === selectedCategory);
      if (cat?.slug) {
        url += `${query ? '&' : '?'}category=${encodeURIComponent(cat.slug)}`;
      }
    }

    if (query) {
      addSearchHistory(query);
    }
    
    router.push(url);
    setIsSearchFocused(false);
  };

  const totalCartCount = (cart?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Primary navigation link active state helpers
  const isNavActive = (path: string, exact: boolean = false) => {
    if (exact) return pathname === path;
    if (path === '/products?deals=true') {
      return pathname === '/products' && searchParams.get('deals') === 'true';
    }
    if (path === '/products?sort=newest') {
      return pathname === '/products' && searchParams.get('sort') === 'newest';
    }
    return pathname.startsWith(path);
  };

  const renderSearchDropdown = () => (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#E5E7EB] z-50 overflow-hidden">
      {searchInput.trim().length < 2 && (
        <div className="p-4 space-y-4">
          {searchHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                <span>Recent Searches</span>
                <button onClick={clearSearchHistory} className="text-[10px] text-[#DC2B53] hover:underline cursor-pointer">Clear All</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((q) => (
                  <span 
                    key={q}
                    onClick={() => {
                      setSearchInput(q);
                      router.push(`/search?q=${encodeURIComponent(q)}`);
                      setIsSearchFocused(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#111827] hover:border-[#DC2B53] hover:text-[#DC2B53] cursor-pointer transition-colors"
                  >
                    <span>{q}</span>
                    <X 
                      size={12} 
                      className="hover:text-red-500 cursor-pointer" 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearchHistoryItem(q);
                      }} 
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Popular Categories</div>
            <div className="grid grid-cols-2 gap-2">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  onClick={() => setIsSearchFocused(false)}
                  className="p-2 rounded-lg bg-[#F9FAFB] hover:bg-[#FDF0F3] hover:text-[#DC2B53] transition-colors text-xs font-medium text-[#111827] flex items-center justify-between border border-transparent hover:border-[#DC2B53]/20"
                >
                  <span className="truncate">{cat.name}</span>
                  <ChevronRight size={14} className="text-[#6B7280] flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {searchInput.trim().length >= 2 && (
        <div>
          {categorySuggestions.length > 0 && (
            <div className="p-3 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase">Categories:</span>
              {categorySuggestions.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  onClick={() => setIsSearchFocused(false)}
                  className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#111827] hover:border-[#DC2B53] hover:text-[#DC2B53] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="divide-y divide-[#E5E7EB] max-h-80 overflow-y-auto">
              {searchResults.map((prod, idx) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    router.push(`/products/${prod.slug}`);
                    setIsSearchFocused(false);
                  }}
                  className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    idx === selectedIndex ? 'bg-[#FDF0F3]' : 'hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <SmartImage 
                      src={prod.images?.[0]} 
                      alt={prod.name} 
                      width={48}
                      height={48}
                      fallbackType="product"
                      fallbackLabel={prod.name}
                      className="w-12 h-12 object-cover rounded-lg border border-[#E5E7EB] flex-shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-[#111827] truncate">{prod.name}</div>
                      <div className="text-xs font-bold text-[#DC2B53] mt-0.5">${prod.price}</div>
                    </div>
                  </div>
                  <Badge variant={prod.stock > 0 ? 'success' : 'error'} size="sm" className="flex-shrink-0">
                    {prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            className="w-full p-3 bg-[#F9FAFB] hover:bg-[#FDF0F3] text-center text-xs font-semibold text-[#DC2B53] border-t border-[#E5E7EB] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="truncate">View all search results for "{searchInput}"</span>
            <ArrowRight size={14} className="flex-shrink-0" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <header className={`w-full bg-white border-b border-border-default sticky top-0 z-40 shadow-premium transition-transform duration-300 ease-in-out ${
        isHeaderVisible || isMobileMenuOpen || isMegaMenuOpen || isAccountMenuOpen || isSearchFocused
          ? 'translate-y-0'
          : '-translate-y-full'
      }`}>
        {/* 1. TOP UTILITY BAR */}
        <div className="bg-white border-b border-[#E5E7EB] py-2 hidden lg:block">
          <div className="container-vyzobd flex items-center justify-between text-xs font-medium text-[#6B7280]">
            <div className="flex items-center gap-6">
              <a 
                href={`tel:${publicSettings?.store?.callOrderNumber || publicSettings?.general?.storePhone || publicSettings?.callOrderNumber || '+8801710634144'}`} 
                className="flex items-center gap-1.5 group cursor-pointer hover:text-[#DC2B53] transition-colors"
                title="Customer Support"
              >
                <PhoneCall size={13} className="text-[#DC2B53]" />
                <span>{publicSettings?.store?.callOrderNumber || publicSettings?.general?.storePhone || publicSettings?.callOrderNumber || '+8801710634144'}</span>
              </a>
              <a href={`mailto:${publicSettings?.general?.storeEmail || 'support@vyzobd.com'}`} className="flex items-center gap-1.5 group cursor-pointer hover:text-[#DC2B53] transition-colors">
                <Mail size={13} className="text-[#DC2B53]" />
                <span>{publicSettings?.general?.storeEmail || 'support@vyzobd.com'}</span>
              </a>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1 hover:text-[#111827] transition-colors cursor-pointer">
                <span>English</span>
                <ChevronDown size={12} />
              </div>
              <div className="flex items-center gap-1 hover:text-[#111827] transition-colors cursor-pointer">
                <span>{publicSettings?.general?.currency || 'BDT'}</span>
                <ChevronDown size={12} />
              </div>
              <Link 
                href={user ? '/account/profile' : '/login'}
                className="flex items-center gap-1.5 hover:text-[#DC2B53] transition-colors cursor-pointer border-l border-[#E5E7EB] pl-5 ml-1"
              >
                <User size={13} className="text-[#DC2B53]" />
                <span>{user ? user.fullName : 'Login / Register'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        {publicSettings?.announcementBanner?.enabled && (
          <div className="bg-[#111827] text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#DC2B53]" />
            <span>{publicSettings.announcementBanner.text}</span>
            <Link 
              href="/products?deals=true"
              className="text-[#DC2B53] font-semibold hover:underline ml-1 cursor-pointer"
            >
              {publicSettings.announcementBanner.linkText || 'Explore Now'}
            </Link>
          </div>
        )}

        {/* 2. MAIN HEADER */}
        <div className="container-vyzobd relative py-2 lg:py-3.5 flex items-center justify-between gap-2 lg:gap-8 min-h-[56px] lg:min-h-[auto] px-2 sm:px-4 lg:px-8">
          
          {/* Mobile Hamburger Menu Button (Far Left) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 text-[#111827] hover:text-[#DC2B53] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center -ml-1 shrink-0 lg:hidden"
            aria-label="Open Menu"
          >
            <Menu size={22} className="stroke-[2.2]" />
          </button>
          
          {/* Centered Brand Logo (Mobile: Absolute Center, Desktop: Flow Position) */}
          <Link 
            href="/" 
            className="max-lg:absolute max-lg:left-1/2 max-lg:top-1/2 max-lg:-translate-x-1/2 max-lg:-translate-y-1/2 flex items-center justify-center group select-none shrink-0 z-10"
          >
            <img 
              src={publicSettings?.branding?.logoUrl || "/logo.svg"} 
              alt={publicSettings?.general?.siteName || "Vyzobd"} 
              className="h-7 sm:h-8 lg:h-9 xl:h-10 w-auto object-contain shrink-0 block max-w-[120px] xs:max-w-[135px] sm:max-w-[155px] lg:max-w-[165px] xl:max-w-[180px]"
            />
          </Link>

          {/* Large Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-2xl lg:max-w-3xl relative" ref={searchContainerRef}>
            <form 
              onSubmit={handleSearchSubmit}
              className="flex items-center w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus-within:border-[#DC2B53] focus-within:ring-1 focus-within:ring-[#DC2B53] focus-within:bg-white transition-colors overflow-hidden"
            >
              {/* Category Selector */}
              <div className="relative border-r border-[#E5E7EB] bg-gray-50 flex-shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none py-2.5 pl-3 pr-8 text-xs font-medium text-[#111827] bg-transparent cursor-pointer focus:outline-none"
                >
                  <option value="All Categories">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Input field */}
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full py-2.5 px-3 text-sm font-normal text-[#111827] placeholder-[#6B7280] bg-transparent focus:outline-none"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="p-1 mr-2 text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="px-5 bg-[#DC2B53] hover:bg-[#C52247] text-white transition-colors cursor-pointer min-h-[42px] flex items-center justify-center shrink-0"
                aria-label="Search"
              >
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={18} />}
              </button>
            </form>

            {/* Search Autocomplete Dropdown (Desktop) */}
            {isSearchFocused && renderSearchDropdown()}
          </div>

          {/* Action Controls: Search, Profile, Cart (Right Aligned) */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 flex-shrink-0 ml-auto lg:ml-0">
            
            {/* Mobile Search Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                if (!isMobileSearchOpen) {
                  setIsSearchFocused(true);
                }
              }}
              className="p-1.5 text-[#111827] hover:text-[#DC2B53] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center lg:hidden"
              aria-label="Search products"
            >
              <Search size={20} />
            </button>

            {/* User Account Button & Dropdown */}
            <div className="relative" ref={accountMenuRef}>
              {/* Mobile Profile Button */}
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    setIsAccountMenuOpen(!isAccountMenuOpen);
                  } else {
                    router.push('/login');
                  }
                }}
                className="p-1.5 text-[#111827] hover:text-[#DC2B53] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center lg:hidden"
                aria-label="Account"
              >
                <User size={20} />
              </button>

              {/* Desktop Profile Button */}
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    setIsAccountMenuOpen(!isAccountMenuOpen);
                  } else {
                    router.push('/login');
                  }
                }}
                className="hidden lg:flex items-center gap-2 p-2 text-[#111827] hover:text-[#DC2B53] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer min-h-[40px]"
              >
                <div className="w-8 h-8 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-[#111827] font-semibold text-xs">
                  {user ? user.fullName.charAt(0).toUpperCase() : <User size={16} />}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-[10px] text-[#6B7280] uppercase font-medium leading-tight">
                    {user ? 'Welcome' : 'Account'}
                  </div>
                  <div className="text-xs font-semibold text-[#111827] leading-tight truncate max-w-[110px]">
                    {user ? user.fullName.split(' ')[0] : 'Sign In'}
                  </div>
                </div>
                {user && <ChevronDown size={13} className="text-[#6B7280] hidden xl:block" />}
              </button>

              {/* Account Dropdown Menu */}
              {user && isAccountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-1.5 z-50">
                  <div className="p-2.5 bg-[#F9FAFB] rounded-lg mb-1 border border-[#E5E7EB]">
                    <div className="text-xs font-bold text-[#111827]">{user.fullName}</div>
                    <div className="text-[11px] text-[#6B7280] truncate">{user.email}</div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/account/profile"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#111827] hover:text-[#DC2B53] hover:bg-[#FDF0F3] rounded-lg transition-colors flex items-center gap-2"
                    >
                      <User size={14} />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/account/orders"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#111827] hover:text-[#DC2B53] hover:bg-[#FDF0F3] rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Package size={14} />
                      <span>Order History</span>
                    </Link>

                    <Link
                      href="/account/wishlist"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#111827] hover:text-[#DC2B53] hover:bg-[#FDF0F3] rounded-lg transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Heart size={14} />
                        <span>Wishlist</span>
                      </div>
                      {wishlist.length > 0 && (
                        <span className="text-[10px] bg-[#DC2B53] text-white font-bold px-1.5 py-0.2 rounded-full">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                  </div>

                  <div className="pt-1 mt-1 border-t border-[#E5E7EB]">
                    <button
                      onClick={async () => {
                        await logout();
                        setIsAccountMenuOpen(false);
                        router.push('/');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Button (Hidden on Mobile, Visible on Desktop) */}
            <Link
              href="/account/wishlist"
              className="hidden lg:flex relative p-2 text-[#111827] hover:text-[#DC2B53] hover:bg-gray-50 rounded-lg transition-colors items-center gap-1.5 min-h-[40px]"
              aria-label="View Wishlist"
            >
              <div className="relative">
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#DC2B53] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-medium text-[#111827]">
                Wishlist
              </span>
            </Link>

            {/* Mobile Shopping Cart Button (Clean Icon with Badge, No Background Pill) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 text-[#111827] hover:text-[#DC2B53] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center relative lg:hidden"
              aria-label="Open Cart"
            >
              <ShoppingCart size={20} />
              {totalCartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#DC2B53] text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-white leading-none">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Desktop Shopping Cart Button (With Red Pill and Price Label) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-[#DC2B53] hover:bg-[#C52247] text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer group min-h-[40px]"
              aria-label="Open Cart"
            >
              <div className="relative">
                <ShoppingCart size={18} />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#111827] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-white/80 uppercase font-medium leading-none">
                  Cart
                </div>
                <div className="text-xs font-bold leading-tight">
                  {formatPrice(cart?.total || 0, publicSettings?.general?.currency || 'BDT', publicSettings?.general?.currencySymbol || '৳')}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. PRIMARY NAVIGATION BAR */}
        <div 
          className="hidden lg:block bg-[#F9FAFB] border-t border-[#E5E7EB] relative" 
          ref={navContainerRef}
          onMouseLeave={() => setIsMegaMenuOpen(false)}
        >
          <div className="container-vyzobd py-0 flex items-center justify-between">
            <nav className="flex items-center">
              <Link
                href="/"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 border-b-2 ${
                  isNavActive('/', true) 
                    ? 'text-[#DC2B53] border-[#DC2B53]' 
                    : 'text-[#111827] border-transparent hover:text-[#DC2B53]'
                }`}
              >
                Home
              </Link>

              <Link
                href="/products"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 border-b-2 ${
                  isNavActive('/products', true) 
                    ? 'text-[#DC2B53] border-[#DC2B53]' 
                    : 'text-[#111827] border-transparent hover:text-[#DC2B53]'
                }`}
              >
                Shop
              </Link>

              <div 
                className="relative"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
              >
                <Link
                  href="/categories"
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 border-b-2 ${
                    isNavActive('/categories') 
                      ? 'text-[#DC2B53] border-[#DC2B53]' 
                      : 'text-[#111827] border-transparent hover:text-[#DC2B53]'
                  }`}
                >
                  <span>Categories</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </Link>
              </div>

              <Link
                href="/brands"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 border-b-2 ${
                  isNavActive('/brands') 
                    ? 'text-[#DC2B53] border-[#DC2B53]' 
                    : 'text-[#111827] border-transparent hover:text-[#DC2B53]'
                }`}
              >
                Brands
              </Link>

              <Link
                href="/products?deals=true"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 border-b-2 ${
                  isNavActive('/products?deals=true') 
                    ? 'text-[#DC2B53] border-[#DC2B53]' 
                    : 'text-[#111827] border-transparent hover:text-[#DC2B53]'
                }`}
              >
                Deals
              </Link>

              <Link
                href="/products?sort=newest"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 border-b-2 ${
                  isNavActive('/products?sort=newest') 
                    ? 'text-[#DC2B53] border-[#DC2B53]' 
                    : 'text-[#111827] border-transparent hover:text-[#DC2B53]'
                }`}
              >
                New Arrivals
              </Link>

              <Link
                href="/blog"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 border-b-2 ${
                  isNavActive('/blog') 
                    ? 'text-[#DC2B53] border-[#DC2B53]' 
                    : 'text-[#111827] border-transparent hover:text-[#DC2B53]'
                }`}
              >
                Blog
              </Link>

              <Link
                href="/pages/about"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 border-b-2 ${
                  isNavActive('/pages/about') 
                    ? 'text-[#DC2B53] border-[#DC2B53]' 
                    : 'text-[#111827] border-transparent hover:text-[#DC2B53]'
                }`}
              >
                About
              </Link>

              <Link
                href="/pages/contact"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 border-b-2 ${
                  isNavActive('/pages/contact') 
                    ? 'text-[#DC2B53] border-[#DC2B53]' 
                    : 'text-[#111827] border-transparent hover:text-[#DC2B53]'
                }`}
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                href="/products?deals=true"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2B53] hover:underline uppercase tracking-wider"
              >
                <Zap size={14} />
                <span>Special Offers</span>
              </Link>
            </div>
          </div>

          {/* Mega Menu Dropdown */}
          <AnimatePresence>
            {isMegaMenuOpen && (
              <div 
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <MegaMenu onClose={() => setIsMegaMenuOpen(false)} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Search Expandable / Overlay UI */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden px-4 pb-3 pt-1 border-t border-[#E5E7EB] bg-white shadow-xs"
            >
              <div ref={mobileSearchContainerRef} className="relative w-full">
                <form 
                  onSubmit={(e) => {
                    handleSearchSubmit(e);
                    setIsMobileSearchOpen(false);
                  }} 
                  className="relative flex items-center w-full"
                >
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    placeholder="Search products, categories..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full py-2 pl-9 pr-16 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:bg-white focus:border-[#DC2B53] focus:ring-1 focus:ring-[#DC2B53] font-normal transition-colors"
                  />
                  <Search size={16} className="absolute left-3 text-[#6B7280] pointer-events-none" />
                  <div className="absolute right-2 flex items-center gap-1">
                    {searchInput && (
                      <button
                        type="button"
                        onClick={() => setSearchInput('')}
                        className="text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer p-1"
                        aria-label="Clear search input"
                      >
                        <X size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileSearchOpen(false);
                        setIsSearchFocused(false);
                      }}
                      className="text-xs font-medium text-[#6B7280] hover:text-[#111827] px-1.5 py-1 rounded cursor-pointer"
                      aria-label="Close search"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {/* Mobile Search Autocomplete Dropdown */}
                {isSearchFocused && renderSearchDropdown()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Slide-out Drawer */}
        <Drawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          position="left"
          size="md"
          title={
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 group min-w-0">
              <img 
                src={publicSettings?.branding?.logoUrl || "/logo.svg"} 
                alt={publicSettings?.general?.siteName || "Vyzobd"} 
                className="h-7 w-auto flex-shrink-0" 
              />
            </Link>
          }
          footer={
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-white border border-[#E5E7EB] hover:border-[#DC2B53] transition-colors group cursor-pointer">
                  <ShieldCheck size={15} className="text-[#111827] group-hover:text-[#DC2B53]" />
                  <span className="text-[11px] font-semibold text-[#6B7280] group-hover:text-[#111827]">Warranty</span>
                </button>
                <button className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-white border border-[#E5E7EB] hover:border-[#DC2B53] transition-colors group cursor-pointer">
                  <Truck size={15} className="text-[#111827] group-hover:text-[#DC2B53]" />
                  <span className="text-[11px] font-semibold text-[#6B7280] group-hover:text-[#111827]">Track Order</span>
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6B7280]">
                <HelpCircle size={13} />
                <span>Support Available 24/7</span>
              </div>
            </div>
          }
        >
          <div className="space-y-4 overflow-x-hidden">
            {/* User Profile Summary */}
            <div className="relative overflow-hidden rounded-xl bg-[#111827] p-3.5 text-white shadow-xs">
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {user ? user.fullName.charAt(0).toUpperCase() : <User size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-xs sm:text-sm leading-tight truncate">
                    {user ? `Hello, ${user.fullName.split(' ')[0]}` : 'Welcome to Vyzobd'}
                  </h3>
                  <p className="text-gray-300 text-[11px] mt-0.5 truncate">
                    {user ? user.email : 'Sign in to manage orders'}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 relative z-10">
                <Link
                  href={user ? '/account/profile' : '/login'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-1.5 px-3 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold text-xs rounded-lg text-center block transition-colors"
                >
                  {user ? 'My Dashboard' : 'Sign In / Register'}
                </Link>
                {user && (
                  <button
                    onClick={async () => {
                      await logout();
                      setIsMobileMenuOpen(false);
                      router.push('/');
                    }}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                    aria-label="Sign out"
                  >
                    <LogOut size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Main Navigation Links */}
            <div className="space-y-0.5">
              <div className="px-2 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Navigation</div>
              {[
                { label: 'Shop All Products', href: '/products', icon: LayoutGrid },
                { label: 'Deals & Offers', href: '/products?deals=true', icon: Zap, isHot: true },
                { label: 'Best Sellers', href: '/products?sort=bestsellers', icon: Star },
                { label: 'New Arrivals', href: '/products?sort=newest', icon: Sparkles },
                { label: 'Brands', href: '/brands', icon: Box },
                { label: 'Blog', href: '/blog', icon: Box },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between py-2 px-2.5 rounded-lg transition-colors group min-h-[40px] ${
                    item.isHot ? 'bg-[#FDF0F3] text-[#DC2B53]' : 'hover:bg-[#F9FAFB] text-[#111827]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-md flex-shrink-0 ${
                      item.isHot ? 'bg-[#DC2B53]/10 text-[#DC2B53]' : 'bg-gray-100 text-[#111827]'
                    }`}>
                      <item.icon size={15} />
                    </div>
                    <span className="text-xs font-semibold truncate">{item.label}</span>
                  </div>
                  <ChevronRight size={15} className={`flex-shrink-0 ${item.isHot ? 'text-[#DC2B53]' : 'text-gray-400'}`} />
                </Link>
              ))}
            </div>

            {/* Product Categories Section */}
            <div>
              <div className="px-2 flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Categories</span>
                <Link 
                  href="/categories" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-xs font-semibold text-[#DC2B53] hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 px-0.5">
                {categories.slice(0, 4).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#DC2B53] transition-colors group min-h-[48px]"
                  >
                    <div className="w-10 h-10 rounded-md overflow-hidden relative flex-shrink-0 bg-gray-100">
                      <SmartImage 
                        src={cat.image} 
                        alt={cat.name} 
                        fill
                        fallbackType="category"
                        fallbackLabel={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[#111827] truncate">{cat.name}</div>
                      <div className="text-[10px] text-[#6B7280]">{cat.itemCount || 0} Items</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Support & Links */}
            <div className="pt-2 border-t border-[#E5E7EB]">
              <div className="grid grid-cols-2 gap-y-0.5">
                {[
                  { label: 'About Us', href: '/pages/about' },
                  { label: 'Help & FAQ', href: '/faq' },
                  { label: 'Contact', href: '/pages/contact' },
                  { label: 'Privacy Policy', href: '/pages/privacy' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-left px-2 py-1 text-xs font-medium text-[#6B7280] hover:text-[#DC2B53] transition-colors block truncate"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Drawer>
      </header>
    </AnimatePresence>
  );
}

export const Header: React.FC = () => {
  return (
    <Suspense fallback={
      <header className="w-full bg-white border-b border-[#E5E7EB] sticky top-0 z-40 py-3.5">
        <div className="container-vyzobd flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-[#111827]">VYZOBD</Link>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  );
};
