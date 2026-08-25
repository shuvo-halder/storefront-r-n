'use client';

import React, { useState, useEffect } from 'react';
import { AccountLayout } from './AccountLayout';
import { SmartImage } from '../common/SmartImage';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '../../services/customerService';
import { useStorefront } from '../../context/StorefrontContext';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice } from '../../utils/formatters';
import { getReviewStatusMeta } from '../../utils/trackingStatus';
import { CustomerReview, EligibleReviewItem } from '../../types/customer';
import { ReviewForm } from './ReviewForm';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Star, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Edit3
} from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') === 'history' ? 'history' : 'eligible';

  const [activeTab, setActiveTab] = useState<'eligible' | 'history'>(initialTab);
  const [page, setPage] = useState<number>(1);
  const [selectedEligibleItem, setSelectedEligibleItem] = useState<EligibleReviewItem | null>(null);

  const { publicSettings } = useStorefront();
  const { settings } = useSettings();
  const currencyCode = publicSettings?.general?.currency || settings?.general?.currency || 'BDT';
  const currencySymbol = publicSettings?.general?.currencySymbol || settings?.general?.currencySymbol || '৳';

  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'history' || tabParam === 'eligible') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Query 1: Eligible items for review (GET /customer/reviews/eligible)
  const { 
    data: eligibleData, 
    isLoading: isEligibleLoading, 
    isError: isEligibleError, 
    error: eligibleError, 
    refetch: refetchEligible,
    isFetching: isFetchingEligible
  } = useQuery({
    queryKey: ['customer', 'reviews', 'eligible'],
    queryFn: async () => {
      const res = await customerService.getEligibleReviews();
      if (res.status === 'error' || !res.data) {
        throw new Error(res.message || 'Failed to fetch eligible review items.');
      }
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // Query 2: Submitted review history (GET /customer/reviews)
  const { 
    data: reviewsData, 
    isLoading: isReviewsLoading, 
    isError: isReviewsError, 
    error: reviewsError, 
    refetch: refetchReviews,
    isFetching: isFetchingReviews
  } = useQuery({
    queryKey: ['customer', 'reviews', { page }],
    queryFn: async () => {
      const res = await customerService.getReviews({ page, limit: 10 });
      if (res.status === 'error' || !res.data) {
        throw new Error(res.message || 'Failed to fetch customer reviews.');
      }
      return res.data;
    },
    staleTime: 30 * 1000,
    enabled: activeTab === 'history',
  });

  const eligibleItems = eligibleData?.items || [];
  const submittedReviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <AccountLayout activeTab="reviews">
      <div className="space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#DC2B53] uppercase tracking-wider mb-1">
              <Star size={14} className="fill-[#DC2B53]" />
              <span>Product Feedback</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Reviews</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Review your delivered purchases and manage your published feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 bg-purple-50 border border-purple-200 rounded-lg text-xs font-semibold text-purple-900 flex items-center gap-2">
              <Sparkles size={15} className="text-purple-600" />
              <span>
                {eligibleItems.length} Purchase{eligibleItems.length === 1 ? '' : 's'} Ready to Review
              </span>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-gray-200 gap-6">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 relative transition-colors cursor-pointer ${
              activeTab === 'eligible'
                ? 'text-[#DC2B53]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Edit3 size={15} />
            <span>Eligible Purchases</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeTab === 'eligible'
                  ? 'bg-[#DC2B53]/10 text-[#DC2B53]'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {eligibleItems.length}
            </span>
            {activeTab === 'eligible' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DC2B53]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 relative transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'text-[#DC2B53]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare size={15} />
            <span>My Submitted Reviews</span>
            {pagination.total > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  activeTab === 'history'
                    ? 'bg-[#DC2B53]/10 text-[#DC2B53]'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {pagination.total}
              </span>
            )}
            {activeTab === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DC2B53]" />
            )}
          </button>
        </div>

        {/* Tab 1: Eligible for Review */}
        {activeTab === 'eligible' && (
          <div>
            {isEligibleLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs animate-pulse flex gap-3.5">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-24 mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isEligibleError ? (
              <div className="bg-white rounded-xl p-8 border border-red-200 shadow-xs text-center">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Unable to Load Review Entitlements</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
                  {eligibleError instanceof Error ? eligibleError.message : 'Please check your connection and retry.'}
                </p>
                <button
                  onClick={() => refetchEligible()}
                  disabled={isFetchingEligible}
                  className="btn-primary inline-flex items-center gap-2 text-xs cursor-pointer"
                >
                  <RefreshCw size={14} className={isFetchingEligible ? 'animate-spin' : ''} />
                  <span>Retry</span>
                </button>
              </div>
            ) : eligibleItems.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-xs text-center">
                <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  You don't have any purchases currently eligible for review.
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
                  Only delivered products can be reviewed. As soon as your pending shipments arrive, you'll be able to share your experience here!
                </p>
                <div className="flex justify-center gap-3">
                  <Link
                    href="/account/orders"
                    className="btn-primary inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs"
                  >
                    <ShoppingBag size={15} />
                    <span>View Order History</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {eligibleItems.map((item: EligibleReviewItem) => {
                  const purchaseDate = item.deliveredAt || item.purchasedAt || item.createdAt;
                  const formattedDate = purchaseDate
                    ? new Date(purchaseDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : null;

                  return (
                    <div
                      key={item.orderItemId}
                      className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between hover:border-gray-300 transition-colors gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden border border-gray-200 flex-shrink-0 relative">
                          <SmartImage
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            fallbackType="product"
                            fallbackLabel={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                            {item.productName}
                          </h3>
                          {item.variantName && (
                            <p className="text-[11px] text-gray-500 mt-0.5">{item.variantName}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-gray-500">
                            {item.orderNumber && (
                              <Link
                                href={`/account/orders/${item.orderId}`}
                                className="font-medium text-[#DC2B53] hover:underline"
                              >
                                Order #{item.orderNumber}
                              </Link>
                            )}
                            {formattedDate && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span>{formattedDate}</span>
                              </>
                            )}
                          </div>

                          {(item.price !== undefined || item.unitPrice !== undefined) && (
                            <div className="text-xs font-bold text-gray-900 mt-1">
                              {formatPrice(item.price ?? item.unitPrice ?? 0, item.currency || currencyCode, currencySymbol)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                          <ShieldCheck size={13} />
                          <span>Verified Purchase</span>
                        </div>
                        <button
                          onClick={() => setSelectedEligibleItem(item)}
                          className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                        >
                          <Star size={13} className="fill-white" />
                          <span>Write a Review</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Submitted Reviews */}
        {activeTab === 'history' && (
          <div>
            {isReviewsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs animate-pulse space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : isReviewsError ? (
              <div className="bg-white rounded-xl p-8 border border-red-200 shadow-xs text-center">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Failed to Load Submitted Reviews</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
                  {reviewsError instanceof Error ? reviewsError.message : 'Please check your network and retry.'}
                </p>
                <button
                  onClick={() => refetchReviews()}
                  disabled={isFetchingReviews}
                  className="btn-primary inline-flex items-center gap-2 text-xs cursor-pointer"
                >
                  <RefreshCw size={14} className={isFetchingReviews ? 'animate-spin' : ''} />
                  <span>Retry</span>
                </button>
              </div>
            ) : submittedReviews.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-xs text-center">
                <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No reviews submitted yet.</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                  You haven't written any product reviews yet. Share your feedback on items you've purchased!
                </p>
                <button
                  onClick={() => setActiveTab('eligible')}
                  className="btn-primary inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs cursor-pointer"
                >
                  <Star size={14} className="fill-white" />
                  <span>View Review-Eligible Items</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {submittedReviews.map((rev: CustomerReview) => {
                  const statusMeta = getReviewStatusMeta(rev.status);
                  const isVerified = rev.verifiedPurchase ?? rev.isVerifiedPurchase ?? true;
                  const submissionDate = rev.createdAt || rev.updatedAt
                    ? new Date(rev.createdAt || rev.updatedAt!).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : null;

                  return (
                    <div
                      key={rev.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 sm:p-6 space-y-4"
                    >
                      {/* Top Bar: Product Link + Status Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-3 min-w-0">
                          {rev.productImage && (
                            <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden border border-gray-200 flex-shrink-0 relative">
                              <SmartImage
                                src={rev.productImage}
                                alt={rev.productName || 'Product'}
                                fill
                                fallbackType="product"
                                fallbackLabel={rev.productName || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                              {rev.productName || 'Product Review'}
                            </h4>
                            {rev.productSlug && (
                              <Link
                                href={`/products/${rev.productSlug}`}
                                className="text-[11px] font-medium text-[#DC2B53] hover:underline inline-flex items-center gap-1"
                              >
                                <span>View Product</span>
                                <ExternalLink size={11} />
                              </Link>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                      </div>

                      {/* Review Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={15}
                                className={
                                  star <= rev.rating
                                    ? 'fill-[#F59E0B] text-[#F59E0B]'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                          </div>
                          {rev.headline && (
                            <h5 className="text-xs font-bold text-gray-900">{rev.headline}</h5>
                          )}
                        </div>

                        <p className="text-xs text-gray-700 leading-relaxed font-normal whitespace-pre-line">
                          {rev.comment || rev.content}
                        </p>

                        {/* Uploaded Photos */}
                        {rev.images && rev.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {rev.images.map((imgUrl, idx) => (
                              <div key={idx} className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 relative">
                                <img
                                  src={imgUrl}
                                  alt={`Review photo ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer Info */}
                      <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-2">
                        <div className="flex items-center gap-3">
                          {isVerified && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                              <ShieldCheck size={12} />
                              <span>Verified Purchase</span>
                            </span>
                          )}
                          {submissionDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>Reviewed on {submissionDate}</span>
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 font-medium">
                      Page <span className="font-bold text-gray-900">{pagination.page}</span> of{' '}
                      <span className="font-bold text-gray-900">{pagination.totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page >= pagination.totalPages}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal: Write Review Form */}
        {selectedEligibleItem && (
          <ReviewForm
            item={selectedEligibleItem}
            isOpen={!!selectedEligibleItem}
            onClose={() => setSelectedEligibleItem(null)}
            onSuccess={() => {
              setSelectedEligibleItem(null);
            }}
          />
        )}

      </div>
    </AccountLayout>
  );
};
