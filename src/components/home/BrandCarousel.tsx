import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { MOCK_BRANDS } from '../../data/mockProducts';

export const BrandCarousel: React.FC = () => {
  const { setFilters, navigateTo } = useStorefront();

  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1">
            Official Brand Partners
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Industry Leaders in Hardware & Audio
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {MOCK_BRANDS.map((brand) => (
            <div
              key={brand.id}
              onClick={() => {
                setFilters(prev => ({ ...prev, brandSlugs: [brand.slug] }));
                navigateTo('shop');
              }}
              className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:border-rose-300 transition-all duration-300 cursor-pointer flex flex-col items-center text-center justify-between"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden mb-3 p-1 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover rounded-xl" />
              </div>

              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-primary transition-colors">
                  {brand.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {brand.description}
                </p>
                <span className="text-[10px] font-semibold text-primary mt-2 inline-block">
                  {brand.featuredProductCount} Products →
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
