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
    <section className="container-vyzobd py-12 md:py-20">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent font-black text-xs uppercase tracking-widest">
            <Layers size={14} />
            <span>Precision Engineered Collections</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-primary tracking-tighter uppercase leading-none">
            Shop by Category
          </h2>
          <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-lg hidden sm:block">
            Explore our meticulously curated selection of high-performance hardware, designed to elevate your digital experience.
          </p>
        </div>

        <Link
          href="/categories"
          onClick={() => {
            setFilters(prev => ({ ...prev, categorySlug: null }));
          }}
          className="group inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-primary text-white rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-widest transition-all hover:bg-accent hover:shadow-xl active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <span>View All Categories</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Categories Grid - Exactly ONE Visual Row (4 columns across all viewports) */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
        {displayedCategories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-[32px] cursor-pointer shadow-premium hover:shadow-2xl transition-all duration-500 aspect-square sm:aspect-[4/5] col-span-1"
          >
            {/* Image Layer */}
            <SmartImage 
              src={cat.image} 
              alt={cat.name} 
              fill
              fallbackType="category"
              fallbackLabel={cat.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Content Layer */}
            <div className="absolute inset-0 p-2.5 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-end">
              <div className="space-y-1 sm:space-y-2 transform translate-y-2 sm:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center justify-between">
                  <Badge className="bg-accent/20 text-accent border-accent/30 backdrop-blur-md font-black text-[8px] sm:text-[10px] uppercase tracking-widest px-1.5 py-0.5 sm:px-2.5 sm:py-1">
                    {cat.itemCount} Units
                  </Badge>
                </div>
                <h3 className="text-xs sm:text-lg md:text-xl lg:text-2xl font-display font-black text-white uppercase tracking-tight leading-snug sm:leading-none group-hover:text-accent transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-white/60 text-[10px] sm:text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block">
                  {cat.description || 'Explore our latest hardware releases and premium accessories in this category.'}
                </p>
                <div className="pt-0.5 sm:pt-2 flex items-center gap-1 sm:gap-2 text-white font-bold text-[8px] sm:text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                  <span>Explore</span>
                  <ArrowRight size={12} className="text-accent" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};

