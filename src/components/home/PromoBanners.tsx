'use client';

import React, { useState, useEffect } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { Banner } from '../../types/storefront';
import { SmartImage } from '../common/SmartImage';
import { ArrowRight, Sparkles, Zap, Flame } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const PromoBanners: React.FC = () => {
  const { navigateTo, setFilters } = useStorefront();
  const [promoBanners, setPromoBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPromos = async () => {
      try {
        setLoading(true);
        const data = await storefrontApi.getBanners('promo');
        if (isMounted) {
          const active = (data || []).filter(b => b.isActive !== false);
          setPromoBanners(active.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load promo banners:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPromos();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-60 w-full rounded-3xl bg-slate-200" />
          <Skeleton className="h-60 w-full rounded-3xl bg-slate-200" />
        </div>
      </section>
    );
  }

  if (!promoBanners || promoBanners.length === 0) return null;

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkUrl && banner.linkUrl.trim() !== '') {
      const url = banner.linkUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else if (url.startsWith('/products/')) {
        const slug = url.replace('/products/', '').split('?')[0];
        navigateTo('product-detail', { productSlug: slug });
      } else if (url.startsWith('/categories/')) {
        const slug = url.replace('/categories/', '').split('?')[0];
        setFilters(prev => ({ ...prev, categorySlug: slug }));
        navigateTo('shop');
      } else if (url === '/shop' || url.startsWith('/shop?')) {
        navigateTo('shop');
      } else {
        window.location.href = url;
      }
    } else if (banner.productSlug) {
      navigateTo('product-detail', { productSlug: banner.productSlug });
    } else if (banner.categorySlug) {
      setFilters(prev => ({ ...prev, categorySlug: banner.categorySlug }));
      navigateTo('shop');
    } else {
      navigateTo('shop');
    }
  };

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {promoBanners.map((banner, idx) => {
          const bg = banner.bgColor || (idx === 0 
            ? 'from-slate-900 via-slate-800 to-rose-950' 
            : 'from-slate-900 via-rose-950 to-slate-900');
          const mobileImg = banner.mobileImage || banner.desktopImage || banner.image;
          const desktopImg = banner.desktopImage || banner.image;

          return (
            <div 
              key={banner.id || idx}
              onClick={() => handleBannerClick(banner)}
              className={`relative rounded-3xl bg-gradient-to-r ${bg} text-white p-8 overflow-hidden shadow-lg flex flex-col justify-between group min-h-[240px] cursor-pointer`}
            >
              {desktopImg && (
                <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-35 transition-opacity">
                  <SmartImage
                    src={desktopImg}
                    alt={banner.title}
                    fill
                    fallbackType="banner"
                    fallbackLabel={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
              
              <div className="relative z-10 space-y-2">
                {banner.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-rose-300 text-[10px] font-extrabold uppercase tracking-widest">
                    <Flame size={12} className="text-amber-400" />
                    {banner.badge}
                  </span>
                )}
                <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                  {banner.title}
                </h3>
                {(banner.subtitle || banner.description) && (
                  <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                    {banner.subtitle || banner.description}
                  </p>
                )}
              </div>

              <div className="relative z-10 pt-4">
                <button
                  type="button"
                  className="py-2.5 px-5 bg-primary hover:bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>{banner.buttonText || banner.ctaText || 'Shop Collection'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

