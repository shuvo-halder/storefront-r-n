'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SmartImage } from '../common/SmartImage';
import { isValidImageUrl } from '../../utils/imageUtils';
import { useParams } from 'next/navigation';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { storefrontApi } from '../../services/storefrontApi';
import { Product, ProductReview, ProductVariant } from '../../types/storefront';
import { RatingStars } from '../common/RatingStars';
import { ProductCard } from '../common/ProductCard';
import { trackGA4ViewItem, trackGA4ViewItemList, trackGA4WhatsAppClick, trackGA4CallClick } from '../../utils/analytics';
import { formatPrice } from '../../utils/formatters';
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
  Loader2,
  MessageCircle,
  PhoneCall
} from 'lucide-react';
import { Skeleton, ProductCardSkeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';

import { SEO } from '../common/SEO';
import { getProductSchema, getBreadcrumbSchema } from '../../utils/seo';

export const ProductDetailPage: React.FC = () => {
  const routeParams = useParams();
  const { 
    viewParams, 
    toggleWishlist, 
    isInWishlist, 
    navigateTo, 
    trackRecentlyViewed,
    recentlyViewed,
    notifySuccess,
    notifyWarning,
    notifyInfo,
    notifyError,
    publicSettings
  } = useStorefront();

  const { addToCart: addToCartFn, isAddingToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState<boolean>(false);
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

  // GA4 Event Tracking Refs for duplicate prevention
  const trackedProductIdRef = useRef<string | null>(null);
  const trackedRelatedRef = useRef<string | null>(null);

  // Track GA4 view_item event on product load
  useEffect(() => {
    if (product && trackedProductIdRef.current !== product.id) {
      trackedProductIdRef.current = product.id;
      const currency = publicSettings?.general?.currency || 'BDT';
      trackGA4ViewItem(product, currency);
    }
  }, [product, publicSettings]);

  // Track GA4 view_item_list event for related products
  useEffect(() => {
    if (relatedProducts.length > 0) {
      const listKey = relatedProducts.map(p => p.id).join(',');
      if (trackedRelatedRef.current !== listKey) {
        trackedRelatedRef.current = listKey;
        trackGA4ViewItemList('related_products', 'Related Products', relatedProducts);
      }
    }
  }, [relatedProducts]);

  // Load product data based on viewParams.productSlug or routeParams.slug
  useEffect(() => {
    let isMounted = true;

    const loadProductAndRelated = async () => {
      const slug = (routeParams?.slug as string) || viewParams.productSlug;
      if (!slug) {
        setError('No product slug specified.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setIsRelatedLoading(true);
      setRelatedProducts([]);

      try {
        const data = await storefrontApi.getProductBySlug(slug);
        
        if (!isMounted) return;

        if (data) {
          setProduct(data);
          setSelectedImage(data.images && data.images.length > 0 ? data.images[0] : '/placeholder-product.png');
          
          // Select default variant if available
          if (data.variants && data.variants.length > 0) {
            const firstVariant = data.variants[0];
            setSelectedVariantId(firstVariant.id);
            if (firstVariant.image && isValidImageUrl(firstVariant.image)) {
              setSelectedImage(firstVariant.image);
            }
          } else {
            setSelectedVariantId(undefined);
          }

          setQuantity(1);
          trackRecentlyViewed(data.id);

          // Fetch related products using categorySlug, falling back to brandSlug and general catalog
          const catSlug = data.categorySlug;
          const brandSlug = data.brandSlug;

          let related: Product[] = [];

          if (catSlug) {
            try {
              const res = await storefrontApi.getProducts({ categorySlug: catSlug, pageSize: 12 });
              related = res.products.filter(p => p.id !== data.id && p.slug !== data.slug);
            } catch (e) {
              console.warn('Error fetching related products by category:', e);
            }
          }

          if (related.length < 4) {
            let fallbackProducts: Product[] = [];
            if (brandSlug) {
              try {
                const brandRes = await storefrontApi.getProducts({ brandSlugs: [brandSlug], pageSize: 12 });
                fallbackProducts = brandRes.products;
              } catch (e) {}
            }
            if (fallbackProducts.length <= 1) {
              try {
                const genRes = await storefrontApi.getProducts({ pageSize: 12 });
                fallbackProducts = genRes.products;
              } catch (e) {}
            }

            for (const item of fallbackProducts) {
              if (item.id !== data.id && item.slug !== data.slug && !related.some(r => r.id === item.id || r.slug === item.slug)) {
                related.push(item);
              }
            }
          }

          if (isMounted) {
            setRelatedProducts(related.slice(0, 5));
            setIsRelatedLoading(false);
          }

        } else {
          setError('Product not found or may have been removed from the catalog.');
          setIsRelatedLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching product details:', err);
          setError(err?.message || 'Failed to load product details.');
          setIsRelatedLoading(false);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProductAndRelated();

    return () => { isMounted = false; };
  }, [routeParams?.slug, viewParams.productSlug]);


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
      <div className="py-16 bg-[#F9FAFB] min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-xl bg-[#FDF0F3] text-[#DC2B53] flex items-center justify-center mx-auto border border-[#DC2B53]/20">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-[#111827]">Product Unavailable</h2>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            {error || "The requested item slug could not be located in our inventory."}
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigateTo('shop')}
              className="w-full py-2.5 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Variant computation
  const currencySymbol = publicSettings?.general?.currencySymbol || (publicSettings?.general?.currency === 'BDT' ? '৳' : '৳');
  const currencyCode = publicSettings?.general?.currency || 'BDT';
  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeComparePrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  // Use product-level stock as availability source if variant stock is 0 but product.stock > 0
  const activeStock = (selectedVariant && selectedVariant.stock > 0)
    ? selectedVariant.stock
    : (product.stock > 0 ? product.stock : 0);
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
    const variantEffectiveStock = variant.stock > 0 ? variant.stock : (product.stock > 0 ? product.stock : 0);
    if (variantEffectiveStock > 0) {
      setQuantity(prev => Math.min(Math.max(1, prev), variantEffectiveStock));
    } else {
      setQuantity(1);
    }
  };

  const handleAddToCart = async () => {
    if (activeStock === 0) {
      notifyWarning('Out of Stock', 'This item/variant is currently out of stock.');
      return;
    }
    try {
      await addToCartFn(product.id, quantity, selectedVariantId);
    } catch {
      // Handled centrally in useCart
    }
  };

  const handleBuyNow = async () => {
    if (activeStock === 0) {
      notifyWarning('Out of Stock', 'This item/variant is currently out of stock.');
      return;
    }
    try {
      await addToCartFn(product.id, quantity, selectedVariantId);
      navigateTo('checkout');
    } catch {
      // Handled centrally in useCart
    }
  };

  // Contact numbers from settings API
  const whatsappRaw = publicSettings?.store?.whatsappOrderNumber || publicSettings?.general?.whatsappOrderNumber || publicSettings?.whatsappOrderNumber || publicSettings?.general?.storePhone || '';
  const callRaw = publicSettings?.store?.callOrderNumber || publicSettings?.general?.callOrderNumber || publicSettings?.callOrderNumber || publicSettings?.general?.storePhone || '';

  // Safely normalize WhatsApp number (e.g. 01712345678 -> 8801712345678, +88017... -> 88017...)
  const getNormalizedWhatsAppNumber = (num: string): string => {
    let digits = num.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('01') && digits.length === 11) {
      digits = '88' + digits;
    }
    return digits;
  };

  // Safely normalize Call number for tel: link
  const getNormalizedCallNumber = (num: string): string => {
    let cleaned = num.trim();
    if (!cleaned) return '';
    const hasPlus = cleaned.startsWith('+');
    const digits = cleaned.replace(/\D/g, '');
    if (!digits) return '';
    return hasPlus ? `+${digits}` : digits;
  };

  const whatsappNumber = getNormalizedWhatsAppNumber(whatsappRaw);
  const callNumber = getNormalizedCallNumber(callRaw);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    trackGA4WhatsAppClick(product?.name || '');
    if (!whatsappNumber) {
      e.preventDefault();
      notifyError(new Error('WhatsApp order number not configured.'), 'Configuration Error');
      return;
    }
    const variant = product?.variants?.find(v => v.id === selectedVariantId);
    let message = `Hello, I want to order ${product?.name}.`;
    message += `\n\n*Product URL:* ${window.location.href}`;
    if (variant) {
      message += `\n*Variant:* ${variant.name}`;
    }
    message += `\n*Quantity:* ${quantity}`;
    const price = variant?.price || product?.price || 0;
    message += `\n*Price:* ${formatPrice(price * quantity, currencyCode, currencySymbol)}`;
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCallClick = (e: React.MouseEvent) => {
    trackGA4CallClick(product?.name || '');
    if (!callNumber) {
      e.preventDefault();
      notifyError(new Error('Call order number not configured.'), 'Configuration Error');
      return;
    }
    window.location.href = `tel:${callNumber}`;
  };

  const handleShare = () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      notifySuccess('Link Copied!', 'Product link copied to your clipboard.');
    } catch {
      notifyInfo('Share Link', window.location.href);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) {
      notifyWarning('Incomplete Review', 'Please provide your name and review comments.');
      return;
    }

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
    notifySuccess('Review Published!', 'Thank you! Your verified rating has been submitted.');
  };

  const openLightbox = (imgUrl: string) => {
    const index = product.images.indexOf(imgUrl);
    setZoomImageIndex(index >= 0 ? index : 0);
    setIsZoomOpen(true);
  };

  return (
    <div className="py-8 bg-white min-h-screen">
      <SEO 
        title={product.name}
        description={product.description}
        ogImage={selectedImage || product.images[0]}
        ogType="product"
        structuredData={[
          getProductSchema(product, publicSettings?.general?.currency),
          getBreadcrumbSchema([
            { name: 'Home', url: typeof window !== 'undefined' ? window.location.origin : 'https://vyzobd.com' },
            { name: 'Products', url: `${typeof window !== 'undefined' ? window.location.origin : 'https://vyzobd.com'}/products` },
            { name: product.name, url: typeof window !== 'undefined' ? `${window.location.origin}/products/${product.slug}` : `https://vyzobd.com/products/${product.slug}` }
          ])
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#6B7280] font-medium overflow-x-auto pb-1">
          <button onClick={() => navigateTo('home')} className="hover:text-[#DC2B53] transition-colors cursor-pointer">
            Home
          </button>
          <ChevronRight size={12} className="text-[#6B7280] flex-shrink-0" />
          <button onClick={() => navigateTo('shop')} className="hover:text-[#DC2B53] transition-colors cursor-pointer">
            Catalog
          </button>
          <ChevronRight size={12} className="text-[#6B7280] flex-shrink-0" />
          <button 
            onClick={() => navigateTo('shop')} 
            className="hover:text-[#DC2B53] transition-colors cursor-pointer truncate"
          >
            {product.category}
          </button>
          <ChevronRight size={12} className="text-[#6B7280] flex-shrink-0" />
          <span className="text-[#111827] font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Main Showcase Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Gallery Column (6 cols on Desktop) */}
          <div className="lg:col-span-6 space-y-3.5">
            
            {/* Main Image Stage */}
            <div className="relative aspect-square bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] overflow-hidden group">
              <SmartImage 
                src={selectedImage || product.images[0]} 
                alt={product.name} 
                priority
                fill
                fallbackType="product"
                fallbackLabel={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />

              {/* Discount Badge */}
              {computedDiscount && (
                <span className="absolute top-3.5 left-3.5 bg-[#DC2B53] text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs z-10">
                  -{computedDiscount}% OFF
                </span>
              )}

              {/* Zoom trigger icon */}
              <button
                onClick={() => openLightbox(selectedImage || product.images[0])}
                className="absolute top-3.5 right-3.5 p-2 rounded-lg bg-[#111827]/80 hover:bg-[#111827] text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                title="Expand Full Resolution Image"
              >
                <ZoomIn size={16} />
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#111827] shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 border border-[#E5E7EB]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const currIdx = product.images.indexOf(selectedImage);
                      const nextIdx = (currIdx + 1) % product.images.length;
                      setSelectedImage(product.images[nextIdx]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#111827] shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 border border-[#E5E7EB]"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all cursor-pointer relative ${
                      selectedImage === img ? 'border-[#DC2B53] ring-1 ring-[#DC2B53]/20' : 'border-[#E5E7EB] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SmartImage 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      fill
                      fallbackType="product"
                      fallbackLabel={product.name}
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Details Column (6 cols on Desktop) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
            
            <div className="space-y-3">
              
              {/* Brand & Stock Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#DC2B53] bg-[#FDF0F3] px-2.5 py-0.5 rounded-md border border-[#DC2B53]/20">
                  {product.brand}
                </span>

                {/* Stock Status Badge */}
                {activeStock > 5 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] border border-emerald-200 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    In Stock ({activeStock} available)
                  </span>
                ) : activeStock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-[#D97706] border border-amber-200 text-xs font-semibold">
                    <Clock size={12} className="text-[#D97706]" />
                    Only {activeStock} Left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FDF0F3] text-[#DC2626] border border-[#DC2626]/20 text-xs font-semibold">
                    <AlertCircle size={12} className="text-[#DC2626]" />
                    Currently Out of Stock
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight leading-snug">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="text-xs sm:text-sm text-[#6B7280]">
                  {product.subtitle}
                </p>
              )}

              {/* Rating and SKU */}
              <div className="flex items-center justify-between border-y border-[#E5E7EB] py-2.5 my-2">
                <div className="flex items-center gap-2">
                  <RatingStars rating={product.rating} count={product.reviewCount} size={15} />
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className="text-xs font-semibold text-[#DC2B53] hover:underline cursor-pointer ml-1"
                  >
                    Read Reviews
                  </button>
                </div>
                <span className="text-xs font-mono text-[#6B7280]">
                  SKU: <span className="font-semibold text-[#111827]">{activeSKU}</span>
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827]">
                  {formatPrice(activePrice, currencyCode, currencySymbol)}
                </span>
                {activeComparePrice && activeComparePrice > activePrice && (
                  <span className="text-base font-medium text-[#6B7280] line-through">
                    {formatPrice(activeComparePrice, currencyCode, currencySymbol)}
                  </span>
                )}
                {computedDiscount && (
                  <span className="px-2 py-0.5 bg-[#FDF0F3] text-[#DC2B53] font-bold text-xs rounded-md border border-[#DC2B53]/20">
                    Save {formatPrice(activeComparePrice! - activePrice, currencyCode, currencySymbol)} ({computedDiscount}%)
                  </span>
                )}
              </div>

              {product.subtitle && (
                <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed pt-1 line-clamp-3">
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#111827]">Select Option:</span>
                  <span className="text-[#6B7280]">{selectedVariant?.name}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleVariantChange(v)}
                        className={`p-2.5 rounded-lg text-xs font-semibold border transition-colors flex flex-col justify-between text-left cursor-pointer ${
                          isSelected 
                            ? 'bg-[#FDF0F3] border-[#DC2B53] text-[#DC2B53] ring-1 ring-[#DC2B53]' 
                            : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#111827]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="truncate">{v.name}</span>
                          {v.colorHex && (
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-[#E5E7EB] flex-shrink-0" 
                              style={{ backgroundColor: v.colorHex }} 
                            />
                          )}
                        </div>
                        <div className="text-[#6B7280] text-[11px] flex items-center justify-between">
                          <span>{formatPrice(v.price, currencyCode, currencySymbol)}</span>
                          {v.stock === 0 && <span className="text-[#DC2626] text-[10px]">Out of stock</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity and CTA Buttons */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                
                {/* Quantity Control */}
                <div className="flex items-center border border-[#E5E7EB] rounded-lg bg-white self-start sm:self-auto min-h-[42px]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={activeStock === 0}
                    className="px-3 py-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-l-lg transition-colors font-bold disabled:opacity-40 cursor-pointer"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="px-3 text-xs font-semibold text-[#111827]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                    disabled={activeStock === 0 || quantity >= activeStock}
                    className="px-3 py-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-r-lg transition-colors font-bold disabled:opacity-40 cursor-pointer"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={activeStock === 0 || isAddingToCart}
                  className="flex-1 py-2.5 px-5 bg-[#DC2B53] hover:bg-[#C52247] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
                >
                  {isAddingToCart ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                  <span>{activeStock === 0 ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={activeStock === 0}
                  className="py-2.5 px-5 bg-[#111827] hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer min-h-[42px]"
                >
                  Buy Now
                </button>

                {/* Wishlist & Share Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-2.5 rounded-lg border transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center ${
                      inWishlist ? 'bg-[#FDF0F3] border-[#DC2B53]/30 text-[#DC2B53]' : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:text-[#DC2B53]'
                    }`}
                    title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart size={16} fill={inWishlist ? '#DC2B53' : 'none'} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2.5 bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] rounded-lg transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
                    title="Share Canonical Link"
                  >
                    <Share2 size={16} />
                  </button>
                </div>

              </div>

              {/* WhatsApp & Call For Order Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
                <button
                  onClick={handleWhatsAppClick}
                  disabled={activeStock === 0 || !whatsappNumber}
                  className="flex-1 py-2.5 px-5 bg-[#25D366] hover:bg-[#1EAE53] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
                >
                  <MessageCircle size={16} />
                  <span>Order On WhatsApp</span>
                </button>
                <button
                  onClick={handleCallClick}
                  disabled={activeStock === 0 || !callNumber}
                  className="flex-1 py-2.5 px-5 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
                >
                  <PhoneCall size={16} />
                  <span>Call For Order</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Tabbed Specifications, Shipping, Returns & Reviews */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Tab Headers */}
          <div className="flex border-b border-[#E5E7EB] gap-4 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto pb-1">
            {[
              { id: 'description', label: 'Overview' },
              { id: 'specs', label: 'Specifications' },
              { id: 'shipping', label: 'Shipping & Delivery' },
              { id: 'returns', label: 'Returns & Warranty' },
              { id: 'reviews', label: `Reviews (${product.reviewCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-[#DC2B53] text-[#DC2B53]' 
                    : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'description' && (
            <div className="space-y-5 text-[#6B7280] text-xs sm:text-sm leading-relaxed">
              <p className="text-sm text-[#111827] leading-relaxed">
                {product.description}
              </p>

              {product.features && product.features.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-bold text-sm text-[#111827] mb-3 flex items-center gap-2">
                    <Sparkles size={15} className="text-[#DC2B53]" />
                    <span>Product Highlights</span>
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 bg-[#F9FAFB] p-3 rounded-lg border border-[#E5E7EB]">
                        <CheckCircle2 size={15} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-[#111827]">{feat}</span>
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
              <h4 className="font-bold text-sm text-[#111827]">Technical Specifications</h4>
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg overflow-hidden divide-y divide-[#E5E7EB] text-xs">
                {product.specifications?.map((spec, i) => (
                  <div key={i} className="py-2.5 px-4 flex justify-between gap-4 odd:bg-white">
                    <span className="font-medium text-[#6B7280] w-1/3">{spec.key}</span>
                    <span className="font-semibold text-[#111827] w-2/3 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Shipping & Delivery */}
          {activeTab === 'shipping' && (
            <div className="space-y-4 text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              <h4 className="font-bold text-sm text-[#111827]">Shipping Policies</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] space-y-1">
                  <Truck size={18} className="text-[#DC2B53] mb-2" />
                  <h5 className="font-bold text-[#111827]">Standard Shipping</h5>
                  <p className="text-xs text-[#6B7280]">{publicSettings?.shipping?.estimatedDeliveryDays || '3–5 Business Days'}. Free shipping on orders over {formatPrice(publicSettings?.shipping?.freeShippingThreshold ?? 2000, currencyCode, currencySymbol)}. Delivery charge: Inside Dhaka {formatPrice(publicSettings?.shipping?.insideDhakaCharge ?? 60, currencyCode, currencySymbol)}, Outside Dhaka {formatPrice(publicSettings?.shipping?.outsideDhakaCharge ?? 120, currencyCode, currencySymbol)}.</p>
                </div>

                <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] space-y-1">
                  <Zap size={18} className="text-[#D97706] mb-2" />
                  <h5 className="font-bold text-[#111827]">Express Delivery</h5>
                  <p className="text-xs text-[#6B7280]">1–2 Business Days. Dispatched same day if ordered before 2 PM.</p>
                </div>

                <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] space-y-1">
                  <Package size={18} className="text-[#16A34A] mb-2" />
                  <h5 className="font-bold text-[#111827]">Insured Transit</h5>
                  <p className="text-xs text-[#6B7280]">All shipments include transit protection against loss or damage.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Returns & Warranty */}
          {activeTab === 'returns' && (
            <div className="space-y-4 text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              <h4 className="font-bold text-sm text-[#111827]">30-Day Money-Back Guarantee</h4>
              <p>
                We stand behind the quality of every product sold on Vyzobd. If you are not satisfied with your purchase, return it within 30 days in original packaging.
              </p>
              <div className="p-4 bg-[#FDF0F3] border border-[#DC2B53]/20 rounded-lg space-y-1 text-[#111827]">
                <h5 className="font-bold text-xs text-[#DC2B53]">2-Year Manufacturer Warranty</h5>
                <p className="text-xs text-[#6B7280]">
                  This product includes a 24-month warranty covering internal component defects and manufacturing faults.
                </p>
              </div>
            </div>
          )}

          {/* Tab 5: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                <div>
                  <h4 className="font-bold text-base text-[#111827]">Customer Ratings</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={product.rating} count={product.reviewCount} size={16} />
                    <span className="text-xs text-[#6B7280]">({product.rating} / 5.0 overall)</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsReviewFormOpen(true)}
                  className="px-4 py-2 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  Write a Review
                </button>
              </div>

              {/* Review Cards */}
              <div className="space-y-4 divide-y divide-[#E5E7EB]">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-xs text-[#111827] flex items-center gap-2">
                          <span>{rev.author}</span>
                          {rev.verifiedPurchase && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#16A34A] text-[10px] font-semibold border border-emerald-200">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#6B7280]">{rev.date}</span>
                      </div>
                      <RatingStars rating={rev.rating} showNumber={false} size={13} />
                      <h5 className="font-semibold text-xs text-[#111827]">{rev.title}</h5>
                      <p className="text-xs text-[#6B7280] leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#6B7280] py-4 text-center">
                    No customer reviews published yet. Be the first to write a review!
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Related Products Grid */}
        {(relatedProducts.length > 0 || isRelatedLoading) && (
          <div className="space-y-4 pt-10 border-t border-[#E5E7EB] mt-8">
            <div className="flex flex-col mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">Related Products</h3>
              <span className="text-sm font-medium text-[#6B7280] block mt-1">You may also like these products</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {isRelatedLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))
              ) : (
                relatedProducts.map((relProduct, idx) => (
                  <ProductCard 
                    key={relProduct.id} 
                    product={relProduct} 
                    itemListId="related_products"
                    itemListName="Related Products"
                    index={idx + 1}
                  />
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Image Lightbox Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
          >
            <X size={20} />
          </button>

          <div className="relative max-w-4xl w-full h-[80vh] flex items-center justify-center">
            <SmartImage 
              src={product.images[zoomImageIndex] || selectedImage} 
              alt="High resolution inspect" 
              fill
              fallbackType="product"
              fallbackLabel={product.name}
              objectFit="contain"
              className="rounded-xl"
            />

            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setZoomImageIndex((prev) => (prev <= 0 ? product.images.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-[#DC2B53] text-white cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setZoomImageIndex((prev) => (prev + 1) % product.images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-[#DC2B53] text-white cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Write Review Dialog Modal */}
      {isReviewFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsReviewFormOpen(false)} />
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative z-10 shadow-lg space-y-4 border border-[#E5E7EB]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="font-bold text-sm text-[#111827]">Write a Review</h3>
              <button onClick={() => setIsReviewFormOpen(false)} className="text-[#6B7280] hover:text-[#111827] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#111827]">Your Name</label>
                <input
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="w-full mt-1 p-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#DC2B53] text-[#111827]"
                  placeholder="e.g. Alex Johnson"
                />
              </div>

              <div>
                <label className="font-semibold text-[#111827]">Rating</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-white border border-[#E5E7EB] rounded-lg font-medium text-[#111827] focus:outline-none focus:border-[#DC2B53]"
                >
                  <option value={5}>5 Stars — Excellent</option>
                  <option value={4}>4 Stars — Very Good</option>
                  <option value={3}>3 Stars — Average</option>
                  <option value={2}>2 Stars — Below Expectations</option>
                  <option value={1}>1 Star — Poor</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#111827]">Review Headline</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full mt-1 p-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#DC2B53] text-[#111827]"
                  placeholder="e.g. Incredible sound and comfort"
                />
              </div>

              <div>
                <label className="font-semibold text-[#111827]">Your Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full mt-1 p-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#DC2B53] text-[#111827]"
                  placeholder="Share details about build quality, performance, battery life..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewFormOpen(false)}
                  className="flex-1 py-2 bg-[#F9FAFB] hover:bg-gray-100 font-semibold text-[#6B7280] rounded-lg cursor-pointer border border-[#E5E7EB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold rounded-lg cursor-pointer shadow-xs transition-colors"
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
