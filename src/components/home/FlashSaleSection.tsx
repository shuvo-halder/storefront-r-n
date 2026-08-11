import React, { useState, useEffect } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import { RatingStars } from '../common/RatingStars';
import { Zap, Clock, ShoppingCart, Heart, ShieldCheck, ArrowRight } from 'lucide-react';

export const FlashSaleSection: React.FC = () => {
  const { addToCart, toggleWishlist, isInWishlist, navigateTo } = useStorefront();

  // Find deal product
  const dealProduct = MOCK_PRODUCTS.find(p => p.isDealOfDay) || MOCK_PRODUCTS[0];
  const inWishlist = isInWishlist(dealProduct.id);

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 42, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-12 bg-slate-900 text-white relative overflow-hidden">
      {/* Light flares */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 rounded-3xl p-6 sm:p-10 border border-slate-700/80 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column Image */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shadow-xl group">
              <img 
                src={dealProduct.images[0]} 
                alt={dealProduct.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-4 left-4 bg-rose-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                <Zap size={14} className="fill-white" />
                <span>SAVE 21% TODAY</span>
              </div>
            </div>
          </div>

          {/* Right Column Info & Timer */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs uppercase tracking-widest">
                <Zap size={16} className="fill-rose-400" />
                <span>DEAL OF THE DAY</span>
              </div>

              {/* Countdown timer blocks */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Clock size={14} /> Ends in:
                </span>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                  <span className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-rose-400">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span>:</span>
                  <span className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-rose-400">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span>:</span>
                  <span className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-rose-400">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                {dealProduct.brand}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {dealProduct.name}
              </h2>
              <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                {dealProduct.description}
              </p>
            </div>

            <RatingStars rating={dealProduct.rating} count={dealProduct.reviewCount} />

            {/* Price & Stock bar */}
            <div className="space-y-3 pt-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-rose-400">
                  ${dealProduct.price.toFixed(2)}
                </span>
                {dealProduct.compareAtPrice && (
                  <span className="text-base font-semibold text-slate-400 line-through">
                    ${dealProduct.compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Hurry! Only {dealProduct.stock} items remaining in stock</span>
                  <span className="text-rose-400 font-mono">78% Claimed</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-rose-600 to-amber-500 rounded-full w-[78%]" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => addToCart(dealProduct.id, 1)}
                className="py-3.5 px-6 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart size={16} />
                <span>Claim Flash Deal Now</span>
              </button>

              <button
                onClick={() => navigateTo('product-detail', { productSlug: dealProduct.slug })}
                className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <span>View Full Product Specs</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
