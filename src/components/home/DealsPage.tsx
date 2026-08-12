import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { storefrontApi } from '../../services/storefrontApi';
import { ProductCard } from '../common/ProductCard';
import { Flame, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const DealsPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['deals_products'],
    queryFn: async () => {
      const res = await storefrontApi.getProducts();
      return res.products || [];
    }
  });

  const products = data || [];
  const dealProducts = products.filter(p => p.discountPercent || p.compareAtPrice || p.isDealOfDay);
  const displayProducts = dealProducts.length > 0 ? dealProducts : products;

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-rose-300 text-xs font-extrabold uppercase">
            <Flame size={14} className="text-amber-400 animate-pulse" />
            Limited-Time Hardware Discounts
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Special Deals & Flash Sale Offers</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Exclusive discounts and seasonal hardware deals direct from our inventory.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <Skeleton className="w-full aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4 max-w-md mx-auto">
            <AlertCircle size={36} className="text-rose-500 mx-auto" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Failed to load deals</h3>
              <p className="text-xs text-slate-500 mt-1">{(error as Error)?.message || 'Could not connect to backend server.'}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} /> Retry Loading
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && displayProducts.length === 0 && (
          <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-3 max-w-md mx-auto">
            <ShoppingBag size={40} className="text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">No Deals Available Right Now</h3>
            <p className="text-xs text-slate-500">Check back soon for new special offers and price drops.</p>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !isError && displayProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
