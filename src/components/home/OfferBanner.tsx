'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from '../common/SmartImage';
import { Banner } from '../../types/storefront';
import { storefrontApi } from '../../services/storefrontApi';
import { useStorefront } from '../../context/StorefrontContext';
import { HOME_PROMOTIONAL_BANNER_PRIORITY } from '../../config/bannerConfig';
import { Skeleton } from '../ui/Skeleton';

interface OfferBannerProps {
  targetPriority?: number;
}

export const OfferBanner: React.FC<OfferBannerProps> = ({
  targetPriority = HOME_PROMOTIONAL_BANNER_PRIORITY
}) => {
  const { navigateTo, setFilters } = useStorefront();
  const [offerBanner, setOfferBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchOffer = async () => {
      try {
        setLoading(true);
        const offers = await storefrontApi.getBanners('offer');
        if (isMounted && Array.isArray(offers)) {
          // Strictly match target priority (handling numeric/string safely)
          const matched = offers.find(
            b => b.priority !== undefined && b.priority !== null && Number(b.priority) === Number(targetPriority)
          );
          setOfferBanner(matched || null);
        }
      } catch (err) {
        console.error('Failed to fetch offer banner:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOffer();
    return () => { isMounted = false; };
  }, [targetPriority]);

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

  const mobileImg = offerBanner.mobileImage || offerBanner.desktopImage || offerBanner.image;
  const desktopImg = offerBanner.desktopImage || offerBanner.image;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div 
        onClick={handleClick}
        className="group relative overflow-hidden rounded-2xl bg-slate-100 cursor-pointer shadow-xs transition-all duration-300 hover:shadow-md"
      >
        <div className="block sm:hidden w-full">
          <SmartImage 
            src={mobileImg} 
            alt={offerBanner.title || 'Promotional Banner'} 
            fill={false}
            fallbackType="banner"
            fallbackLabel={offerBanner.title}
            className="w-full h-auto block group-hover:scale-[1.01] transition-transform duration-700" 
          />
        </div>
        <div className="hidden sm:block w-full">
          <SmartImage 
            src={desktopImg} 
            alt={offerBanner.title || 'Promotional Banner'} 
            fill={false}
            fallbackType="banner"
            fallbackLabel={offerBanner.title}
            className="w-full h-auto block group-hover:scale-[1.01] transition-transform duration-700" 
          />
        </div>
      </div>
    </section>
  );
};
