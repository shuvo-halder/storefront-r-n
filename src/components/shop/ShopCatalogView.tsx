import React, { useState, useEffect } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { Product } from '../../types/storefront';
import { ProductCard } from '../common/ProductCard';
import { ProductFilterSidebar } from './ProductFilterSidebar';
import { 
  Grid, 
  List, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Search, 
  ArrowUpDown,
  Sparkles,
  PackageX
} from 'lucide-react';

export const ShopCatalogView: React.FC = () => {
  const { filters, setFilters, resetFilters, categories, brands } = useStorefront();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      try {
        const { products: fetched, total } = await storefrontApi.getProducts(filters);
        setProducts(fetched);
        setTotalCount(total);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [filters]);

  const activeCategoryObj = categories.find(c => c.slug === filters.categorySlug);

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Catalog Banner / Title */}
        <div className="mb-6 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold text-rose-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Sparkles size={14} />
              Aura Tech Catalog
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeCategoryObj ? activeCategoryObj.name : 'All Flagship Electronics'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {activeCategoryObj ? activeCategoryObj.description : 'Explore premium spatial audio, GaN IV charging stations, titanium smartwatches, and custom keyboards.'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400">Showing</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {products.length} Products
            </div>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(filters.categorySlug || filters.brandSlugs.length > 0 || filters.searchQuery || filters.maxPrice < 1000 || filters.ratingMin > 0) && (
          <div className="mb-6 flex flex-wrap items-center gap-2 bg-white p-3.5 border border-slate-200 rounded-2xl shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Active Filters:
            </span>

            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-full">
                Search: "{filters.searchQuery}"
                <button onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))} className="hover:text-rose-900">
                  <X size={12} />
                </button>
              </span>
            )}

            {filters.categorySlug && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-full">
                Dept: {activeCategoryObj?.name}
                <button onClick={() => setFilters(prev => ({ ...prev, categorySlug: null }))} className="hover:text-rose-900">
                  <X size={12} />
                </button>
              </span>
            )}

            {filters.brandSlugs.map((bs) => (
              <span key={bs} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-full">
                Brand: {bs}
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, brandSlugs: prev.brandSlugs.filter(s => s !== bs) }))}
                  className="hover:text-rose-900"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            <button
              onClick={resetFilters}
              className="text-xs font-bold text-rose-600 hover:underline ml-auto cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Sorting & Presentation Control Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
          
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal size={16} />
            <span>Filter Catalog</span>
          </button>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Sort By:
            </span>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="appearance-none bg-slate-50 border border-slate-300 hover:border-slate-400 py-2 pl-3.5 pr-8 text-xs font-bold text-slate-800 rounded-xl focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="featured">Featured / Best Sellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="newest">Newest Releases</option>
              </select>
              <ChevronDown size={14} className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Grid / List View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

        </div>

        {/* Main Catalog Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs sticky top-28">
            <ProductFilterSidebar />
          </div>

          {/* Products Presentation Stage */}
          <div className="lg:col-span-9 space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 h-72 animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <PackageX size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No matching electronics found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing some filter criteria or adjusting your search phrase.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-start lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-base text-slate-900">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400">
                <X size={20} />
              </button>
            </div>
            <ProductFilterSidebar onCloseMobile={() => setIsMobileFilterOpen(false)} />
          </div>
        </div>
      )}

    </div>
  );
};
