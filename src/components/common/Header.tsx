import React, { useState, useRef, useEffect } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  ChevronDown, 
  Menu, 
  X, 
  Sparkles,
  Zap,
  PhoneCall,
  ShieldCheck,
  Truck,
  ArrowRight
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/mockProducts';

export const Header: React.FC = () => {
  const { 
    publicSettings, 
    categories, 
    cart, 
    setIsCartOpen, 
    wishlist, 
    user, 
    setIsAuthModalOpen, 
    navigateTo,
    filters,
    setFilters
  } = useStorefront();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchInput, setSearchInput] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live auto-complete search results
  const searchSuggestions = searchInput.trim().length >= 2 
    ? MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(searchInput.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.category.toLowerCase().includes(searchInput.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, searchQuery: searchInput }));
    navigateTo('shop');
    setIsSearchFocused(false);
  };

  const totalCartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Announcement Banner */}
      {publicSettings?.announcementBanner?.enabled && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-200" />
          <span>{publicSettings.announcementBanner.text}</span>
          <button 
            onClick={() => navigateTo('deals')}
            className="underline underline-offset-2 font-semibold hover:text-amber-200 transition-colors ml-1 cursor-pointer"
          >
            {publicSettings.announcementBanner.linkText || 'Shop Now'} →
          </button>
        </div>
      )}

      {/* Top Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 text-slate-700 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open Mobile Menu"
        >
          <Menu size={24} />
        </button>

        {/* Brand Logo */}
        <div 
          onClick={() => navigateTo('home')} 
          className="cursor-pointer flex items-center gap-2.5 group select-none flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white font-black text-xl tracking-tight shadow-sm shadow-rose-200 group-hover:bg-rose-700 transition-all transform group-hover:scale-105">
            A
          </div>
          <div>
            <div className="font-extrabold text-xl text-slate-900 tracking-tight leading-none group-hover:text-rose-600 transition-colors">
              AURA<span className="text-rose-600">TECH</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase leading-none mt-0.5">
              Next-Gen Electronics
            </div>
          </div>
        </div>

        {/* Large Search Bar with Category Selector (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-2xl relative" ref={searchContainerRef}>
          <form 
            onSubmit={handleSearchSubmit}
            className="flex items-center w-full bg-slate-50 border border-slate-300 rounded-xl focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:bg-white transition-all overflow-hidden"
          >
            {/* Category Selector Dropdown */}
            <div className="relative border-r border-slate-200 bg-slate-100/70 hover:bg-slate-100">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  const matchedCat = categories.find(c => c.name === e.target.value);
                  setFilters(prev => ({ ...prev, categorySlug: matchedCat ? matchedCat.slug : null }));
                }}
                className="appearance-none py-2.5 pl-3.5 pr-8 text-xs font-semibold text-slate-700 bg-transparent cursor-pointer focus:outline-none"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Input field */}
            <input
              type="text"
              placeholder="Search 4K webcams, ANC headphones, GaN chargers..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs flex items-center justify-center transition-colors cursor-pointer"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Search Autocomplete Suggestions Dropdown */}
          {isSearchFocused && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in-50 duration-150">
              <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Matching Products
              </div>
              <div className="divide-y divide-slate-100">
                {searchSuggestions.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      navigateTo('product-detail', { productSlug: prod.slug });
                      setIsSearchFocused(false);
                      setSearchInput('');
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-rose-50/50 cursor-pointer transition-colors"
                  >
                    <img 
                      src={prod.images[0]} 
                      alt="" 
                      className="w-11 h-11 object-cover rounded-lg border border-slate-200 bg-slate-50" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{prod.brand}</span>
                        <span>•</span>
                        <span className="font-bold text-rose-600">${prod.price}</span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls: User, Wishlist, Cart */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* User Account */}
          <button
            onClick={() => user ? navigateTo('account') : setIsAuthModalOpen(true)}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <User size={18} />
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-[10px] text-slate-400 uppercase font-semibold leading-tight">
                {user ? 'Welcome back' : 'Account'}
              </div>
              <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                {user ? user.fullName.split(' ')[0] : 'Sign In'}
              </div>
            </div>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => navigateTo('shop')}
            className="relative p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            aria-label="Wishlist"
          >
            <div className="relative">
              <Heart size={22} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="hidden xl:inline text-xs font-semibold text-slate-700">
              Wishlist
            </span>
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="relative">
              <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-rose-600">
                  {totalCartCount}
                </span>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[9px] text-rose-100 uppercase font-medium leading-none">
                My Cart
              </div>
              <div className="text-xs font-bold leading-tight">
                ${cart.subtotal.toFixed(2)}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Input Row */}
      <div className="lg:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
          <input
            type="text"
            placeholder="Search headphones, keyboards, power banks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full py-2 pl-9 pr-4 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-rose-500"
          />
          <Search size={16} className="absolute left-3 text-slate-400" />
        </form>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="font-extrabold text-lg text-slate-900">
                AURA<span className="text-rose-600">TECH</span> Menu
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Navigation
                </div>
                <div className="space-y-1">
                  {[
                    { label: 'Home', view: 'home' },
                    { label: 'All Products / Shop', view: 'shop' },
                    { label: 'Special Offers & Deals', view: 'deals' },
                    { label: 'Tech Blog', view: 'blog' },
                    { label: 'Order History', view: 'orders' },
                    { label: 'My Account', view: 'account' },
                  ].map((nav) => (
                    <button
                      key={nav.label}
                      onClick={() => {
                        navigateTo(nav.view as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2 px-3 text-sm font-semibold text-slate-800 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      {nav.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Categories
                </div>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, categorySlug: cat.slug }));
                        navigateTo('shop');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2 px-3 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">
                        {cat.itemCount}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-center">
              Need help? Call {publicSettings?.supportPhone}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
