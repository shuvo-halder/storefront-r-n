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
      const res = await storefrontApi.getFeaturedReviews(5);
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

  // 3. Shuffle once and select EXACTLY 5 reviews (stable for current page session)
  const reviews = useMemo<CustomerReviewItem[]>(() => {
    if (allReviews.length === 0) return [];
    
    const shuffled = [...allReviews];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 5);
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

  // 5. Loading State: Strict 302px Skeleton Structure
  if (isLoading) {
    return (
      <section 
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 box-border overflow-hidden h-[302px] min-h-[302px] max-h-[302px]"
        aria-label="Loading customer reviews"
      >
        <div className="h-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-2xs">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-44 rounded-md bg-slate-200" />
              <Skeleton className="h-4 w-24 rounded-full bg-slate-200 hidden sm:block" />
            </div>
            <Skeleton className="h-4 w-16 rounded-md bg-slate-200" />
          </div>

          {/* 5-Card Stage Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 items-center my-auto overflow-hidden">
            {/* Position 1 (Far Left - lg only) */}
            <div className="hidden lg:block opacity-35">
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 h-[145px] flex flex-col justify-between shadow-2xs">
                <Skeleton className="h-3 w-16 bg-slate-200" />
                <Skeleton className="h-8 w-full bg-slate-200" />
                <Skeleton className="h-3 w-20 bg-slate-200" />
              </div>
            </div>

            {/* Position 2 (Mid Left - md & lg) */}
            <div className="hidden md:block opacity-55">
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 h-[155px] flex flex-col justify-between shadow-2xs">
                <Skeleton className="h-3 w-20 bg-slate-200" />
                <Skeleton className="h-10 w-full bg-slate-200" />
                <Skeleton className="h-4 w-24 bg-slate-200" />
              </div>
            </div>

            {/* Position 3 (Center Highlighted) */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1">
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 h-[175px] flex flex-col justify-between shadow-md">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24 bg-slate-200" />
                  <Skeleton className="h-3 w-12 bg-slate-200" />
                </div>
                <Skeleton className="h-12 w-full bg-slate-200" />
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Skeleton className="w-7 h-7 rounded-full bg-slate-200" />
                  <Skeleton className="h-3.5 w-24 bg-slate-200" />
                </div>
              </div>
            </div>

            {/* Position 4 (Mid Right - md & lg) */}
            <div className="hidden md:block opacity-55">
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 h-[155px] flex flex-col justify-between shadow-2xs">
                <Skeleton className="h-3 w-20 bg-slate-200" />
                <Skeleton className="h-10 w-full bg-slate-200" />
                <Skeleton className="h-4 w-24 bg-slate-200" />
              </div>
            </div>

            {/* Position 5 (Far Right - lg only) */}
            <div className="hidden lg:block opacity-35">
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 h-[145px] flex flex-col justify-between shadow-2xs">
                <Skeleton className="h-3 w-16 bg-slate-200" />
                <Skeleton className="h-8 w-full bg-slate-200" />
                <Skeleton className="h-3 w-20 bg-slate-200" />
              </div>
            </div>
          </div>

          {/* Dots Skeleton */}
          <div className="flex justify-center items-center gap-1.5 shrink-0">
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

  // Calculate 5 relative slots: [-2, -1, 0 (center), +1, +2]
  // This produces continuous rotating array for 5 review positions
  const getSlotReview = (offset: number) => {
    const idx = (activeIndex + offset + count) % count;
    return { review: reviews[idx], rawIndex: idx };
  };

  const slotMinus2 = getSlotReview(-2);
  const slotMinus1 = getSlotReview(-1);
  const centerSlot = getSlotReview(0);
  const slotPlus1 = getSlotReview(1);
  const slotPlus2 = getSlotReview(2);

  const currentReview = centerSlot.review;

  return (
    <section 
      id="customer-testimonials"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 box-border overflow-hidden h-[302px] min-h-[302px] max-h-[302px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer Reviews and Testimonials"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ height: '302px', minHeight: '302px', maxHeight: '302px' }}
    >
      <div 
        className="h-full bg-gradient-to-b from-[#F9FAFB] via-[#F9FAFB] to-white border border-[#E5E7EB] rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3 flex flex-col justify-between relative overflow-hidden shadow-2xs"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Subtle decorative quote watermark */}
        <Quote 
          size={110} 
          className="absolute -top-4 -right-4 text-slate-200/40 pointer-events-none select-none z-0" 
        />

        {/* 1. Header Row (Compact & Clean) */}
        <div className="relative z-10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[#111827] tracking-tight leading-none">
              What Our Customers Say
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[10px] font-semibold text-[#DC2B53] shadow-2xs">
              <Sparkles size={11} className="text-[#DC2B53]" />
              Verified Stories
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isPaused && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100/90 px-1.5 py-0.5 rounded font-medium">
                <Pause size={10} /> Paused
              </span>
            )}
            <span className="text-[11px] text-[#6B7280] font-medium">
              {activeIndex + 1} / {count}
            </span>
          </div>
        </div>

        {/* 2. Main 5-Position Carousel Stage */}
        <div className="relative z-10 w-full overflow-hidden my-auto py-1">
          <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
            
            {/* SLOT 1: Far Left (-2) - Desktop only */}
            {count >= 5 && (
              <div 
                onClick={() => handleSelect(slotMinus2.rawIndex)}
                className="hidden lg:block w-[18%] shrink-0 transition-all duration-300 transform scale-[0.82] opacity-40 hover:opacity-75 cursor-pointer select-none"
                role="button"
                aria-label={`View review by ${slotMinus2.review.author}`}
              >
                <div className="bg-white/90 border border-[#E5E7EB] rounded-xl p-2.5 h-[152px] flex flex-col justify-between shadow-2xs hover:shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between">
                    {renderStars(slotMinus2.review.rating, 10)}
                    <span className="text-[9px] text-[#9CA3AF] truncate max-w-[50px]">{slotMinus2.review.date}</span>
                  </div>

                  <p className="text-[11px] text-[#4B5563] line-clamp-3 italic leading-relaxed my-auto">
                    "{slotMinus2.review.comment || slotMinus2.review.title}"
                  </p>

                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold shrink-0">
                      {slotMinus2.review.author.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[11px] font-semibold text-[#111827] truncate">
                      {slotMinus2.review.author}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SLOT 2: Mid Left (-1) - Tablet & Desktop */}
            {count >= 3 && (
              <div 
                onClick={() => handleSelect(slotMinus1.rawIndex)}
                className="hidden md:block w-[28%] lg:w-[20%] shrink-0 transition-all duration-300 transform scale-[0.88] opacity-55 hover:opacity-85 cursor-pointer select-none"
                role="button"
                aria-label={`View review by ${slotMinus1.review.author}`}
              >
                <div className="bg-white/95 border border-[#E5E7EB] rounded-xl p-3 h-[162px] flex flex-col justify-between shadow-xs hover:shadow-md overflow-hidden">
                  <div className="flex items-center justify-between">
                    {renderStars(slotMinus1.review.rating, 11)}
                    <span className="text-[10px] text-[#9CA3AF] truncate max-w-[65px]">{slotMinus1.review.date}</span>
                  </div>

                  <p className="text-xs text-[#4B5563] line-clamp-3 italic leading-relaxed my-auto">
                    "{slotMinus1.review.comment || slotMinus1.review.title}"
                  </p>

                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-[11px] font-bold shrink-0">
                      {slotMinus1.review.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#111827] truncate">
                        {slotMinus1.review.author}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLOT 3: CENTER HIGHLIGHTED MAIN REVIEW (0) */}
            <div className="w-full md:w-[42%] lg:w-[32%] shrink-0 z-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview.id || activeIndex}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="bg-white border border-[#E5E7EB] ring-1 ring-black/5 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 h-[178px] flex flex-col justify-between shadow-md relative overflow-hidden"
                  aria-live="polite"
                >
                  {/* Top Bar: Stars + Rating Score + Verified Badge */}
                  <div className="flex items-center justify-between gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {renderStars(currentReview.rating, 13)}
                      <span className="text-xs font-bold text-[#111827]">
                        {currentReview.rating.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                      {currentReview.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 text-[#16A34A] text-[10px] font-semibold border border-emerald-200">
                          <CheckCircle2 size={10} />
                          Verified
                        </span>
                      )}
                      <span className="text-[10px]">{currentReview.date}</span>
                    </div>
                  </div>

                  {/* Body Content with Optional Review Photo */}
                  <div className="flex items-start gap-2.5 my-auto overflow-hidden">
                    {currentReview.images && currentReview.images.length > 0 && (
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-[#E5E7EB] bg-slate-50 shrink-0">
                        <SmartImage
                          src={currentReview.images[0]}
                          alt={`Review photo by ${currentReview.author}`}
                          width={56}
                          height={56}
                          fallbackType="product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      {currentReview.title && (
                        <h3 className="font-bold text-xs sm:text-sm text-[#111827] truncate mb-0.5">
                          {currentReview.title}
                        </h3>
                      )}
                      <blockquote className="text-xs sm:text-[13px] text-[#374151] leading-snug line-clamp-2 sm:line-clamp-3 italic">
                        "{currentReview.comment}"
                      </blockquote>
                    </div>
                  </div>

                  {/* Footer: Author & Product Reference */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F3F4F6] shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#DC2B53] to-rose-400 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                        {currentReview.avatar ? (
                          <SmartImage
                            src={currentReview.avatar}
                            alt={currentReview.author}
                            width={24}
                            height={24}
                            fallbackType="avatar"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>{currentReview.author.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-bold text-xs text-[#111827] truncate">
                        {currentReview.author}
                      </span>
                    </div>

                    {currentReview.productName && (
                      <div className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[#6B7280] truncate max-w-[140px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                        <ShoppingBag size={10} className="text-[#DC2B53] shrink-0" />
                        <span className="truncate">{currentReview.productName}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* SLOT 4: Mid Right (+1) - Tablet & Desktop */}
            {count >= 3 && (
              <div 
                onClick={() => handleSelect(slotPlus1.rawIndex)}
                className="hidden md:block w-[28%] lg:w-[20%] shrink-0 transition-all duration-300 transform scale-[0.88] opacity-55 hover:opacity-85 cursor-pointer select-none"
                role="button"
                aria-label={`View review by ${slotPlus1.review.author}`}
              >
                <div className="bg-white/95 border border-[#E5E7EB] rounded-xl p-3 h-[162px] flex flex-col justify-between shadow-xs hover:shadow-md overflow-hidden">
                  <div className="flex items-center justify-between">
                    {renderStars(slotPlus1.review.rating, 11)}
                    <span className="text-[10px] text-[#9CA3AF] truncate max-w-[65px]">{slotPlus1.review.date}</span>
                  </div>

                  <p className="text-xs text-[#4B5563] line-clamp-3 italic leading-relaxed my-auto">
                    "{slotPlus1.review.comment || slotPlus1.review.title}"
                  </p>

                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-[11px] font-bold shrink-0">
                      {slotPlus1.review.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#111827] truncate">
                        {slotPlus1.review.author}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLOT 5: Far Right (+2) - Desktop only */}
            {count >= 5 && (
              <div 
                onClick={() => handleSelect(slotPlus2.rawIndex)}
                className="hidden lg:block w-[18%] shrink-0 transition-all duration-300 transform scale-[0.82] opacity-40 hover:opacity-75 cursor-pointer select-none"
                role="button"
                aria-label={`View review by ${slotPlus2.review.author}`}
              >
                <div className="bg-white/90 border border-[#E5E7EB] rounded-xl p-2.5 h-[152px] flex flex-col justify-between shadow-2xs hover:shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between">
                    {renderStars(slotPlus2.review.rating, 10)}
                    <span className="text-[9px] text-[#9CA3AF] truncate max-w-[50px]">{slotPlus2.review.date}</span>
                  </div>

                  <p className="text-[11px] text-[#4B5563] line-clamp-3 italic leading-relaxed my-auto">
                    "{slotPlus2.review.comment || slotPlus2.review.title}"
                  </p>

                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold shrink-0">
                      {slotPlus2.review.author.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[11px] font-semibold text-[#111827] truncate">
                      {slotPlus2.review.author}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 3. Bottom Controls Row: Prev / Dots / Next (Compact & Functional) */}
        {count > 1 && (
          <div className="relative z-10 flex items-center justify-center gap-3 shrink-0">
            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded-full bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#DC2B53]/30"
              aria-label="Previous customer review"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Indicator Dots for exactly 5 reviews */}
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
