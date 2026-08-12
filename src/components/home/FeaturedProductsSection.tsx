import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { ProductCard } from '../common/ProductCard';
import { ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const FeaturedProductsSection: React.FC = () => {
  const { navigateTo, setFilters } = useStorefront();
  const [activeTab, setActiveTab] = useState<string>('all');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['featured_section_products'],
    queryFn: async () => {
      const res = await storefrontApi.getProducts();
      return res.products || [];
    }
  });

  const products = data || [];

  const displayedProducts = activeTab === 'all'
    ? products.slice(0, 8)
    : products.filter(p => p.categoryId === activeTab || p.category.toLowerCase().includes(activeTab.toLowerCase())).slice(0, 8);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Sparkles size={14} />
              Featured Collection
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Flagship Technology & Hardware
            </h2>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <Skeleton className="w-full aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-6 bg-slate-50 border border-rose-200 rounded-2xl text-center space-y-3 max-w-md mx-auto">
            <AlertCircle size={24} className="text-rose-500 mx-auto" />
            <p className="text-xs text-slate-600">Failed to load featured collection: {(error as Error)?.message}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && displayedProducts.length === 0 && (
          <div className="text-center py-10 text-xs text-slate-500">
            No featured products currently available.
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !isError && displayedProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, categorySlug: null }));
              navigateTo('shop');
            }}
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Full Storefront Catalog</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
};
