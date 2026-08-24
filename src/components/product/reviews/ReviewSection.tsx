'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Product, ProductReview, ReviewStats } from '../../../types/storefront';
import { ReviewSummary } from './ReviewSummary';
import { ReviewList } from './ReviewList';
import { ReviewFormModal } from './ReviewFormModal';
import { ReviewImageLightbox } from './ReviewImageLightbox';
import { reviewService } from '../../../services/reviewService';

export interface ReviewSectionProps {
  product: Product;
  onUpdateProductReviews?: (updatedReviews: ProductReview[], newReviewCount: number, newRating: number) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  product,
  onUpdateProductReviews,
}) => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reviews, setReviews] = useState<ProductReview[]>(product.reviews || []);
  const [stats, setStats] = useState<ReviewStats | undefined>(undefined);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(product.reviewCount || (product.reviews?.length ?? 0));

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

  const fetchReviews = useCallback(async (targetPage = 1) => {
    if (!product.id) return;
    setIsLoading(true);
    try {
      const res = await reviewService.getProductReviews(product.id, {
        page: targetPage,
        limit: 10,
      });

      if (res.status === 'success' && res.data) {
        if (res.data.reviews && res.data.reviews.length > 0) {
          setReviews(res.data.reviews);
          setTotalCount(res.data.total);
          setTotalPages(res.data.totalPages || 1);
          setPage(res.data.page || targetPage);
          if (res.data.stats) {
            setStats(res.data.stats);
          }
        } else if (product.reviews && product.reviews.length > 0) {
          // If backend returns empty array for new product, keep product.reviews fallback
          setReviews(product.reviews);
        } else {
          setReviews([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.warn('Could not load reviews from API, using fallback product reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [product.id, product.reviews]);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  // Reset local state on product transition to prevent flashing old product reviews
  useEffect(() => {
    setReviews(product.reviews || []);
    setStats(undefined);
    setPage(1);
    setTotalPages(1);
    setTotalCount(product.reviewCount || (product.reviews?.length ?? 0));
  }, [product.id, product.reviews, product.reviewCount]);

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
    const updatedReviews = [newReview, ...reviews.filter((r) => r.id !== newReview.id)];
    setReviews(updatedReviews);
    const newCount = (totalCount || 0) + 1;
    setTotalCount(newCount);

    const totalScore = updatedReviews.reduce((sum, r) => sum + (r.rating || 5), 0);
    const newAverage = Number((totalScore / updatedReviews.length).toFixed(1));

    if (onUpdateProductReviews) {
      onUpdateProductReviews(updatedReviews, newCount, newAverage);
    }

    // Refresh review list from backend
    fetchReviews(1);
  };

  const currentAverageRating = stats?.averageRating ?? product.rating ?? 5.0;
  const currentTotalReviews = totalCount || product.reviewCount || reviews.length;

  return (
    <section className="space-y-6" aria-label="Customer Reviews & Ratings">
      {/* 1. Review Summary with Rating Distribution */}
      <ReviewSummary
        rating={currentAverageRating}
        reviewCount={currentTotalReviews}
        reviews={reviews}
        distribution={stats?.ratingDistribution || stats?.distribution}
        onWriteReview={() => setIsFormOpen(true)}
      />

      {/* 2. Review List with Filter Tabs, Pagination and Review Cards */}
      <ReviewList
        reviews={reviews}
        onOpenLightbox={handleOpenLightbox}
        onWriteReview={() => setIsFormOpen(true)}
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => {
          setPage(newPage);
          fetchReviews(newPage);
        }}
        isLoading={isLoading}
        totalReviews={currentTotalReviews}
      />

      {/* 3. Review Submission Modal with Eligibility Verification and Image Upload */}
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
