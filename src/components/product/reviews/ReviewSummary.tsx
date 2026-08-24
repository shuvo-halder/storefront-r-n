'use client';

import React from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';
import { ProductReview } from '../../../types/storefront';
import { RatingStars } from '../../common/RatingStars';

export interface ReviewSummaryProps {
  rating: number;
  reviewCount: number;
  reviews?: ProductReview[];
  distribution?: Record<number, number>;
  onWriteReview: () => void;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  rating,
  reviewCount,
  reviews = [],
  distribution: backendDistribution,
  onWriteReview,
}) => {
  // Use backend pre-calculated distribution if available, or calculate breakdown from reviews list (or proportional fallback)
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (backendDistribution && Object.values(backendDistribution).some((v) => v > 0)) {
    for (let i = 1; i <= 5; i++) {
      distribution[i] = backendDistribution[i] || 0;
    }
  } else if (reviews.length > 0) {
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
      distribution[star] = (distribution[star] || 0) + 1;
    });
  } else if (reviewCount > 0) {
    // Proportional breakdown based on average rating
    distribution[5] = rating >= 4.5 ? Math.round(reviewCount * 0.7) : Math.round(reviewCount * 0.4);
    distribution[4] = Math.round(reviewCount * 0.2);
    distribution[3] = Math.round(reviewCount * 0.07);
    distribution[2] = Math.round(reviewCount * 0.02);
    distribution[1] = Math.max(0, reviewCount - (distribution[5] + distribution[4] + distribution[3] + distribution[2]));
  }

  const effectiveTotal = Object.values(distribution).reduce((sum, v) => sum + v, 0) || (reviews.length > 0 ? reviews.length : Math.max(1, reviewCount));

  return (
    <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Overall Rating & Stars */}
        <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-[#E5E7EB] pb-4 md:pb-0 md:pr-6">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            {reviewCount > 0 ? rating.toFixed(1) : '0.0'}
          </span>
          <div className="mt-1">
            <RatingStars rating={reviewCount > 0 ? rating : 0} showNumber={false} size={18} />
          </div>
          <span className="text-xs text-[#6B7280] font-medium mt-1">
            Based on {reviewCount} verified {reviewCount === 1 ? 'review' : 'reviews'}
          </span>

          <button
            type="button"
            onClick={onWriteReview}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#DC2B53] focus:ring-offset-2"
          >
            <MessageSquarePlus size={15} />
            Write a Review
          </button>
        </div>

        {/* Right: Star Rating Distribution Progress Bars */}
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((starLevel) => {
            const count = distribution[starLevel] || 0;
            const percentage = Math.round((count / effectiveTotal) * 100);

            return (
              <div key={starLevel} className="flex items-center gap-2 text-xs">
                <span className="w-12 font-medium text-[#111827] flex items-center gap-1 justify-end">
                  {starLevel} <Star size={11} className="fill-amber-400 text-amber-400 inline" />
                </span>

                {/* Progress Track */}
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="w-10 text-right font-medium text-[#6B7280] text-[11px]">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
