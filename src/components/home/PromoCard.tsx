'use client';

import React from 'react';
import { SmartImage } from '../common/SmartImage';
import { Banner } from '../../types/storefront';
import { useStorefront } from '../../context/StorefrontContext';
import { ArrowRight } from 'lucide-react';

interface PromoCardProps {
  banner: Banner;
  variant?: 'vertical' | 'horizontal' | 'compact';
}

export const PromoCard: React.FC<PromoCardProps> = ({ banner, variant = 'vertical' }) => {
  const { navigateTo, setFilters } = useStorefront();

  const handleClick = () => {
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

  const ctaText = banner.ctaText || banner.buttonText;
  const descriptionText = banner.subtitle || banner.description;
  const mobileImg = banner.mobileImage || banner.desktopImage || banner.image;
  const desktopImg = banner.desktopImage || banner.image;

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleClick}
        className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-5 text-white flex items-center justify-between gap-4 cursor-pointer hover:border-accent/50 transition-all duration-300 shadow-md"
      >
        <div className="relative z-10 space-y-1.5 flex-1 min-w-0">
          {banner.badge && (
            <span className="inline-block text-[10px] font-black uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
              {banner.badge}
            </span>
          )}
          <h4 className="font-extrabold text-sm sm:text-base leading-snug text-white group-hover:text-accent transition-colors truncate">
            {banner.title}
          </h4>
          {descriptionText && (
            <p className="text-xs text-slate-300 line-clamp-1 font-normal">
              {descriptionText}
            </p>
          )}
          {banner.price && (
            <div className="text-xs font-bold text-accent pt-1">
              {banner.price}
            </div>
          )}
        </div>

        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700/60 relative">
          <SmartImage 
            src={desktopImg} 
            alt={banner.title} 
            fill
            fallbackType="banner"
            fallbackLabel={banner.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="group relative overflow-hidden rounded-[32px] bg-[#101A25] border border-slate-800 text-white p-8 flex flex-col justify-between cursor-pointer hover:border-accent/40 transition-all duration-500 shadow-premium min-h-[260px]"
    >
      {/* Background Image with Dark Gradient overlay */}
      <div className="absolute inset-0 z-0">
        <div className="block sm:hidden absolute inset-0">
          <SmartImage 
            src={mobileImg} 
            alt={banner.title} 
            fill
            fallbackType="banner"
            fallbackLabel={banner.title}
            className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-40 group-hover:scale-110 transition-all duration-1000 ease-out" 
          />
        </div>
        <div className="hidden sm:block absolute inset-0">
          <SmartImage 
            src={desktopImg} 
            alt={banner.title} 
            fill
            fallbackType="banner"
            fallbackLabel={banner.title}
            className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-40 group-hover:scale-110 transition-all duration-1000 ease-out" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#101A25] via-[#101A25]/60 to-transparent" />
      </div>

      {/* Top Badge */}
      <div className="relative z-10 flex items-center justify-between">
        {banner.badge ? (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-white text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
            {banner.badge}
          </span>
        ) : <div />}
        {banner.discount && (
          <span className="px-3 py-1 bg-accent text-white font-black text-[9px] rounded-lg uppercase tracking-widest shadow-lg shadow-accent/20">
            {banner.discount}
          </span>
        )}
      </div>

      {/* Center/Bottom Content */}
      <div className="relative z-10 mt-8 space-y-3">
        <h3 className="font-display font-black text-xl sm:text-2xl text-white group-hover:text-accent transition-colors leading-none uppercase tracking-tighter">
          {banner.title}
        </h3>
        {descriptionText && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 font-medium">
            {descriptionText}
          </p>
        )}

        <div className="pt-2 flex items-center justify-between">
          {banner.price && (
            <span className="text-lg font-display font-black text-white">
              {banner.price}
            </span>
          )}
          {ctaText && (
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest group-hover:translate-x-1 transition-transform">
              <span>{ctaText}</span>
              <ArrowRight size={14} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
