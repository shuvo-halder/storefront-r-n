'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '../../types/storefront';
import { ProductCard } from '../common/ProductCard';
import { useStorefront } from '../../context/StorefrontContext';
import { Flame, Clock, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface SpecialOfferSectionProps {
  products: Product[];
}

export const SpecialOfferSection: React.FC<SpecialOfferSectionProps> = ({ products }) => {
  const { navigateTo, setFilters } = useStorefront();

  // Deal countdown state (e.g. 14 hours 28 mins 45 secs remaining)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = products.filter(p => p.isDealOfDay || p.discountPercent).slice(0, 6);

  if (dealProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gradient-to-r from-slate-950 via-rose-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-primary-hover/40 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Countdown Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-rose-300 text-xs font-black uppercase tracking-wider border border-primary/30">
              <Flame size={14} className="text-amber-400 animate-bounce" />
              <span>Limited-Time Flash Deals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Today's Heavy Discount Drops
            </h2>
          </div>

          {/* Real-time Countdown Timer */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mr-2">
              <Clock size={16} className="text-rose-400" />
              <span>Offer Ends In:</span>
            </div>

            <div className="flex items-center gap-1.5 text-center">
              <div className="bg-primary text-white px-2.5 py-1.5 rounded-xl min-w-[36px]">
                <span className="font-black text-sm block leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[9px] text-primary/20 uppercase font-semibold">hrs</span>
              </div>
              <span className="font-extrabold text-rose-400">:</span>
              <div className="bg-primary text-white px-2.5 py-1.5 rounded-xl min-w-[36px]">
                <span className="font-black text-sm block leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] text-primary/20 uppercase font-semibold">min</span>
              </div>
              <span className="font-extrabold text-rose-400">:</span>
              <div className="bg-primary text-white px-2.5 py-1.5 rounded-xl min-w-[36px]">
                <span className="font-black text-sm block leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] text-primary/20 uppercase font-semibold">sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-3.5 pt-6 relative z-10">
          {dealProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Deals Footer Button */}
        <div className="mt-8 pt-4 text-center relative z-10 border-t border-slate-800/80">
          <button
            onClick={() => navigateTo('deals')}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <span>View All Flash Sale Hardware Deals</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
};
