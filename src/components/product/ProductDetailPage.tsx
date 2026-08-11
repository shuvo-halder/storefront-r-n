import React, { useState, useEffect, useCallback } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { storefrontApi } from '../../services/storefrontApi';
import { Product, ProductReview, ProductVariant } from '../../types/storefront';
import { RatingStars } from '../common/RatingStars';
import { ProductCard } from '../common/ProductCard';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw,
  Star,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  ZoomIn,
  X,
  Package,
  AlertCircle,
  Clock,
  Sparkles,
  Award,
  HelpCircle,
  Send,
  Check,
  Zap,
  Loader2
} from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';

import { SEO } from '../common/SEO';
import { getProductSchema, getBreadcrumbSchema } from '../../utils/seo';

export const ProductDetailPage: React.FC = () => {
  const { 
    viewParams, 
    toggleWishlist, 
    isInWishlist, 
    navigateTo, 
    trackRecentlyViewed,
    recentlyViewed,
    addToast,
    publicSettings
  } = useStorefront();

  const { addToCart: addToCartFn, isAddingToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping' | 'returns' | 'reviews'>('description');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Zoom / Lightbox Modal State
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [zoomImageIndex, setZoomImageIndex] = useState<number>(0);

  // Review form modal
  const [isReviewFormOpen, setIsReviewFormOpen] = useState<boolean>(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, title: '', comment: '' });

  // Load product data based on viewParams.productSlug
  useEffect(() => {
    let isMounted = true;

    const loadProductAndRelated = async () => {
      const slug = viewParams.productSlug;
      if (!slug) {
        setError('No product slug specified.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Parallelize product fetch and recently viewed if possible (though recently viewed is local)
        const data = await storefrontApi.getProductBySlug(slug);
        
        if (!isMounted) return;

        if (data) {
          setProduct(data);
          setSelectedImage(data.images && data.images.length > 0 ? data.images[0] : '/placeholder-product.png');
          
          // Select default variant if available
          if (data.variants && data.variants.length > 0) {
            const firstVariant = data.variants[0];
            setSelectedVariantId(firstVariant.id);
            if (firstVariant.image) {
              setSelectedImage(firstVariant.image);
            }
          } else {
            setSelectedVariantId(undefined);
          }

          setQuantity(1);
          trackRecentlyViewed(data.id);

          // Fetch related products - can be started immediately after product data is known
          storefrontApi.getProducts({ categorySlug: data.categoryId || data.category })
            .then(relatedRes => {
              if (isMounted) {
                const filtered = relatedRes.products.filter(p => p.id !== data.id).slice(0, 4);
                setRelatedProducts(filtered);
              }
            })
            .catch(() => {
              if (isMounted) setRelatedProducts([]);
            });

        } else {
          setError('Product not found or may have been removed from the catalog.');
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching product details:', err);
          setError(err?.message || 'Failed to load product details.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProductAndRelated();

    return () => { isMounted = false; };
  }, [viewParams.productSlug]);


  if (isLoading) {
    return (
      <div className="py-10 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-6 w-64 rounded-xl bg-slate-200" />
          <div className="bg-white border border-slate-200 rounded-3xl p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4">
              <Skeleton className="h-[420px] w-full rounded-2xl bg-slate-200" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-20 rounded-xl bg-slate-200" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-6 space-y-4">
              <Skeleton className="h-6 w-32 rounded-md bg-slate-200" />
              <Skeleton className="h-10 w-full rounded-xl bg-slate-200" />
              <Skeleton className="h-8 w-40 rounded-xl bg-slate-200" />
              <Skeleton className="h-24 w-full rounded-2xl bg-slate-200" />
              <Skeleton className="h-12 w-full rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mx-auto border border-primary/10">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Product Unavailable</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {error || "The requested item slug could not be located in our inventory."}
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigateTo('shop')}
              className="w-full py-3 bg-primary hover:bg-primary text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Variant computation
  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeComparePrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock;
  const activeSKU = selectedVariant ? selectedVariant.sku : `AURA-PRD-${product.id}`;

  const hasDiscount = activeComparePrice && activeComparePrice > activePrice;
  const computedDiscount = hasDiscount 
    ? Math.round(((activeComparePrice - activePrice) / activeComparePrice) * 100) 
    : product.discountPercent;

  const inWishlist = isInWishlist(product.id);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    if (variant.image) {
      setSelectedImage(variant.image);
    }
  };

  const handleAddToCart = () => {
    if (activeStock === 0) return;
    addToCartFn({ productId: product.id, quantity, variantId: selectedVariantId });
  };

  const handleBuyNow = async () => {
    if (activeStock === 0) return;
    await addToCartFn({ productId: product.id, quantity, variantId: selectedVariantId });
    navigateTo('checkout');
  };

  const handleShare = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      addToast({
        title: 'Share Link Copied!',
        description: 'Product canonical URL copied to clipboard.',
        type: 'info',
      });
    } catch {
      addToast({ title: 'Sharing Active', description: window.location.href, type: 'info' });
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    const reviewObj: ProductReview = {
      id: `rev-${Date.now()}`,
      author: newReview.name,
      rating: newReview.rating,
      date: 'Just Now',
      title: newReview.title || 'Verified Hardware Review',
      comment: newReview.comment,
      verifiedPurchase: true,
    };

    setProduct(prev => prev ? {
      ...prev,
      reviews: [reviewObj, ...(prev.reviews || [])],
      reviewCount: prev.reviewCount + 1,
    } : null);

    setIsReviewFormOpen(false);
    setNewReview({ name: '', rating: 5, title: '', comment: '' });
    addToast({ title: 'Review Published!', description: 'Your verified rating has been submitted.', type: 'success' });
  };

  const openLightbox = (imgUrl: string) => {
    const index = product.images.indexOf(imgUrl);
    setZoomImageIndex(index >= 0 ? index : 0);
    setIsZoomOpen(true);
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <SEO 
        title={product.name}
        description={product.description}
        ogImage={selectedImage || product.images[0]}
        ogType="product"
        structuredData={[
          getProductSchema(product, publicSettings?.general?.currency),
          getBreadcrumbSchema([
            { name: 'Home', url: typeof window !== 'undefined' ? window.location.origin : '' },
            { name: 'Catalog', url: `${typeof window !== 'undefined' ? window.location.origin : ''}/#shop` },
            { name: product.name, url: typeof window !== 'undefined' ? window.location.href : '' }
          ])
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto pb-1">
          <button onClick={() => navigateTo('home')} className="hover:text-primary transition-colors cursor-pointer">
            Home
          </button>
          <ChevronRight size={12} className="text-slate-400 flex-shrink-0" />
          <button onClick={() => navigateTo('shop')} className="hover:text-primary transition-colors cursor-pointer">
            Catalog
          </button>
          <ChevronRight size={12} className="text-slate-400 flex-shrink-0" />
          <button 
            onClick={() => navigateTo('shop')} 
            className="hover:text-primary transition-colors cursor-pointer truncate"
          >
            {product.category}
          </button>
          <ChevronRight size={12} className="text-slate-400 flex-shrink-0" />
          <span className="text-slate-900 font-extrabold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Main Showcase Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Gallery Column (6 cols on Desktop) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Image Stage */}
            <div className="relative aspect-square bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden group">
              <img 
                src={selectedImage || product.images[0]} 
                alt={product.name} 
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />

              {/* Discount Badge */}
              {computedDiscount && (
                <span className="absolute top-4 left-4 bg-primary text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md z-10">
                  -{computedDiscount}% OFF
                </span>
              )}

              {/* Zoom trigger icon */}
              <button
                onClick={() => openLightbox(selectedImage || product.images[0])}
                className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700/80 opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs z-10"
                title="Expand Full Resolution Image"
              >
                <ZoomIn size={18} />
              </button>

              {/* Image Prev/Next arrows on main stage */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const currIdx = product.images.indexOf(selectedImage);
                      const prevIdx = currIdx <= 0 ? product.images.length - 1 : currIdx - 1;
                      setSelectedImage(product.images[prevIdx]);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 border border-slate-200"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => {
                      const currIdx = product.images.indexOf(selectedImage);
                      const nextIdx = (currIdx + 1) % product.images.length;
                      setSelectedImage(product.images[nextIdx]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 border border-slate-200"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                      selectedImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges under gallery */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-xs text-slate-700">
                <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-extrabold block text-slate-900">2-Year Official Warranty</span>
                  <span className="text-[10px] text-slate-500">Authorized local repair</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-xs text-slate-700">
                <RotateCcw size={18} className="text-primary flex-shrink-0" />
                <div>
                  <span className="font-extrabold block text-slate-900">30-Day Easy Return</span>
                  <span className="text-[10px] text-slate-500">100% money back guarantee</span>
                </div>
              </div>
            </div>

          </div>

          {/* Details Column (6 cols on Desktop) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              
              {/* Brand & Stock Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-block text-xs font-black uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-md border border-primary/20">
                  {product.brand}
                </span>

                {/* Stock Status Badge */}
                {activeStock > 5 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock ({activeStock} available)
                  </span>
                ) : activeStock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                    <Clock size={12} className="text-amber-600" />
                    Only {activeStock} Left - Order Soon!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/5 text-primary border border-primary/20 text-xs font-bold">
                    <AlertCircle size={12} className="text-primary" />
                    Currently Out of Stock
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {product.subtitle}
                </p>
              )}

              {/* Rating and SKU */}
              <div className="flex items-center justify-between border-y border-slate-100 py-2.5 my-2">
                <div className="flex items-center gap-2">
                  <RatingStars rating={product.rating} count={product.reviewCount} size={16} />
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer ml-1"
                  >
                    Read Reviews
                  </button>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  SKU: <span className="font-bold text-slate-700">{activeSKU}</span>
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                  ${activePrice.toFixed(2)}
                </span>
                {activeComparePrice && activeComparePrice > activePrice && (
                  <span className="text-base font-semibold text-slate-400 line-through font-mono">
                    ${activeComparePrice.toFixed(2)}
                  </span>
                )}
                {computedDiscount && (
                  <span className="px-2.5 py-0.5 bg-primary/10 text-rose-800 font-black text-xs rounded-lg uppercase">
                    Save ${(activeComparePrice! - activePrice).toFixed(2)} ({computedDiscount}%)
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                {product.description}
              </p>
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">Select Variant / Option:</span>
                  <span className="text-slate-500 font-bold">{selectedVariant?.name}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleVariantChange(v)}
                        className={`p-3 rounded-2xl text-xs font-bold border transition-all flex flex-col justify-between text-left cursor-pointer ${
                          isSelected 
                            ? 'bg-primary/5 border-primary text-primary-hover shadow-2xs ring-2 ring-primary/20' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="truncate">{v.name}</span>
                          {v.colorHex && (
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" 
                              style={{ backgroundColor: v.colorHex }} 
                            />
                          )}
                        </div>
                        <div className="font-mono text-slate-500 text-[11px] flex items-center justify-between">
                          <span>${v.price}</span>
                          {v.stock === 0 && <span className="text-primary text-[10px]">Out of stock</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Express Shipping Notification Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3 text-xs text-slate-700">
              <Truck size={20} className="text-primary flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900">FREE Express Delivery</span> on orders over ${publicSettings?.shipping.freeShippingThreshold || 99}.
                <span className="block text-[11px] text-slate-500">Dispatched within 24 hours with real-time tracking code.</span>
              </div>
            </div>

            {/* Quantity and CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                
                {/* Quantity Control */}
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 self-start sm:self-auto min-h-[46px]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={activeStock === 0}
                    className="px-3.5 py-3 text-slate-600 hover:bg-slate-200 rounded-l-xl transition-colors font-bold disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-800 font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                    disabled={activeStock === 0 || quantity >= activeStock}
                    className="px-3.5 py-3 text-slate-600 hover:bg-slate-200 rounded-r-xl transition-colors font-bold disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={activeStock === 0 || isAddingToCart}
                  className="flex-1 py-3.5 px-6 bg-primary hover:bg-primary disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                >
                  {isAddingToCart ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                  <span>{activeStock === 0 ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={activeStock === 0}
                  className="py-3.5 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer min-h-[46px]"
                >
                  Buy Now
                </button>

                {/* Wishlist & Share Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer min-h-[46px] min-w-[46px] flex items-center justify-center ${
                      inWishlist ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-500 hover:text-primary'
                    }`}
                    title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart size={18} fill={inWishlist ? '#e11d48' : 'none'} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer min-h-[46px] min-w-[46px] flex items-center justify-center"
                    title="Share Canonical Link"
                  >
                    <Share2 size={18} />
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Tabbed Specifications, Shipping, Returns & Reviews */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 gap-4 sm:gap-8 text-xs sm:text-sm font-bold overflow-x-auto pb-1">
            {[
              { id: 'description', label: 'Overview & Highlights' },
              { id: 'specs', label: 'Technical Specifications' },
              { id: 'shipping', label: 'Shipping & Delivery' },
              { id: 'returns', label: 'Returns & Warranty' },
              { id: 'reviews', label: `Customer Reviews (${product.reviewCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'description' && (
            <div className="space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
              <div className="prose max-w-none text-slate-600 space-y-3">
                <p className="text-sm font-medium text-slate-800 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    <span>Product Features & Key Highlights</span>
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-slate-800">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Technical Specifications */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 mb-2">Technical Data & Architecture</h4>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-200/80 text-xs sm:text-sm">
                {product.specifications?.map((spec, i) => (
                  <div key={i} className="py-3 px-4 flex justify-between gap-4 odd:bg-white">
                    <span className="font-bold text-slate-500 w-1/3">{spec.key}</span>
                    <span className="font-semibold text-slate-900 w-2/3 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Shipping & Delivery */}
          {activeTab === 'shipping' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h4 className="font-extrabold text-sm text-slate-900">Shipping Policies & Partner Couriers</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <Truck size={20} className="text-primary mb-2" />
                  <h5 className="font-bold text-slate-900">Standard Shipping</h5>
                  <p className="text-xs text-slate-500">3–5 Business Days. Free on all orders over $99.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <Zap size={20} className="text-amber-500 mb-2" />
                  <h5 className="font-bold text-slate-900">Express Priority Air</h5>
                  <p className="text-xs text-slate-500">1–2 Business Days. Dispatched same day if ordered before 2 PM EST.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <Package size={20} className="text-emerald-600 mb-2" />
                  <h5 className="font-bold text-slate-900">Insured Delivery</h5>
                  <p className="text-xs text-slate-500">All shipments include full transit protection against damage or loss.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Returns & Warranty */}
          {activeTab === 'returns' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h4 className="font-extrabold text-sm text-slate-900">30-Day Money-Back Guarantee & Official Warranty</h4>
              <p>
                We stand behind the craftsmanship of every device sold on Vyzobd. If you are not satisfied with your purchase, return it within 30 days in original packaging for a full refund or exchange.
              </p>
              <div className="p-4 bg-primary/5 border border-primary/20/80 rounded-2xl space-y-2 text-primary-hover">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-primary">Official 2-Year Manufacturer Hardware Warranty</h5>
                <p className="text-xs text-rose-800">
                  This hardware product includes a comprehensive 24-month warranty covering internal component defects, battery degradation beyond 20%, and firmware failures.
                </p>
              </div>
            </div>
          )}

          {/* Tab 5: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-black text-lg text-slate-900">Verified Customer Ratings</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={product.rating} count={product.reviewCount} size={18} />
                    <span className="text-xs text-slate-500 font-semibold">({product.rating} / 5.0 overall)</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsReviewFormOpen(true)}
                  className="px-5 py-2.5 bg-primary hover:bg-primary text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-primary/20"
                >
                  Write a Review
                </button>
              </div>

              {/* Review Cards */}
              <div className="space-y-4 divide-y divide-slate-100">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <span>{rev.author}</span>
                          {rev.verifiedPurchase && (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">{rev.date}</span>
                      </div>
                      <RatingStars rating={rev.rating} showNumber={false} size={14} />
                      <h5 className="font-bold text-xs text-slate-800">{rev.title}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    No customer reviews published yet. Be the first to write a review!
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-primary block">More in {product.category}</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">You Might Also Like</h3>
              </div>
              <button
                onClick={() => navigateTo('shop')}
                className="text-xs font-bold text-primary hover:text-primary flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Full Catalog</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Image Lightbox Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in-50 duration-200">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-white hover:bg-primary transition-colors cursor-pointer z-10"
          >
            <X size={24} />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
            <img 
              src={product.images[zoomImageIndex] || selectedImage} 
              alt="High resolution inspect" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />

            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setZoomImageIndex((prev) => (prev <= 0 ? product.images.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-primary text-white border border-slate-700 cursor-pointer"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setZoomImageIndex((prev) => (prev + 1) % product.images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-primary text-white border border-slate-700 cursor-pointer"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Write Review Dialog Modal */}
      {isReviewFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsReviewFormOpen(false)} />
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Write Verified Review</h3>
              <button onClick={() => setIsReviewFormOpen(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-medium"
                  placeholder="e.g. Alex Johnson"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Rating Grade</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-primary"
                >
                  <option value={5}>5 Stars — Excellent Performance</option>
                  <option value={4}>4 Stars — Very Good Quality</option>
                  <option value={3}>3 Stars — Average / Acceptable</option>
                  <option value={2}>2 Stars — Below Expectations</option>
                  <option value={1}>1 Star — Poor Experience</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Review Headline</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-medium"
                  placeholder="e.g. Incredible spatial audio & active noise canceling"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Detailed Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-medium"
                  placeholder="Describe your daily usage, build quality, sound profile, battery life..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewFormOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 font-bold text-slate-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-primary text-white font-extrabold rounded-xl cursor-pointer shadow-md shadow-primary/20"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
