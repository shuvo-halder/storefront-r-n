import React, { useState } from 'react';
import { Product } from '../../types/storefront';
import { ProductCard } from '../common/ProductCard';
import { Skeleton } from '../ui/Skeleton';
import { useStorefront } from '../../context/StorefrontContext';
import { ArrowRight, Sparkles, Flame, Zap } from 'lucide-react';

interface TabOption {
  id: string;
  label: string;
  categorySlug?: string;
}

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  products: Product[];
  isLoading?: boolean;
  viewAllText?: string;
  viewAllAction?: () => void;
  tabs?: TabOption[];
  onTabChange?: (tabId: string) => void;
  activeTabId?: string;
  limit?: number;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  badge,
  icon,
  products,
  isLoading = false,
  viewAllText = 'View All Products',
  viewAllAction,
  tabs,
  onTabChange,
  activeTabId,
  limit = 8,
}) => {
  const displayedProducts = limit ? products.slice(0, limit) : products;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          {badge && (
            <div className="inline-flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-[0.3em] mb-1">
              {icon || <Sparkles size={14} />}
              <span>{badge}</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-5xl font-display font-black text-[#101A25] tracking-tighter uppercase leading-none">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-500 max-w-2xl font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Tab Filters or Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          {tabs && tabs.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTabId === tab.id
                      ? 'bg-white text-primary shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {viewAllAction && (
            <button
              onClick={viewAllAction}
              className="text-xs font-bold text-primary hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{viewAllText}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <Skeleton className="h-48 w-full rounded-xl bg-slate-200" />
              <Skeleton className="h-4 w-1/3 rounded-md bg-slate-200" />
              <Skeleton className="h-5 w-full rounded-md bg-slate-200" />
              <Skeleton className="h-6 w-1/2 rounded-md bg-slate-200" />
            </div>
          ))}
        </div>
      ) : displayedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500">
          <p className="text-sm font-semibold">No products found in this section.</p>
        </div>
      )}
    </section>
  );
};
