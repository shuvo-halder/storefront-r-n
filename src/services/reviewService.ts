import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import {
  ProductReview,
  ProductReviewsResponse,
  ReviewEligibilityResponse,
  ReviewSubmissionPayload,
  FeaturedReview,
  ReviewStats,
  ReviewRatingDistribution,
} from '../types/storefront';

/**
 * Safely normalizes raw review object returned from the backend.
 */
export function normalizeReview(raw: any): ProductReview {
  if (!raw) {
    return {
      id: `rev-${Date.now()}-${Math.random()}`,
      author: 'Customer',
      rating: 5,
      date: 'Recently',
      title: '',
      comment: '',
      verifiedPurchase: true,
      images: [],
    };
  }

  const rawImages = Array.isArray(raw.images)
    ? raw.images
    : Array.isArray(raw.photos)
    ? raw.photos
    : typeof raw.image === 'string'
    ? [raw.image]
    : [];

  const validImages: string[] = rawImages
    .map((img: any) => {
      if (typeof img === 'string') return img.trim();
      if (img && typeof img === 'object' && img.url) return String(img.url).trim();
      if (img && typeof img === 'object' && img.secure_url) return String(img.secure_url).trim();
      return '';
    })
    .filter(Boolean);

  const authorName = String(
    raw.name ||
    raw.author ||
    raw.customerName ||
    raw.userName ||
    raw.user_name ||
    raw.user?.fullName ||
    raw.user?.name ||
    'Verified Buyer'
  ).trim();

  const reviewDate = String(
    raw.date ||
    raw.createdAt ||
    raw.created_at ||
    raw.updatedAt ||
    'Recently'
  );

  return {
    id: String(raw.id || raw._id || raw.reviewId || `rev-${Date.now()}`),
    author: authorName,
    avatar: raw.avatar || raw.avatarUrl || raw.userAvatar || raw.user?.avatar || undefined,
    rating: Math.max(1, Math.min(5, Number(raw.rating || raw.score || raw.stars || 5))),
    date: reviewDate,
    title: raw.reviewHeadline || raw.headline || raw.title || '',
    comment: String(raw.reviewComment || raw.comment || raw.body || raw.content || raw.message || '').trim(),
    verifiedPurchase: Boolean(
      raw.isVerifiedPurchase ??
      raw.verifiedPurchase ??
      raw.is_verified ??
      raw.verified ??
      true
    ),
    images: validImages,
    phone: raw.phone || raw.mobile || undefined,
    email: raw.email || undefined,
    productName: raw.productName || raw.product?.name || undefined,
    productSlug: raw.productSlug || raw.product?.slug || undefined,
    productImage: raw.productImage || raw.product?.image || raw.product?.images?.[0] || undefined,
  };
}

/**
 * Normalizes backend review statistics (average rating, distribution breakdown).
 */
export function normalizeReviewStats(raw: any, reviewsList: ProductReview[] = []): ReviewStats {
  const distribution: ReviewRatingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  if (raw && (raw.ratingDistribution || raw.distribution)) {
    const rawDist = raw.ratingDistribution || raw.distribution;
    for (let i = 1; i <= 5; i++) {
      distribution[i] = Number(rawDist[i] || rawDist[`star_${i}`] || rawDist[`star${i}`] || 0);
    }
  } else if (reviewsList.length > 0) {
    reviewsList.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
      distribution[star] = (distribution[star] || 0) + 1;
    });
  }

  const averageRating = raw?.averageRating ?? raw?.avg_rating ?? raw?.rating ?? (
    reviewsList.length > 0
      ? Number((reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsList.length).toFixed(1))
      : 5.0
  );

  const totalReviews = raw?.totalReviews ?? raw?.reviewsCount ?? raw?.total ?? reviewsList.length;

  return {
    averageRating: Number(averageRating),
    totalReviews: Number(totalReviews),
    ratingDistribution: distribution,
    distribution,
  };
}

export const reviewService = {
  /**
   * GET /reviews/:productId
   * Fetches approved reviews, aggregate stats, and pagination for a product.
   */
  getProductReviews: async (
    productId: string,
    params?: {
      page?: number;
      limit?: number;
      rating?: number;
      hasImages?: boolean;
      sort?: string;
    }
  ): Promise<ApiResponse<ProductReviewsResponse>> => {
    try {
      if (!productId) {
        return {
          status: 'error',
          message: 'Product ID is required',
          data: { reviews: [], total: 0, page: 1, limit: 10, totalPages: 0 },
        };
      }

      const queryParams: Record<string, any> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.rating) queryParams.rating = params.rating;
      if (params?.hasImages) queryParams.hasImages = params.hasImages;
      if (params?.sort) queryParams.sort = params.sort;

      const res = await apiClient.get(`/reviews/${productId}`, { params: queryParams });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch reviews',
          data: { reviews: [], total: 0, page: 1, limit: 10, totalPages: 0 },
        };
      }

      let rawReviews: any[] = [];
      const data = unwrapped.data;

      if (Array.isArray(data)) {
        rawReviews = data;
      } else if (data && Array.isArray(data.items)) {
        rawReviews = data.items;
      } else if (data && Array.isArray(data.reviews)) {
        rawReviews = data.reviews;
      }

      const reviews = rawReviews.map(normalizeReview);
      const stats = normalizeReviewStats(data?.stats || data, reviews);

      const total =
        unwrapped.pagination?.total ??
        data?.pagination?.total ??
        data?.total ??
        reviews.length;
      const page =
        unwrapped.pagination?.page ??
        data?.pagination?.page ??
        params?.page ??
        1;
      const limit =
        unwrapped.pagination?.limit ??
        data?.pagination?.limit ??
        params?.limit ??
        10;
      const totalPages =
        unwrapped.pagination?.totalPages ??
        data?.pagination?.totalPages ??
        (Math.ceil(total / (limit || 10)) || 1);

      return {
        status: 'success',
        message: null,
        data: {
          reviews,
          stats,
          total,
          page,
          limit,
          totalPages,
        },
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to load product reviews');
      return {
        status: 'error',
        message,
        errors,
        data: { reviews: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      };
    }
  },

  /**
   * POST /reviews/:productId/eligibility or POST /reviews/:productId/guest/eligibility
   * Validates if the customer with the provided mobile number has an unused delivered review entitlement.
   */
  checkReviewEligibility: async (
    productId: string,
    mobile?: string,
    isAuthenticated?: boolean
  ): Promise<ApiResponse<ReviewEligibilityResponse>> => {
    try {
      if (!productId) {
        return {
          status: 'error',
          message: 'Product ID is required',
          data: { eligible: false, message: 'Product ID is required' },
        };
      }

      const isAuth = isAuthenticated !== undefined ? isAuthenticated : (typeof window !== 'undefined' && !!localStorage.getItem('vyzobd_auth_token'));

      if (isAuth) {
        // Authenticated Customer Eligibility
        // POST /api/storefront/v1/reviews/:productId/eligibility
        const res = await apiClient.post(`/reviews/${productId}/eligibility`, {});
        const unwrapped = unwrapApiResponse<any>(res);

        if (unwrapped.status === 'error') {
          return {
            status: 'error',
            message: unwrapped.message || 'You are not eligible to review this product.',
            data: {
              eligible: false,
              message: unwrapped.message || 'You are not eligible to review this product.',
            },
          };
        }

        const data = unwrapped.data;
        const eligible = typeof data?.eligible === 'boolean' ? data.eligible : true;
        const responseMessage = data?.message || unwrapped.message || (eligible ? 'Eligible for review' : 'Not eligible');

        return {
          status: 'success',
          message: responseMessage,
          data: {
            eligible,
            message: responseMessage,
            availableSlots: data?.availableSlots,
            qualifyingOrderIds: data?.qualifyingOrderIds || [],
            orderItemId: data?.orderItemId,
            reason: data?.reason,
          },
        };
      } else {
        // Guest Review Eligibility
        // POST /api/storefront/v1/reviews/:productId/guest/eligibility
        const cleanMobile = mobile?.trim();
        if (!cleanMobile) {
          return {
            status: 'error',
            message: 'Mobile number is required to verify review eligibility',
            data: { eligible: false, message: 'Mobile number is required' },
          };
        }

        const res = await apiClient.post(`/reviews/${productId}/guest/eligibility`, {
          mobile: cleanMobile,
        });

        const unwrapped = unwrapApiResponse<any>(res);

        if (unwrapped.status === 'error') {
          return {
            status: 'error',
            message: unwrapped.message || 'You are not eligible to review this product.',
            data: {
              eligible: false,
              message: unwrapped.message || 'You are not eligible to review this product.',
            },
          };
        }

        const data = unwrapped.data;
        const eligible = typeof data?.eligible === 'boolean' ? data.eligible : true;
        const responseMessage = data?.message || unwrapped.message || (eligible ? 'Eligible for review' : 'Not eligible');

        return {
          status: 'success',
          message: responseMessage,
          data: {
            eligible,
            message: responseMessage,
            availableSlots: data?.availableSlots,
            qualifyingOrderIds: data?.qualifyingOrderIds || [],
            orderItemId: data?.orderItemId,
            reason: data?.reason,
          },
        };
      }
    } catch (err: any) {
      const { message, errors } = extractApiError(
        err,
        'You are not eligible to review this product. A delivered purchase is required.'
      );
      return {
        status: 'error',
        message,
        errors,
        data: {
          eligible: false,
          message,
        },
      };
    }
  },

  /**
   * POST /reviews/:productId or POST /reviews/:productId/guest
   * Submits a verified customer or guest review with Cloudinary image URLs.
   */
  submitReview: async (
    productId: string,
    payload: ReviewSubmissionPayload,
    isAuthenticated?: boolean
  ): Promise<ApiResponse<ProductReview>> => {
    try {
      if (!productId) {
        return {
          status: 'error',
          message: 'Product ID is required',
          data: normalizeReview(null),
        };
      }

      const isAuth = isAuthenticated !== undefined ? isAuthenticated : (typeof window !== 'undefined' && !!localStorage.getItem('vyzobd_auth_token'));

      if (isAuth) {
        // Authenticated Customer Review Submission
        // POST /api/storefront/v1/reviews/:productId
        const cleanPayload = {
          rating: Math.max(1, Math.min(5, Number(payload.rating))),
          reviewHeadline: payload.reviewHeadline?.trim() || undefined,
          reviewComment: payload.reviewComment.trim(),
          images: Array.isArray(payload.images) ? payload.images.filter(Boolean) : [],
        };

        const res = await apiClient.post(`/reviews/${productId}`, cleanPayload);
        const unwrapped = unwrapApiResponse<any>(res);

        if (unwrapped.status === 'error') {
          return {
            status: 'error',
            message: unwrapped.message || 'Failed to submit review',
            errors: unwrapped.errors,
            data: normalizeReview(null),
          };
        }

        const normalized = normalizeReview(unwrapped.data);

        return {
          status: 'success',
          message: unwrapped.message || 'Review submitted successfully',
          data: normalized,
        };
      } else {
        // Guest Review Submission
        // POST /api/storefront/v1/reviews/:productId/guest
        const cleanPayload = {
          name: payload.name.trim(),
          mobile: payload.mobile.trim(),
          email: payload.email?.trim() || undefined,
          rating: Math.max(1, Math.min(5, Number(payload.rating))),
          reviewHeadline: payload.reviewHeadline?.trim() || undefined,
          reviewComment: payload.reviewComment.trim(),
          images: Array.isArray(payload.images) ? payload.images.filter(Boolean) : [],
        };

        const res = await apiClient.post(`/reviews/${productId}/guest`, cleanPayload);
        const unwrapped = unwrapApiResponse<any>(res);

        if (unwrapped.status === 'error') {
          return {
            status: 'error',
            message: unwrapped.message || 'Failed to submit guest review',
            errors: unwrapped.errors,
            data: normalizeReview(null),
          };
        }

        const normalized = normalizeReview(unwrapped.data);

        return {
          status: 'success',
          message: unwrapped.message || 'Review submitted successfully',
          data: normalized,
        };
      }
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Unable to submit review. Please try again.');
      return {
        status: 'error',
        message,
        errors,
        data: normalizeReview(null),
      };
    }
  },

  /**
   * GET /reviews/featured
   * Fetches curated approved reviews for the homepage carousel.
   */
  getFeaturedReviews: async (limit = 5): Promise<ApiResponse<FeaturedReview[]>> => {
    try {
      const res = await apiClient.get('/reviews/featured', { params: { limit } });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch featured reviews',
          data: [],
        };
      }

      let rawReviews: any[] = [];
      const data = unwrapped.data;

      if (Array.isArray(data)) {
        rawReviews = data;
      } else if (data && Array.isArray(data.items)) {
        rawReviews = data.items;
      } else if (data && Array.isArray(data.reviews)) {
        rawReviews = data.reviews;
      }

      const featured = rawReviews.map(normalizeReview);

      return {
        status: 'success',
        message: null,
        data: featured,
      };
    } catch (err: any) {
      const { message } = extractApiError(err, 'Failed to load featured reviews');
      return {
        status: 'error',
        message,
        data: [],
      };
    }
  },

  /**
   * GET /reviews/me/history
   * Returns paginated history of the authenticated customer's reviews.
   */
  getCustomerReviewHistory: async (
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<{ reviews: ProductReview[]; total: number; page: number; limit: number; totalPages: number }>> => {
    try {
      const queryParams: Record<string, any> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.limit) queryParams.limit = params.limit;

      const res = await apiClient.get('/reviews/me/history', { params: queryParams });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch customer review history',
          data: { reviews: [], total: 0, page: 1, limit: 10, totalPages: 0 },
        };
      }

      let rawReviews: any[] = [];
      const data = unwrapped.data;

      if (Array.isArray(data)) {
        rawReviews = data;
      } else if (data && Array.isArray(data.items)) {
        rawReviews = data.items;
      } else if (data && Array.isArray(data.reviews)) {
        rawReviews = data.reviews;
      }

      const reviews = rawReviews.map(normalizeReview);
      const total =
        unwrapped.pagination?.total ??
        data?.pagination?.total ??
        data?.total ??
        reviews.length;
      const page =
        unwrapped.pagination?.page ??
        data?.pagination?.page ??
        params?.page ??
        1;
      const limit =
        unwrapped.pagination?.limit ??
        data?.pagination?.limit ??
        params?.limit ??
        10;
      const totalPages =
        unwrapped.pagination?.totalPages ??
        data?.pagination?.totalPages ??
        (Math.ceil(total / (limit || 10)) || 1);

      return {
        status: 'success',
        message: null,
        data: {
          reviews,
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (err: any) {
      const { message } = extractApiError(err, 'Failed to load review history');
      return {
        status: 'error',
        message,
        data: { reviews: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      };
    }
  },
};
