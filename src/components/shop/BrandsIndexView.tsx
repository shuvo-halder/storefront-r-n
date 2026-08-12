'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from '../common/SmartImage';
import Link from 'next/link';
import { storefrontApi } from '../../services/storefrontApi';
import { Brand } from '../../types/storefront';
import { Award, ArrowRight, ShieldCheck, ChevronRight, Home, PackageX, Sparkles } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const BrandsIndexView: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBrands() {
      try {
        setLoading(true);
        setError(null);
        const data = await storefrontApi.getBrands();
        setBrands(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch partner manufacturers.');
      } finally {
        setLoading(false);
      }
    }
    loadBrands();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-8 overflow-x-auto py-1">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home size={14} />
            <span>Home</span>
          </Link>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="text-slate-900 font-bold">Brands</span>
        </nav>

        {/* Header Banner */}
        <div className="bg-slate-900 text-white rounded-[32px] p-8 sm:p-12 mb-10 relative overflow-hidden border border-slate-800 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 text-primary-light text-xs font-black uppercase tracking-wider border border-primary/30">
              <Award size={14} />
              Verified Hardware Partners
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Official Tech Manufacturers
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed font-normal">
              Direct official authorization and 2-year warranty support for every featured global technology brand.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-5 w-1/2 rounded-lg" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto my-12">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <PackageX size={24} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Unable to Load Manufacturers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && brands.length === 0 && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <PackageX size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900">No Manufacturers Found</h3>
            <p className="text-xs text-slate-500">Brand directory is currently being updated.</p>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-extrabold text-xs rounded-xl hover:bg-primary-hover transition-all"
            >
              <span>Browse Catalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Brands Grid */}
        {!loading && !error && brands.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group bg-white rounded-3xl border border-slate-200/80 hover:border-primary/40 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-24 rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-center group-hover:bg-primary/5 transition-colors relative overflow-hidden">
                    <SmartImage 
                      src={brand.logo} 
                      alt={brand.name} 
                      fill
                      fallbackType="brand"
                      fallbackLabel={brand.name}
                      objectFit="contain"
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-primary transition-colors flex items-center justify-between">
                      <span>{brand.name}</span>
                      <ArrowRight size={16} className="text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 font-medium">
                      {brand.description || 'Verified manufacturer hardware.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-primary">
                  <span>{brand.itemCount} Products</span>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
