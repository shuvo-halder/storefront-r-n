'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Quote, 
  CheckCircle2, 
  Star, 
  Sparkles,
  Pause,
  ShoppingBag
} from 'lucide-react';
import { ProductReview } from '../../types/storefront';
import { storefrontApi } from '../../services/storefrontApi';
import { SmartImage } from '../common/SmartImage';
import { Skeleton } from '../ui/Skeleton';

export interface CustomerReviewItem extends ProductReview {
  productName?: string;
  productSlug?: string;
  productImage?: string;
}

export const CustomerReviewCarousel: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // 1. Fetch featured reviews from backend API (GET /reviews/featured)
  const { data: featuredData, isLoading: isFeaturedLoading, isError: isFeaturedError } = useQuery({
    queryKey: ['featured_reviews'],
    queryFn: async () => {
      const res = await storefrontApi.getFeaturedReviews(10);
      return res || [];
    },
  });

  // Fallback: Fetch products using existing storefront API if featured reviews are not populated yet
  const { data: productsData, isLoading: isProductsLoading, isError: isProductsError } = useQuery({
    queryKey: ['home_products'],
    queryFn: async () => {
      const res = await storefrontApi.getProducts({ pageSize: 50 });
      return res.products || [];
    },
    enabled: !featuredData || featuredData.length === 0,
  });

  const isLoading = isFeaturedLoading && isProductsLoading;
  const isError = isFeaturedError && isProductsError;

  // 2. Extract valid reviews from featured reviews API or product fallback
  const allReviews = useMemo<CustomerReviewItem[]>(() => {
    if (featuredData && Array.isArray(featuredData) && featuredData.length > 0) {
      return featuredData.map((rev) => ({
        ...rev,
        productName: rev.productName,
        productSlug: rev.productSlug,
        productImage: rev.productImage,
      }));
    }

    if (!productsData || !Array.isArray(productsData)) return [];
    
    const extracted: CustomerReviewItem[] = [];
    for (const product of productsData) {
      if (product.reviews && Array.isArray(product.reviews)) {
        for (const rev of product.reviews) {
          if (rev && (rev.comment?.trim() || rev.title?.trim() || rev.rating)) {
            extracted.push({
              ...rev,
              productName: product.name,
              productSlug: product.slug,
              productImage: product.images?.[0],
            });
          }
        }
      }
    }
    return extracted;
  }, [featuredData, productsData]);

  // 3. Shuffle once and select available reviews (stable for current page session)
  const reviews = useMemo<CustomerReviewItem[]>(() => {
    if (allReviews.length === 0) return [];
    
    const shuffled = [...allReviews];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 10);
  }, [allReviews]);

  const count = reviews.length;

  // Safe navigation handlers
  const handlePrev = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  const handleNext = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev + 1) % count);
  }, [count]);

  const handleSelect = useCallback((index: number) => {
    if (index >= 0 && index < count) {
      setActiveIndex(index);
    }
  }, [count]);

  // 4. Autoplay timer (4000ms / 4 seconds, paused on hover)
  useEffect(() => {
    if (isPaused || count <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, count]);

  // Touch swipe support for mobile
  const minSwipeDistance = 45;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  // Star rating renderer helper
  const renderStars = (rating: number, size = 12) => (
    <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}
        />
      ))}
    </div>
  );

  // 5. Loading State: Responsive Skeleton Structure
  if (isLoading) {
    return (
      <section 
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 box-border overflow-hidden"
        aria-label="Loading customer reviews"
      >
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-2xs min-h-[280px]">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between shrink-0 mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48 rounded-md bg-slate-200" />
              <Skeleton className="h-5 w-28 rounded-full bg-slate-200 hidden sm:block" />
            </div>
            <Skeleton className="h-4 w-16 rounded-md bg-slate-200" />
          </div>

          {/* Responsive Cards Skeleton */}
          <div className="flex items-center justify-between gap-3 lg:gap-4 my-auto w-full py-1">
            <div className="hidden lg:flex flex-1 min-w-0">
              <Skeleton className="h-[160px] w-full rounded-xl bg-slate-200/80" />
            </div>
            <div className="hidden md:flex flex-1 min-w-0">
              <Skeleton className="h-[160px] w-full rounded-xl bg-slate-200/80" />
            </div>
            <div className="flex-1 min-w-0 w-full">
              <Skeleton className="h-[175px] w-full rounded-xl bg-slate-200" />
            </div>
            <div className="hidden md:flex flex-1 min-w-0">
              <Skeleton className="h-[160px] w-full rounded-xl bg-slate-200/80" />
            </div>
            <div className="hidden lg:flex flex-1 min-w-0">
              <Skeleton className="h-[160px] w-full rounded-xl bg-slate-200/80" />
            </div>
          </div>

          {/* Dots Skeleton */}
          <div className="flex justify-center items-center gap-1.5 shrink-0 mt-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-2 w-2 rounded-full bg-slate-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 6. Error or Empty State: Gracefully collapse without breaking homepage
  if (isError || count === 0) {
    return null;
  }

  // Calculate relative slot positions based on total available reviews
  const getSlot = (offset: number) => {
    const idx = (activeIndex + offset + count) % count;
    return { review: reviews[idx], rawIndex: idx, offset };
  };

  // Determine slot list based on available review count
  let visibleSlots: Array<{
    review: CustomerReviewItem;
    rawIndex: number;
    offset: number;
    isCenter: boolean;
    visibility: string;
  }> = [];

  if (count >= 5) {
    visibleSlots = [
      { ...getSlot(-2), isCenter: false, visibility: 'hidden lg:flex' },
      { ...getSlot(-1), isCenter: false, visibility: 'hidden md:flex' },
      { ...getSlot(0), isCenter: true, visibility: 'flex' },
      { ...getSlot(1), isCenter: false, visibility: 'hidden md:flex' },
      { ...getSlot(2), isCenter: false, visibility: 'hidden lg:flex' },
    ];
  } else if (count === 4) {
    visibleSlots = [
      { ...getSlot(-1), isCenter: false, visibility: 'hidden md:flex' },
      { ...getSlot(0), isCenter: true, visibility: 'flex' },
      { ...getSlot(1), isCenter: false, visibility: 'hidden md:flex' },
      { ...getSlot(2), isCenter: false, visibility: 'hidden lg:flex' },
    ];
  } else if (count === 3) {
    visibleSlots = [
      { ...getSlot(-1), isCenter: false, visibility: 'hidden md:flex' },
      { ...getSlot(0), isCenter: true, visibility: 'flex' },
      { ...getSlot(1), isCenter: false, visibility: 'hidden md:flex' },
    ];
  } else if (count === 2) {
    visibleSlots = [
      { ...getSlot(0), isCenter: true, visibility: 'flex' },
      { ...getSlot(1), isCenter: false, visibility: 'hidden md:flex' },
    ];
  } else {
    visibleSlots = [
      { ...getSlot(0), isCenter: true, visibility: 'flex' },
    ];
  }

  return (
    <section 
      id="customer-testimonials"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 box-border overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer Reviews and Testimonials"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="bg-gradient-to-b from-[#F9FAFB] via-[#F9FAFB] to-white border border-[#E5E7EB] rounded-2xl px-3 py-3.5 sm:px-6 sm:py-5 flex flex-col justify-between relative overflow-hidden shadow-2xs min-h-[290px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Subtle decorative quote watermark */}
        <Quote 
          size={120} 
          className="absolute -top-4 -right-4 text-slate-200/30 pointer-events-none select-none z-0" 
        />

        {/* 1. Header Row (Compact & Clean) */}
        <div className="relative z-10 flex items-center justify-between gap-2 shrink-0 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#111827] tracking-tight leading-none">
              What Our Customers Say
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#DC2B53] shadow-2xs">
              <Sparkles size={12} className="text-[#DC2B53]" />
              Verified Stories
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isPaused && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100/90 px-1.5 py-0.5 rounded font-medium">
                <Pause size={10} /> Paused
              </span>
            )}
            <span className="text-xs text-[#6B7280] font-medium">
              {activeIndex + 1} / {count}
            </span>
          </div>
        </div>

        {/* 2. Responsive Carousel Stage (5 cards on desktop, 3 on tablet, 1 on mobile) */}
        <div className="relative z-10 w-full overflow-hidden my-auto py-1">
          <div className="flex items-center justify-center gap-3 lg:gap-3.5 w-full">
            {visibleSlots.map((slot) => {
              const item = slot.review;
              const isCenter = slot.isCenter;

              if (isCenter) {
                return (
                  <div
                    key={item.id || slot.rawIndex}
                    className={`flex-1 min-w-0 w-full ${slot.visibility} z-20`}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={item.id || slot.rawIndex}
                        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="w-full bg-white border-2 border-[#DC2B53]/35 ring-1 ring-[#DC2B53]/15 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 min-h-[175px] flex flex-col justify-between shadow-md shadow-rose-950/5 relative overflow-hidden"
                        aria-live="polite"
                      >
                        {/* Top Bar: Stars + Rating Score + Verified Badge */}
                        <div className="flex items-center justify-between gap-1.5 shrink-0">
                          <div className="flex items-center gap-1.5">
                            {renderStars(item.rating, 13)}
                            <span className="text-xs sm:text-sm font-bold text-[#111827]">
                              {item.rating.toFixed(1)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                            {item.verifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-50 text-[#16A34A] text-[10px] font-semibold border border-emerald-200 shrink-0">
                                <CheckCircle2 size={10} />
                                Verified
                              </span>
                            )}
                            <span className="text-[10px] text-[#9CA3AF] shrink-0">{item.date}</span>
                          </div>
                        </div>

                        {/* Body Content with Optional Review Photo */}
                        <div className="flex items-start gap-2.5 my-auto overflow-hidden py-1">
                          {item.images && item.images.length > 0 && (
                            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-[#E5E7EB] bg-slate-50 shrink-0">
                              <SmartImage
                                src={item.images[0]}
                                alt={`Review photo by ${item.author}`}
                                width={48}
                                height={48}
                                fallbackType="product"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            {item.title && (
                              <h3 className="font-bold text-xs sm:text-sm text-[#111827] truncate mb-0.5">
                                {item.title}
                              </h3>
                            )}
                            <blockquote className="text-xs sm:text-[13px] text-[#374151] leading-relaxed line-clamp-3 italic">
                              "{item.comment || item.title}"
                            </blockquote>
                          </div>
                        </div>

                        {/* Footer: Author & Product Reference */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F3F4F6] shrink-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#DC2B53] to-rose-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {item.avatar ? (
                                <SmartImage
                                  src={item.avatar}
                                  alt={item.author}
                                  width={28}
                                  height={28}
                                  fallbackType="avatar"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span>{item.author.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <span className="font-bold text-xs sm:text-sm text-[#111827] truncate">
                              {item.author}
                            </span>
                          </div>

                          {item.productName && (
                            <div className="hidden xl:inline-flex items-center gap-1 text-[10px] text-[#6B7280] truncate max-w-[120px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              <ShoppingBag size={10} className="text-[#DC2B53] shrink-0" />
                              <span className="truncate">{item.productName}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <div
                  key={`${item.id || slot.rawIndex}_${slot.offset}`}
                  onClick={() => handleSelect(slot.rawIndex)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(slot.rawIndex);
                    }
                  }}
                  aria-label={`View review by ${item.author}`}
                  className={`flex-1 min-w-0 ${slot.visibility} flex flex-col justify-between bg-white/95 border border-[#E5E7EB] rounded-xl sm:rounded-2xl p-3 sm:p-3.5 min-h-[165px] shadow-2xs hover:shadow-xs opacity-90 hover:opacity-100 hover:border-slate-300 transition-all duration-200 cursor-pointer select-none z-10 scale-[0.97] hover:scale-[0.99]`}
                >
                  {/* Top Bar: Stars + Date */}
                  <div className="flex items-center justify-between gap-1.5 shrink-0">
                    <div className="flex items-center gap-1">
                      {renderStars(item.rating, 11)}
                      <span className="text-xs font-semibold text-[#374151]">
                        {item.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#9CA3AF] truncate max-w-[65px]">{item.date}</span>
                  </div>

                  {/* Comment */}
                  <div className="my-auto py-1">
                    {item.title && (
                      <h4 className="font-semibold text-xs text-[#111827] truncate mb-0.5">
                        {item.title}
                      </h4>
                    )}
                    <p className="text-xs text-[#4B5563] line-clamp-3 italic leading-relaxed">
                      "{item.comment || item.title}"
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 shrink-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-[10px] font-bold shrink-0">
                        {item.author.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-xs font-semibold text-[#111827] truncate">
                        {item.author}
                      </p>
                    </div>
                    {item.verifiedPurchase && (
                      <span className="inline-flex items-center text-[10px] text-[#16A34A] font-medium shrink-0">
                        <CheckCircle2 size={10} className="mr-0.5" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Bottom Controls Row: Prev / Dots / Next */}
        {count > 1 && (
          <div className="relative z-10 flex items-center justify-center gap-3 shrink-0 mt-2 sm:mt-3">
            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded-full bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#DC2B53]/30"
              aria-label="Previous customer review"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Indicator Dots */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Review pagination">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  onClick={() => handleSelect(idx)}
                  aria-selected={idx === activeIndex}
                  aria-label={`Go to customer review ${idx + 1} of ${count}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none ${
                    idx === activeIndex
                      ? 'w-5 h-1.5 bg-[#DC2B53]'
                      : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 rounded-full bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#DC2B53]/30"
              aria-label="Next customer review"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
