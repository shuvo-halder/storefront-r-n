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
        className="group relative overflow-hidden rounded-xl bg-[#111827] border border-gray-800 p-4 text-white flex items-center justify-between gap-4 cursor-pointer hover:border-gray-700 transition-colors shadow-xs"
      >
        <div className="relative z-10 space-y-1 flex-1 min-w-0">
          {banner.badge && (
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[#DC2B53] bg-[#DC2B53]/10 px-2 py-0.5 rounded-md border border-[#DC2B53]/20">
              {banner.badge}
            </span>
          )}
          <h4 className="font-semibold text-sm sm:text-base leading-snug text-white group-hover:text-[#DC2B53] transition-colors truncate">
            {banner.title}
          </h4>
          {descriptionText && (
            <p className="text-xs text-gray-300 line-clamp-1 font-normal">
              {descriptionText}
            </p>
          )}
          {banner.price && (
            <div className="text-xs font-semibold text-[#DC2B53] pt-0.5">
              {banner.price}
            </div>
          )}
        </div>

        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700 relative">
          <SmartImage 
            src={desktopImg} 
            alt={banner.title} 
            fill
            fallbackType="banner"
            fallbackLabel={banner.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="group relative overflow-hidden rounded-xl bg-[#111827] border border-gray-800 text-white p-6 flex flex-col justify-between cursor-pointer hover:border-gray-700 transition-colors shadow-xs min-h-[220px]"
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
            className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 ease-out" 
          />
        </div>
        <div className="hidden sm:block absolute inset-0">
          <SmartImage 
            src={desktopImg} 
            alt={banner.title} 
            fill
            fallbackType="banner"
            fallbackLabel={banner.title}
            className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 ease-out" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/60 to-transparent" />
      </div>

      {/* Top Badge */}
      <div className="relative z-10 flex items-center justify-between">
        {banner.badge ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#DC2B53]/20 border border-[#DC2B53]/30 text-white text-[10px] font-semibold tracking-wide backdrop-blur-xs">
            {banner.badge}
          </span>
        ) : <div />}
        {banner.discount && (
          <span className="px-2 py-0.5 bg-[#DC2B53] text-white font-semibold text-[10px] rounded-md tracking-wide">
            {banner.discount}
          </span>
        )}
      </div>

      {/* Center/Bottom Content */}
      <div className="relative z-10 mt-6 space-y-2">
        <h3 className="font-semibold text-lg text-white group-hover:text-[#DC2B53] transition-colors leading-tight">
          {banner.title}
        </h3>
        {descriptionText && (
          <p className="text-xs text-gray-300 leading-relaxed line-clamp-2 font-normal">
            {descriptionText}
          </p>
        )}

        <div className="pt-1 flex items-center justify-between">
          {banner.price && (
            <span className="text-base font-bold text-white">
              {banner.price}
            </span>
          )}
          {ctaText && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2B53] group-hover:translate-x-0.5 transition-transform">
              <span>{ctaText}</span>
              <ArrowRight size={13} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
