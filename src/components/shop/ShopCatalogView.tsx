import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { Product, ProductFilterState } from '../../types/storefront';
import { ProductCard } from '../common/ProductCard';
import { ProductFilterSidebar } from './ProductFilterSidebar';
import { 
  Grid, 
  List, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Search, 
  Sparkles,
  PackageX,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const ShopCatalogView: React.FC = () => {
  const { filters, setFilters, resetFilters, categories, brands } = useStorefront();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Helper to parse URL search params into ProductFilterState
  const getFiltersFromURL = useCallback((): Partial<ProductFilterState> => {
    try {
      let searchStr = window.location.search;
      // Also check hash query string if hash routing is used e.g. #shop?category=audio
      if (!searchStr && window.location.hash.includes('?')) {
        searchStr = window.location.hash.substring(window.location.hash.indexOf('?'));
      }

      if (!searchStr) return {};

      const params = new URLSearchParams(searchStr);
      const urlFilters: Partial<ProductFilterState> = {};

      if (params.has('page')) {
        const p = parseInt(params.get('page') || '1', 10);
        if (!isNaN(p) && p > 0) urlFilters.page = p;
      }
      if (params.has('category') || params.has('categorySlug')) {
        urlFilters.categorySlug = params.get('category') || params.get('categorySlug');
      }
      if (params.has('brand') || params.has('brandSlugs')) {
        const brandStr = params.get('brand') || params.get('brandSlugs');
        if (brandStr) {
          urlFilters.brandSlugs = brandStr.split(',').map(s => s.trim().toLowerCase());
        }
      }
      if (params.has('minPrice')) {
        const min = parseFloat(params.get('minPrice') || '0');
        if (!isNaN(min)) urlFilters.minPrice = min;
      }
      if (params.has('maxPrice')) {
        const max = parseFloat(params.get('maxPrice') || '1000');
        if (!isNaN(max)) urlFilters.maxPrice = max;
      }
      if (params.has('inStock') || params.has('inStockOnly')) {
        urlFilters.inStockOnly = params.get('inStock') === 'true' || params.get('inStockOnly') === 'true';
      }
      if (params.has('sort') || params.has('sortBy')) {
        const sortVal = (params.get('sort') || params.get('sortBy')) as any;
        urlFilters.sortBy = sortVal;
      }
      if (params.has('q') || params.has('search') || params.has('searchQuery')) {
        urlFilters.searchQuery = params.get('q') || params.get('search') || params.get('searchQuery') || '';
      }

      return urlFilters;
    } catch {
      return {};
    }
  }, []);

  // Update URL search parameters to reflect state
  const updateURLFromFilters = useCallback((f: ProductFilterState) => {
    try {
      const params = new URLSearchParams();

      if (f.page > 1) params.set('page', f.page.toString());
      if (f.categorySlug) params.set('category', f.categorySlug);
      if (f.brandSlugs.length > 0) params.set('brand', f.brandSlugs.join(','));
      if (f.minPrice > 0) params.set('minPrice', f.minPrice.toString());
      if (f.maxPrice < 1000) params.set('maxPrice', f.maxPrice.toString());
      if (f.inStockOnly) params.set('inStock', 'true');
      if (f.sortBy !== 'featured') params.set('sort', f.sortBy);
      if (f.searchQuery) params.set('q', f.searchQuery);

      const queryString = params.toString();
      const currentHashView = window.location.hash.split('?')[0] || '#shop';
      const newUrl = queryString ? `${currentHashView}?${queryString}` : currentHashView;

      if (window.location.hash !== newUrl) {
        window.history.replaceState(null, '', newUrl);
      }
    } catch {}
  }, []);

  // Sync on initial mount & browser back/forward (popstate / hashchange)
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      const urlFilters = getFiltersFromURL();
      if (Object.keys(urlFilters).length > 0) {
        setFilters(prev => ({ ...prev, ...urlFilters }));
      }
      isInitialMount.current = false;
    }

    const handleLocationChange = () => {
      const urlFilters = getFiltersFromURL();
      if (Object.keys(urlFilters).length > 0) {
        setFilters(prev => ({ ...prev, ...urlFilters }));
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [getFiltersFromURL, setFilters]);

  // Sync URL when filter state changes
  useEffect(() => {
    if (!isInitialMount.current) {
      updateURLFromFilters(filters);
    }
  }, [filters, updateURLFromFilters]);

  // Fetch products when filters change
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { products: fetched, total } = await storefrontApi.getProducts(filters);
      setProducts(fetched);
      setTotalCount(total);
    } catch (err: any) {
      console.error('Failed to load catalog products:', err);
      setError(err?.message || 'Could not fetch catalog items. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(totalCount / (filters.pageSize || 9)));
  const currentPage = filters.page || 1;
  const startIndex = (currentPage - 1) * (filters.pageSize || 9) + 1;
  const endIndex = Math.min(currentPage * (filters.pageSize || 9), totalCount);

  const activeCategoryObj = categories.find(c => c.slug === filters.categorySlug);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Catalog Banner / Header */}
        <div className="mb-6 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Flagship Hardware Store</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeCategoryObj ? activeCategoryObj.name : 'All Products & Gear'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl font-medium">
              {activeCategoryObj ? activeCategoryObj.description : 'Browse our verified collection of pro spatial audio, GaN fast chargers, titanium smartwatches, and mechanical keyboards.'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Catalog Range</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {totalCount > 0 ? `${startIndex}–${endIndex} of ${totalCount}` : '0 Items'}
            </div>
          </div>
        </div>

        {/* Active Filters Bar */}
        {(filters.categorySlug || filters.brandSlugs.length > 0 || filters.searchQuery || filters.minPrice > 0 || filters.maxPrice < 1000 || filters.ratingMin > 0 || filters.inStockOnly) && (
          <div className="mb-6 flex flex-wrap items-center gap-2 bg-white p-3.5 border border-slate-200/90 rounded-2xl shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Active Filters:
            </span>

            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 border border-primary/20 text-primary text-xs font-semibold rounded-full">
                Search: "{filters.searchQuery}"
                <button onClick={() => setFilters(prev => ({ ...prev, searchQuery: '', page: 1 }))} className="hover:text-primary-hover cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}

            {filters.categorySlug && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 border border-primary/20 text-primary text-xs font-semibold rounded-full">
                Dept: {activeCategoryObj?.name || filters.categorySlug}
                <button onClick={() => setFilters(prev => ({ ...prev, categorySlug: null, page: 1 }))} className="hover:text-primary-hover cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}

            {filters.brandSlugs.map((bs) => (
              <span key={bs} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 border border-primary/20 text-primary text-xs font-semibold rounded-full capitalize">
                Brand: {bs}
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, brandSlugs: prev.brandSlugs.filter(s => s !== bs), page: 1 }))}
                  className="hover:text-primary-hover cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {(filters.minPrice > 0 || filters.maxPrice < 1000) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 border border-primary/20 text-primary text-xs font-semibold rounded-full">
                Price: ${filters.minPrice} - ${filters.maxPrice}
                <button onClick={() => setFilters(prev => ({ ...prev, minPrice: 0, maxPrice: 1000, page: 1 }))} className="hover:text-primary-hover cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}

            {filters.inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full">
                In Stock Only
                <button onClick={() => setFilters(prev => ({ ...prev, inStockOnly: false, page: 1 }))} className="hover:text-emerald-900 cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}

            {filters.ratingMin > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-full">
                Rating: {filters.ratingMin}+ Stars
                <button onClick={() => setFilters(prev => ({ ...prev, ratingMin: 0, page: 1 }))} className="hover:text-amber-900 cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-xs font-bold text-primary hover:text-primary hover:underline ml-auto cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Sorting & Grid Layout Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-4">
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
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
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any, page: 1 }))}
                className="appearance-none bg-slate-50 border border-slate-300 hover:border-slate-400 py-2 pl-3.5 pr-8 text-xs font-bold text-slate-800 rounded-xl focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="featured">Featured / Best Sellers</option>
                <option value="newest">Newest Releases</option>
                <option value="oldest">Oldest Catalog Items</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="rating">Highest Customer Rating</option>
              </select>
              <ChevronDown size={14} className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-primary shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-primary shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

        </div>

        {/* Main Grid & Desktop Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs sticky top-28">
            <ProductFilterSidebar />
          </div>

          {/* Products Presentation Stage */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Loading Skeletons */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: filters.pageSize || 9 }).map((_, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl bg-slate-200" />
                    <Skeleton className="h-4 w-1/3 rounded-md bg-slate-200" />
                    <Skeleton className="h-5 w-full rounded-md bg-slate-200" />
                    <Skeleton className="h-6 w-1/2 rounded-md bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : error ? (
              /* Error State */
              <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-base font-extrabold text-primary-hover">Catalog Loading Error</h3>
                <p className="text-xs text-primary max-w-md mx-auto">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-5 py-2.5 bg-primary hover:bg-primary text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Retry Loading Catalog</span>
                </button>
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <PackageX size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-900">No products match your criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
                  We couldn't find any devices or gear matching your current filter settings. Try adjusting your search query, price range, or category filter.
                </p>
                <div className="pt-2">
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-primary hover:bg-primary text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-primary/20"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              /* Product Grid or List */
              <>
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">
                      Showing <span className="font-bold text-slate-900">{startIndex}</span> to <span className="font-bold text-slate-900">{endIndex}</span> of <span className="font-bold text-slate-900">{totalCount}</span> items
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Previous Page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Next Page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in-50 duration-200" 
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 animate-in slide-in-from-right duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-black text-base text-slate-900">Filter Hardware</h3>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)} 
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <ProductFilterSidebar onCloseMobile={() => setIsMobileFilterOpen(false)} />
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-primary hover:bg-primary text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
              >
                Apply Filters & View ({totalCount})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
