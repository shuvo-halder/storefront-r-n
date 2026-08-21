'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SmartImage } from '../common/SmartImage';
import Link from 'next/link';
import { storefrontApi } from '../../services/storefrontApi';
import { Category } from '../../types/storefront';
import { buildCategoryHierarchy } from '../../utils/categoryHierarchy';
import { Layers, ArrowRight, Grid, ChevronRight, Home, PackageX, Sparkles, FolderTree } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const CategoriesIndexView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        setError(null);
        const data = await storefrontApi.getCategories();
        setCategories(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch categories.');
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const hierarchyCategories = useMemo(() => {
    return buildCategoryHierarchy(categories);
  }, [categories]);

  return (
    <div className="bg-slate-50 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6 overflow-x-auto py-1">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home size={14} />
            <span>Home</span>
          </Link>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="text-slate-900 font-bold">Categories</span>
        </nav>

        {/* Header Banner */}
        <div className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 mb-8 relative overflow-hidden border border-slate-800 shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-light text-xs font-bold uppercase tracking-wider border border-primary/30">
              <Layers size={14} />
              Store Catalog
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Product Categories & Departments
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              Explore our verified collections organized by precision departments and subcategories.
            </p>
          </div>
          <div className="absolute right-[-40px] bottom-[-40px] opacity-10 pointer-events-none">
            <Grid size={300} />
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3.5">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-3 border border-slate-200 space-y-3">
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto my-12">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <PackageX size={24} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Unable to Load Categories</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && hierarchyCategories.length === 0 && (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-xs space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <PackageX size={28} />
            </div>
            <h3 className="text-base font-black text-slate-900">No Categories Found</h3>
            <p className="text-xs text-slate-500">Categories are currently being updated.</p>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-hover transition-all"
            >
              <span>Browse All Products</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Category Cards Grid (6-7 Cards per Row on Desktop) */}
        {!loading && !error && hierarchyCategories.length > 0 && (
          <div className="space-y-10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  <span>Main Departments ({hierarchyCategories.length})</span>
                </h2>
                <span className="text-xs font-semibold text-slate-500">6–7 per row on desktop</span>
              </div>

              {/* 6-7 Columns Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
                {hierarchyCategories.map((cat) => {
                  const subs = cat.subcategories || [];
                  const visibleSubs = subs.slice(0, 2);
                  const extraCount = subs.length - visibleSubs.length;

                  return (
                    <div
                      key={cat.id}
                      className="group bg-white rounded-2xl border border-slate-200 hover:border-primary/50 p-3 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full"
                    >
                      <Link href={`/categories/${cat.slug}`} className="space-y-2.5 block">
                        <div className="relative h-28 sm:h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                          <SmartImage 
                            src={cat.image} 
                            alt={cat.name} 
                            fill
                            fallbackType="category"
                            fallbackLabel={cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold rounded-full">
                            {subs.length > 0 ? `${subs.length} subs` : `${cat.itemCount || 0} items`}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 flex items-center justify-between">
                            <span>{cat.name}</span>
                            <ChevronRight size={14} className="text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </h3>
                        </div>
                      </Link>

                      {/* Subcategories Chips inside Card */}
                      {subs.length > 0 ? (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                          {visibleSubs.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/categories/${sub.slug}`}
                              className="text-[10px] font-semibold text-slate-600 hover:text-primary bg-slate-100 hover:bg-primary/10 px-1.5 py-0.5 rounded transition-colors truncate max-w-[110px]"
                            >
                              {sub.name}
                            </Link>
                          ))}
                          {extraCount > 0 && (
                            <Link
                              href={`/categories/${cat.slug}`}
                              className="text-[10px] font-bold text-primary hover:underline px-1 py-0.5"
                            >
                              +{extraCount}
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <Link
                            href={`/categories/${cat.slug}`}
                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <span>Browse Catalog</span>
                            <ArrowRight size={10} />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department & Subcategories Matrix (Requirement #8) */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <FolderTree size={18} />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Explore Departments & Subcategories
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click any subcategory pill to jump directly to filtered products
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hierarchyCategories.map((mainCat) => {
                  const subs = mainCat.subcategories || [];

                  return (
                    <div 
                      key={mainCat.id} 
                      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <Link 
                          href={`/categories/${mainCat.slug}`}
                          className="text-sm font-bold text-slate-900 hover:text-primary transition-colors flex items-center gap-1.5 group"
                        >
                          <span>{mainCat.name}</span>
                          <ArrowRight size={13} className="text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {subs.length} subcategories
                        </span>
                      </div>

                      {subs.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {subs.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/categories/${sub.slug}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-primary/10 hover:text-primary border border-slate-200/80 hover:border-primary/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <span>{sub.name}</span>
                              <ChevronRight size={12} className="opacity-60" />
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Direct category catalog (no subcategories)
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
