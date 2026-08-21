'use client';

import React, { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { Product, SearchFacetsResponse } from '../../types/storefront';
import { ProductCard } from '../common/ProductCard';
import { trackGA4ViewItemList } from '../../utils/analytics';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  History, 
  Trash2, 
  Clock, 
  Sparkles, 
  Check, 
  Filter, 
  Grid, 
  List, 
  Star,
  PackageX,
  ArrowRight,
  TrendingUp,
  Tag,
  Loader2
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';

export const SearchPageView: React.FC = () => {
  const { 
    viewParams, 
    navigateTo, 
    categories, 
    brands, 
    searchHistory, 
    addSearchHistory, 
    clearSearchHistory, 
    removeSearchHistoryItem 
  } = useStorefront();

  const [isPending, startTransition] = useTransition();

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [ratingMin, setRatingMin] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Results & Facets state
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [facets, setFacets] = useState<SearchFacetsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFacetsLoading, setIsFacetsLoading] = useState<boolean>(true);

  const trackedSearchRef = useRef<string | null>(null);

  // Track search_results view_item_list
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      const listKey = `search_${searchQuery}_${page}_${products.map(p => p.id).join(',')}`;
      if (trackedSearchRef.current !== listKey) {
        trackedSearchRef.current = listKey;
        trackGA4ViewItemList('search_results', `Search Results: ${searchQuery || 'All'}`, products);
      }
    }
  }, [isLoading, products, searchQuery, page]);

  // Sync state from URL as absolute Source of Truth
  const syncFromURL = useCallback(() => {
    let q = viewParams.searchQuery || '';
    
    // Check window location if viewParams not hydrated yet
    let searchStr = window.location.search;
    if (!searchStr && window.location.hash.includes('?')) {
      searchStr = window.location.hash.substring(window.location.hash.indexOf('?'));
    }

    if (searchStr) {
      const params = new URLSearchParams(searchStr);
      if (params.has('q')) q = params.get('q') || '';
      if (params.has('category')) setSelectedCategory(params.get('category'));
      if (params.has('brand')) {
        const b = params.get('brand');
        if (b) setSelectedBrands(b.split(',').map(s => s.trim().toLowerCase()));
      }
      if (params.has('minPrice')) setMinPrice(parseFloat(params.get('minPrice') || '0'));
      if (params.has('maxPrice')) setMaxPrice(parseFloat(params.get('maxPrice') || '1000'));
      if (params.has('inStock')) setInStockOnly(params.get('inStock') === 'true');
      if (params.has('rating')) setRatingMin(parseFloat(params.get('rating') || '0'));
      if (params.has('sort')) setSortBy(params.get('sort') || 'featured');
      if (params.has('page')) setPage(parseInt(params.get('page') || '1', 10));
    }

    setSearchQuery(q);
  }, [viewParams.searchQuery]);

  useEffect(() => {
    syncFromURL();
  }, [syncFromURL]);

  // Update URL helper
  const updateURLParams = (updates: Record<string, any>) => {
    const searchParams = new URLSearchParams(window.location.search);
    
    // Also parse current hash if applicable
    if (window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1];
      const hParams = new URLSearchParams(hashQuery);
      hParams.forEach((val, key) => {
        if (!searchParams.has(key)) searchParams.set(key, val);
      });
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0) || value === false) {
        searchParams.delete(key);
      } else if (Array.isArray(value)) {
        searchParams.set(key, value.join(','));
      } else {
        searchParams.set(key, String(value));
      }
    });

    const newQueryStr = searchParams.toString();
    const newPath = `/search${newQueryStr ? `?${newQueryStr}` : ''}`;

    try {
      window.history.pushState(null, '', newPath);
    } catch {}
  };

  // Execute Search API call (GET /api/storefront/v1/search)
  const executeSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await storefrontApi.search({
        q: searchQuery,
        category: selectedCategory || undefined,
        brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
        minPrice,
        maxPrice,
        inStock: inStockOnly || undefined,
        ratingMin: ratingMin > 0 ? ratingMin : undefined,
        sort: sortBy,
        page,
        pageSize,
      });

      setProducts(res.products || []);
      setTotalProducts(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedBrands, minPrice, maxPrice, inStockOnly, ratingMin, sortBy, page]);

  // Fetch Search Facets API call (GET /api/storefront/v1/search/facets)
  const fetchFacets = useCallback(async () => {
    setIsFacetsLoading(true);
    try {
      const res = await storefrontApi.getSearchFacets(searchQuery);
      setFacets(res);
    } catch (err) {
      console.error('Facets error:', err);
    } finally {
      setIsFacetsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  useEffect(() => {
    fetchFacets();
  }, [fetchFacets]);

  // Handle Search Input submission on page
  const handlePageSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      addSearchHistory(trimmed);
    }
    setPage(1);
    updateURLParams({ q: trimmed, page: 1 });
  };

  // Toggle brand selection
  const handleBrandToggle = (brandSlug: string) => {
    const updated = selectedBrands.includes(brandSlug)
      ? selectedBrands.filter(b => b !== brandSlug)
      : [...selectedBrands, brandSlug];
    setSelectedBrands(updated);
    setPage(1);
    updateURLParams({ brand: updated, page: 1 });
  };

  // Category change
  const handleCategorySelect = (catSlug: string | null) => {
    setSelectedCategory(catSlug);
    setPage(1);
    updateURLParams({ category: catSlug, page: 1 });
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedBrands([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setInStockOnly(false);
    setRatingMin(0);
    setSortBy('featured');
    setPage(1);
    updateURLParams({
      category: null,
      brand: null,
      minPrice: null,
      maxPrice: null,
      inStock: null,
      rating: null,
      sort: 'featured',
      page: 1,
    });
  };

  const hasActiveFilters = Boolean(
    selectedCategory ||
    selectedBrands.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    inStockOnly ||
    ratingMin > 0
  );

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={14} />
              <span>Catalog Search Engine</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              {searchQuery ? (
                <>Search results for <span className="text-primary">"{searchQuery}"</span></>
              ) : (
                <>Search Storefront Catalog</>
              )}
            </h1>
            
            <p className="text-sm text-slate-500 mb-6">
              {isLoading ? (
                <span>Searching products across all categories...</span>
              ) : (
                <span>Found <strong className="text-slate-900 font-extrabold">{totalProducts}</strong> products matching your query and filters.</span>
              )}
            </p>

            {/* Page-level Search Input Form */}
            <form onSubmit={handlePageSearchSubmit} className="flex items-center gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories, specifications..."
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      updateURLParams({ q: '' });
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-primary hover:bg-primary text-white text-sm font-bold rounded-2xl transition-all shadow-sm shadow-primary/20 cursor-pointer min-h-[46px] flex items-center justify-center gap-2"
              >
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Search History Pills Bar */}
          {searchHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <History size={13} className="text-primary" />
                  <span>Recent Queries:</span>
                </span>
                {searchHistory.slice(0, 6).map((term, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-primary/5 text-slate-700 hover:text-primary border border-slate-200/80 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span 
                      onClick={() => {
                        setSearchQuery(term);
                        addSearchHistory(term);
                        setPage(1);
                        updateURLParams({ q: term, page: 1 });
                      }}
                      className="flex items-center gap-1"
                    >
                      <Clock size={12} className="text-slate-400" />
                      <span>{term}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearchHistoryItem(term);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => clearSearchHistory()}
                className="text-xs font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Clear history</span>
              </button>
            </div>
          )}
        </div>

        {/* Active Filter Badges */}
        {(hasActiveFilters || searchQuery) && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap text-xs font-medium text-slate-600">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mr-1">
                Active Filters:
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-xl font-bold border border-slate-200">
                  Query: "{searchQuery}"
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      updateURLParams({ q: '' });
                    }} 
                    className="hover:text-primary cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary rounded-xl font-bold border border-primary/20">
                  Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => handleCategorySelect(null)} className="hover:text-primary-hover cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedBrands.map(bSlug => (
                <span key={bSlug} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl font-bold border border-indigo-200">
                  Brand: {brands.find(b => b.slug === bSlug)?.name || bSlug}
                  <button onClick={() => handleBrandToggle(bSlug)} className="hover:text-indigo-900 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              ))}

              {(minPrice !== undefined || maxPrice !== undefined) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl font-bold border border-emerald-200">
                  Price: ${minPrice || 0} - ${maxPrice || 'Max'}
                  <button onClick={() => {
                    setMinPrice(undefined);
                    setMaxPrice(undefined);
                    updateURLParams({ minPrice: null, maxPrice: null });
                  }} className="hover:text-emerald-900 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-xl font-bold border border-amber-200">
                  In Stock Only
                  <button onClick={() => {
                    setInStockOnly(false);
                    updateURLParams({ inStock: null });
                  }} className="hover:text-amber-900 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}

              {ratingMin > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-xl font-bold border border-purple-200">
                  Rating: {ratingMin}+ ★
                  <button onClick={() => {
                    setRatingMin(0);
                    updateURLParams({ rating: null });
                  }} className="hover:text-purple-900 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs font-extrabold text-primary hover:text-primary flex items-center gap-1 cursor-pointer hover:underline"
            >
              <RotateCcw size={13} />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

        {/* Main Content: Sidebar Facets + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 mb-4">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="flex items-center gap-2 font-bold text-sm text-slate-800"
            >
              <SlidersHorizontal size={18} className="text-primary" />
              <span>Filters & Facets</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary"></span>
              )}
            </button>
            <span className="text-xs text-slate-500 font-semibold">{totalProducts} Items</span>
          </div>

          {/* Facets Sidebar (Desktop + Mobile Drawer) */}
          <aside className={`lg:block bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 ${
            isMobileFilterOpen ? 'block' : 'hidden'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base">
                <SlidersHorizontal size={18} className="text-primary" />
                <span>Filter Facets</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-primary font-bold hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Facet */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Categories</span>
                {selectedCategory && (
                  <button onClick={() => handleCategorySelect(null)} className="text-[11px] text-primary font-bold">Clear</button>
                )}
              </h3>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    selectedCategory === null 
                      ? 'bg-primary/5 text-primary border border-primary/20' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[11px] font-semibold opacity-60">{totalProducts}</span>
                </button>

                {facets?.categories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-primary/5 text-primary border border-primary/20 font-bold' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Facet */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Brands</span>
                {selectedBrands.length > 0 && (
                  <button onClick={() => {
                    setSelectedBrands([]);
                    updateURLParams({ brand: null });
                  }} className="text-[11px] text-primary font-bold">Clear ({selectedBrands.length})</button>
                )}
              </h3>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {facets?.brands.map((b) => {
                  const isChecked = selectedBrands.includes(b.slug);
                  return (
                    <label
                      key={b.slug}
                      onClick={() => handleBrandToggle(b.slug)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        isChecked ? 'bg-primary/5 text-primary border border-primary/20' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          isChecked ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="truncate">{b.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{b.count}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range Facet */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Price Range
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Min (৳)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={minPrice ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : undefined;
                      setMinPrice(val);
                      updateURLParams({ minPrice: val });
                    }}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Max (৳)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="1000"
                    value={maxPrice ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : undefined;
                      setMaxPrice(val);
                      updateURLParams({ maxPrice: val });
                    }}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* In Stock & Rating */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-700">In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    updateURLParams({ inStock: e.target.checked });
                  }}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </label>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Minimum Rating</label>
                <select
                  value={ratingMin}
                  onChange={(e) => {
                    const r = parseFloat(e.target.value);
                    setRatingMin(r);
                    updateURLParams({ rating: r > 0 ? r : null });
                  }}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl cursor-pointer focus:outline-none focus:border-primary"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4.5}>4.5★ & Above</option>
                  <option value={4.0}>4.0★ & Above</option>
                  <option value={3.5}>3.5★ & Above</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Product Results List */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Sorting Header */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const s = e.target.value;
                    setSortBy(s);
                    setPage(1);
                    updateURLParams({ sort: s, page: 1 });
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-1.5 rounded-xl font-extrabold cursor-pointer focus:outline-none border border-slate-200/60"
                >
                  <option value="featured">Best Match / Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">
                  Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalProducts)} of {totalProducts}
                </span>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white text-primary shadow-xs font-bold' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'list' ? 'bg-white text-primary shadow-xs font-bold' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid / Loading / Empty */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-2.5 border border-slate-200 space-y-2.5">
                    <Skeleton className="w-full aspect-square rounded-xl" />
                    <Skeleton className="w-3/4 h-4 rounded-lg" />
                    <Skeleton className="w-1/2 h-3.5 rounded-lg" />
                    <Skeleton className="w-full h-8 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4'
                  : 'space-y-4'
              }>
                {products.map((prod, idx) => (
                  <ProductCard 
                    key={prod.id} 
                    product={prod} 
                    itemListId="search_results"
                    itemListName={`Search Results: ${searchQuery || 'All'}`}
                    index={idx + 1}
                  />
                ))}
              </div>
            ) : (
              /* EMPTY RESULTS STATE */
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center shadow-xs my-6">
                <div className="w-16 h-16 rounded-3xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/10 shadow-xs">
                  <PackageX size={32} />
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                  No matching products found
                </h2>

                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  We couldn't find any products matching <strong className="text-slate-800">"{searchQuery || 'your filters'}"</strong>.
                  Try checking your spelling or relaxing active search filters.
                </p>

                {/* Popular Search Terms Recovery */}
                <div className="mb-8 p-4 bg-slate-50 rounded-2xl max-w-lg mx-auto border border-slate-200/80">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Try searching for:
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Wireless Headphones', 'Smartwatch', '4K Webcam', 'GaN Charger', 'Mechanical Keyboard', 'Gaming Mouse'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          addSearchHistory(term);
                          setPage(1);
                          updateURLParams({ q: term, page: 1 });
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-primary/5 text-slate-700 hover:text-primary rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-2.5 bg-primary hover:bg-primary text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-sm shadow-primary/20"
                  >
                    Clear All Filters & Reset Search
                  </button>
                  <button
                    onClick={() => navigateTo('shop')}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-extrabold transition-all cursor-pointer"
                  >
                    Browse All Catalog Products
                  </button>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    const newPage = Math.max(1, page - 1);
                    setPage(newPage);
                    updateURLParams({ page: newPage });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => {
                        setPage(pNum);
                        updateURLParams({ page: pNum });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        pNum === page
                          ? 'bg-primary text-white shadow-sm shadow-primary/20'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>

                <button
                  disabled={page >= totalPages}
                  onClick={() => {
                    const newPage = Math.min(totalPages, page + 1);
                    setPage(newPage);
                    updateURLParams({ page: newPage });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
