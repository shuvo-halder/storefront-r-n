'use client';
import React from 'react';
import { SmartImage } from '../common/SmartImage';
import { RichTextRenderer, hasRichTextContent } from '../common/RichTextRenderer';
import { useQuery } from '@tanstack/react-query';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { Skeleton } from '../ui/Skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const BrandCarousel: React.FC = () => {
  const { setFilters, navigateTo } = useStorefront();

  const { data: brands = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['brands'],
    queryFn: storefrontApi.getBrands
  });

  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1">
            Official Brand Partners
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Top Brands You Know and Trust
          </h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
                <Skeleton className="h-4 w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-6 bg-white border border-rose-200 rounded-2xl text-center space-y-3 max-w-md mx-auto">
            <AlertCircle size={24} className="text-rose-500 mx-auto" />
            <p className="text-xs text-slate-600">Failed to load brand partners: {(error as Error)?.message}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && brands.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-500">
            No partner brands currently listed.
          </div>
        )}

        {/* Brands Grid */}
        {!isLoading && !isError && brands.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => {
                  setFilters(prev => ({ ...prev, brandSlugs: [brand.slug] }));
                  navigateTo('shop');
                }}
                className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:border-rose-300 transition-all duration-300 cursor-pointer flex flex-col items-center text-center justify-between"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden mb-3 flex items-center justify-center group-hover:scale-105 transition-transform relative">
                  <SmartImage 
                    src={brand.logo} 
                    alt={brand.name} 
                    fill
                    fallbackType="brand"
                    fallbackLabel={brand.name}
                    className="w-full h-full object-cover rounded-xl" 
                  />
                </div>

                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-primary transition-colors">
                    {brand.name}
                  </h3>
                  {hasRichTextContent(brand.description) && (
                    <RichTextRenderer
                      content={brand.description}
                      inline
                      className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 [&_p]:inline [&_p]:m-0"
                    />
                  )}
                  <span className="text-[10px] font-semibold text-primary mt-2 inline-block">
                    Explore Brand →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
