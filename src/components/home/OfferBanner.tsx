import React, { useState, useEffect } from 'react';
import { Banner } from '../../types/storefront';
import { storefrontApi } from '../../services/storefrontApi';
import { useStorefront } from '../../context/StorefrontContext';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';
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

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div 
        onClick={() => {
          if (offerBanner.categorySlug) {
            setFilters(prev => ({ ...prev, categorySlug: offerBanner.categorySlug || null }));
            navigateTo('shop');
          } else {
            navigateTo('shop');
          }
        }}
        className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-8 sm:p-12 cursor-pointer shadow-2xl transition-all duration-300 hover:border-primary/50"
      >
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0">
          <img 
            src={offerBanner.image} 
            alt={offerBanner.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-30" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 max-w-xl space-y-4">
          {offerBanner.badge && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-rose-300 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              {offerBanner.badge}
            </span>
          )}

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight group-hover:text-primary/20 transition-colors">
            {offerBanner.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            {offerBanner.subtitle}
          </p>

          <div className="pt-2">
            <button className="px-6 py-3.5 bg-primary hover:bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center gap-2 cursor-pointer">
              <span>{offerBanner.buttonText || 'Explore Desk Upgrades'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
