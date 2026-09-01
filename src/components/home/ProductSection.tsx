'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../types/storefront';
import { ProductCard } from '../common/ProductCard';
import { Skeleton } from '../ui/Skeleton';
import { useStorefront } from '../../context/StorefrontContext';
import { trackGA4ViewItemList } from '../../utils/analytics';
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

  const trackedSectionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoading && displayedProducts.length > 0) {
      const listKey = `${title}_${activeTabId || ''}_${displayedProducts.map(p => p.id).join(',')}`;
      if (trackedSectionRef.current !== listKey) {
        trackedSectionRef.current = listKey;
        const listId = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        trackGA4ViewItemList(listId, title, displayedProducts);
      }
    }
  }, [isLoading, displayedProducts, title, activeTabId]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 lg:pt-5 pb-6 sm:pb-8 lg:pb-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 sm:mb-5">
        <div className="space-y-1">
          {badge && (
            <div className="inline-flex items-center gap-1.5 text-[#DC2B53] font-semibold text-xs uppercase tracking-wider mb-0.5">
              {icon || <Sparkles size={14} />}
              <span>{badge}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#6B7280] max-w-2xl font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Tab Filters or Action Button */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
          {tabs && tabs.length > 0 && (
            <div className="flex items-center gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#E5E7EB]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    activeTabId === tab.id
                      ? 'bg-white text-[#111827] shadow-xs border border-[#E5E7EB]'
                      : 'text-[#6B7280] hover:text-[#111827]'
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
              className="text-xs font-semibold text-[#DC2B53] hover:text-[#C52247] flex items-center gap-1 transition-colors cursor-pointer min-h-[32px] ml-auto md:ml-0"
            >
              <span>{viewAllText}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-3.5">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-2.5 space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg bg-slate-200" />
              <Skeleton className="h-3 w-1/3 rounded-md bg-slate-200" />
              <Skeleton className="h-3.5 w-full rounded-md bg-slate-200" />
              <Skeleton className="h-4 w-1/2 rounded-md bg-slate-200" />
            </div>
          ))}
        </div>
      ) : displayedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-3.5">
          {displayedProducts.map((product, idx) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              itemListId={title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}
              itemListName={title}
              index={idx + 1}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-8 text-center text-[#6B7280]">
          <p className="text-xs font-semibold">No products found in this section.</p>
        </div>
      )}
    </section>
  );
};
