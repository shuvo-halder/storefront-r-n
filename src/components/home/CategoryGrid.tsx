import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { ArrowRight, Grid, Headphones, Watch, Laptop, Zap, Gamepad2 } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { categories, setFilters, navigateTo } = useStorefront();

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold text-rose-600 uppercase tracking-widest mb-1">
              Top Categories
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore Featured Departments
            </h2>
          </div>

          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, categorySlug: null }));
              navigateTo('shop');
            }}
            className="text-xs font-bold text-slate-700 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Categories Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setFilters(prev => ({ ...prev, categorySlug: cat.slug }));
                navigateTo('shop');
              }}
              className="group bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-rose-300 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between text-center relative overflow-hidden"
            >
              <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3 relative">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {cat.itemCount} Items
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
