'use client';

import React, { useState } from 'react';
import { Product, ProductReview } from '../../../types/storefront';
import { ReviewSummary } from './ReviewSummary';
import { ReviewList } from './ReviewList';
import { ReviewFormModal } from './ReviewFormModal';
import { ReviewImageLightbox } from './ReviewImageLightbox';

export interface ReviewSectionProps {
  product: Product;
  onUpdateProductReviews?: (updatedReviews: ProductReview[], newReviewCount: number, newRating: number) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  product,
  onUpdateProductReviews,
}) => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: string[];
    initialIndex: number;
    author?: string;
  }>({
    isOpen: false,
    images: [],
    initialIndex: 0,
    author: undefined,
  });

  const reviews = product.reviews || [];

  const handleOpenLightbox = (images: string[], index: number, author: string) => {
    setLightboxState({
      isOpen: true,
      images,
      initialIndex: index,
      author,
    });
  };

  const handleCloseLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleReviewSubmitted = (newReview: ProductReview) => {
    const updatedReviews = [newReview, ...reviews];
    const newCount = product.reviewCount + 1;
    // Calculate new average rating
    const totalScore = updatedReviews.reduce((sum, r) => sum + (r.rating || 5), 0);
    const newAverage = Number((totalScore / updatedReviews.length).toFixed(1));

    if (onUpdateProductReviews) {
      onUpdateProductReviews(updatedReviews, newCount, newAverage);
    }
  };

  return (
    <section className="space-y-6" aria-label="Customer Reviews & Ratings">
      {/* 1. Review Summary with Rating Distribution */}
      <ReviewSummary
        rating={product.rating}
        reviewCount={product.reviewCount}
        reviews={reviews}
        onWriteReview={() => setIsFormOpen(true)}
      />

      {/* 2. Review List with Filter Tabs and Review Cards */}
      <ReviewList
        reviews={reviews}
        onOpenLightbox={handleOpenLightbox}
        onWriteReview={() => setIsFormOpen(true)}
      />

      {/* 3. Review Submission Modal with Image Upload */}
      <ReviewFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productName={product.name}
        productId={product.id}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* 4. Fullscreen Image Lightbox */}
      <ReviewImageLightbox
        isOpen={lightboxState.isOpen}
        images={lightboxState.images}
        initialIndex={lightboxState.initialIndex}
        author={lightboxState.author}
        onClose={handleCloseLightbox}
      />
    </section>
  );
};
