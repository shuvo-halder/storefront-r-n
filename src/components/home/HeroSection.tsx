'use client';

import React, { useState, useEffect } from 'react';
import { Banner } from '../../types/storefront';
import { storefrontApi } from '../../services/storefrontApi';
import { useStorefront } from '../../context/StorefrontContext';
import { PromoCard } from './PromoCard';
import { Sparkles, ArrowRight, ShieldCheck, Zap, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Skeleton, HeroSkeleton } from '../ui/Skeleton';
import { SmartImage } from '../common/SmartImage';

export const HeroSection: React.FC = () => {
  const { navigateTo } = useStorefront();
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

  const fallbackHero: Banner = {
    id: 'fallback-hero',
    title: 'High-Performance Workstation Gear',
    subtitle: 'Explore our latest flagship collection of precision hardware, ergonomic audio gear, and professional desk upgrades.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
    badge: 'FLAGSHIP STORE',
    buttonText: 'Explore Catalog',
    type: 'hero',
  };

  const fallbackPromos: Banner[] = [
    {
      id: 'fallback-promo-1',
      title: 'Pro Desk Setup Gear',
      subtitle: 'Ergonomic monitors & mechanical keyboards.',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      badge: 'POPULAR',
      buttonText: 'Shop Setup',
      type: 'promo',
    },
    {
      id: 'fallback-promo-2',
      title: 'Studio Grade Audio',
      subtitle: 'Noise canceling headsets & USB mics.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      badge: 'SPECIAL SALE',
      buttonText: 'Explore Audio',
      type: 'promo',
    }
  ];

  const activeHero = heroBanners[currentSlide] || heroBanners[0] || fallbackHero;
  const displayedPromos = promoBanners.length > 0 ? promoBanners.slice(0, 2) : fallbackPromos;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Main Hero Slider Area (Desktop: 8 cols, Mobile: 12 cols) */}
        <div className="lg:col-span-8 relative rounded-[40px] overflow-hidden bg-[#101A25] text-white border border-slate-800 shadow-2xl flex flex-col justify-between min-h-[500px] lg:min-h-[560px] p-8 sm:p-14 group">
          
          {/* Dynamic Background Image & Gradients */}
          {activeHero && (
            <div className="absolute inset-0 z-0">
              <SmartImage 
                src={activeHero.image} 
                alt={activeHero.title} 
                priority
                fill
                fallbackType="banner"
                fallbackLabel={activeHero.title}
                className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-all duration-1000 ease-out" 
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${activeHero.bgColor || 'from-[#101A25] via-[#101A25]/80 to-transparent'}`} />
            </div>
          )}

          {/* Top Row: Badge & Navigation Arrows */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            {activeHero?.badge && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-white text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md shadow-lg shadow-accent/10">
                <Sparkles size={14} className="text-accent animate-pulse" />
                {activeHero.badge}
              </span>
            )}

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
          {activeHero && (
            <div className="relative z-10 my-auto space-y-6 max-w-2xl py-8">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-black text-white tracking-tighter leading-[0.95] uppercase">
                {activeHero.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-lg">
                {activeHero.subtitle}
              </p>

              {/* Price Tag & Discount */}
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

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-6">
                <button
                  onClick={() => {
                    if (activeHero.productSlug) {
                      navigateTo('product-detail', { productSlug: activeHero.productSlug });
                    } else {
                      navigateTo('shop');
                    }
                  }}
                  className="px-8 py-4 bg-accent hover:bg-accent/90 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-accent/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3 cursor-pointer"
                >
                  <span>{activeHero.buttonText || 'Shop Flagship Gear'}</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => navigateTo('shop')}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all cursor-pointer backdrop-blur-xl active:scale-95"
                >
                  Explore Catalog
                </button>
              </div>
            </div>
          )}

          {/* Bottom Bar: Indicators & Trust Tags */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
            {/* Indicators */}
            {heroBanners.length > 1 && (
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
            )}

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

        {/* Promo Cards Alongside Hero (Desktop: 4 cols, Mobile: 12 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {displayedPromos.map((promo) => (
            <PromoCard key={promo.id} banner={promo} />
          ))}
        </div>

      </div>
    </section>
  );
};
