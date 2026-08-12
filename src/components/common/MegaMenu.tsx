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
      className="absolute top-full left-0 right-0 bg-white shadow-premium border-t border-border-default z-50 overflow-hidden"
    >
      <div className="container-vyzobd py-10">
        <div className="grid grid-cols-4 gap-10">
          {categories.slice(0, 4).map((category) => (
            <div key={category.id} className="space-y-6">
              <Link 
                href={`/categories/${category.slug}`}
                onClick={onClose}
                className="group block cursor-pointer"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition-all duration-300">
                  <SmartImage 
                    src={category.image} 
                    alt={category.name} 
                    fill
                    fallbackType="category"
                    fallbackLabel={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-4">
                    <h3 className="text-white font-display font-black text-lg tracking-tight uppercase">
                      {category.name}
                    </h3>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-primary group-hover:text-accent transition-colors">
                  <span className="text-xs font-black uppercase tracking-widest">Explore {category.name}</span>
                  <ArrowRight size={16} />
                </div>
              </Link>

              {category.subcategories && category.subcategories.length > 0 && (
                <ul className="space-y-3 border-l-2 border-slate-100 pl-4">
                  {category.subcategories.slice(0, 6).map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/categories/${category.slug}`}
                        onClick={onClose}
                        className="text-sm text-slate-500 hover:text-accent font-medium transition-colors flex items-center justify-between w-full group"
                      >
                        <span>{sub.name}</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                  {category.subcategories.length > 6 && (
                    <li>
                      <Link 
                        href={`/categories/${category.slug}`}
                        onClick={onClose}
                        className="text-xs text-accent font-bold hover:underline"
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

        <div className="mt-10 pt-8 border-t border-border-default flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Quick Links:</span>
            </div>
            {[
              { label: 'New Arrivals', href: '/products?sort=newest' },
              { label: 'Best Sellers', href: '/products?sort=bestsellers' },
              { label: 'Trending Gear', href: '/products?deals=true' },
              { label: 'Vyzobd Exclusives', href: '/products' },
            ].map((link) => (
              <Link 
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="text-sm font-bold text-primary hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <Link 
            href="/products"
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 bg-surface hover:bg-slate-200 text-primary rounded-xl font-bold transition-all group"
          >
            <span>Browse All Collections</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

