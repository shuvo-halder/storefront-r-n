import React, { useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import { ProductCard } from '../common/ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FeaturedProductsSection: React.FC = () => {
  const { navigateTo, setFilters } = useStorefront();
  const [activeTab, setActiveTab] = useState<'all' | 'audio-headphones' | 'smart-wearables' | 'laptops-computing'>('all');

  const tabs = [
    { id: 'all', label: 'All Products' },
    { id: 'audio-headphones', label: 'Audio & Headphones' },
    { id: 'smart-wearables', label: 'Smart Wearables' },
    { id: 'laptops-computing', label: 'Laptops & Workstations' },
  ];

  const displayedProducts = activeTab === 'all'
    ? MOCK_PRODUCTS.slice(0, 8)
    : MOCK_PRODUCTS.filter(p => p.categoryId === tabs.find(t => t.id === activeTab)?.id || p.category.toLowerCase().includes(activeTab.split('-')[0])).slice(0, 8);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Sparkles size={14} />
              Featured Collection
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Flagship Technology & Audio
            </h2>
          </div>

          {/* Interactive Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, categorySlug: null }));
              navigateTo('shop');
            }}
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Full Catalog ({MOCK_PRODUCTS.length}+ Items)</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
};
