import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { X, RotateCcw, Filter, Check, Star, Search } from 'lucide-react';

interface FilterSidebarProps {
  onCloseMobile?: () => void;
}

export const ProductFilterSidebar: React.FC<FilterSidebarProps> = ({ onCloseMobile }) => {
  const { categories, brands, filters, setFilters, resetFilters } = useStorefront();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value, page: 1 }));
  };

  const handleCategorySelect = (slug: string | null) => {
    setFilters(prev => ({ 
      ...prev, 
      categorySlug: prev.categorySlug === slug ? null : slug,
      page: 1 
    }));
  };

  const handleBrandToggle = (brandSlug: string) => {
    setFilters(prev => {
      const exists = prev.brandSlugs.includes(brandSlug);
      const updated = exists 
        ? prev.brandSlugs.filter(s => s !== brandSlug)
        : [...prev.brandSlugs, brandSlug];
      return { ...prev, brandSlugs: updated, page: 1 };
    });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setFilters(prev => ({ ...prev, minPrice: val, page: 1 }));
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setFilters(prev => ({ ...prev, maxPrice: val, page: 1 }));
  };

  return (
    <aside className="w-full space-y-6 text-slate-800">
      
      {/* Title & Reset Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-slate-900">
          <Filter size={16} className="text-primary" />
          <span>Filter Catalog</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-primary hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Reset All</span>
        </button>
      </div>

      {/* Quick Search inside Sidebar */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Search Hardware
        </h4>
        <div className="relative">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search audio, watches, chargers..."
            className="w-full py-2 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary focus:bg-white transition-colors"
          />
          <Search size={14} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Category / Department
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
              filters.categorySlug === null ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-slate-100 text-slate-700'
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
                  isSelected ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-slate-100 text-slate-700'
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
                  className="w-4 h-4 rounded-md text-primary focus:ring-primary border-slate-300"
                />
                <span className={isChecked ? 'font-bold text-primary' : 'font-medium'}>
                  {b.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range Controls */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400">
          <span>Price Range</span>
          <span className="text-primary font-mono font-bold text-xs">
            ${filters.minPrice} - ${filters.maxPrice}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Min ($)</label>
            <input
              type="number"
              min={0}
              max={filters.maxPrice}
              value={filters.minPrice}
              onChange={handleMinPriceChange}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Max ($)</label>
            <input
              type="number"
              min={filters.minPrice}
              max={2000}
              value={filters.maxPrice}
              onChange={handleMaxPriceChange}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={1000}
          step={25}
          value={filters.maxPrice}
          onChange={handleMaxPriceChange}
          className="w-full accent-primary cursor-pointer"
        />
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
                onClick={() => setFilters(prev => ({ ...prev, ratingMin: prev.ratingMin === rate ? 0 : rate, page: 1 }))}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-slate-100 text-slate-700'
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

      {/* Availability / In Stock Toggle */}
      <div className="pt-3 border-t border-slate-100">
        <label className="flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer">
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked, page: 1 }))}
            className="w-4 h-4 rounded-md text-primary focus:ring-primary border-slate-300 cursor-pointer"
          />
        </label>
      </div>

    </aside>
  );
};
