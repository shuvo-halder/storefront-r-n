import React from 'react';
import {
  FileText,
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Clock,
  Navigation,
  CreditCard,
  Banknote,
  ShieldCheck,
  Zap
} from 'lucide-react';

export interface TrackingStatusMeta {
  label: string;
  badgeClass: string;
  dotClass: string;
  icon: React.ElementType;
  description: string;
  stepRank: number; // 0 to 5 for progressive progress
}

export interface PaymentGatewayMeta {
  name: string;
  badgeClass: string;
  icon: React.ElementType;
}

export interface PaymentStatusMeta {
  label: string;
  badgeClass: string;
}

/**
 * Maps raw backend shipment/tracking statuses to presentation styles without altering raw backend values.
 */
export function getTrackingStatusMeta(rawStatus?: string): TrackingStatusMeta {
  const s = (rawStatus || '').toUpperCase().trim();

  if (s === 'DELIVERED' || s === 'COMPLETED') {
    return {
      label: 'Delivered',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
      description: 'Package has been safely delivered to the recipient address.',
      stepRank: 5,
    };
  }

  if (s === 'OUT_FOR_DELIVERY' || s === 'OUT FOR DELIVERY') {
    return {
      label: 'Out for Delivery',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500 text-white',
      icon: Navigation,
      description: 'Courier agent is en route to deliver the package today.',
      stepRank: 4,
    };
  }

  if (s === 'ARRIVED_AT_HUB' || s === 'AT_FACILITY' || s === 'HUB_ARRIVED') {
    return {
      label: 'Arrived at Hub',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      dotClass: 'bg-purple-600 text-white',
      icon: MapPin,
      description: 'Package has arrived at the local courier distribution hub.',
      stepRank: 3,
    };
  }

  if (s === 'IN_TRANSIT' || s === 'IN TRANSIT' || s === 'SHIPPED' || s === 'DISPATCHED') {
    return {
      label: 'In Transit',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      dotClass: 'bg-blue-600 text-white',
      icon: Truck,
      description: 'Package is moving between transit facilities.',
      stepRank: 2,
    };
  }

  if (s === 'PICKED_UP' || s === 'PACKAGE_ACCEPTED' || s === 'COLLECTED') {
    return {
      label: 'Picked Up',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dotClass: 'bg-indigo-600 text-white',
      icon: Package,
      description: 'Courier has picked up parcel from merchant warehouse.',
      stepRank: 1,
    };
  }

  if (s === 'INFO_RECEIVED' || s === 'ORDER_PLACED' || s === 'PENDING' || s === 'PROCESSING' || s === 'LABEL_CREATED') {
    return {
      label: s === 'INFO_RECEIVED' ? 'Info Received' : s === 'PROCESSING' ? 'Processing' : 'Order Placed',
      badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
      dotClass: 'bg-slate-600 text-white',
      icon: FileText,
      description: 'Shipment label created and dispatch request is being prepared.',
      stepRank: 0,
    };
  }

  if (s === 'FAILED' || s === 'ATTEMPTED' || s === 'UNDELIVERED') {
    return {
      label: 'Delivery Attempt Failed',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-600 text-white',
      icon: AlertTriangle,
      description: 'Delivery attempt unsuccessful. Carrier will re-attempt.',
      stepRank: 4,
    };
  }

  if (s === 'RETURNED' || s === 'RETURN_IN_TRANSIT' || s === 'RTO') {
    return {
      label: 'Returned to Sender',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
      dotClass: 'bg-orange-600 text-white',
      icon: RotateCcw,
      description: 'Shipment is returning to fulfillment center.',
      stepRank: 0,
    };
  }

  if (s === 'CANCELLED' || s === 'VOID') {
    return {
      label: 'Cancelled',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
      dotClass: 'bg-gray-500 text-white',
      icon: XCircle,
      description: 'Shipment has been cancelled or voided.',
      stepRank: 0,
    };
  }

  // Safe Fallback for unknown / custom backend statuses
  const formattedFallback = rawStatus
    ? rawStatus
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Status Pending';

  return {
    label: formattedFallback,
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    dotClass: 'bg-gray-600 text-white',
    icon: Clock,
    description: 'Shipment status updated.',
    stepRank: 0,
  };
}

/**
 * Maps payment gateway/provider strings into branded UI representations
 */
export function getPaymentGatewayMeta(gatewayStr?: string): PaymentGatewayMeta {
  const g = (gatewayStr || '').toUpperCase().trim();

  if (g.includes('BKASH')) {
    return {
      name: 'bKash',
      badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
      icon: Zap,
    };
  }

  if (g.includes('NAGAD')) {
    return {
      name: 'Nagad',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: Zap,
    };
  }

  if (g.includes('SSLCOMMERZ') || g.includes('SSL')) {
    return {
      name: 'SSLCommerz',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: CreditCard,
    };
  }

  if (g.includes('STRIPE')) {
    return {
      name: 'Stripe Card',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: CreditCard,
    };
  }

  if (g.includes('COD') || g.includes('CASH')) {
    return {
      name: 'Cash on Delivery (COD)',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Banknote,
    };
  }

  const cleanFallback = gatewayStr
    ? gatewayStr
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Payment Gateway';

  return {
    name: cleanFallback,
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: CreditCard,
  };
}

/**
 * Maps payment transaction statuses
 */
export function getPaymentStatusMeta(statusStr?: string): PaymentStatusMeta {
  const s = (statusStr || '').toUpperCase().trim();

  if (s.includes('SUCCESS') || s === 'PAID' || s === 'COMPLETED') {
    return {
      label: 'Success',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  if (s.includes('PENDING') || s === 'UNPAID' || s === 'PROCESSING' || s === 'AUTHORIZED') {
    return {
      label: s === 'AUTHORIZED' ? 'Authorized' : 'Pending',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  if (s.includes('REFUNDED') || s.includes('PARTIAL_REFUND')) {
    return {
      label: s.includes('PARTIAL') ? 'Partially Refunded' : 'Refunded',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    };
  }

  if (s.includes('FAILED') || s.includes('REJECTED') || s.includes('DECLINED') || s.includes('EXPIRED')) {
    return {
      label: s.includes('EXPIRED') ? 'Expired' : 'Failed',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }

  if (s.includes('CANCELLED') || s.includes('VOID')) {
    return {
      label: 'Cancelled',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    };
  }

  return {
    label: statusStr || 'Unknown',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
  };
}

export interface ReturnStatusMeta {
  label: string;
  badgeClass: string;
  icon: React.ElementType;
}

export function getReturnStatusMeta(statusStr?: string): ReturnStatusMeta {
  const s = (statusStr || '').toUpperCase().trim();

  if (s === 'APPROVED') {
    return {
      label: 'Approved',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    };
  }

  if (s === 'COMPLETED' || s === 'RESOLVED') {
    return {
      label: 'Completed',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    };
  }

  if (s === 'PROCESSING' || s === 'IN_REVIEW' || s === 'IN_TRANSIT' || s === 'RECEIVED') {
    return {
      label: s === 'RECEIVED' ? 'Item Received' : 'Processing Return',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: RotateCcw,
    };
  }

  if (s === 'PENDING' || s === 'REQUESTED' || s === 'SUBMITTED') {
    return {
      label: 'Pending Review',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
    };
  }

  if (s === 'REJECTED' || s === 'DECLINED') {
    return {
      label: 'Rejected',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
    };
  }

  if (s === 'CANCELLED' || s === 'CLOSED') {
    return {
      label: 'Cancelled',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: XCircle,
    };
  }

  const cleanFallback = statusStr
    ? statusStr
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Pending';

  return {
    label: cleanFallback,
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Clock,
  };
}

export interface RefundStatusMeta {
  label: string;
  badgeClass: string;
  icon: React.ElementType;
}

export function getRefundStatusMeta(statusStr?: string): RefundStatusMeta {
  const s = (statusStr || '').toUpperCase().trim();

  if (s === 'COMPLETED' || s === 'REFUNDED' || s === 'SUCCESS' || s === 'PAID') {
    return {
      label: 'Refunded',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    };
  }

  if (s === 'APPROVED') {
    return {
      label: 'Approved',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: CheckCircle2,
    };
  }

  if (s === 'PROCESSING' || s === 'IN_PROGRESS' || s === 'SENDING') {
    return {
      label: 'Processing Refund',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
    };
  }

  if (s === 'PENDING' || s === 'REQUESTED' || s === 'QUEUED') {
    return {
      label: 'Pending',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
    };
  }

  if (s === 'FAILED' || s === 'REJECTED' || s === 'DECLINED') {
    return {
      label: 'Failed',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertTriangle,
    };
  }

  if (s === 'CANCELLED' || s === 'VOID') {
    return {
      label: 'Cancelled',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: XCircle,
    };
  }

  const cleanFallback = statusStr
    ? statusStr
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Pending';

  return {
    label: cleanFallback,
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Clock,
  };
}

export interface ReviewStatusMeta {
  label: string;
  badgeClass: string;
}

export function getReviewStatusMeta(statusStr?: string): ReviewStatusMeta {
  const s = (statusStr || '').toUpperCase().trim();

  if (s === 'APPROVED' || s === 'PUBLISHED' || s === 'ACTIVE') {
    return {
      label: 'Published',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  if (s === 'PENDING' || s === 'UNDER_REVIEW' || s === 'SUBMITTED') {
    return {
      label: 'Under Review',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  if (s === 'REJECTED' || s === 'DECLINED' || s === 'FLAGGED') {
    return {
      label: 'Rejected',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }

  const cleanFallback = statusStr
    ? statusStr
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Published';

  return {
    label: cleanFallback,
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
  };
}
