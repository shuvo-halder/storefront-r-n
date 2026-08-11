import React, { useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { HeroSection } from './HeroSection';
import { TrustFeatures } from './TrustFeatures';
import { CategorySection } from './CategorySection';
import { ProductSection } from './ProductSection';
import { SpecialOfferSection } from './SpecialOfferSection';
import { OfferBanner } from './OfferBanner';
import { BrandSection } from './BrandSection';
import { BlogSection } from './BlogSection';
import { NewsletterSection } from './NewsletterSection';
import { Sparkles, Flame, Zap, Award } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { products, isLoading, navigateTo, setFilters } = useStorefront();

  // Filter products for different sections
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8);
  const bestSellers = products.filter(p => p.isBestSeller || p.reviewCount >= 10).slice(0, 4);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

  return (
    <div className="bg-white pb-20">
      
      {/* 1. HERO SECTION & PROMOTIONAL CARDS */}
      <HeroSection />

      {/* 2. TRUST / SERVICE STRIP */}
      <TrustFeatures />

      {/* 3. FEATURED CATEGORIES */}
      <CategorySection />

      {/* 4. FEATURED PRODUCTS */}
      <ProductSection
        title="Featured Products"
        subtitle="Handpicked hardware essentials for your digital lifestyle."
        badge="CURATED COLLECTION"
        icon={<Sparkles size={14} className="text-accent" />}
        products={featuredProducts}
        isLoading={isLoading}
        viewAllText="View All Products"
        viewAllAction={() => {
          setFilters(prev => ({ ...prev, sortBy: 'featured' }));
          navigateTo('shop');
        }}
        limit={8}
      />

      {/* 5. BEST SELLERS */}
      <ProductSection
        title="Best Sellers"
        subtitle="Most popular picks from our tech community."
        badge="MOST POPULAR"
        icon={<Flame size={14} className="text-accent" />}
        products={bestSellers}
        isLoading={isLoading}
        viewAllText="View All Best Sellers"
        viewAllAction={() => {
          setFilters(prev => ({ ...prev, sortBy: 'rating' }));
          navigateTo('shop');
        }}
        limit={4}
      />

      {/* 6. PROMOTIONAL BANNER */}
      <OfferBanner />

      {/* 7. NEW ARRIVALS */}
      <ProductSection
        title="New Arrivals"
        subtitle="The latest drops in high-performance hardware."
        badge="JUST RELEASED"
        icon={<Zap size={14} className="text-accent" />}
        products={newArrivals}
        isLoading={isLoading}
        viewAllText="View All New Arrivals"
        viewAllAction={() => {
          setFilters(prev => ({ ...prev, sortBy: 'newest' }));
          navigateTo('shop');
        }}
        limit={4}
      />

      {/* 8. BRANDS */}
      <BrandSection />

      {/* 9. BLOG */}
      <BlogSection />

      {/* 10. NEWSLETTER */}
      <NewsletterSection />

    </div>
  );
};
