'use client';

import React, { useState, useEffect } from 'react';
import { Banner } from '../../types/storefront';
import { storefrontApi } from '../../services/storefrontApi';
import { useStorefront } from '../../context/StorefrontContext';
import { PromoCard } from './PromoCard';
import { Sparkles, ArrowRight, ShieldCheck, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroSkeleton } from '../ui/Skeleton';
import { SmartImage } from '../common/SmartImage';

export const HeroSection: React.FC = () => {
  const { navigateTo, setFilters } = useStorefront();
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [promoBanners, setPromoBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const [heroes, promos] = await Promise.all([
          storefrontApi.getBanners('hero'),
          storefrontApi.getBanners('promo')
        ]);
        if (isMounted) {
          setHeroBanners(heroes);
          setPromoBanners(promos);
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBanners();
    return () => { isMounted = false; };
  }, []);

  // Auto-play slide transition for hero banners
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  if (loading) {
    return <HeroSkeleton />;
  }

  const activeHero = heroBanners[currentSlide] || heroBanners[0] || null;
  const displayedPromos = promoBanners.slice(0, 2);

  if (!activeHero && displayedPromos.length === 0) {
    return null;
  }

  const handleBannerClick = (banner: Banner) => {
    if (!banner) return;
    if (banner.linkUrl && banner.linkUrl.trim() !== '') {
      const url = banner.linkUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else if (url.startsWith('/products/')) {
        const slug = url.replace('/products/', '').split('?')[0];
        navigateTo('product-detail', { productSlug: slug });
      } else if (url.startsWith('/categories/')) {
        const slug = url.replace('/categories/', '').split('?')[0];
        setFilters(prev => ({ ...prev, categorySlug: slug }));
        navigateTo('shop');
      } else if (url === '/shop' || url.startsWith('/shop?')) {
        navigateTo('shop');
      } else {
        window.location.href = url;
      }
    } else if (banner.productSlug) {
      navigateTo('product-detail', { productSlug: banner.productSlug });
    } else if (banner.categorySlug) {
      setFilters(prev => ({ ...prev, categorySlug: banner.categorySlug }));
      navigateTo('shop');
    } else {
      navigateTo('shop');
    }
  };

  const heroCtaText = activeHero?.ctaText || activeHero?.buttonText;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Main Hero Slider Area */}
        {activeHero && (
          <div className={`${displayedPromos.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} relative rounded-[40px] overflow-hidden bg-[#101A25] text-white border border-slate-800 shadow-2xl flex flex-col justify-between min-h-[500px] lg:min-h-[560px] p-8 sm:p-14 group`}>
            
            {/* Dynamic Background Image (Desktop & Mobile) */}
            <div className="absolute inset-0 z-0">
              {/* Mobile Image */}
              <div className="block sm:hidden absolute inset-0">
                <SmartImage 
                  src={activeHero.mobileImage || activeHero.desktopImage || activeHero.image} 
                  alt={activeHero.title} 
                  priority
                  fill
                  fallbackType="banner"
                  fallbackLabel={activeHero.title}
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-all duration-1000 ease-out" 
                />
              </div>
              {/* Desktop Image */}
              <div className="hidden sm:block absolute inset-0">
                <SmartImage 
                  src={activeHero.desktopImage || activeHero.image} 
                  alt={activeHero.title} 
                  priority
                  fill
                  fallbackType="banner"
                  fallbackLabel={activeHero.title}
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-all duration-1000 ease-out" 
                />
              </div>
              <div className={`absolute inset-0 bg-gradient-to-r ${activeHero.bgColor || 'from-[#101A25] via-[#101A25]/80 to-transparent'}`} />
            </div>

            {/* Top Row: Badge & Navigation Arrows */}
            <div className="relative z-10 flex items-center justify-between gap-4">
              {activeHero.badge ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-white text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md shadow-lg shadow-accent/10">
                  <Sparkles size={14} className="text-accent animate-pulse" />
                  {activeHero.badge}
                </span>
              ) : <div />}

              {/* Slide Next/Prev Buttons */}
              {heroBanners.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1))}
                    className="w-9 h-9 rounded-full bg-slate-900/80 hover:bg-primary text-white border border-slate-700/80 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % heroBanners.length)}
                    className="w-9 h-9 rounded-full bg-slate-900/80 hover:bg-primary text-white border border-slate-700/80 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                    aria-label="Next Slide"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Hero Content Body */}
            <div className="relative z-10 my-auto space-y-6 max-w-2xl py-8">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-black text-white tracking-tighter leading-[0.95] uppercase">
                {activeHero.title}
              </h1>
              
              {(activeHero.subtitle || activeHero.description) && (
                <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-lg">
                  {activeHero.subtitle || activeHero.description}
                </p>
              )}

              {/* Price Tag & Discount */}
              {(activeHero.price || activeHero.comparePrice || activeHero.discount) && (
                <div className="flex items-center gap-4 pt-2">
                  {activeHero.price && (
                    <span className="text-3xl sm:text-4xl font-display font-black text-white">
                      {activeHero.price}
                    </span>
                  )}
                  {activeHero.comparePrice && (
                    <span className="text-lg font-bold text-slate-500 line-through">
                      {activeHero.comparePrice}
                    </span>
                  )}
                  {activeHero.discount && (
                    <span className="px-3 py-1 bg-accent text-white text-[11px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-accent/20">
                      {activeHero.discount}
                    </span>
                  )}
                </div>
              )}

              {/* CTAs */}
              {heroCtaText && (
                <div className="flex flex-wrap items-center gap-4 pt-6">
                  <button
                    onClick={() => handleBannerClick(activeHero)}
                    className="px-8 py-4 bg-accent hover:bg-accent/90 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-accent/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3 cursor-pointer"
                  >
                    <span>{heroCtaText}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Bar: Indicators & Trust Tags */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
              {/* Indicators */}
              {heroBanners.length > 1 ? (
                <div className="flex items-center gap-2">
                  {heroBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx ? 'w-8 bg-accent' : 'w-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              ) : <div />}

              {/* Feature Pills */}
              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  2-Year Warranty
                </span>
                <span className="flex items-center gap-1">
                  <Zap size={14} className="text-amber-400" />
                  24h Express Shipping
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Promo Cards Alongside Hero */}
        {displayedPromos.length > 0 && (
          <div className={`${activeHero ? 'lg:col-span-4' : 'lg:col-span-12'} flex flex-col gap-6`}>
            {displayedPromos.map((promo) => (
              <PromoCard key={promo.id} banner={promo} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
