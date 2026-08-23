'use client';

import React, { useState, useMemo } from 'react';
import { Image as ImageIcon, Star, MessageSquare, Sparkles } from 'lucide-react';
import { ProductReview } from '../../../types/storefront';
import { ReviewCard } from './ReviewCard';

export interface ReviewListProps {
  reviews: ProductReview[];
  onOpenLightbox: (images: string[], index: number, author: string) => void;
  onWriteReview: () => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onOpenLightbox,
  onWriteReview,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'with-images' | '5-star' | '4-star'>('all');

  const filteredReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];

    switch (filterType) {
      case 'with-images':
        return reviews.filter((r) => r.images && r.images.length > 0);
      case '5-star':
        return reviews.filter((r) => Math.round(r.rating) === 5);
      case '4-star':
        return reviews.filter((r) => Math.round(r.rating) === 4);
      default:
        return reviews;
    }
  }, [reviews, filterType]);

  const reviewsWithImagesCount = useMemo(() => {
    return reviews.filter((r) => r.images && r.images.length > 0).length;
  }, [reviews]);

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-[#F9FAFB] border border-dashed border-[#E5E7EB] rounded-xl space-y-3">
        <div className="w-12 h-12 rounded-full bg-white border border-[#E5E7EB] mx-auto flex items-center justify-center text-[#6B7280] shadow-2xs">
          <MessageSquare size={22} className="text-[#DC2B53]" />
        </div>
        <div className="space-y-1">
          <h5 className="font-bold text-sm text-[#111827]">No customer reviews yet</h5>
          <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
            Be the first to rate and review this product. Upload photos to help other shoppers!
          </p>
        </div>
        <button
          type="button"
          onClick={onWriteReview}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Sparkles size={14} />
          Write the First Review
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#E5E7EB] text-xs">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
            filterType === 'all'
              ? 'bg-[#111827] text-white'
              : 'bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] hover:bg-gray-100'
          }`}
        >
          All Reviews ({reviews.length})
        </button>

        {reviewsWithImagesCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterType('with-images')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              filterType === 'with-images'
                ? 'bg-[#DC2B53] text-white'
                : 'bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] hover:bg-gray-100'
            }`}
          >
            <ImageIcon size={13} />
            With Photos ({reviewsWithImagesCount})
          </button>
        )}

        <button
          type="button"
          onClick={() => setFilterType('5-star')}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
            filterType === '5-star'
              ? 'bg-amber-500 text-white'
              : 'bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] hover:bg-gray-100'
          }`}
        >
          5 <Star size={11} className="fill-current inline" />
        </button>

        <button
          type="button"
          onClick={() => setFilterType('4-star')}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
            filterType === '4-star'
              ? 'bg-amber-500 text-white'
              : 'bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] hover:bg-gray-100'
          }`}
        >
          4 <Star size={11} className="fill-current inline" />
        </button>
      </div>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="divide-y divide-[#E5E7EB] space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onOpenLightbox={onOpenLightbox}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#6B7280] py-6 text-center">
          No reviews match the selected filter.
        </p>
      )}
    </div>
  );
};
