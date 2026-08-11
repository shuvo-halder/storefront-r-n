import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { categories, brands, navigateTo, setFilters, currentView } = useStorefront();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', view: 'home' },
    { label: 'Shop Catalog', view: 'shop' },
    { label: 'Deals & Offers', view: 'deals', badge: 'HOT', isHot: true },
    { label: 'Tech Blog', view: 'blog' },
    { label: 'Shipping & FAQ', view: 'cms-page', params: { cmsPageType: 'shipping' } },
    { label: 'Contact Us', view: 'cms-page', params: { cmsPageType: 'contact' } },
  ];

  return (
    <nav className="hidden lg:block bg-slate-900 text-white border-b border-slate-800 relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Category Selector Button & Mega Menu */}
        <div 
          className="relative"
          onMouseEnter={() => setIsCategoryMenuOpen(true)}
          onMouseLeave={() => setIsCategoryMenuOpen(false)}
        >
          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, categorySlug: null }));
              navigateTo('shop');
            }}
            className="flex items-center gap-2.5 py-3.5 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Grid size={16} />
            <span>All Categories</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mega Menu Dropdown */}
          {isCategoryMenuOpen && (
            <div className="absolute top-full left-0 w-[800px] bg-white rounded-b-2xl shadow-2xl border border-slate-200 p-6 z-50 text-slate-800 grid grid-cols-3 gap-6 animate-in fade-in-50 slide-in-from-top-2 duration-150">
              {/* Category Columns */}
              <div className="col-span-2 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Browse Departments</span>
                  <span className="text-rose-600 font-semibold cursor-pointer hover:underline" onClick={() => { navigateTo('shop'); setIsCategoryMenuOpen(false); }}>
                    View All →
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, categorySlug: cat.slug }));
                        navigateTo('shop');
                        setIsCategoryMenuOpen(false);
                      }}
                      className="group p-3 rounded-xl hover:bg-rose-50/70 border border-transparent hover:border-rose-100 transition-all cursor-pointer flex items-start gap-3"
                    >
                      <img 
                        src={cat.image} 
                        alt="" 
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform" 
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {cat.description}
                        </p>
                        <span className="text-[10px] font-semibold text-rose-600 mt-1 inline-block">
                          {cat.itemCount} Products
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Brand Banner side */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider mb-3">
                    <Sparkles size={12} />
                    Featured Spotlight
                  </div>
                  <h3 className="font-extrabold text-base leading-snug">
                    Aura Studio Pro Audio Gear
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Experience lossless LDAC 48dB active noise cancelling with spatial head tracking.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, categorySlug: 'audio-headphones' }));
                    navigateTo('shop');
                    setIsCategoryMenuOpen(false);
                  }}
                  className="mt-4 py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors self-start flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Series</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Main Navigation Links */}
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = currentView === item.view;

            return (
              <button
                key={item.label}
                onClick={() => navigateTo(item.view as any, item.params as any)}
                className={`px-4 py-3.5 text-xs font-semibold transition-colors relative flex items-center gap-1.5 cursor-pointer ${
                  isActive 
                    ? 'text-rose-400 bg-slate-800/80 font-bold' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {item.isHot && <Flame size={14} className="text-rose-500 animate-pulse" />}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-600 text-white uppercase leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Quick Features / Phone */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>2-Year Official Warranty</span>
          </div>
        </div>

      </div>
    </nav>
  );
};
