'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from '../common/SmartImage';
import { Banner } from '../../types/storefront';
import { storefrontApi } from '../../services/storefrontApi';
import { useStorefront } from '../../context/StorefrontContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const OfferBanner: React.FC = () => {
  const { navigateTo, setFilters } = useStorefront();
  const [offerBanner, setOfferBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchOffer = async () => {
      try {
        setLoading(true);
        const offers = await storefrontApi.getBanners('offer');
        if (isMounted && offers.length > 0) {
          setOfferBanner(offers[0]);
        }
      } catch (err) {
        console.error('Failed to fetch offer banner:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOffer();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Skeleton className="h-44 sm:h-52 w-full rounded-2xl bg-slate-200" />
      </section>
    );
  }

  if (!offerBanner) return null;

  const handleClick = () => {
    if (offerBanner.linkUrl && offerBanner.linkUrl.trim() !== '') {
      const url = offerBanner.linkUrl.trim();
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
    } else if (offerBanner.productSlug) {
      navigateTo('product-detail', { productSlug: offerBanner.productSlug });
    } else if (offerBanner.categorySlug) {
      setFilters(prev => ({ ...prev, categorySlug: offerBanner.categorySlug }));
      navigateTo('shop');
    } else {
      navigateTo('shop');
    }
  };

  const ctaText = offerBanner.ctaText || offerBanner.buttonText;
  const descriptionText = offerBanner.subtitle || offerBanner.description;
  const mobileImg = offerBanner.mobileImage || offerBanner.desktopImage || offerBanner.image;
  const desktopImg = offerBanner.desktopImage || offerBanner.image;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div 
        onClick={handleClick}
        className="group relative overflow-hidden rounded-2xl bg-[#111827] border border-gray-800 text-white p-5 sm:p-8 lg:p-10 cursor-pointer shadow-xs transition-all duration-300 hover:border-[#DC2B53]/50"
      >
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="block sm:hidden absolute inset-0">
            <SmartImage 
              src={mobileImg} 
              alt={offerBanner.title} 
              fill
              fallbackType="banner"
              fallbackLabel={offerBanner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-25" 
            />
          </div>
          <div className="hidden sm:block absolute inset-0">
            <SmartImage 
              src={desktopImg} 
              alt={offerBanner.title} 
              fill
              fallbackType="banner"
              fallbackLabel={offerBanner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-25" 
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/90 to-transparent" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 max-w-xl space-y-2.5">
          {offerBanner.badge && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#DC2B53]/20 border border-[#DC2B53]/30 text-rose-300 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles size={12} className="text-amber-300 animate-pulse" />
              {offerBanner.badge}
            </span>
          )}

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight group-hover:text-rose-200 transition-colors">
            {offerBanner.title}
          </h2>

          {descriptionText && (
            <p className="text-xs sm:text-sm text-gray-300 font-normal leading-relaxed line-clamp-2">
              {descriptionText}
            </p>
          )}

          {ctaText && (
            <div className="pt-1">
              <button className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs min-h-[36px]">
                <span>{ctaText}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
