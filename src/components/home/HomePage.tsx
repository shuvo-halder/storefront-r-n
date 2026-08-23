'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { HeroSection } from './HeroSection';
import { TrustFeatures } from './TrustFeatures';
import { CategorySection } from './CategorySection';
import { ProductSection } from './ProductSection';
import { OfferBanner } from './OfferBanner';
import { BrandSection } from './BrandSection';
import { BlogSection } from './BlogSection';
import { CustomerReviewCarousel } from './CustomerReviewCarousel';
import { Sparkles, Flame, Zap, AlertCircle, RefreshCw } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigateTo, setFilters } = useStorefront();

  const { data: productsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['home_products'],
    queryFn: async () => {
      const res = await storefrontApi.getProducts({ pageSize: 50 });
      return res.products || [];
    },
  });

  const products = productsData || [];

  // Filter products for different sections with priority to tagged items
  const featuredOnly = products.filter(p => p.isFeatured);
  const featuredProducts = featuredOnly.length >= 8 
    ? featuredOnly 
    : [...featuredOnly, ...products.filter(p => !p.isFeatured)];
    
  const bestSellerOnly = products.filter(p => p.isBestSeller || p.reviewCount > 0 || (p.rating && p.rating >= 4.5));
  const bestSellers = bestSellerOnly.length >= 4
    ? bestSellerOnly
    : [...bestSellerOnly, ...products.filter(p => !bestSellerOnly.includes(p))];

  const newArrivalsOnly = products.filter(p => p.isNew);
  const newArrivals = newArrivalsOnly.length >= 4
    ? newArrivalsOnly
    : [...newArrivalsOnly, ...products.filter(p => !newArrivalsOnly.includes(p))];

  return (
    <div className="bg-white pb-12 sm:pb-16 overflow-x-hidden">
      
      {/* 1. HERO SECTION & PROMOTIONAL CARDS */}
      <HeroSection />

      {/* 2. TRUST / SERVICE STRIP */}
      <TrustFeatures />

      {/* 3. FEATURED CATEGORIES */}
      <CategorySection />

      {/* API Error Alert */}
      {isError && (
        <div className="max-w-7xl mx-auto px-4 my-6">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
              <span>Unable to load products from server: {(error as Error)?.message || 'Network error'}</span>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* 4. FEATURED PRODUCTS */}
      <ProductSection
        title="Featured Products"
        subtitle="Handpicked quality items curated just for you."
        badge="CURATED COLLECTION"
        icon={<Sparkles size={14} className="text-[#DC2B53]" />}
        products={featuredProducts}
        isLoading={isLoading}
        viewAllText="View All Products"
        viewAllAction={() => {
          setFilters(prev => ({ ...prev, sortBy: 'featured' }));
          navigateTo('shop');
        }}
        limit={12}
      />

      {/* 5. POPULAR PRODUCTS */}
      <ProductSection
        title="Popular Products"
        subtitle="Most popular picks loved by our customers."
        badge="MOST POPULAR"
        icon={<Flame size={14} className="text-[#DC2B53]" />}
        products={bestSellers}
        isLoading={isLoading}
        viewAllText="View All Popular Products"
        viewAllAction={() => {
          setFilters(prev => ({ ...prev, sortBy: 'rating' }));
          navigateTo('shop');
        }}
        limit={6}
      />

      {/* 6. PROMOTIONAL BANNER */}
      <OfferBanner />

      {/* 7. NEW ARRIVALS */}
      <ProductSection
        title="New Arrivals"
        subtitle="Explore the latest additions to our store."
        badge="JUST RELEASED"
        icon={<Zap size={14} className="text-[#DC2B53]" />}
        products={newArrivals}
        isLoading={isLoading}
        viewAllText="View All New Arrivals"
        viewAllAction={() => {
          setFilters(prev => ({ ...prev, sortBy: 'newest' }));
          navigateTo('shop');
        }}
        limit={6}
      />

      {/* 8. BRANDS */}
      <BrandSection />

      {/* 9. BLOG */}
      <BlogSection />

      {/* 10. CUSTOMER REVIEWS & TESTIMONIALS */}
      <CustomerReviewCarousel />

    </div>
  );
};
