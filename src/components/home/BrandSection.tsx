'use client';

import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { Award, ArrowRight } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';

export const BrandSection: React.FC = () => {
  const { brands, isLoading, navigateTo, setFilters } = useStorefront();

  const handleBrandClick = (brandSlug: string) => {
    setFilters(prev => ({ ...prev, brandSlugs: [brandSlug] }));
    navigateTo('shop');
  };

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-6 w-36 mb-6 bg-slate-200" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl bg-slate-200" />
          ))}
        </div>
      </section>
    );
  }

  if (!brands || brands.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-extrabold text-xs uppercase tracking-wider mb-1">
            <Award size={14} />
            <span>Verified Hardware Partners</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Featured Tech Brands
          </h2>
        </div>

        <button
          onClick={() => {
            setFilters(prev => ({ ...prev, brandSlugs: [] }));
            navigateTo('shop');
          }}
          className="text-xs font-bold text-primary hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>View All Brands</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            onClick={() => handleBrandClick(brand.slug)}
            className="group bg-white border border-slate-200/80 hover:border-rose-300 rounded-2xl p-4 text-center transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col items-center justify-between min-h-[110px]"
          >
            <div className="font-black text-slate-800 group-hover:text-primary transition-colors text-sm tracking-tight my-auto">
              {brand.name}
            </div>

            <Badge variant="secondary" size="sm" className="mt-2">
              {brand.itemCount} Items
            </Badge>
          </div>
        ))}
      </div>

    </section>
  );
};
