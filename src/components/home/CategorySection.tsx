'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { SmartImage } from '../common/SmartImage';
import { useStorefront } from '../../context/StorefrontContext';
import { buildCategoryHierarchy } from '../../utils/categoryHierarchy';
import { ArrowRight, Layers } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const CategorySection: React.FC = () => {
  const { categories, isLoading, navigateTo, setFilters } = useStorefront();

  const handleCategoryClick = (categorySlug: string) => {
    setFilters(prev => ({ ...prev, categorySlug }));
    navigateTo('shop');
  };

  const topCategories = useMemo(() => buildCategoryHierarchy(categories), [categories]);

  // Select 7 random categories dynamically and stably per categories array load
  const displayedCategories = useMemo(() => {
    const sourceList = topCategories.length > 0 ? topCategories : categories;
    if (!sourceList || sourceList.length === 0) return [];
    if (sourceList.length <= 7) return sourceList;

    const copy = [...sourceList];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 7);
  }, [topCategories, categories]);

  if (isLoading) {
    return (
      <section className="container-vyzobd pt-4 sm:pt-6 pb-2 sm:pb-3">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32 rounded-lg bg-slate-200" />
            <Skeleton className="h-6 w-48 rounded-xl bg-slate-200" />
          </div>
          <Skeleton className="h-8 w-32 rounded-xl bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 lg:gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl bg-slate-200" />
          ))}
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="container-vyzobd py-6 text-center text-slate-500 text-xs font-medium">
        No categories available at this time.
      </section>
    );
  }

  return (
    <section className="container-vyzobd pt-4 sm:pt-6 pb-2 sm:pb-3">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 mb-3.5 sm:mb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[#DC2B53] font-semibold text-xs uppercase tracking-wider">
            <Layers size={14} />
            <span>Featured Collections</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
            Shop by Category
          </h2>
        </div>

        <Link
          href="/categories"
          onClick={() => {
            setFilters(prev => ({ ...prev, categorySlug: null }));
          }}
          className="group inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#DC2B53] hover:bg-[#C52247] text-white rounded-lg font-semibold text-xs transition-colors shrink-0 self-start sm:self-auto shadow-2xs min-h-[32px]"
        >
          <span>View All Categories</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Categories Grid - Exactly 7 columns in 1 single row on Desktop (lg:) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 lg:gap-3">
        {displayedCategories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className="group relative overflow-hidden rounded-xl cursor-pointer border border-[#E5E7EB] hover:border-gray-300 transition-colors aspect-[4/3] col-span-1 shadow-2xs"
          >
            {/* Image Layer */}
            <SmartImage 
              src={cat.image} 
              alt={cat.name} 
              fill
              fallbackType="category"
              fallbackLabel={cat.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/90 via-[#111827]/35 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

            {/* Content Layer */}
            <div className="absolute inset-0 p-2 sm:p-2.5 flex flex-col justify-end">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="bg-[#DC2B53]/40 text-white font-semibold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded backdrop-blur-2xs">
                    {cat.itemCount || 0} Items
                  </span>
                </div>
                <h3 className="text-xs sm:text-xs md:text-sm font-bold text-white tracking-tight leading-tight group-hover:text-[#DC2B53] transition-colors line-clamp-1">
                  {cat.name}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};


