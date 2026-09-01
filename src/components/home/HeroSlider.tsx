'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from '../common/SmartImage';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { Banner } from '../../types/storefront';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const HeroSlider: React.FC = () => {
  const { navigateTo, setFilters } = useStorefront();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchHeroBanners = async () => {
      try {
        setLoading(true);
        const data = await storefrontApi.getBanners('hero');
        if (isMounted) {
          const active = (data || []).filter(
            b => b.isActive !== false && (b.priority === undefined || b.priority === null || Number(b.priority) !== 99)
          );
          setBanners(active);
        }
      } catch (err) {
        console.error('Failed to load hero slider banners:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHeroBanners();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[480px] lg:min-h-[540px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="h-6 w-36 rounded-full bg-slate-800" />
            <Skeleton className="h-14 w-full rounded-2xl bg-slate-800" />
            <Skeleton className="h-20 w-3/4 rounded-xl bg-slate-800" />
            <Skeleton className="h-12 w-48 rounded-xl bg-slate-800" />
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <Skeleton className="w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl bg-slate-800" />
          </div>
        </div>
      </section>
    );
  }

  if (!banners || banners.length === 0) return null;

  const slide = banners[currentSlide] || banners[0];

  const handleSlideClick = () => {
    if (slide.linkUrl && slide.linkUrl.trim() !== '') {
      const url = slide.linkUrl.trim();
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
    } else if (slide.productSlug) {
      navigateTo('product-detail', { productSlug: slide.productSlug });
    } else if (slide.categorySlug) {
      setFilters(prev => ({ ...prev, categorySlug: slide.categorySlug }));
      navigateTo('shop');
    } else {
      navigateTo('shop');
    }
  };

  const slideBg = slide.bgColor || 'from-slate-900 via-slate-800 to-rose-950';

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[480px] lg:min-h-[540px] flex items-center">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slideBg} transition-all duration-700 opacity-90`} />

      {/* Decorative light flares */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column Text Info */}
        <div className="lg:col-span-7 space-y-6 text-left animate-in fade-in slide-in-from-left-4 duration-500">
          
          {slide.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-rose-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-xs">
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              <span>{slide.badge}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            {slide.title}
          </h1>

          {(slide.subtitle || slide.description) && (
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
              {slide.subtitle || slide.description}
            </p>
          )}

          {/* Pricing & CTA */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            {(slide.price || slide.comparePrice || slide.discount) && (
              <div className="flex items-baseline gap-3">
                {slide.price && (
                  <span className="text-3xl sm:text-4xl font-extrabold text-rose-400">
                    {slide.price}
                  </span>
                )}
                {slide.comparePrice && (
                  <span className="text-base font-semibold text-slate-400 line-through">
                    {slide.comparePrice}
                  </span>
                )}
                {slide.discount && (
                  <span className="px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-lg uppercase">
                    {slide.discount}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleSlideClick}
                className="px-6 py-3.5 bg-primary hover:bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{slide.buttonText || slide.ctaText || 'Shop Now'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
              <span>Verified Authentic</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400 flex-shrink-0" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-rose-400 flex-shrink-0" />
              <span>Direct Support</span>
            </div>
          </div>

        </div>

        {/* Right Column Image Stage */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-900 group">
            <SmartImage 
              src={slide.desktopImage || slide.image} 
              alt={slide.title} 
              fill
              fallbackType="banner"
              fallbackLabel={slide.title}
              objectFit="contain"
              className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>
        </div>

      </div>

      {/* Slide Navigation Controls */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'w-8 bg-primary' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

    </section>
  );
};
