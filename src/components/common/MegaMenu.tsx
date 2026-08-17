'use client';

import React from 'react';
import { SmartImage } from './SmartImage';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useStorefront } from '../../context/StorefrontContext';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface MegaMenuProps {
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ onClose }) => {
  const { categories } = useStorefront();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-[#E5E7EB] z-50 overflow-hidden"
    >
      <div className="container-vyzobd py-8">
        <div className="grid grid-cols-4 gap-8">
          {categories.slice(0, 4).map((category) => (
            <div key={category.id} className="space-y-4">
              <Link 
                href={`/categories/${category.slug}`}
                onClick={onClose}
                className="group block cursor-pointer"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-[#E5E7EB] shadow-xs">
                  <SmartImage 
                    src={category.image} 
                    alt={category.name} 
                    fill
                    fallbackType="category"
                    fallbackLabel={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 to-transparent flex items-end p-3">
                    <h3 className="text-white font-bold text-base tracking-tight">
                      {category.name}
                    </h3>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-[#111827] group-hover:text-[#DC2B53] transition-colors">
                  <span className="text-xs font-semibold uppercase tracking-wider">Explore {category.name}</span>
                  <ArrowRight size={14} />
                </div>
              </Link>

              {category.subcategories && category.subcategories.length > 0 && (
                <ul className="space-y-2 border-l-2 border-[#E5E7EB] pl-3">
                  {category.subcategories.slice(0, 6).map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/categories/${category.slug}`}
                        onClick={onClose}
                        className="text-sm text-[#6B7280] hover:text-[#DC2B53] font-normal transition-colors flex items-center justify-between w-full group"
                      >
                        <span>{sub.name}</span>
                        <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-[#DC2B53]" />
                      </Link>
                    </li>
                  ))}
                  {category.subcategories.length > 6 && (
                    <li>
                      <Link 
                        href={`/categories/${category.slug}`}
                        onClick={onClose}
                        className="text-xs text-[#DC2B53] font-semibold hover:underline"
                      >
                        View all subcategories
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              <span>Quick Links:</span>
            </div>
            {[
              { label: 'New Arrivals', href: '/products?sort=newest' },
              { label: 'Best Sellers', href: '/products?sort=bestsellers' },
              { label: 'Trending Gear', href: '/products?deals=true' },
              { label: 'All Products', href: '/products' },
            ].map((link) => (
              <Link 
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="text-sm font-medium text-[#111827] hover:text-[#DC2B53] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <Link 
            href="/products"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-[#F9FAFB] hover:bg-gray-100 text-[#111827] border border-[#E5E7EB] rounded-lg font-semibold text-xs transition-colors group shadow-xs"
          >
            <span>Browse All Collections</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

