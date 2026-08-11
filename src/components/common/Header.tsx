import React, { useState, useRef, useEffect } from 'react';
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
  ShieldCheck,
  Truck,
  ArrowRight,
  LogOut,
  Package,
  Layers,
  Tag,
  Loader2,
  Flame,
  HelpCircle,
  Clock,
  Trash2,
  History,
  LayoutGrid,
  Info,
  Mail,
  Box,
  Star
} from 'lucide-react';
import { storefrontApi } from '../../services/storefrontApi';
import { Product } from '../../types/storefront';
import { Badge } from '../ui/Badge';
import { Drawer } from '../ui/Drawer';
import { MegaMenu } from './MegaMenu';
import { AnimatePresence, motion } from 'motion/react';

export const Header: React.FC = () => {
  const { 
    publicSettings, 
    categories, 
    brands,
    setIsCartOpen, 
    wishlist, 
    setIsAuthModalOpen, 
    navigateTo,
    filters,
    setFilters,
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
    removeSearchHistoryItem
  } = useStorefront();

  const { user, logout } = useAuth();

  const { cart, totalItemCount } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchInput, setSearchInput] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState<boolean>(false);
  const [activeNavTab, setActiveNavTab] = useState<string>('Home');
  
  // Search suggestion state
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<{ id?: string; name: string; slug: string }[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search fetching from storefrontApi using GET /api/storefront/v1/search
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
          // Fallback matching categories
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
        navigateTo('product-detail', { productSlug: selected.slug });
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
    if (!query) {
      navigateTo('search', { searchQuery: '' });
      setIsSearchFocused(false);
      return;
    }
    addSearchHistory(query);
    navigateTo('search', { searchQuery: query });
    setIsSearchFocused(false);
  };

  const totalCartCount = (cart.items || []).reduce((sum, item) => sum + item.quantity, 0);

  // Category chips matching search query
  const matchingCategoryChips = searchInput.trim().length >= 2
    ? categories.filter(c => c.name.toLowerCase().includes(searchInput.toLowerCase())).slice(0, 3)
    : [];

  return (
    <AnimatePresence>
      <header className="w-full bg-white border-b border-border-default sticky top-0 z-40 shadow-premium transition-all">
        {/* 1. TOP UTILITY BAR */}
        <div className="bg-white border-b border-border-default py-2.5 hidden lg:block">
          <div className="container-vyzobd flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 group cursor-pointer hover:text-primary transition-colors">
                <PhoneCall size={13} className="text-accent" />
                <span>Customer Support</span>
              </div>
              <div className="flex items-center gap-2 group cursor-pointer hover:text-primary transition-colors">
                <Mail size={13} className="text-accent" />
                <span>{publicSettings?.general.storeEmail || 'support@vyzobd.com'}</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                <span>English</span>
                <ChevronDown size={12} />
              </div>
              <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                <span>{publicSettings?.general.currency || 'BDT'}</span>
                <ChevronDown size={12} />
              </div>
              <div 
                onClick={() => navigateTo(user ? 'account' : 'login')}
                className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer border-l border-slate-200 pl-6 ml-2"
              >
                <User size={13} className="text-accent" />
                <span>{user ? 'My Profile' : 'Sign In'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        {publicSettings?.announcementBanner?.enabled && (
          <div className="bg-primary text-white text-[10px] sm:text-xs py-2 px-4 text-center font-bold tracking-widest uppercase flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-accent" />
            <span>{publicSettings.announcementBanner.text}</span>
            <button 
              onClick={() => navigateTo('deals')}
              className="underline underline-offset-2 font-black hover:text-accent transition-colors ml-1 cursor-pointer"
            >
              {publicSettings.announcementBanner.linkText || 'Explore Now'}
            </button>
          </div>
        )}

        {/* Top Main Header */}
        <div className="container-vyzobd py-4 flex items-center justify-between gap-4 lg:gap-10">
        
        {/* Mobile: Hamburger and Logo (Logo moved for mobile design) */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-primary hover:text-accent rounded-xl hover:bg-surface transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
          
          <div 
            onClick={() => navigateTo('home')} 
            className="cursor-pointer flex items-center group select-none flex-shrink-0"
          >
            <img 
              src="/logo.svg" 
              alt="Vyzobd" 
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden font-display font-black text-xl text-primary tracking-tighter leading-none group-hover:text-accent transition-colors">
              VYZOBD
            </div>
          </div>
        </div>

        {/* Desktop Brand Logo */}
        <div 
          onClick={() => navigateTo('home')} 
          className="hidden lg:flex cursor-pointer items-center group select-none flex-shrink-0"
        >
          <img 
            src="/logo.svg" 
            alt="Vyzobd" 
            className="h-9 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden font-display font-black text-2xl text-primary tracking-tighter leading-none group-hover:text-accent transition-colors ml-2">
            VYZOBD
          </div>
        </div>

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
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  const matchedCat = categories.find(c => c.name === e.target.value);
                  setFilters(prev => ({ ...prev, categorySlug: matchedCat ? matchedCat.slug : null }));
                }}
                className="appearance-none py-3 pl-4 pr-9 text-xs font-bold text-primary bg-transparent cursor-pointer focus:outline-none"
              >
                <option value="All Categories">Catalog</option>
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
                placeholder="Search webcams, headphones, chargers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleKeyDown}
                className="w-full py-3 px-4 text-sm font-medium text-primary placeholder-slate-400 bg-transparent focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="px-6 bg-primary hover:bg-accent text-white transition-colors cursor-pointer min-h-[48px]"
            >
              {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={20} />}
            </button>
          </form>

          {/* Search Autocomplete Dropdown (Existing logic) */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in-50 duration-150">
              
              {/* STATE 1: Empty Query - Show Recent Searches & Categories */}
              {searchInput.trim().length < 2 && (
                <div className="p-4 space-y-4">
                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <History size={14} className="text-primary" />
                          <span>Recent Searches</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => clearSearchHistory()}
                          className="text-[11px] font-semibold text-slate-400 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Clear history</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((term, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-primary-light text-slate-700 hover:text-primary rounded-xl text-xs font-medium border border-slate-200/80 hover:border-primary/20 transition-colors group cursor-pointer"
                          >
                            <span 
                              onClick={() => {
                                setSearchInput(term);
                                addSearchHistory(term);
                                navigateTo('search', { searchQuery: term });
                                setIsSearchFocused(false);
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <Clock size={12} className="text-slate-400 group-hover:text-primary" />
                              <span>{term}</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSearchHistoryItem(term);
                              }}
                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Category Shortcuts */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Popular Categories
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {categories.slice(0, 6).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setFilters(prev => ({ ...prev, categorySlug: cat.slug }));
                            navigateTo('shop');
                            setIsSearchFocused(false);
                          }}
                          className="text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-primary-light text-slate-700 hover:text-primary border border-slate-200/60 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-between"
                        >
                          <span>{cat.name}</span>
                          <ChevronRight size={12} className="text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 2: Active Query - Suggestions */}
              {searchInput.trim().length >= 2 && (
                <>
                  {/* Category Suggestions Chips */}
                  {categorySuggestions.length > 0 && (
                    <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Categories:</span>
                      {categorySuggestions.map((cat) => (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => {
                            navigateTo('search', { searchQuery: `${searchInput}` });
                            setIsSearchFocused(false);
                          }}
                          className="text-xs px-2.5 py-1 rounded-full bg-white hover:bg-primary-light text-slate-700 hover:text-primary border border-slate-200 hover:border-primary/20 font-semibold transition-colors cursor-pointer"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Searching Spinner */}
                  {isSearching && (
                    <div className="p-6 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-primary" />
                      <span>Searching storefront catalog...</span>
                    </div>
                  )}

                  {/* Product Results */}
                  {!isSearching && searchResults.length > 0 && (
                    <div>
                      <div className="px-3.5 py-2 bg-slate-100/50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                        <span>Matching Products</span>
                        <span>Use ↑↓ to navigate • Enter to select</span>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        {searchResults.map((prod, index) => {
                          const isSelected = index === selectedIndex;

                          return (
                            <div
                              key={prod.id}
                              onClick={() => {
                                addSearchHistory(searchInput);
                                navigateTo('product-detail', { productSlug: prod.slug });
                                setIsSearchFocused(false);
                              }}
                              onMouseEnter={() => setSelectedIndex(index)}
                              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                                isSelected ? 'bg-primary/5/80' : 'hover:bg-slate-50'
                              }`}
                            >
                              <img 
                                src={prod.images[0]} 
                                alt={prod.name} 
                                className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-white flex-shrink-0" 
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {prod.name}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span className="font-semibold text-slate-600">{prod.brand}</span>
                                  <span>•</span>
                                  <span className="font-bold text-primary">${prod.price.toFixed(2)}</span>
                                  {prod.compareAtPrice && (
                                    <span className="text-slate-400 line-through text-[10px]">
                                      ${prod.compareAtPrice.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge variant={prod.stock > 0 ? 'success' : 'error'} size="sm">
                                {prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                              <ArrowRight size={14} className="text-slate-300" />
                            </div>
                          );
                        })}
                      </div>
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

                  {/* Empty state */}
                  {!isSearching && searchResults.length === 0 && (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
                        <Search size={20} />
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        No products found matching "{searchInput}"
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Try searching for keywords like "Headphones", "Wireless", "Smartwatch", or "Charger".
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSearchSubmit()}
                        className="mt-3 px-4 py-1.5 bg-primary hover:bg-primary text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        Search all catalog for "{searchInput}"
                      </button>
                    </div>
                  )}
                </>
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
                  navigateTo('login');
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
                  {user ? user.fullName.split(' ')[0] : 'Sign In'}
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
                  <button
                    onClick={() => {
                      navigateTo('account');
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-primary-light rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <User size={15} />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateTo('orders');
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-primary-light rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Package size={15} />
                    <span>Order History</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateTo('wishlist');
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-primary-light rounded-xl transition-colors flex items-center justify-between cursor-pointer"
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
                  </button>
                </div>

                <div className="pt-1 mt-1 border-t border-slate-100">
                  <button
                    onClick={async () => {
                      await logout();
                      setIsAccountMenuOpen(false);
                      navigateTo('home');
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
          <button
            onClick={() => navigateTo('wishlist')}
            className="relative p-2 sm:px-3 sm:py-2 text-primary hover:text-accent hover:bg-surface rounded-2xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
            aria-label="View Wishlist"
          >
            <div className="relative">
              <Heart size={22} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-scale-in shadow-accent">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="hidden xl:inline text-xs font-bold text-primary">
              Wishlist
            </span>
          </button>

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
                ${cart.total.toFixed(2)}
              </div>
            </div>
          </button>
        </div>
      </div>

        {/* Desktop Secondary Navigation Bar */}
        <div className="hidden lg:block bg-surface border-t border-border-default relative" ref={navContainerRef}>
          <div className="container-vyzobd py-0 flex items-center justify-between">
            <nav className="flex items-center">
              {[
                { label: 'Home', view: 'home' },
                { label: 'Shop', view: 'shop' },
                { label: 'Categories', isMega: true },
                { label: 'Brands', view: 'shop' },
                { label: 'Deals', view: 'deals' },
                { label: 'New Arrivals', view: 'shop' },
                { label: 'Blog', view: 'blog' },
                { label: 'About', view: 'cms-page', params: { cmsPageType: 'about' } },
                { label: 'Contact', view: 'cms-page', params: { cmsPageType: 'contact' } },
              ].map((link) => (
                <div key={link.label} className="relative">
                  <button
                    onClick={() => {
                      if (link.isMega) {
                        setIsMegaMenuOpen(!isMegaMenuOpen);
                      } else {
                        navigateTo(link.view as any, link.params as any);
                        setIsMegaMenuOpen(false);
                      }
                      setActiveNavTab(link.label);
                    }}
                    onMouseEnter={() => {
                      if (link.isMega) setIsMegaMenuOpen(true);
                    }}
                    className={`px-5 py-4 text-[13px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                      activeNavTab === link.label 
                        ? 'text-accent border-accent' 
                        : 'text-primary border-transparent hover:text-accent'
                    }`}
                  >
                    {link.label}
                    {link.isMega && <ChevronDown size={14} className={`transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />}
                  </button>
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-6">
               <button 
                onClick={() => navigateTo('deals')}
                className="flex items-center gap-2 text-xs font-black text-accent animate-pulse uppercase tracking-tighter"
              >
                <Zap size={14} />
                <span>Flash Deals ending soon</span>
              </button>
              
              <div className="h-4 w-[1px] bg-border-default" />
              
              <div className="flex items-center gap-4">
                <img src="/navLogo.png" alt="" className="h-5 w-auto opacity-40 grayscale" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precision Engineered</span>
              </div>
            </div>
          </div>

          {/* Mega Menu Dropdown */}
          <AnimatePresence>
            {isMegaMenuOpen && <MegaMenu onClose={() => setIsMegaMenuOpen(false)} />}
          </AnimatePresence>
        </div>

        {/* Mobile Row Search Bar */}
        <div className="lg:hidden px-4 pb-4">
          <form 
            onSubmit={handleSearchSubmit} 
            className="relative flex items-center w-full"
            ref={searchContainerRef}
          >
            <input
              type="text"
              placeholder="What are you looking for?"
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
            
            {/* Mobile Search Suggestions Dropdown */}
            {isSearchFocused && searchInput.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden overflow-y-auto max-h-96">
                 {searchResults.slice(0, 5).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        navigateTo('product-detail', { productSlug: prod.slug });
                        setIsSearchFocused(false);
                      }}
                      className="flex items-center gap-3 p-3 border-b border-slate-50 last:border-0"
                    >
                      <img src={prod.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-primary truncate">{prod.name}</div>
                        <div className="text-[11px] font-bold text-accent">${prod.price}</div>
                      </div>
                    </div>
                 ))}
                 <button 
                  onClick={() => handleSearchSubmit()}
                  className="w-full py-3 bg-surface text-center text-xs font-bold text-primary"
                 >
                   View All Results
                 </button>
              </div>
            )}
          </form>
        </div>

        {/* Responsive Mobile Slide-out Drawer Menu */}
        <Drawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          position="left"
          size="md"
          title={
            <div className="flex items-center gap-2 group">
              <img src="/logo.svg" alt="Vyzobd" className="h-8 w-auto" />
              <span className="font-display font-black text-xl text-primary tracking-tighter uppercase group-hover:text-accent transition-colors">Vyzobd</span>
            </div>
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
          <div className="space-y-8">
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
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigateTo(user ? 'account' : 'login');
                  }}
                  className="flex-1 py-3 px-4 bg-white text-primary font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all"
                >
                  {user ? 'My Dashboard' : 'Sign In / Register'}
                </button>
                {user && (
                   <button
                    onClick={async () => {
                      await logout();
                      setIsMobileMenuOpen(false);
                      navigateTo('home');
                    }}
                    className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                )}
              </div>
              
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl" />
            </div>

            {/* Main Navigation Links */}
            <div className="space-y-1">
              <div className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Explore Store</div>
              {[
                { label: 'Shop Catalog', view: 'shop', icon: LayoutGrid },
                { label: 'Hot Deals', view: 'deals', icon: Zap, isHot: true },
                { label: 'Best Sellers', view: 'shop', icon: Star },
                { label: 'New Arrivals', view: 'shop', icon: Sparkles },
                { label: 'Vyzobd Blog', view: 'blog', icon: Box },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigateTo(item.view as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    item.isHot ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-colors ${
                      item.isHot ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-primary group-hover:bg-white group-hover:shadow-md'
                    }`}>
                      <item.icon size={20} />
                    </div>
                    <span className={`text-sm font-bold ${item.isHot ? 'text-accent' : 'text-primary'}`}>{item.label}</span>
                  </div>
                  <ChevronRight size={18} className={item.isHot ? 'text-accent' : 'text-slate-300'} />
                </button>
              ))}
            </div>

            {/* Product Categories Section */}
            <div>
              <div className="px-4 flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Categories</span>
                <button onClick={() => { navigateTo('shop'); setIsMobileMenuOpen(false); }} className="text-[11px] font-black text-accent uppercase tracking-tighter">View All</button>
              </div>
              <div className="grid grid-cols-2 gap-3 px-1">
                {categories.slice(0, 4).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, categorySlug: cat.slug }));
                      navigateTo('shop');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex flex-col p-3 rounded-2xl bg-surface border border-border-default hover:border-accent transition-all group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-3">
                      <img src={cat.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="text-xs font-bold text-primary truncate">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">{cat.itemCount} Items</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Support & Links */}
            <div className="pt-4 border-t border-border-default">
               <div className="grid grid-cols-2 gap-y-2">
                {[
                  { label: 'About Us', type: 'about' },
                  { label: 'Help & FAQ', view: 'faq' },
                  { label: 'Contact', type: 'contact' },
                  { label: 'Privacy', type: 'privacy' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.view) navigateTo(item.view as any);
                      else navigateTo('cms-page', { cmsPageType: item.type as any });
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left px-4 py-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Drawer>
      </header>
    </AnimatePresence>
  );
};
