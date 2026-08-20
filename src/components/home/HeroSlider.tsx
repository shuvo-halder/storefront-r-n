'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from '../common/SmartImage';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { Sparkles, ArrowRight, ShieldCheck, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 'slide-1',
    badge: 'NEW FLAGSHIP RELEASE',
    title: 'Aura Studio Pro ANC Headphones',
    subtitle: 'Spatial Audio with Real-Time Head Tracking & 65-Hour Battery Life',
    price: '৳35,999',
    comparePrice: '৳45,999',
    discount: 'SAVE 21%',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    productSlug: 'aura-studio-pro-wireless-anc-headphones',
    bgColor: 'from-slate-900 via-slate-800 to-rose-950',
  },
  {
    id: 'slide-2',
    badge: 'AEROSPACE GRADE TITANIUM',
    title: 'Aura Pulse Ultra Smartwatch',
    subtitle: '1.95" LTPO Sapphire AMOLED Display, Multi-Band GPS & Medical ECG',
    price: '৳41,999',
    comparePrice: '৳51,999',
    discount: 'LIMITED EDITION',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
    productSlug: 'aura-pulse-ultra-titanium-smartwatch',
    bgColor: 'from-slate-900 via-rose-950 to-slate-900',
  },
  {
    id: 'slide-3',
    badge: 'GAN IV FAST CHARGING',
    title: 'Aura Boost 100W Charging Hub',
    subtitle: '4-in-1 Official Qi2 15W Magnetic Charger with 100W USB-C PD Power',
    price: '৳10,999',
    comparePrice: '৳14,999',
    discount: 'BEST DESK GEAR',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&auto=format&fit=crop&q=80',
    productSlug: 'aura-boost-100w-gan-magsafe-desktop-station',
    bgColor: 'from-slate-950 via-slate-900 to-primary-hover',
  },
];

export const HeroSlider: React.FC = () => {
  const { navigateTo } = useStorefront();
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[480px] lg:min-h-[540px] flex items-center">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} transition-all duration-700 opacity-90`} />

      {/* Decorative light flares */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column Text Info */}
        <div className="lg:col-span-7 space-y-6 text-left animate-in fade-in slide-in-from-left-4 duration-500">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-rose-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-xs">
            <Sparkles size={14} className="text-amber-300 animate-pulse" />
            <span>{slide.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            {slide.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
            {slide.subtitle}
          </p>

          {/* Pricing & CTA */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-rose-400">
                {slide.price}
              </span>
              <span className="text-base font-semibold text-slate-400 line-through">
                {slide.comparePrice}
              </span>
              <span className="px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-lg uppercase">
                {slide.discount}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigateTo('product-detail', { productSlug: slide.productSlug })}
                className="px-6 py-3.5 bg-primary hover:bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Shop Flagship Deal</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
              <span>2-Year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400 flex-shrink-0" />
              <span>Dispatched in 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-rose-400 flex-shrink-0" />
              <span>Official Genuine</span>
            </div>
          </div>

        </div>

        {/* Right Column Image Stage */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-900 group">
            <SmartImage 
              src={slide.image} 
              alt={slide.title} 
              fill
              fallbackType="banner"
              fallbackLabel={slide.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>
        </div>

      </div>

      {/* Slide Navigation Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, idx) => (
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

    </section>
  );
};
