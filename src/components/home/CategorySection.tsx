import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { ArrowRight, Layers, Sparkles } from 'lucide-react';
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48 rounded-xl bg-slate-200" />
          <Skeleton className="h-6 w-24 rounded-lg bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl bg-slate-200" />
          ))}
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-500 text-xs">
        No categories available at this time.
      </section>
    );
  }

  return (
    <section className="container-vyzobd py-20">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent font-black text-xs uppercase tracking-widest">
            <Layers size={14} />
            <span>Precision Engineered Collections</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black text-primary tracking-tighter uppercase leading-none">
            Shop by Category
          </h2>
          <p className="text-slate-500 font-medium max-w-lg">
            Explore our meticulously curated selection of high-performance hardware, designed to elevate your digital experience.
          </p>
        </div>

        <button
          onClick={() => {
            setFilters(prev => ({ ...prev, categorySlug: null }));
            navigateTo('shop');
          }}
          className="group flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-accent hover:shadow-xl active:scale-95"
        >
          <span>View All Collections</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Categories Grid - Editorial Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.slice(0, 8).map((cat, idx) => (
          <div
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className={`group relative overflow-hidden rounded-[32px] cursor-pointer shadow-premium hover:shadow-2xl transition-all duration-500 ${
              idx % 5 === 0 ? 'lg:col-span-2 aspect-video lg:aspect-auto' : 'aspect-square'
            }`}
          >
            {/* Image Layer */}
            <img 
              src={cat.image} 
              alt={cat.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Content Layer */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div className="space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center justify-between">
                  <Badge className="bg-accent/20 text-accent border-accent/30 backdrop-blur-md font-black text-[10px] uppercase tracking-widest px-2.5 py-1">
                    {cat.itemCount} Units
                  </Badge>
                </div>
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight leading-none group-hover:text-accent transition-colors">
                  {cat.name}
                </h3>
                <p className="text-white/60 text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {cat.description || 'Explore our latest hardware releases and premium accessories in this category.'}
                </p>
                <div className="pt-2 flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                  <span>Explore Collection</span>
                  <ArrowRight size={14} className="text-accent" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
