'use client';

import React, { useState, useRef, useMemo } from 'react';
import { SmartImage } from './SmartImage';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStorefront } from '../../context/StorefrontContext';
import { buildCategoryHierarchy } from '../../utils/categoryHierarchy';
import { 
  ChevronDown, 
  Grid, 
  Flame, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { categories, brands, setFilters } = useStorefront();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isBrandsMenuOpen, setIsBrandsMenuOpen] = useState(false);

  const hierarchyCategories = useMemo(() => buildCategoryHierarchy(categories), [categories]);

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

  const isAboutActive = pathname === '/pages/about' || pathname === '/pages/about-us';
  const isContactActive = pathname === '/pages/contact' || pathname === '/pages/contact-us';

  return (
    <nav className="hidden lg:block bg-secondary text-white border-b border-slate-800 relative z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Dynamic Category Mega Menu Button */}
        <div 
          className="relative"
          onMouseEnter={handleCategoryMouseEnter}
          onMouseLeave={handleCategoryMouseLeave}
        >
          <Link
            href="/categories"
            className="flex items-center gap-2.5 py-3.5 px-5 bg-primary hover:bg-primary-hover text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            <Grid size={16} />
            <span>Browse Categories</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
          </Link>

          {/* Dynamic Mega Menu Dropdown */}
          {isCategoryMenuOpen && (
            <div className="absolute top-full left-0 w-[840px] bg-white rounded-b-2xl shadow-2xl border border-slate-200 p-6 z-50 text-slate-800 grid grid-cols-3 gap-6 animate-in fade-in-50 slide-in-from-top-2 duration-150">
              {/* Dynamic Category Grid */}
              <div className="col-span-2 space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span>Product Categories ({hierarchyCategories.length})</span>
                  <Link 
                    href="/categories"
                    className="text-primary font-bold cursor-pointer hover:underline text-xs flex items-center gap-1" 
                    onClick={() => setIsCategoryMenuOpen(false)}
                  >
                    <span>View All Catalog</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {hierarchyCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setIsCategoryMenuOpen(false)}
                      className="group p-3 rounded-2xl hover:bg-primary/5/70 border border-slate-100 hover:border-primary/20/80 transition-all cursor-pointer flex items-start gap-3 bg-slate-50/50"
                    >
                      <div className="w-12 h-12 rounded-xl border border-slate-200 flex-shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                        <SmartImage 
                          src={cat.image} 
                          alt={cat.name} 
                          fill
                          fallbackType="category"
                          fallbackLabel={cat.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                            {cat.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {cat.subcategories && cat.subcategories.length > 0 
                            ? cat.subcategories.map(s => s.name).join(', ')
                            : (cat.description || 'Explore products in this category')}
                        </p>
                        <span className="text-[10px] font-extrabold text-primary mt-1 inline-block">
                          {cat.subcategories && cat.subcategories.length > 0
                            ? `${cat.subcategories.length} Subcategories`
                            : `${cat.itemCount || 0} Products`}
                        </span>
                      </div>
                    </Link>
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

                <Link
                  href="/categories/audio-headphones"
                  onClick={() => setIsCategoryMenuOpen(false)}
                  className="mt-6 py-2.5 px-4 bg-primary hover:bg-primary text-white rounded-xl text-xs font-extrabold transition-all self-start flex items-center gap-2 cursor-pointer shadow-sm shadow-primary-hover/50"
                >
                  <span>Explore Audio Catalog</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Center: Primary Navigation Menu Links */}
        <div className="flex items-center space-x-1">
          {/* Home */}
          <Link
            href="/"
            className={`px-3.5 py-3.5 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              pathname === '/' 
                ? 'text-primary bg-slate-800/80' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>Home</span>
          </Link>

          {/* Shop */}
          <Link
            href="/products"
            onClick={() => setFilters(prev => ({ ...prev, categorySlug: null, searchQuery: '' }))}
            className={`px-3.5 py-3.5 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              pathname === '/products' && !isAboutActive && !isContactActive
                ? 'text-primary bg-slate-800/80' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>Shop Catalog</span>
          </Link>

          {/* Dynamic Brands Dropdown */}
          <div 
            className="relative"
            onMouseEnter={handleBrandMouseEnter}
            onMouseLeave={handleBrandMouseLeave}
          >
            <Link
              href="/brands"
              className={`px-3.5 py-3.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                pathname.startsWith('/brands') 
                  ? 'text-primary bg-slate-800/80' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>Brands</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isBrandsMenuOpen ? 'rotate-180' : ''}`} />
            </Link>

            {isBrandsMenuOpen && brands && brands.length > 0 && (
              <div className="absolute top-full left-0 w-80 bg-white rounded-b-2xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100 flex justify-between items-center">
                  <span>Verified Tech Manufacturers</span>
                  <Link href="/brands" className="text-primary font-bold cursor-pointer" onClick={() => setIsBrandsMenuOpen(false)}>
                    All
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {brands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/brands/${brand.slug}`}
                      onClick={() => setIsBrandsMenuOpen(false)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-primary/5 text-left transition-colors border border-slate-100 hover:border-primary/20 cursor-pointer group block"
                    >
                      <div className="text-xs font-bold text-slate-900 group-hover:text-primary truncate">
                        {brand.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        {brand.itemCount} Items
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Deals & Offers (Hot) */}
          <Link
            href="/products?deals=true"
            className="px-3.5 py-3.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all relative flex items-center gap-1.5 cursor-pointer"
          >
            <Flame size={14} className="text-primary animate-pulse" />
            <span>Deals & Offers</span>
            <Badge variant="deal" size="sm">HOT</Badge>
          </Link>

          {/* New Arrivals */}
          <Link
            href="/products?sort=newest"
            className="px-3.5 py-3.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>New Arrivals</span>
            <Badge variant="new" size="sm">NEW</Badge>
          </Link>

          {/* Tech Blog */}
          <Link
            href="/blog"
            className={`px-3.5 py-3.5 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              pathname.startsWith('/blog') 
                ? 'text-primary bg-slate-800/80' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>Tech Blog</span>
          </Link>

          {/* About Us */}
          <Link
            href="/pages/about"
            className={`px-3.5 py-3.5 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              isAboutActive 
                ? 'text-primary bg-slate-800/80' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>About Us</span>
          </Link>

          {/* Contact */}
          <Link
            href="/pages/contact"
            className={`px-3.5 py-3.5 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              isContactActive 
                ? 'text-primary bg-slate-800/80' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>Contact</span>
          </Link>
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

