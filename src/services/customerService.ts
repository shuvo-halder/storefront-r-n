import { apiClient, ApiResponse, unwrapApiResponse, extractApiError } from '../lib/api';
import { 
  CustomerDashboardData, 
  CustomerProfileData, 
  UpdateCustomerProfilePayload,
  CustomerOrdersData,
  CustomerOrderQueryParams,
  CustomerOrderDetails,
  CustomerPaymentQueryParams,
  CustomerPaymentsData,
  OrderPaymentSummary,
  CustomerShipmentQueryParams,
  CustomerShipmentsData,
  OrderShipmentsResponse,
  CustomerTrackingData,
  CustomerReturn,
  CustomerReturnsData,
  CustomerReturnQueryParams,
  OrderReturnsResponse,
  ReturnRequestPayload,
  CustomerRefund,
  CustomerRefundsData,
  CustomerRefundQueryParams,
  OrderRefundsResponse,
  CustomerReview,
  CustomerReviewsData,
  CustomerReviewQueryParams,
  EligibleReviewItem,
  EligibleReviewsResponse,
  ReviewSubmissionPayload,
  CustomerNotification,
  CustomerNotificationsData,
  CustomerNotificationQueryParams
} from '../types/customer';

export const customerService = {
  /**
   * GET /customer/dashboard
   * Aggregated customer dashboard endpoint (metrics, recent orders, customer summary)
   */
  getDashboard: async (): Promise<ApiResponse<CustomerDashboardData>> => {
    try {
      const res = await apiClient.get('/customer/dashboard');
      const unwrapped = unwrapApiResponse<CustomerDashboardData>(res);
      return unwrapped;
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch customer dashboard metrics.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any,
      };
    }
  },

  /**
   * GET /customer/profile
   * Authoritative customer profile details including verification timestamps
   */
  getProfile: async (): Promise<ApiResponse<CustomerProfileData>> => {
    try {
      const res = await apiClient.get('/customer/profile');
      const unwrapped = unwrapApiResponse<CustomerProfileData>(res);
      return unwrapped;
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch customer profile.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any,
      };
    }
  },

  /**
   * PATCH /customer/profile
   * Updates mutable profile attributes (firstName, lastName, avatarUrl).
   * Security Rule: Non-editable fields (id, email, phone, verification statuses, tokens) are strictly omitted.
   */
  updateProfile: async (payload: UpdateCustomerProfilePayload): Promise<ApiResponse<CustomerProfileData>> => {
    try {
      const sanitizedBody: UpdateCustomerProfilePayload = {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
      };

      if (payload.avatarUrl !== undefined && payload.avatarUrl !== null) {
        sanitizedBody.avatarUrl = payload.avatarUrl.trim();
      }

      if (payload.phone !== undefined && payload.phone !== null) {
        sanitizedBody.phone = payload.phone.trim();
      }

      const res = await apiClient.patch('/customer/profile', sanitizedBody);
      const unwrapped = unwrapApiResponse<CustomerProfileData>(res);
      return unwrapped;
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to update customer profile.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any,
      };
    }
  },

  /**
   * GET /customer/orders
   * Paginated orders list for the authenticated customer.
   * Query parameters: page, limit, status, search.
   */
  getOrders: async (params?: CustomerOrderQueryParams): Promise<ApiResponse<CustomerOrdersData>> => {
    try {
      const queryParams: Record<string, any> = {};
      if (params?.page && params.page > 0) {
        queryParams.page = params.page;
      }
      if (params?.limit && params.limit > 0) {
        queryParams.limit = params.limit;
      }
      if (params?.status && params.status !== 'ALL' && params.status.trim() !== '') {
        queryParams.status = params.status.trim();
      }
      if (params?.search && params.search.trim() !== '') {
        queryParams.search = params.search.trim();
      }

      const res = await apiClient.get('/customer/orders', { params: queryParams });
      const unwrapped = unwrapApiResponse<CustomerOrdersData>(res);
      return unwrapped;
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch customer orders.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any,
      };
    }
  },

  /**
   * GET /customer/orders/:orderId
   * Detailed single order record for the authenticated customer.
   * Backend enforces strict IDOR protection.
   */
  getOrderById: async (orderId: string): Promise<ApiResponse<CustomerOrderDetails>> => {
    try {
      const cleanId = encodeURIComponent(orderId.trim());
      const res = await apiClient.get(`/customer/orders/${cleanId}`);
      const unwrapped = unwrapApiResponse<any>(res);
      
      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Order not found',
          errors: unwrapped.errors,
          data: null as any,
        };
      }

      // Normalize if backend wraps under data.order or returns order directly
      const orderData: CustomerOrderDetails = unwrapped.data.order ? unwrapped.data.order : unwrapped.data;

      return {
        status: 'success',
        message: unwrapped.message || null,
        data: orderData,
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch order details.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any,
      };
    }
  },

  /**
   * GET /customer/payments
   * Paginated payment transaction history for the authenticated customer.
   * Query parameters: page, limit, status.
   */
  getPayments: async (params?: CustomerPaymentQueryParams): Promise<ApiResponse<CustomerPaymentsData>> => {
    try {
      const queryParams: Record<string, any> = {};
      if (params?.page && params.page > 0) {
        queryParams.page = params.page;
      }
      if (params?.limit && params.limit > 0) {
        queryParams.limit = params.limit;
      }
      if (params?.status && params.status !== 'ALL' && params.status.trim() !== '') {
        queryParams.status = params.status.trim();
      }

      const res = await apiClient.get('/customer/payments', { params: queryParams });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' && !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch customer payments.',
          errors: unwrapped.errors,
          data: {
            payments: [],
            pagination: { page: params?.page || 1, limit: params?.limit || 10, total: 0, totalPages: 1 },
          },
        };
      }

      // Normalize array vs { payments: [], pagination: {} }
      const rawData = unwrapped.data || {};
      const paymentsList = Array.isArray(rawData) 
        ? rawData 
        : Array.isArray(rawData.payments) 
        ? rawData.payments 
        : [];

      const paginationMeta = rawData.pagination || unwrapped.pagination || {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: paymentsList.length,
        totalPages: Math.max(1, Math.ceil(paymentsList.length / (params?.limit || 10))),
      };

      return {
        status: 'success',
        message: unwrapped.message || null,
        data: {
          payments: paymentsList,
          pagination: paginationMeta,
        },
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch customer payments.');
      return {
        status: 'error',
        message,
        errors,
        data: {
          payments: [],
          pagination: { page: params?.page || 1, limit: params?.limit || 10, total: 0, totalPages: 1 },
        },
      };
    }
  },

  /**
   * GET /customer/orders/:orderId/payments
   * Detailed financial transactions summary for a specific order.
   * Returns: orderId, orderNumber, orderTotal, paidAmount, dueAmount, refundedAmount, payments.
   */
  getOrderPayments: async (orderId: string): Promise<ApiResponse<OrderPaymentSummary>> => {
    try {
      const cleanId = encodeURIComponent(orderId.trim());
      const res = await apiClient.get(`/customer/orders/${cleanId}/payments`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch order payment summary.',
          errors: unwrapped.errors,
          data: null as any,
        };
      }

      const raw = unwrapped.data;
      const normalized: OrderPaymentSummary = {
        orderId: raw.orderId || orderId,
        orderNumber: raw.orderNumber,
        orderTotal: Number(raw.orderTotal ?? raw.totalAmount ?? raw.total ?? 0),
        paidAmount: Number(raw.paidAmount ?? 0),
        dueAmount: Number(raw.dueAmount ?? 0),
        refundedAmount: Number(raw.refundedAmount ?? 0),
        payments: Array.isArray(raw.payments) ? raw.payments : Array.isArray(raw) ? raw : [],
        currency: raw.currency || 'BDT',
      };

      return {
        status: 'success',
        message: unwrapped.message || null,
        data: normalized,
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch order payment summary.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any,
      };
    }
  },

  /**
   * GET /customer/shipments
   * Paginated shipment packages for the authenticated customer.
   * Query parameters: page, limit, status.
   */
  getShipments: async (params?: CustomerShipmentQueryParams): Promise<ApiResponse<CustomerShipmentsData>> => {
    try {
      const queryParams: Record<string, any> = {};
      if (params?.page && params.page > 0) {
        queryParams.page = params.page;
      }
      if (params?.limit && params.limit > 0) {
        queryParams.limit = params.limit;
      }
      if (params?.status && params.status !== 'ALL' && params.status.trim() !== '') {
        queryParams.status = params.status.trim();
      }

      const res = await apiClient.get('/customer/shipments', { params: queryParams });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' && !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch customer shipments.',
          errors: unwrapped.errors,
          data: {
            shipments: [],
            pagination: { page: params?.page || 1, limit: params?.limit || 10, total: 0, totalPages: 1 },
          },
        };
      }

      const rawData = unwrapped.data || {};
      const shipmentsList = Array.isArray(rawData) 
        ? rawData 
        : Array.isArray(rawData.shipments) 
        ? rawData.shipments 
        : [];

      const paginationMeta = rawData.pagination || unwrapped.pagination || {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: shipmentsList.length,
        totalPages: Math.max(1, Math.ceil(shipmentsList.length / (params?.limit || 10))),
      };

      return {
        status: 'success',
        message: unwrapped.message || null,
        data: {
          shipments: shipmentsList,
          pagination: paginationMeta,
        },
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch customer shipments.');
      return {
        status: 'error',
        message,
        errors,
        data: {
          shipments: [],
          pagination: { page: params?.page || 1, limit: params?.limit || 10, total: 0, totalPages: 1 },
        },
      };
    }
  },

  /**
   * GET /customer/orders/:orderId/shipments
   * Dispatched shipment packages for a specific order.
   */
  getOrderShipments: async (orderId: string): Promise<ApiResponse<OrderShipmentsResponse>> => {
    try {
      const cleanId = encodeURIComponent(orderId.trim());
      const res = await apiClient.get(`/customer/orders/${cleanId}/shipments`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch order shipments.',
          errors: unwrapped.errors,
          data: {
            orderId,
            shipments: [],
          },
        };
      }

      const raw = unwrapped.data;
      const shipments = Array.isArray(raw.shipments) 
        ? raw.shipments 
        : Array.isArray(raw) 
        ? raw 
        : [];

      return {
        status: 'success',
        message: unwrapped.message || null,
        data: {
          orderId: raw.orderId || orderId,
          orderNumber: raw.orderNumber,
          shipments,
        },
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch order shipments.');
      return {
        status: 'error',
        message,
        errors,
        data: {
          orderId,
          shipments: [],
        },
      };
    }
  },

  /**
   * GET /customer/orders/:orderId/tracking
   * Real-time carrier tracking checkpoints and transit events for an order.
   */
  getOrderTracking: async (orderId: string): Promise<ApiResponse<CustomerTrackingData>> => {
    try {
      const cleanId = encodeURIComponent(orderId.trim());
      const res = await apiClient.get(`/customer/orders/${cleanId}/tracking`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch order tracking.',
          errors: unwrapped.errors,
          data: {
            orderId,
            shipments: [],
          },
        };
      }

      const raw = unwrapped.data;
      const shipments = Array.isArray(raw.shipments) 
        ? raw.shipments 
        : Array.isArray(raw) 
        ? raw 
        : [];

      return {
        status: 'success',
        message: unwrapped.message || null,
        data: {
          orderId: raw.orderId || orderId,
          orderNumber: raw.orderNumber,
          shipments,
        },
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch order tracking.');
      return {
        status: 'error',
        message,
        errors,
        data: {
          orderId,
          shipments: [],
        },
      };
    }
  },

  /**
   * ------------------------------------------------------------------
   * RETURNS API METHODS
   * ------------------------------------------------------------------
   */

  /**
   * GET /customer/returns
   * Paginated returns list for the authenticated customer.
   * Query parameters: page, limit, status.
   */
  getReturns: async (params?: CustomerReturnQueryParams): Promise<ApiResponse<CustomerReturnsData>> => {
    try {
      const queryParams: Record<string, any> = {};
      if (params?.page && params.page > 0) {
        queryParams.page = params.page;
      }
      if (params?.limit && params.limit > 0) {
        queryParams.limit = params.limit;
      }
      if (params?.status && params.status !== 'ALL') {
        queryParams.status = params.status;
      }

      const res = await apiClient.get('/customer/returns', { params: queryParams });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch returns history.',
          errors: unwrapped.errors,
          data: {
            returns: [],
            pagination: { page: 1, limit: params?.limit || 10, total: 0, totalPages: 0 },
          },
        };
      }

      const raw = unwrapped.data;
      const returns: CustomerReturn[] = Array.isArray(raw.returns)
        ? raw.returns
        : Array.isArray(raw)
        ? raw
        : [];

      const pagination = raw.pagination || {
        page: raw.page || params?.page || 1,
        limit: raw.limit || params?.limit || 10,
        total: raw.total || returns.length,
        totalPages: raw.totalPages || Math.ceil((raw.total || returns.length) / (params?.limit || 10)) || 1,
      };

      return {
        status: 'success',
        message: unwrapped.message || null,
        data: {
          returns,
          pagination,
        },
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch returns history.');
      return {
        status: 'error',
        message,
        errors,
        data: {
          returns: [],
          pagination: { page: 1, limit: params?.limit || 10, total: 0, totalPages: 0 },
        },
      };
    }
  },

  /**
   * GET /customer/orders/:orderId/returns
   * Returns list for a specific order.
   */
  getOrderReturns: async (orderId: string): Promise<ApiResponse<OrderReturnsResponse>> => {
    try {
      const cleanId = encodeURIComponent(orderId.trim());
      const res = await apiClient.get(`/customer/orders/${cleanId}/returns`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch order returns.',
          errors: unwrapped.errors,
          data: {
            orderId,
            returns: [],
          },
        };
      }

      const raw = unwrapped.data;
      const returns: CustomerReturn[] = Array.isArray(raw.returns)
        ? raw.returns
        : Array.isArray(raw)
        ? raw
        : [];

      return {
        status: 'success',
        message: unwrapped.message || null,
        data: {
          orderId: raw.orderId || orderId,
          orderNumber: raw.orderNumber,
          returns,
        },
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch order returns.');
      return {
        status: 'error',
        message,
        errors,
        data: {
          orderId,
          returns: [],
        },
      };
    }
  },

  /**
   * POST /returns/request
   * Submit a return request for eligible order items.
   */
  requestReturn: async (payload: ReturnRequestPayload): Promise<ApiResponse<CustomerReturn>> => {
    try {
      const res = await apiClient.post('/returns/request', payload);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to submit return request.',
          errors: unwrapped.errors,
          data: null as any,
        };
      }

      return {
        status: 'success',
        message: unwrapped.message || 'Return request submitted successfully.',
        data: unwrapped.data,
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to submit return request.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any,
      };
    }
  },

  /**
   * ------------------------------------------------------------------
   * REFUNDS API METHODS
   * ------------------------------------------------------------------
   */

  /**
   * GET /customer/refunds
   * Paginated refunds list for the authenticated customer.
   * Query parameters: page, limit, status.
   */
  getRefunds: async (params?: CustomerRefundQueryParams): Promise<ApiResponse<CustomerRefundsData>> => {
    try {
      const queryParams: Record<string, any> = {};
      if (params?.page && params.page > 0) {
        queryParams.page = params.page;
      }
      if (params?.limit && params.limit > 0) {
        queryParams.limit = params.limit;
      }
      if (params?.status && params.status !== 'ALL') {
        queryParams.status = params.status;
      }

      const res = await apiClient.get('/customer/refunds', { params: queryParams });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch refunds history.',
          errors: unwrapped.errors,
          data: {
            refunds: [],
            pagination: { page: 1, limit: params?.limit || 10, total: 0, totalPages: 0 },
          },
        };
      }

      const raw = unwrapped.data;
      const refunds: CustomerRefund[] = Array.isArray(raw.refunds)
        ? raw.refunds
        : Array.isArray(raw)
        ? raw
        : [];

      const pagination = raw.pagination || {
        page: raw.page || params?.page || 1,
        limit: raw.limit || params?.limit || 10,
        total: raw.total || refunds.length,
        totalPages: raw.totalPages || Math.ceil((raw.total || refunds.length) / (params?.limit || 10)) || 1,
      };

      return {
        status: 'success',
        message: unwrapped.message || null,
        data: {
          refunds,
          pagination,
          totalRefunded: raw.totalRefunded,
          pendingRefundsCount: raw.pendingRefundsCount,
        },
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch refunds history.');
      return {
        status: 'error',
        message,
        errors,
        data: {
          refunds: [],
          pagination: { page: 1, limit: params?.limit || 10, total: 0, totalPages: 0 },
        },
      };
    }
  },

  /**
   * GET /customer/orders/:orderId/refunds
   * Refund records for a specific order.
   */
  getOrderRefunds: async (orderId: string): Promise<ApiResponse<OrderRefundsResponse>> => {
    try {
      const cleanId = encodeURIComponent(orderId.trim());
      const res = await apiClient.get(`/customer/orders/${cleanId}/refunds`);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch order refunds.',
          errors: unwrapped.errors,
          data: {
            orderId,
            refunds: [],
          },
        };
      }

      const raw = unwrapped.data;
      const refunds: CustomerRefund[] = Array.isArray(raw.refunds)
        ? raw.refunds
        : Array.isArray(raw)
        ? raw
        : [];

      return {
        status: 'success',
        message: unwrapped.message || null,
        data: {
          orderId: raw.orderId || orderId,
          orderNumber: raw.orderNumber,
          refunds,
          totalRefunded: raw.totalRefunded,
        },
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch order refunds.');
      return {
        status: 'error',
        message,
        errors,
        data: {
          orderId,
          refunds: [],
        },
      };
    }
  },

  /**
   * ------------------------------------------------------------------
   * REVIEWS API METHODS
   * ------------------------------------------------------------------
   */

  /**
   * GET /customer/reviews
   * Paginated reviews submitted by the authenticated customer.
   * Query parameters: page, limit.
   */
  getReviews: async (params?: CustomerReviewQueryParams): Promise<ApiResponse<CustomerReviewsData>> => {
    try {
      const queryParams: Record<string, any> = {};
      if (params?.page && params.page > 0) {
        queryParams.page = params.page;
      }
      if (params?.limit && params.limit > 0) {
        queryParams.limit = params.limit;
      }

      const res = await apiClient.get('/customer/reviews', { params: queryParams });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch your product reviews.',
          errors: unwrapped.errors,
          data: {
            reviews: [],
            pagination: { page: 1, limit: params?.limit || 10, total: 0, totalPages: 0 },
          },
        };
      }

      const raw = unwrapped.data;
      const reviews: CustomerReview[] = Array.isArray(raw.reviews)
        ? raw.reviews
        : Array.isArray(raw)
        ? raw
        : [];

      const pagination = raw.pagination || {
        page: raw.page || params?.page || 1,
        limit: raw.limit || params?.limit || 10,
        total: raw.total || reviews.length,
        totalPages: raw.totalPages || Math.ceil((raw.total || reviews.length) / (params?.limit || 10)) || 1,
      };

      return {
        status: 'success',
        message: unwrapped.message || null,
        data: {
          reviews,
          pagination,
        },
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch your product reviews.');
      return {
        status: 'error',
        message,
        errors,
        data: {
          reviews: [],
          pagination: { page: 1, limit: params?.limit || 10, total: 0, totalPages: 0 },
        },
      };
    }
  },

  /**
   * GET /customer/reviews/eligible
   * Individual purchase entitlements eligible for review.
   * Key rule: Individual purchase entitlements (orderItemId) are not deduplicated by productId.
   */
  getEligibleReviews: async (): Promise<ApiResponse<EligibleReviewsResponse>> => {
    try {
      const res = await apiClient.get('/customer/reviews/eligible');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch review-eligible items.',
          errors: unwrapped.errors,
          data: {
            items: [],
            total: 0,
          },
        };
      }

      const raw = unwrapped.data;
      const items: EligibleReviewItem[] = Array.isArray(raw.items)
        ? raw.items
        : Array.isArray(raw.eligibleItems)
        ? raw.eligibleItems
        : Array.isArray(raw)
        ? raw
        : [];

      return {
        status: 'success',
        message: unwrapped.message || null,
        data: {
          items,
          total: raw.total ?? items.length,
        },
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch review-eligible items.');
      return {
        status: 'error',
        message,
        errors,
        data: {
          items: [],
          total: 0,
        },
      };
    }
  },

  /**
   * POST /customer/reviews
   * Submit a new customer review.
   * Handles 409 ALREADY_REVIEWED explicitly.
   */
  submitReview: async (payload: ReviewSubmissionPayload): Promise<ApiResponse<CustomerReview>> => {
    try {
      const res = await apiClient.post('/customer/reviews', payload);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error' || !unwrapped.data) {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to submit review.',
          errors: unwrapped.errors,
          data: null as any,
        };
      }

      return {
        status: 'success',
        message: unwrapped.message || 'Review submitted successfully.',
        data: unwrapped.data,
      };
    } catch (err: any) {
      if (err.response?.status === 409 || err.message?.includes('ALREADY_REVIEWED')) {
        return {
          status: 'error',
          message: 'This purchase has already been reviewed.',
          errors: [{ field: 'orderItemId', message: 'This purchase has already been reviewed.' }],
          data: null as any,
        };
      }

      const { message, errors } = extractApiError(err, 'Failed to submit review.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any,
      };
    }
  },

  /**
   * GET /customer/notifications
   * Fetch customer notifications with pagination and unreadOnly filter.
   */
  getNotifications: async (params?: CustomerNotificationQueryParams): Promise<ApiResponse<CustomerNotificationsData>> => {
    try {
      const queryParams: Record<string, any> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.unreadOnly !== undefined) queryParams.unreadOnly = params.unreadOnly;

      const res = await apiClient.get('/customer/notifications', { params: queryParams });
      const unwrapped = unwrapApiResponse<CustomerNotificationsData>(res);
      return unwrapped;
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to load notifications.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any,
      };
    }
  },

  /**
   * PATCH /customer/notifications/:id/read
   * Mark a single notification as read.
   */
  markNotificationAsRead: async (notificationId: string): Promise<ApiResponse<{ status: string }>> => {
    try {
      const res = await apiClient.patch(`/customer/notifications/${encodeURIComponent(notificationId)}/read`);
      const unwrapped = unwrapApiResponse<{ status: string }>(res);
      return unwrapped;
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to mark notification as read.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any,
      };
    }
  },

  /**
   * PATCH /customer/notifications/read-all
   * Mark all customer notifications as read.
   */
  markAllNotificationsAsRead: async (): Promise<ApiResponse<{ message?: string }>> => {
    try {
      const res = await apiClient.patch('/customer/notifications/read-all');
      const unwrapped = unwrapApiResponse<{ message?: string }>(res);
      return unwrapped;
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to mark all notifications as read.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any,
      };
    }
  },
};


