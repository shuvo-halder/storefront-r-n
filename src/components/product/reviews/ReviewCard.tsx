'use client';

import React from 'react';
import { CheckCircle2, User } from 'lucide-react';
import { ProductReview } from '../../../types/storefront';
import { RatingStars } from '../../common/RatingStars';
import { SmartImage } from '../../common/SmartImage';

export interface ReviewCardProps {
  review: ProductReview;
  onOpenLightbox?: (images: string[], index: number, author: string) => void;
  maxVisibleThumbnails?: number;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onOpenLightbox,
  maxVisibleThumbnails = 4,
}) => {
  const images = review.images || [];
  const hasImages = images.length > 0;

  const visibleImages = images.slice(0, maxVisibleThumbnails);
  const remainingCount = images.length - maxVisibleThumbnails;

  return (
    <article className="pt-4 first:pt-0 space-y-2.5">
      {/* Header: Author Info, Rating, Date */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Avatar / Initials */}
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
            {review.avatar ? (
              <SmartImage
                src={review.avatar}
                alt={review.author}
                width={32}
                height={32}
                fallbackType="avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={15} />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#111827]">
                {review.author}
              </span>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-[#16A34A] text-[10px] font-semibold border border-emerald-200">
                  <CheckCircle2 size={10} />
                  Verified Purchase
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#6B7280]">{review.date}</span>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex-shrink-0">
          <RatingStars rating={review.rating} showNumber={false} size={13} />
        </div>
      </div>

      {/* Review Title / Headline */}
      {review.title && (
        <h5 className="font-bold text-xs sm:text-sm text-[#111827] leading-snug">
          {review.title}
        </h5>
      )}

      {/* Review Comment */}
      <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed break-words">
        {review.comment}
      </p>

      {/* Review Image Thumbnails with Lightbox Trigger */}
      {hasImages && (
        <div className="pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {visibleImages.map((imgUrl, index) => {
              const isLastVisible = index === maxVisibleThumbnails - 1;
              const showOverlay = isLastVisible && remainingCount > 0;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onOpenLightbox?.(images, index, review.author)}
                  aria-label={`View photo ${index + 1} from review by ${review.author}`}
                  className="group relative w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden border border-[#E5E7EB] bg-[#F9FAFB] hover:border-[#DC2B53] focus:outline-none focus:ring-2 focus:ring-[#DC2B53] transition-all cursor-pointer flex-shrink-0"
                >
                  <SmartImage
                    src={imgUrl}
                    alt={`Review photo ${index + 1} from ${review.author}`}
                    fill
                    fallbackType="product"
                    objectFit="cover"
                    className="transition-transform duration-200 group-hover:scale-105"
                  />

                  {/* Plus More Overlay on the last thumbnail */}
                  {showOverlay && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold transition-opacity group-hover:bg-black/70">
                      +{remainingCount + 1}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
};
