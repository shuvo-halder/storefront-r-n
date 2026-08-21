'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useStorefront } from '../../context/StorefrontContext';
import { ChevronRight, ArrowRight, Layers } from 'lucide-react';
import { buildCategoryHierarchy } from '../../utils/categoryHierarchy';

interface MegaMenuProps {
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ onClose }) => {
  const { categories, isLoading } = useStorefront();

  // Dynamically process and filter categories into a clean text hierarchy
  const menuCategories = useMemo(() => {
    return buildCategoryHierarchy(categories);
  }, [categories]);

  // Compute dynamic column layout based on the number of active main categories
  const getGridColsClass = (count: number) => {
    if (count <= 1) return 'grid-cols-1 max-w-md';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-2xl';
    if (count === 3) return 'grid-cols-1 md:grid-cols-3 max-w-4xl';
    if (count === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-[#E5E7EB] z-50 overflow-hidden"
    >
      <div className="container-vyzobd py-7">
        
        {/* Top Header Bar inside Mega Menu */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-[#FDF0F3] text-[#DC2B53]">
              <Layers size={16} />
            </span>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#111827]">
              Product Categories
            </h2>
          </div>
          <Link
            href="/categories"
            onClick={onClose}
            className="text-xs font-bold text-[#DC2B53] hover:text-[#C52247] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Explore All Catalog</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Content Area: Dynamic Hierarchy */}
        {isLoading ? (
          /* Professional Loading Skeletons */
          <div className="py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3.5">
                <div className="h-5 bg-gray-100 rounded-md w-3/4"></div>
                <div className="space-y-2.5 pt-2">
                  <div className="h-3.5 bg-gray-100 rounded w-full"></div>
                  <div className="h-3.5 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-3.5 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : menuCategories.length === 0 ? (
          /* Graceful Fallback if empty */
          <div className="py-8 text-center text-[#6B7280] space-y-3">
            <p className="text-sm font-medium">Browse our full range of product categories</p>
            <Link
              href="/categories"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#DC2B53] text-white text-xs font-bold rounded-lg hover:bg-[#C52247] transition-colors cursor-pointer"
            >
              <span>View All Categories</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* Dynamic Hierarchy Grid */
          <div className={`grid gap-8 ${getGridColsClass(menuCategories.length)}`}>
            {menuCategories.map((mainCategory) => {
              const subcategories = mainCategory.subcategories || [];
              const visibleSubcategories = subcategories.slice(0, 5);
              const remainingCount = subcategories.length - visibleSubcategories.length;

              return (
                <div key={mainCategory.id} className="space-y-3.5">
                  {/* Main Category Header Link */}
                  <div className="pb-2 border-b-2 border-[#111827] flex items-center justify-between group">
                    <Link
                      href={`/categories/${mainCategory.slug}`}
                      onClick={onClose}
                      className="text-sm font-bold text-[#111827] group-hover:text-[#DC2B53] uppercase tracking-wide transition-colors truncate cursor-pointer"
                    >
                      {mainCategory.name}
                    </Link>
                    <Link
                      href={`/categories/${mainCategory.slug}`}
                      onClick={onClose}
                      className="text-[#6B7280] group-hover:text-[#DC2B53] transition-colors shrink-0 ml-1 cursor-pointer"
                      aria-label={`View ${mainCategory.name}`}
                    >
                      <ChevronRight size={15} />
                    </Link>
                  </div>

                  {/* Subcategories List */}
                  <ul className="space-y-2">
                    {visibleSubcategories.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={`/categories/${sub.slug}`}
                          onClick={onClose}
                          className="text-xs sm:text-sm text-[#4B5563] hover:text-[#DC2B53] font-medium transition-colors flex items-center justify-between w-full group py-0.5 cursor-pointer"
                        >
                          <span className="truncate group-hover:translate-x-0.5 transition-transform duration-150">
                            {sub.name}
                          </span>
                          <ChevronRight
                            size={13}
                            className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-[#DC2B53] shrink-0 ml-1"
                          />
                        </Link>
                      </li>
                    ))}

                    {/* View All Subcategories link if count exceeds 5 */}
                    {remainingCount > 0 && (
                      <li className="pt-1">
                        <Link
                          href={`/categories/${mainCategory.slug}`}
                          onClick={onClose}
                          className="text-xs text-[#DC2B53] font-bold hover:underline inline-flex items-center gap-1 group cursor-pointer"
                        >
                          <span>View all ({subcategories.length})</span>
                          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Quick Access Bar */}
        <div className="mt-8 pt-5 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider">
              Quick Links:
            </span>
            {[
              { label: 'New Arrivals', href: '/products?sort=newest' },
              { label: 'Best Sellers', href: '/products?sort=bestsellers' },
              { label: 'Deals & Offers', href: '/products?deals=true' },
              { label: 'Shop Catalog', href: '/products' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="text-xs font-semibold text-[#111827] hover:text-[#DC2B53] transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href="/products"
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#F9FAFB] hover:bg-gray-100 text-[#111827] border border-[#E5E7EB] rounded-lg font-bold text-xs transition-colors group shadow-2xs cursor-pointer"
          >
            <span>Browse All Collections</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform text-[#DC2B53]" />
          </Link>
        </div>

      </div>
    </motion.div>
  );
};
