import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import { ProductCard } from '../common/ProductCard';
import { Flame, Zap, Clock } from 'lucide-react';

export const DealsPage: React.FC = () => {
  const dealProducts = MOCK_PRODUCTS.filter(p => p.discountPercent || p.isDealOfDay);

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold uppercase">
            <Flame size={14} className="text-amber-400 animate-pulse" />
            Limited-Time Hardware Discounts
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Special Deals & Flash Sale Offers</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Save up to 35% on ANC wireless headphones, titanium smartwatches, and desktop fast chargers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

      </div>
    </div>
  );
};
