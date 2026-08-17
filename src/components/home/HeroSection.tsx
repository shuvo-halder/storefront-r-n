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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Main Hero Slider Area */}
        {activeHero && (
          <div className={`${displayedPromos.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} relative rounded-2xl overflow-hidden bg-[#111827] text-white border border-gray-800 shadow-xs flex flex-col justify-between min-h-[380px] sm:min-h-[420px] lg:min-h-[440px] p-5 sm:p-8 group`}>
            
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
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-all duration-700 ease-out" 
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
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-all duration-700 ease-out" 
                />
              </div>
              <div className={`absolute inset-0 bg-gradient-to-r ${activeHero.bgColor || 'from-[#111827] via-[#111827]/80 to-transparent'}`} />
            </div>

            {/* Top Row: Badge & Navigation Arrows */}
            <div className="relative z-10 flex items-center justify-between gap-4">
              {activeHero.badge ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#DC2B53]/20 border border-[#DC2B53]/30 text-white text-xs font-semibold backdrop-blur-xs">
                  <Sparkles size={13} className="text-[#DC2B53]" />
                  {activeHero.badge}
                </span>
              ) : <div />}

              {/* Slide Next/Prev Buttons */}
              {heroBanners.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1))}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-[#DC2B53] text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % heroBanners.length)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-[#DC2B53] text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Next Slide"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Hero Content Body - Bottom-Aligned Composition */}
            <div className="relative z-10 mt-auto pt-6 pb-2 space-y-3 max-w-xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                {activeHero.title}
              </h1>
              
              {(activeHero.subtitle || activeHero.description) && (
                <p className="text-xs sm:text-sm text-gray-200 font-normal leading-relaxed line-clamp-2">
                  {activeHero.subtitle || activeHero.description}
                </p>
              )}

              {/* Price Tag & Discount */}
              {(activeHero.price || activeHero.comparePrice || activeHero.discount) && (
                <div className="flex items-center gap-2.5 pt-0.5">
                  {activeHero.price && (
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      {activeHero.price}
                    </span>
                  )}
                  {activeHero.comparePrice && (
                    <span className="text-xs font-medium text-gray-400 line-through">
                      {activeHero.comparePrice}
                    </span>
                  )}
                  {activeHero.discount && (
                    <span className="px-2 py-0.5 bg-[#DC2B53] text-white text-[11px] font-semibold rounded-md">
                      {activeHero.discount}
                    </span>
                  )}
                </div>
              )}

              {/* CTAs */}
              {heroCtaText && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => handleBannerClick(activeHero)}
                    className="px-5 py-2 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs min-h-[38px]"
                  >
                    <span>{heroCtaText}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Bar: Indicators & Trust Tags */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 mt-2 border-t border-gray-800/80">
              {/* Indicators */}
              {heroBanners.length > 1 ? (
                <div className="flex items-center gap-1.5">
                  {heroBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx ? 'w-5 bg-[#DC2B53]' : 'w-1.5 bg-gray-600 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              ) : <div />}

              {/* Feature Pills */}
              <div className="flex items-center gap-3 text-[11px] font-medium text-gray-300">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  Quality Guarantee
                </span>
                <span className="flex items-center gap-1">
                  <Zap size={13} className="text-amber-400" />
                  Fast Dispatch
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Promo Cards Alongside Hero */}
        {displayedPromos.length > 0 && (
          <div className={`${activeHero ? 'lg:col-span-4' : 'lg:col-span-12'} flex flex-col gap-5`}>
            {displayedPromos.map((promo) => (
              <PromoCard key={promo.id} banner={promo} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
