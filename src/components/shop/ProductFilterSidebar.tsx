import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { X, RotateCcw, Filter, Check, Star } from 'lucide-react';

interface FilterSidebarProps {
  onCloseMobile?: () => void;
}

export const ProductFilterSidebar: React.FC<FilterSidebarProps> = ({ onCloseMobile }) => {
  const { categories, brands, filters, setFilters, resetFilters } = useStorefront();

  const handleCategorySelect = (slug: string | null) => {
    setFilters(prev => ({ ...prev, categorySlug: prev.categorySlug === slug ? null : slug }));
  };

  const handleBrandToggle = (brandSlug: string) => {
    setFilters(prev => {
      const exists = prev.brandSlugs.includes(brandSlug);
      const updated = exists 
        ? prev.brandSlugs.filter(s => s !== brandSlug)
        : [...prev.brandSlugs, brandSlug];
      return { ...prev, brandSlugs: updated };
    });
  };

  return (
    <aside className="w-full space-y-6 text-slate-800">
      
      {/* Title & Reset Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-slate-900">
          <Filter size={16} className="text-rose-600" />
          <span>Filter Products</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Reset All</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Department
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
              filters.categorySlug === null ? 'bg-rose-50 text-rose-600 font-bold' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>All Departments</span>
            {filters.categorySlug === null && <Check size={14} />}
          </button>

          {categories.map((cat) => {
            const isSelected = filters.categorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected ? 'bg-rose-50 text-rose-600 font-bold' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                  {cat.itemCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Filter Checkboxes */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Brand
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {brands.map((b) => {
            const isChecked = filters.brandSlugs.includes(b.slug);
            return (
              <label 
                key={b.id} 
                className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer py-1"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleBrandToggle(b.slug)}
                  className="w-4 h-4 rounded-md text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <span className={isChecked ? 'font-bold text-rose-600' : 'font-medium'}>
                  {b.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400">
          <span>Max Price</span>
          <span className="text-rose-600 font-mono font-bold text-sm">
            ${filters.maxPrice}
          </span>
        </div>

        <input
          type="range"
          min={50}
          max={1000}
          step={25}
          value={filters.maxPrice}
          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className="w-full accent-rose-600 cursor-pointer"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>$50</span>
          <span>$1,000+</span>
        </div>
      </div>

      {/* Minimum Rating Filter */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Minimum Rating
        </h4>
        <div className="space-y-1">
          {[4.5, 4.0, 3.5].map((rate) => {
            const isSelected = filters.ratingMin === rate;
            return (
              <button
                key={rate}
                onClick={() => setFilters(prev => ({ ...prev, ratingMin: prev.ratingMin === rate ? 0 : rate }))}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected ? 'bg-rose-50 text-rose-600 font-bold' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span>{rate} Stars & Above</span>
                </div>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* In Stock Only Toggle */}
      <div className="pt-3 border-t border-slate-100">
        <label className="flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer">
          <span>In Stock Items Only</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
            className="w-4 h-4 rounded-md text-rose-600 focus:ring-rose-500 border-slate-300"
          />
        </label>
      </div>

    </aside>
  );
};
