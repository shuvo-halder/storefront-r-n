import { z } from 'zod';
import { isValidBDPhone } from '../utils/phone';

/**
 * Customer Dashboard Metrics
 */
export interface CustomerDashboardMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  unreadNotifications: number;
  eligibleReviews: number;
}

/**
 * Customer Dashboard Order
 */
export interface CustomerDashboardOrder {
  id: string;
  orderNumber?: string;
  orderStatus?: string;
  status?: string;
  paymentStatus?: string;
  totalAmount?: number;
  total?: number;
  createdAt?: string;
  itemsCount?: number;
  items?: any[];
  currency?: string;
  [key: string]: any;
}

/**
 * Aggregated Customer Dashboard Response Data
 */
export interface CustomerDashboardData {
  customer: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    fullName?: string;
    avatarUrl?: string;
  };
  metrics: CustomerDashboardMetrics;
  recentOrders: CustomerDashboardOrder[];
}

/**
 * Customer Profile Model
 */
export interface CustomerProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  avatar?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CustomerProfileData {
  profile: CustomerProfile;
}

/**
 * Zod validation schema for editing Customer Profile
 */
export const updateCustomerProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
  avatarUrl: z
    .string()
    .trim()
    .refine((val) => {
      if (!val || val === '') return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'Please enter a valid image URL (starting with http:// or https://)')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .refine((val) => {
      if (!val || val === '') return true;
      return isValidBDPhone(val);
    }, 'Please enter a valid Bangladesh mobile number (e.g. 01700000000)')
    .optional()
    .or(z.literal('')),
});

export type UpdateCustomerProfileFormData = z.infer<typeof updateCustomerProfileSchema>;

/**
 * Whitelisted PATCH payload for /customer/profile
 */
export interface UpdateCustomerProfilePayload {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phone?: string;
}

/**
 * Customer Orders List Pagination Info
 */
export interface CustomerOrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Customer Order Line Item
 */
export interface CustomerOrderItem {
  id?: string;
  productId?: string;
  product_id?: string;
  productName?: string;
  name?: string;
  productImage?: string;
  image?: string;
  variantName?: string;
  variant?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  totalPrice?: number;
  total?: number;
  [key: string]: any;
}

/**
 * Customer Order Address Record
 */
export interface CustomerOrderAddress {
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  zip?: string;
  country?: string;
  [key: string]: any;
}

/**
 * Customer Order Shipment Summary
 */
export interface CustomerOrderShipmentSummary {
  id?: string;
  trackingNumber?: string;
  carrier?: string;
  carrierName?: string;
  status?: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDeliveryDate?: string;
  trackingUrl?: string;
  [key: string]: any;
}

/**
 * Customer Order Timeline Event
 */
export interface CustomerOrderTimelineEvent {
  id?: string;
  status?: string;
  label?: string;
  title?: string;
  description?: string;
  timestamp?: string;
  createdAt?: string;
  date?: string;
  completed?: boolean;
  current?: boolean;
  [key: string]: any;
}

/**
 * Single Order in Customer Orders List (/customer/orders)
 */
export interface CustomerOrderListItem {
  id: string;
  orderNumber?: string;
  status?: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  total?: number;
  totalAmount?: number;
  subtotal?: number;
  itemCount?: number;
  itemsCount?: number;
  createdAt?: string;
  items?: CustomerOrderItem[];
  currency?: string;
  [key: string]: any;
}

/**
 * Customer Orders List API Response Data
 */
export interface CustomerOrdersData {
  orders: CustomerOrderListItem[];
  pagination: CustomerOrderPagination;
}

/**
 * Full Customer Order Details (/customer/orders/:orderId)
 */
export interface CustomerOrderDetails {
  id: string;
  orderNumber?: string;
  status?: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
  currency?: string;
  items: CustomerOrderItem[];
  shippingAddress?: CustomerOrderAddress;
  billingAddress?: CustomerOrderAddress;
  subtotal?: number;
  discount?: number;
  shippingFee?: number;
  shippingCost?: number;
  tax?: number;
  total?: number;
  totalAmount?: number;
  paidAmount?: number;
  dueAmount?: number;
  shipment?: CustomerOrderShipmentSummary;
  shipments?: CustomerOrderShipmentSummary[];
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: string;
  timeline?: CustomerOrderTimelineEvent[];
  trackingSteps?: CustomerOrderTimelineEvent[];
  [key: string]: any;
}

export interface CustomerOrderDetailsData {
  order: CustomerOrderDetails;
}

/**
 * Query Parameters for GET /customer/orders
 */
export interface CustomerOrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

/**
 * =========================================================
 * STEP 4 — Customer Payments, Shipments & Tracking Types
 * =========================================================
 */

/**
 * Single Payment Transaction (/customer/payments)
 */
export interface CustomerPayment {
  id?: string;
  transactionId?: string;
  gateway: string; // COD, BKASH, NAGAD, SSLCOMMERZ, STRIPE, etc.
  amount: number;
  currency?: string;
  status: string; // SUCCESS, PENDING, FAILED, REFUNDED, CANCELLED, etc.
  orderId?: string;
  orderNumber?: string;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
  details?: Record<string, unknown>;
  [key: string]: any;
}

/**
 * Customer Payments API Response Data (/customer/payments)
 */
export interface CustomerPaymentsData {
  payments: CustomerPayment[];
  pagination: CustomerOrderPagination;
}

/**
 * Query Parameters for GET /customer/payments
 */
export interface CustomerPaymentQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * Order Payment Details Summary (/customer/orders/:orderId/payments)
 */
export interface OrderPaymentSummary {
  orderId: string;
  orderNumber?: string;
  orderTotal: number;
  paidAmount: number;
  dueAmount: number;
  refundedAmount: number;
  payments: CustomerPayment[];
  currency?: string;
  [key: string]: any;
}

/**
 * Item included in a Shipment Package
 */
export interface ShipmentItem {
  id?: string;
  productId?: string;
  productName?: string;
  name?: string;
  productImage?: string;
  image?: string;
  quantity: number;
  unitPrice?: number;
  variant?: string;
  variantName?: string;
  sku?: string;
  [key: string]: any;
}

/**
 * Single Customer Shipment Record (/customer/shipments)
 */
export interface CustomerShipment {
  id?: string;
  orderId?: string;
  orderNumber?: string;
  carrier?: string;
  carrierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status?: string; // PENDING, INFO_RECEIVED, PICKED_UP, IN_TRANSIT, ARRIVED_AT_HUB, OUT_FOR_DELIVERY, DELIVERED, FAILED, RETURNED, CANCELLED
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDeliveryDate?: string;
  items?: ShipmentItem[];
  itemCount?: number;
  shippingAddress?: CustomerOrderAddress;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

/**
 * Customer Shipments API Response Data (/customer/shipments)
 */
export interface CustomerShipmentsData {
  shipments: CustomerShipment[];
  pagination: CustomerOrderPagination;
}

/**
 * Query Parameters for GET /customer/shipments
 */
export interface CustomerShipmentQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * Order Shipment Packages API Response (/customer/orders/:orderId/shipments)
 */
export interface OrderShipmentsResponse {
  orderId: string;
  orderNumber?: string;
  shipments: CustomerShipment[];
  [key: string]: any;
}

/**
 * Single Tracking Milestone Event
 */
export interface TrackingEvent {
  id?: string;
  status: string; // INFO_RECEIVED, PICKED_UP, IN_TRANSIT, ARRIVED_AT_HUB, OUT_FOR_DELIVERY, DELIVERED, FAILED, RETURNED, CANCELLED
  label?: string;
  title?: string;
  description?: string;
  location?: string;
  timestamp?: string;
  date?: string;
  createdAt?: string;
  completed?: boolean;
  current?: boolean;
  [key: string]: any;
}

/**
 * Shipment with Timeline Events inside Tracking Response
 */
export interface CustomerTrackingShipment {
  id?: string;
  carrier?: string;
  carrierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status?: string;
  events: TrackingEvent[];
  estimatedDeliveryDate?: string;
  shippedAt?: string;
  deliveredAt?: string;
  [key: string]: any;
}

/**
 * Order Tracking API Response (/customer/orders/:orderId/tracking)
 */
export interface CustomerTrackingData {
  orderId: string;
  orderNumber?: string;
  shipments: CustomerTrackingShipment[];
  [key: string]: any;
}

/**
 * ------------------------------------------------------------------
 * RETURNS TYPES (/customer/returns & /customer/orders/:orderId/returns)
 * ------------------------------------------------------------------
 */

export interface CustomerReturnItem {
  id?: string;
  orderItemId?: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  variantName?: string;
  quantity: number;
  reason?: string;
  condition?: string;
  unitPrice?: number;
  price?: number;
  totalPrice?: number;
  [key: string]: any;
}

export interface CustomerReturn {
  id: string;
  returnNumber?: string;
  orderId: string;
  orderNumber?: string;
  status: string; // PENDING, APPROVED, PROCESSING, COMPLETED, REJECTED, CANCELLED
  reason?: string;
  notes?: string;
  condition?: string;
  items?: CustomerReturnItem[];
  itemCount?: number;
  refundAmount?: number;
  refundId?: string;
  resolution?: string;
  resolutionNotes?: string;
  requestedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CustomerReturnsData {
  returns: CustomerReturn[];
  pagination: CustomerOrderPagination;
}

export interface CustomerReturnQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface OrderReturnsResponse {
  orderId: string;
  orderNumber?: string;
  returns: CustomerReturn[];
  [key: string]: any;
}

export interface ReturnRequestItemPayload {
  orderItemId?: string;
  productId: string;
  quantity: number;
  reason: string;
  condition?: string;
}

export interface ReturnRequestPayload {
  orderId: string;
  items: ReturnRequestItemPayload[];
  reason?: string;
  notes?: string;
}

/**
 * ------------------------------------------------------------------
 * REFUNDS TYPES (/customer/refunds & /customer/orders/:orderId/refunds)
 * ------------------------------------------------------------------
 */

export interface CustomerRefund {
  id: string;
  refundNumber?: string;
  orderId: string;
  orderNumber?: string;
  returnId?: string;
  returnNumber?: string;
  amount: number;
  currency?: string;
  status: string; // PENDING, PROCESSING, APPROVED, COMPLETED, REFUNDED, FAILED, REJECTED
  reason?: string;
  method?: string; // BKASH, NAGAD, SSLCOMMERZ, BANK_TRANSFER, WALLET, ORIGINAL_PAYMENT
  gateway?: string;
  transactionId?: string;
  requestedAt?: string;
  processedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: any[];
  [key: string]: any;
}

export interface CustomerRefundsData {
  refunds: CustomerRefund[];
  pagination: CustomerOrderPagination;
  totalRefunded?: number;
  pendingRefundsCount?: number;
}

export interface CustomerRefundQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface OrderRefundsResponse {
  orderId: string;
  orderNumber?: string;
  refunds: CustomerRefund[];
  totalRefunded?: number;
  [key: string]: any;
}

/**
 * ------------------------------------------------------------------
 * REVIEWS TYPES (/customer/reviews & /customer/reviews/eligible)
 * ------------------------------------------------------------------
 */

export interface CustomerReview {
  id: string;
  orderId?: string;
  orderItemId?: string;
  productId: string;
  productName?: string;
  productImage?: string;
  productSlug?: string;
  rating: number;
  headline?: string;
  title?: string;
  comment: string;
  content?: string;
  images?: string[];
  status: string; // PENDING, APPROVED, REJECTED
  verifiedPurchase?: boolean;
  isVerifiedPurchase?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CustomerReviewsData {
  reviews: CustomerReview[];
  pagination: CustomerOrderPagination;
}

export interface CustomerReviewQueryParams {
  page?: number;
  limit?: number;
}

export interface EligibleReviewItem {
  orderItemId: string; // Primary entitlement identifier
  orderId: string;
  orderNumber?: string;
  productId: string;
  productName: string;
  productImage?: string;
  productSlug?: string;
  variantName?: string;
  price?: number;
  unitPrice?: number;
  currency?: string;
  purchasedAt?: string;
  deliveredAt?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface EligibleReviewsResponse {
  items: EligibleReviewItem[];
  total?: number;
}

export interface ReviewSubmissionPayload {
  orderItemId: string;
  productId: string;
  rating: number;
  headline?: string;
  comment: string;
  images?: string[];
}

/**
 * ------------------------------------------------------------------
 * NOTIFICATIONS TYPES (/customer/notifications)
 * ------------------------------------------------------------------
 */

export interface CustomerNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  status?: string;
  isRead: boolean;
  orderId?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CustomerNotificationsData {
  notifications: CustomerNotification[];
  unreadCount: number;
  pagination: CustomerOrderPagination;
}

export interface CustomerNotificationQueryParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

