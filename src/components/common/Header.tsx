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
import { AnimatePresence } from 'motion/react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState<boolean>(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);

  const lastScrollYRef = useRef<number>(0);

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
  }, [pathname, searchParams]);

  // Search suggestion state
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<{ id?: string; name: string; slug: string }[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
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

        setSearchResults(res.products || []);
        if (res.suggestions?.categories && res.suggestions.categories.length > 0) {
          setCategorySuggestions(res.suggestions.categories);
        } else {
          const matchedCats = categories.filter(c => c.name.toLowerCase().includes(trimmed.toLowerCase()));
          setCategorySuggestions(matchedCats);
        }
      } catch (err) {
        console.error('Failed to fetch search suggestions:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput, selectedCategory, categories]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
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

  return (
    <AnimatePresence>
      <header className={`w-full bg-white border-b border-border-default sticky top-0 z-40 shadow-premium transition-transform duration-300 ease-in-out ${
        isHeaderVisible || isMobileMenuOpen || isMegaMenuOpen || isAccountMenuOpen || isSearchFocused
          ? 'translate-y-0'
          : '-translate-y-full'
      }`}>
        {/* 1. TOP UTILITY BAR */}
        <div className="bg-white border-b border-border-default py-2.5 hidden lg:block">
          <div className="container-vyzobd flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-8">
              <a href="tel:+8801700000000" className="flex items-center gap-2 group cursor-pointer hover:text-primary transition-colors">
                <PhoneCall size={13} className="text-accent" />
                <span>Customer Support</span>
              </a>
              <a href={`mailto:${publicSettings?.general?.storeEmail || 'support@vyzobd.com'}`} className="flex items-center gap-2 group cursor-pointer hover:text-primary transition-colors">
                <Mail size={13} className="text-accent" />
                <span>{publicSettings?.general?.storeEmail || 'support@vyzobd.com'}</span>
              </a>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                <span>English</span>
                <ChevronDown size={12} />
              </div>
              <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                <span>{publicSettings?.general?.currency || 'BDT'}</span>
                <ChevronDown size={12} />
              </div>
              <Link 
                href={user ? '/account/profile' : '/login'}
                className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer border-l border-slate-200 pl-6 ml-2"
              >
                <User size={13} className="text-accent" />
                <span>{user ? user.fullName : 'Login / Register'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        {publicSettings?.announcementBanner?.enabled && (
          <div className="bg-primary text-white text-[10px] sm:text-xs py-2 px-4 text-center font-bold tracking-widest uppercase flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-accent" />
            <span>{publicSettings.announcementBanner.text}</span>
            <Link 
              href="/products?deals=true"
              className="underline underline-offset-2 font-black hover:text-accent transition-colors ml-1 cursor-pointer"
            >
              {publicSettings.announcementBanner.linkText || 'Explore Now'}
            </Link>
          </div>
        )}

        {/* 2. MAIN HEADER */}
        <div className="container-vyzobd py-4 flex items-center justify-between gap-4 lg:gap-10">
          
          {/* Mobile: Hamburger and Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-primary hover:text-accent rounded-xl hover:bg-surface transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
            
            <Link href="/" className="flex items-center group select-none flex-shrink-0">
              <img 
                src="/logo.svg" 
                alt="Vyzobd Store" 
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Brand Logo */}
          <Link href="/" className="hidden lg:flex items-center group select-none flex-shrink-0">
            <img 
              src="/logo.svg" 
              alt="Vyzobd Flagship Store" 
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Large Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-2xl relative" ref={searchContainerRef}>
            <form 
              onSubmit={handleSearchSubmit}
              className="flex items-center w-full bg-surface border border-border-default rounded-2xl focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10 focus-within:bg-white transition-all overflow-hidden"
            >
              {/* Category Selector */}
              <div className="relative border-r border-border-default bg-slate-100/50 flex-shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none py-3 pl-4 pr-9 text-xs font-bold text-primary bg-transparent cursor-pointer focus:outline-none"
                >
                  <option value="All Categories">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Input field */}
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  placeholder="Search webcams, headphones, chargers, accessories..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full py-3 px-4 text-sm font-medium text-primary placeholder-slate-400 bg-transparent focus:outline-none"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="p-1 mr-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="px-6 bg-primary hover:bg-accent text-white transition-colors cursor-pointer min-h-[48px] flex items-center justify-center"
                aria-label="Search"
              >
                {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={20} />}
              </button>
            </form>

            {/* Search Autocomplete Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in-50 duration-150">
                {searchInput.trim().length < 2 && (
                  <div className="p-4 space-y-4">
                    {searchHistory.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          <span>Recent Searches</span>
                          <button onClick={clearSearchHistory} className="text-[10px] text-accent hover:underline">Clear All</button>
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
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-accent hover:text-accent cursor-pointer transition-colors"
                            >
                              <span>{q}</span>
                              <X 
                                size={12} 
                                className="hover:text-red-500" 
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
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Popular Categories</div>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.slice(0, 6).map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/categories/${cat.slug}`}
                            onClick={() => setIsSearchFocused(false)}
                            className="p-2 rounded-xl bg-surface hover:bg-primary-light hover:text-primary transition-colors text-xs font-semibold text-slate-700 flex items-center justify-between"
                          >
                            <span>{cat.name}</span>
                            <ChevronRight size={14} className="text-slate-400" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {searchInput.trim().length >= 2 && (
                  <div>
                    {categorySuggestions.length > 0 && (
                      <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Categories:</span>
                        {categorySuggestions.map(cat => (
                          <Link
                            key={cat.slug}
                            href={`/categories/${cat.slug}`}
                            onClick={() => setIsSearchFocused(false)}
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-primary hover:border-accent hover:text-accent transition-colors"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        {searchResults.map((prod, idx) => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              router.push(`/products/${prod.slug}`);
                              setIsSearchFocused(false);
                            }}
                            className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                              idx === selectedIndex ? 'bg-primary-light' : 'hover:bg-slate-50'
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
                                className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0" 
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-slate-900 truncate">{prod.name}</div>
                                <div className="text-xs font-black text-accent mt-0.5">${prod.price}</div>
                              </div>
                            </div>
                            <Badge variant={prod.stock > 0 ? 'success' : 'error'} size="sm">
                              {prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="w-full p-3 bg-slate-50 hover:bg-primary/5 text-center text-xs font-bold text-primary border-t border-slate-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>View all search results for "{searchInput}"</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Controls: User Account, Wishlist, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* User Account Button & Dropdown */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => {
                  if (user) {
                    setIsAccountMenuOpen(!isAccountMenuOpen);
                  } else {
                    router.push('/login');
                  }
                }}
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-primary hover:text-accent hover:bg-surface rounded-2xl transition-all cursor-pointer min-h-[44px]"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-border-default flex items-center justify-center text-primary font-bold text-xs shadow-premium">
                  {user ? user.fullName.charAt(0).toUpperCase() : <User size={18} />}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-[10px] text-slate-400 uppercase font-black leading-tight tracking-wider">
                    {user ? 'Welcome' : 'Account'}
                  </div>
                  <div className="text-xs font-bold text-primary leading-tight truncate max-w-[110px]">
                    {user ? user.fullName.split(' ')[0] : 'Login / Register'}
                  </div>
                </div>
                {user && <ChevronDown size={14} className="text-slate-400 hidden xl:block" />}
              </button>

              {/* Account Dropdown Menu */}
              {user && isAccountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in-50 duration-150">
                  <div className="p-3 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{user.fullName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/account/profile"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-primary-light rounded-xl transition-colors flex items-center gap-2"
                    >
                      <User size={15} />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/account/orders"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-primary-light rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Package size={15} />
                      <span>Order History</span>
                    </Link>

                    <Link
                      href="/account/wishlist"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-primary-light rounded-xl transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Heart size={15} />
                        <span>Wishlist</span>
                      </div>
                      {wishlist.length > 0 && (
                        <span className="text-[10px] bg-primary text-white font-bold px-1.5 py-0.5 rounded-full">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                  </div>

                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={async () => {
                        await logout();
                        setIsAccountMenuOpen(false);
                        router.push('/');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <Link
              href="/account/wishlist"
              className="relative p-2 sm:px-3 sm:py-2 text-primary hover:text-accent hover:bg-surface rounded-2xl transition-all flex items-center gap-2 min-h-[44px]"
              aria-label="View Wishlist"
            >
              <div className="relative">
                <Heart size={22} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-accent">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-bold text-primary">
                Wishlist
              </span>
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-2xl font-bold shadow-accent transition-all cursor-pointer group min-h-[44px]"
              aria-label="Open Cart"
            >
              <div className="relative">
                <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-accent shadow-premium">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[9px] text-white/80 uppercase font-bold tracking-wider leading-none">
                  Cart
                </div>
                <div className="text-xs font-black leading-tight">
                  ${(cart?.total || 0).toFixed(2)}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. PRIMARY NAVIGATION BAR */}
        <div 
          className="hidden lg:block bg-surface border-t border-border-default relative" 
          ref={navContainerRef}
          onMouseLeave={() => setIsMegaMenuOpen(false)}
        >
          <div className="container-vyzobd py-0 flex items-center justify-between">
            <nav className="flex items-center">
              <Link
                href="/"
                className={`px-4 py-3.5 text-[13px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border-b-2 ${
                  isNavActive('/', true) 
                    ? 'text-accent border-accent' 
                    : 'text-primary border-transparent hover:text-accent'
                }`}
              >
                Home
              </Link>

              <Link
                href="/products"
                className={`px-4 py-3.5 text-[13px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border-b-2 ${
                  isNavActive('/products', true) 
                    ? 'text-accent border-accent' 
                    : 'text-primary border-transparent hover:text-accent'
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
                  className={`px-4 py-3.5 text-[13px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border-b-2 ${
                    isNavActive('/categories') 
                      ? 'text-accent border-accent' 
                      : 'text-primary border-transparent hover:text-accent'
                  }`}
                >
                  <span>Categories</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </Link>
              </div>

              <Link
                href="/brands"
                className={`px-4 py-3.5 text-[13px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border-b-2 ${
                  isNavActive('/brands') 
                    ? 'text-accent border-accent' 
                    : 'text-primary border-transparent hover:text-accent'
                }`}
              >
                Brands
              </Link>

              <Link
                href="/products?deals=true"
                className={`px-4 py-3.5 text-[13px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border-b-2 ${
                  isNavActive('/products?deals=true') 
                    ? 'text-accent border-accent' 
                    : 'text-primary border-transparent hover:text-accent'
                }`}
              >
                Deals
              </Link>

              <Link
                href="/products?sort=newest"
                className={`px-4 py-3.5 text-[13px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border-b-2 ${
                  isNavActive('/products?sort=newest') 
                    ? 'text-accent border-accent' 
                    : 'text-primary border-transparent hover:text-accent'
                }`}
              >
                New Arrivals
              </Link>

              <Link
                href="/blog"
                className={`px-4 py-3.5 text-[13px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border-b-2 ${
                  isNavActive('/blog') 
                    ? 'text-accent border-accent' 
                    : 'text-primary border-transparent hover:text-accent'
                }`}
              >
                Blog
              </Link>

              <Link
                href="/pages/about"
                className={`px-4 py-3.5 text-[13px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border-b-2 ${
                  isNavActive('/pages/about') 
                    ? 'text-accent border-accent' 
                    : 'text-primary border-transparent hover:text-accent'
                }`}
              >
                About
              </Link>

              <Link
                href="/pages/contact"
                className={`px-4 py-3.5 text-[13px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border-b-2 ${
                  isNavActive('/pages/contact') 
                    ? 'text-accent border-accent' 
                    : 'text-primary border-transparent hover:text-accent'
                }`}
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-6">
              <Link 
                href="/products?deals=true"
                className="flex items-center gap-2 text-xs font-black text-accent animate-pulse uppercase tracking-tighter"
              >
                <Zap size={14} />
                <span>Flash Deals ending soon</span>
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

        {/* Mobile Search Row */}
        <div className="lg:hidden px-4 pb-4">
          <div ref={searchContainerRef} className="relative w-full">
            <form 
              onSubmit={handleSearchSubmit} 
              className="relative flex items-center w-full"
            >
              <input
                type="text"
                placeholder="Search webcams, headphones, chargers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full py-3 pl-10 pr-10 text-sm bg-surface border border-border-default rounded-2xl focus:outline-none focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 font-medium transition-all"
              />
              <Search size={18} className="absolute left-3.5 text-primary pointer-events-none" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 text-slate-400 hover:text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Mobile Slide-out Drawer */}
        <Drawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          position="left"
          size="md"
          title={
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 group">
              <img src="/logo.svg" alt="Vyzobd" className="h-8 w-auto" />
              <span className="font-display font-black text-xl text-primary tracking-tighter uppercase group-hover:text-accent transition-colors">Vyzobd</span>
            </Link>
          }
          footer={
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface border border-border-default hover:border-accent transition-all group">
                  <ShieldCheck size={20} className="text-primary group-hover:text-accent mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Warranty</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface border border-border-default hover:border-accent transition-all group">
                  <Truck size={20} className="text-primary group-hover:text-accent mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Track</span>
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                <HelpCircle size={14} />
                <span>Support Center Available 24/7</span>
              </div>
            </div>
          }
        >
          <div className="space-y-8 overflow-x-hidden">
            {/* User Profile Summary */}
            <div className="relative overflow-hidden rounded-3xl bg-primary p-6 text-white shadow-xl">
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-black shadow-lg">
                  {user ? user.fullName.charAt(0).toUpperCase() : <User size={28} />}
                </div>
                <div>
                  <h3 className="font-display font-black text-lg leading-tight">
                    {user ? `Hey, ${user.fullName.split(' ')[0]}!` : 'Welcome to Vyzobd'}
                  </h3>
                  <p className="text-white/70 text-xs mt-0.5">
                    {user ? user.email : 'Login for a personalized experience'}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex gap-2 relative z-10">
                <Link
                  href={user ? '/account/profile' : '/login'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-3 px-4 bg-white text-primary font-black text-xs rounded-xl shadow-lg text-center block"
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
                    className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Main Navigation Links */}
            <div className="space-y-1">
              <div className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Explore Store</div>
              {[
                { label: 'Shop Catalog', href: '/products', icon: LayoutGrid },
                { label: 'Hot Deals', href: '/products?deals=true', icon: Zap, isHot: true },
                { label: 'Best Sellers', href: '/products?sort=bestsellers', icon: Star },
                { label: 'New Arrivals', href: '/products?sort=newest', icon: Sparkles },
                { label: 'Brands', href: '/brands', icon: Box },
                { label: 'Vyzobd Blog', href: '/blog', icon: Box },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    item.isHot ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-colors ${
                      item.isHot ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-primary group-hover:bg-white'
                    }`}>
                      <item.icon size={20} />
                    </div>
                    <span className={`text-sm font-bold ${item.isHot ? 'text-accent' : 'text-primary'}`}>{item.label}</span>
                  </div>
                  <ChevronRight size={18} className={item.isHot ? 'text-accent' : 'text-slate-300'} />
                </Link>
              ))}
            </div>

            {/* Product Categories Section */}
            <div>
              <div className="px-4 flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Categories</span>
                <Link 
                  href="/categories" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-[11px] font-black text-accent uppercase tracking-tighter"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 px-1">
                {categories.slice(0, 4).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col p-3 rounded-2xl bg-surface border border-border-default hover:border-accent transition-all group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-3">
                      <SmartImage 
                        src={cat.image} 
                        alt={cat.name} 
                        fill
                        fallbackType="category"
                        fallbackLabel={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <span className="text-xs font-bold text-primary truncate">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">{cat.itemCount || 0} Items</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Support & Links */}
            <div className="pt-4 border-t border-border-default">
              <div className="grid grid-cols-2 gap-y-2">
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
                    className="text-left px-4 py-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors block"
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
      <header className="w-full bg-white border-b border-border-default sticky top-0 z-40 py-4">
        <div className="container-vyzobd flex items-center justify-between">
          <Link href="/" className="font-display font-black text-2xl text-primary uppercase">VYZOBD</Link>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  );
};
