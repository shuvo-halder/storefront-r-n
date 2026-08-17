'use client';

import React from 'react';
import Link from 'next/link';
import { SmartImage } from '../common/SmartImage';
import { useStorefront } from '../../context/StorefrontContext';
import { ArrowRight, Layers } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';

export const CategorySection: React.FC = () => {
  const { categories, isLoading, navigateTo, setFilters } = useStorefront();

  const handleCategoryClick = (categorySlug: string) => {
    setFilters(prev => ({ ...prev, categorySlug }));
    navigateTo('shop');
  };

  if (isLoading) {
    return (
      <section className="container-vyzobd py-10 md:py-16">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded-lg bg-slate-200" />
            <Skeleton className="h-8 w-64 rounded-xl bg-slate-200" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl bg-slate-200" />
        </div>
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square sm:aspect-[4/5] w-full rounded-xl sm:rounded-2xl md:rounded-[32px] bg-slate-200" />
          ))}
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="container-vyzobd py-12 text-center text-slate-500 text-xs font-medium">
        No categories available at this time.
      </section>
    );
  }

  // Display top 4 categories in exactly ONE visual row across Desktop, Tablet, and Mobile
  const displayedCategories = categories.slice(0, 4);

  return (
    <section className="container-vyzobd py-8 md:py-10">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 md:mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#DC2B53] font-semibold text-xs uppercase tracking-wider">
            <Layers size={14} />
            <span>Featured Collections</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
            Shop by Category
          </h2>
          <p className="text-[#6B7280] text-sm max-w-lg hidden sm:block">
            Explore our curated selection of quality products and everyday essentials.
          </p>
        </div>

        <Link
          href="/categories"
          onClick={() => {
            setFilters(prev => ({ ...prev, categorySlug: null }));
          }}
          className="group inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[#DC2B53] hover:bg-[#C52247] text-white rounded-lg font-semibold text-xs transition-colors shrink-0 self-start sm:self-auto shadow-xs min-h-[36px]"
        >
          <span>View All Categories</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Categories Grid - Exactly ONE Visual Row (4 columns across all viewports) */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
        {displayedCategories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className="group relative overflow-hidden rounded-xl cursor-pointer border border-[#E5E7EB] hover:border-gray-300 transition-colors aspect-[4/3] sm:aspect-[16/10] col-span-1 shadow-xs"
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/90 via-[#111827]/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

            {/* Content Layer */}
            <div className="absolute inset-0 p-2.5 sm:p-3.5 flex flex-col justify-end">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="bg-[#DC2B53]/30 text-white font-semibold text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                    {cat.itemCount} Items
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight leading-tight group-hover:text-[#DC2B53] transition-colors line-clamp-1">
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

