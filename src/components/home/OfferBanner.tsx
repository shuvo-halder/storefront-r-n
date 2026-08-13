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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-64 w-full rounded-3xl bg-slate-200" />
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div 
        onClick={handleClick}
        className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-8 sm:p-12 cursor-pointer shadow-2xl transition-all duration-300 hover:border-accent/50"
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
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-30" 
            />
          </div>
          <div className="hidden sm:block absolute inset-0">
            <SmartImage 
              src={desktopImg} 
              alt={offerBanner.title} 
              fill
              fallbackType="banner"
              fallbackLabel={offerBanner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-30" 
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 max-w-xl space-y-4">
          {offerBanner.badge && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-rose-300 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              {offerBanner.badge}
            </span>
          )}

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight group-hover:text-accent transition-colors">
            {offerBanner.title}
          </h2>

          {descriptionText && (
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              {descriptionText}
            </p>
          )}

          {ctaText && (
            <div className="pt-2">
              <button className="px-6 py-3.5 bg-accent hover:bg-accent/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-accent/30 transition-all flex items-center gap-2 cursor-pointer">
                <span>{ctaText}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
