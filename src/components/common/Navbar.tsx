import React, { useState, useRef, useEffect } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { 
  ChevronDown, 
  Grid, 
  Flame, 
  Sparkles, 
  Tag, 
  Layers, 
  BookOpen, 
  Info, 
  Headphones, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkle
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const { categories, brands, navigateTo, setFilters, currentView, viewParams } = useStorefront();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isBrandsMenuOpen, setIsBrandsMenuOpen] = useState(false);

  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const brandTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCategoryMouseEnter = () => {
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    setIsCategoryMenuOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setIsCategoryMenuOpen(false);
    }, 150);
  };

  const handleBrandMouseEnter = () => {
    if (brandTimeoutRef.current) clearTimeout(brandTimeoutRef.current);
    setIsBrandsMenuOpen(true);
  };

  const handleBrandMouseLeave = () => {
    brandTimeoutRef.current = setTimeout(() => {
      setIsBrandsMenuOpen(false);
    }, 150);
  };

  const isAboutActive = currentView === 'cms-page' && viewParams?.cmsPageType === 'about-us';
  const isContactActive = currentView === 'cms-page' && viewParams?.cmsPageType === 'contact-us';

  return (
    <nav className="hidden lg:block bg-secondary text-white border-b border-slate-800 relative z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Dynamic Category Mega Menu Button */}
        <div 
          className="relative"
          onMouseEnter={handleCategoryMouseEnter}
          onMouseLeave={handleCategoryMouseLeave}
        >
          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, categorySlug: null }));
              navigateTo('shop');
            }}
            className="flex items-center gap-2.5 py-3.5 px-5 bg-primary hover:bg-primary-hover text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            <Grid size={16} />
            <span>Browse Categories</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dynamic Mega Menu Dropdown */}
          {isCategoryMenuOpen && (
            <div className="absolute top-full left-0 w-[840px] bg-white rounded-b-2xl shadow-2xl border border-slate-200 p-6 z-50 text-slate-800 grid grid-cols-3 gap-6 animate-in fade-in-50 slide-in-from-top-2 duration-150">
              {/* Dynamic Category Grid */}
              <div className="col-span-2 space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span>Backend Categories ({categories.length})</span>
                  <span 
                    className="text-primary font-bold cursor-pointer hover:underline text-xs flex items-center gap-1" 
                    onClick={() => { navigateTo('shop'); setIsCategoryMenuOpen(false); }}
                  >
                    <span>View All Catalog</span>
                    <ArrowRight size={12} />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, categorySlug: cat.slug }));
                        navigateTo('shop');
                        setIsCategoryMenuOpen(false);
                      }}
                      className="group p-3 rounded-2xl hover:bg-primary/5/70 border border-slate-100 hover:border-primary/20/80 transition-all cursor-pointer flex items-start gap-3 bg-slate-50/50"
                    >
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        loading="lazy"
                        decoding="async"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                            {cat.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {cat.description}
                        </p>
                        <span className="text-[10px] font-extrabold text-primary mt-1 inline-block">
                          {cat.itemCount} Products Available
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Banner side */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 rounded-2xl p-5 text-white flex flex-col justify-between relative overflow-hidden border border-slate-800 shadow-md">
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary-light text-[10px] font-black uppercase tracking-wider border border-primary/30">
                    <Sparkles size={12} />
                    Vyzobd Spotlight
                  </div>
                  <h3 className="font-black text-lg leading-snug tracking-tight">
                    Next-Gen Spatial Audio Series
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    Experience Lossless LDAC audio, 48dB active noise cancellation, and head tracking.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, categorySlug: 'audio-headphones' }));
                    navigateTo('shop');
                    setIsCategoryMenuOpen(false);
                  }}
                  className="mt-6 py-2.5 px-4 bg-primary hover:bg-primary text-white rounded-xl text-xs font-extrabold transition-all self-start flex items-center gap-2 cursor-pointer shadow-sm shadow-primary-hover/50"
                >
                  <span>Explore Audio Catalog</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Primary Navigation Menu Links */}
        <div className="flex items-center space-x-1">
          {/* Home */}
          <button
            onClick={() => navigateTo('home')}
            className={`px-3.5 py-3.5 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              currentView === 'home' 
                ? 'text-primary bg-slate-800/80' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>Home</span>
          </button>

          {/* Shop */}
          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, categorySlug: null, searchQuery: '' }));
              navigateTo('shop');
            }}
            className={`px-3.5 py-3.5 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              currentView === 'shop' && !isAboutActive && !isContactActive
                ? 'text-primary bg-slate-800/80' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>Shop Catalog</span>
          </button>

          {/* Dynamic Brands Dropdown */}
          <div 
            className="relative"
            onMouseEnter={handleBrandMouseEnter}
            onMouseLeave={handleBrandMouseLeave}
          >
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, brandSlugs: [] }));
                navigateTo('shop');
              }}
              className="px-3.5 py-3.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Brands</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isBrandsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isBrandsMenuOpen && brands && brands.length > 0 && (
              <div className="absolute top-full left-0 w-80 bg-white rounded-b-2xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100 flex justify-between items-center">
                  <span>Verified Tech Manufacturers</span>
                  <span className="text-primary font-bold cursor-pointer" onClick={() => { navigateTo('shop'); setIsBrandsMenuOpen(false); }}>
                    All
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, brandSlugs: [brand.slug] }));
                        navigateTo('shop');
                        setIsBrandsMenuOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-primary/5 text-left transition-colors border border-slate-100 hover:border-primary/20 cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-slate-900 group-hover:text-primary truncate">
                        {brand.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        {brand.itemCount} Items
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Deals & Offers (Hot) */}
          <button
            onClick={() => navigateTo('deals')}
            className={`px-3.5 py-3.5 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              currentView === 'deals' 
                ? 'text-primary bg-slate-800/80' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Flame size={14} className="text-primary animate-pulse" />
            <span>Deals & Offers</span>
            <Badge variant="deal" size="sm">HOT</Badge>
          </button>

          {/* New Arrivals */}
          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, sortBy: 'newest' }));
              navigateTo('shop');
            }}
            className="px-3.5 py-3.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>New Arrivals</span>
            <Badge variant="new" size="sm">NEW</Badge>
          </button>

          {/* Tech Blog */}
          <button
            onClick={() => navigateTo('blog')}
            className={`px-3.5 py-3.5 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              currentView === 'blog' || currentView === 'article-detail' 
                ? 'text-primary bg-slate-800/80' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>Tech Blog</span>
          </button>

          {/* About Us */}
          <button
            onClick={() => navigateTo('cms-page', { cmsPageType: 'about-us' })}
            className={`px-3.5 py-3.5 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              isAboutActive 
                ? 'text-primary bg-slate-800/80' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>About Us</span>
          </button>

          {/* Contact */}
          <button
            onClick={() => navigateTo('cms-page', { cmsPageType: 'contact-us' })}
            className={`px-3.5 py-3.5 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              isContactActive 
                ? 'text-primary bg-slate-800/80' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>Contact</span>
          </button>
        </div>

        {/* Right: Warranty & Express Badge */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>2-Year Official Warranty</span>
          </div>
        </div>

      </div>
    </nav>
  );
};
