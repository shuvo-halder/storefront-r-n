'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Banner } from '../../types/storefront';
import { storefrontApi } from '../../services/storefrontApi';
import { useStorefront } from '../../context/StorefrontContext';
import { Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { HeroSkeleton } from '../ui/Skeleton';
import { SmartImage } from '../common/SmartImage';

export const HeroSection: React.FC = () => {
  const { navigateTo, setFilters } = useStorefront();
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const heroes = await storefrontApi.getBanners('hero');
        if (isMounted) {
          // Strictly exclude priority 99 at the data-selection layer
          const validHeroes = (heroes || []).filter(
            (b) => b.isActive !== false && (b.priority === undefined || b.priority === null || Number(b.priority) !== 99)
          );
          setHeroBanners(validHeroes);
        }
      } catch (err) {
        console.error('Failed to fetch hero banners:', err);
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

  if (!heroBanners || heroBanners.length === 0) {
    return null;
  }

  const activeHero = heroBanners[currentSlide] || heroBanners[0];

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

  const getBannerHref = (banner: Banner): string => {
    if (!banner) return '/shop';
    if (banner.linkUrl && banner.linkUrl.trim() !== '') {
      return banner.linkUrl.trim();
    }
    if (banner.productSlug) {
      return `/products/${banner.productSlug}`;
    }
    if (banner.categorySlug) {
      return `/shop?category=${banner.categorySlug}`;
    }
    return '/shop';
  };

  const bannerHref = getBannerHref(activeHero);
  const isExternal = bannerHref.startsWith('http://') || bannerHref.startsWith('https://') || bannerHref.startsWith('//');

  const bannerContent = (
    <>
      {/* Dynamic Background Image (Mobile & Desktop) - Preserves bright original Cloudinary source */}
      <div className="absolute inset-0 z-0">
        {/* Mobile Image */}
        <div className="block sm:hidden absolute inset-0">
          <SmartImage 
            src={activeHero.mobileImage || activeHero.desktopImage || activeHero.image} 
            alt={activeHero.title || 'Promotional Banner'} 
            priority
            fill
            fallbackType="banner"
            fallbackLabel={activeHero.title || 'Banner'}
            objectFit="cover"
            className="w-full h-full object-cover object-center opacity-100 group-hover:scale-103 transition-transform duration-700 ease-out" 
          />
        </div>
        {/* Desktop Image */}
        <div className="hidden sm:block absolute inset-0">
          <SmartImage 
            src={activeHero.desktopImage || activeHero.image} 
            alt={activeHero.title || 'Promotional Banner'} 
            priority
            fill
            fallbackType="banner"
            fallbackLabel={activeHero.title || 'Banner'}
            objectFit="cover"
            className="w-full h-full object-cover object-center opacity-100 group-hover:scale-103 transition-transform duration-700 ease-out" 
          />
        </div>
        
        {/* Very subtle gradient overlay ONLY for text contrast, leaving 70%+ of image unobstructed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent sm:bg-gradient-to-r sm:from-black/60 sm:via-black/20 sm:to-transparent" />
      </div>

      {/* Top Bar: Badge & Navigation Controls */}
      <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-4">
        {activeHero.badge ? (
          <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/40 border border-white/20 text-white text-[10px] sm:text-xs font-semibold backdrop-blur-md">
            <Sparkles size={11} className="text-[#DC2B53] sm:w-[13px] sm:h-[13px]" />
            {activeHero.badge}
          </span>
        ) : <div />}

        {/* Slide Next/Prev Buttons (Interactive - stops propagation to parent link) */}
        {heroBanners.length > 1 && (
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentSlide((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1));
              }}
              className="w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-[#DC2B53] text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer backdrop-blur-xs"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
              }}
              className="w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-[#DC2B53] text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer backdrop-blur-xs"
              aria-label="Next Slide"
            >
              <ChevronRight size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Hero Content Body (No CTA button - entire card is clickable) */}
      <div className="relative z-10 mt-auto pt-1 sm:pt-6 pb-0.5 sm:pb-2 space-y-0.5 sm:space-y-2 max-w-2xl">
        {activeHero.title && (
          <h1 className="text-sm xs:text-base sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-xs line-clamp-1 sm:line-clamp-2">
            {activeHero.title}
          </h1>
        )}
        
        {(activeHero.subtitle || activeHero.description) && (
          <p className="text-[11px] sm:text-sm md:text-base text-gray-100 font-normal leading-snug sm:leading-relaxed line-clamp-1 sm:line-clamp-2 max-w-xl drop-shadow-xs">
            {activeHero.subtitle || activeHero.description}
          </p>
        )}

        {/* Price Tag & Discount */}
        {(activeHero.price || activeHero.comparePrice || activeHero.discount) && (
          <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5">
            {activeHero.price && (
              <span className="text-xs xs:text-sm sm:text-2xl font-bold text-white drop-shadow-xs">
                {activeHero.price}
              </span>
            )}
            {activeHero.comparePrice && (
              <span className="text-[10px] sm:text-xs font-medium text-gray-300 line-through">
                {activeHero.comparePrice}
              </span>
            )}
            {activeHero.discount && (
              <span className="px-1.5 py-0.5 sm:px-2 bg-[#DC2B53] text-white text-[9px] sm:text-xs font-bold rounded-sm sm:rounded-md">
                {activeHero.discount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar: Slide Indicators & Value Badges */}
      <div className="relative z-10 flex items-center justify-between pt-1 sm:pt-3 mt-0.5 sm:mt-2 border-t border-white/10">
        {heroBanners.length > 1 ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentSlide(idx);
                }}
                className={`h-1 sm:h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-4 sm:w-6 bg-[#DC2B53]' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        ) : <div />}

        <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-gray-200">
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
    </>
  );

  return (
    <section className="w-full px-[1px] sm:px-[2px] py-1.5 sm:py-3 md:py-4">
      {isExternal ? (
        <a
          href={bannerHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleBannerClick(activeHero)}
          aria-label={activeHero.title || 'Promotional Banner'}
          className="relative w-full rounded-[2px] sm:rounded-[3px] overflow-hidden bg-[#111827] text-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between h-[170px] min-h-[170px] max-h-[170px] sm:h-[418px] sm:min-h-[418px] sm:max-h-[418px] p-2.5 xs:p-3 sm:p-8 lg:p-10 group block focus:outline-none focus:ring-2 focus:ring-[#DC2B53] focus:ring-offset-2 transition-shadow"
        >
          {bannerContent}
        </a>
      ) : (
        <Link
          href={bannerHref}
          onClick={() => handleBannerClick(activeHero)}
          aria-label={activeHero.title || 'Promotional Banner'}
          className="relative w-full rounded-[2px] sm:rounded-[3px] overflow-hidden bg-[#111827] text-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between h-[170px] min-h-[170px] max-h-[170px] sm:h-[418px] sm:min-h-[418px] sm:max-h-[418px] p-2.5 xs:p-3 sm:p-8 lg:p-10 group block focus:outline-none focus:ring-2 focus:ring-[#DC2B53] focus:ring-offset-2 transition-shadow"
        >
          {bannerContent}
        </Link>
      )}
    </section>
  );
};
