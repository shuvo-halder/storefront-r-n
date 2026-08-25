import React from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ShoppingBag, 
  CreditCard, 
  AlertTriangle, 
  RotateCcw, 
  Receipt, 
  Star, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Tag, 
  Bell, 
  Info,
  Clock,
  LucideIcon
} from 'lucide-react';

export interface NotificationMeta {
  icon: LucideIcon;
  categoryLabel: string;
  iconBgClass: string;
  iconColorClass: string;
  badgeClass: string;
}

/**
 * Maps notification types to appropriate Lucide icons and styles.
 * Safe fallback for unknown or new backend notification types.
 */
export function getNotificationMeta(type?: string): NotificationMeta {
  if (!type) {
    return {
      icon: Bell,
      categoryLabel: 'Notification',
      iconBgClass: 'bg-gray-100',
      iconColorClass: 'text-gray-600',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    };
  }

  const upperType = type.toUpperCase();

  // 1. Order Status Notifications
  if (upperType === 'ORDER_PLACED') {
    return {
      icon: ShoppingBag,
      categoryLabel: 'Order Placed',
      iconBgClass: 'bg-blue-50',
      iconColorClass: 'text-blue-600',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }
  if (upperType === 'ORDER_CONFIRMED' || upperType === 'ORDER_PROCESSING') {
    return {
      icon: Package,
      categoryLabel: 'Order Processing',
      iconBgClass: 'bg-indigo-50',
      iconColorClass: 'text-indigo-600',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
  }
  if (upperType === 'ORDER_SHIPPED' || upperType.includes('SHIP')) {
    return {
      icon: Truck,
      categoryLabel: 'Order Shipped',
      iconBgClass: 'bg-purple-50',
      iconColorClass: 'text-purple-600',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    };
  }
  if (upperType === 'ORDER_DELIVERED' || upperType === 'ORDER_COMPLETED') {
    return {
      icon: CheckCircle2,
      categoryLabel: 'Order Delivered',
      iconBgClass: 'bg-emerald-50',
      iconColorClass: 'text-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  if (upperType === 'ORDER_CANCELLED') {
    return {
      icon: XCircle,
      categoryLabel: 'Order Cancelled',
      iconBgClass: 'bg-red-50',
      iconColorClass: 'text-red-600',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
    };
  }

  // 2. Payment Notifications
  if (upperType === 'PAYMENT_SUCCESS' || upperType === 'PAYMENT_COMPLETED') {
    return {
      icon: CreditCard,
      categoryLabel: 'Payment Received',
      iconBgClass: 'bg-emerald-50',
      iconColorClass: 'text-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  if (upperType === 'PAYMENT_FAILED') {
    return {
      icon: AlertTriangle,
      categoryLabel: 'Payment Failed',
      iconBgClass: 'bg-red-50',
      iconColorClass: 'text-red-600',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
    };
  }
  if (upperType === 'PAYMENT_PENDING') {
    return {
      icon: Clock,
      categoryLabel: 'Payment Pending',
      iconBgClass: 'bg-amber-50',
      iconColorClass: 'text-amber-600',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  if (upperType === 'PAYMENT_REFUNDED') {
    return {
      icon: Receipt,
      categoryLabel: 'Payment Refunded',
      iconBgClass: 'bg-emerald-50',
      iconColorClass: 'text-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  // 3. Return Notifications
  if (upperType.startsWith('RETURN_')) {
    const isApproved = upperType === 'RETURN_APPROVED' || upperType === 'RETURN_COMPLETED';
    const isRejected = upperType === 'RETURN_REJECTED';
    return {
      icon: RotateCcw,
      categoryLabel: upperType.replace(/_/g, ' '),
      iconBgClass: isApproved ? 'bg-emerald-50' : isRejected ? 'bg-red-50' : 'bg-amber-50',
      iconColorClass: isApproved ? 'text-emerald-600' : isRejected ? 'text-red-600' : 'text-amber-600',
      badgeClass: isApproved 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : isRejected 
        ? 'bg-red-50 text-red-700 border-red-200' 
        : 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  // 4. Refund Notifications
  if (upperType.startsWith('REFUND_')) {
    const isCompleted = upperType === 'REFUND_COMPLETED';
    return {
      icon: Receipt,
      categoryLabel: upperType.replace(/_/g, ' '),
      iconBgClass: isCompleted ? 'bg-emerald-50' : 'bg-amber-50',
      iconColorClass: isCompleted ? 'text-emerald-600' : 'text-amber-600',
      badgeClass: isCompleted 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  // 5. Review Notifications
  if (upperType.startsWith('REVIEW_')) {
    return {
      icon: Star,
      categoryLabel: upperType.replace(/_/g, ' '),
      iconBgClass: 'bg-purple-50',
      iconColorClass: 'text-purple-600',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    };
  }

  // 6. Account & Security
  if (upperType.includes('ACCOUNT') || upperType.includes('SECURITY')) {
    return {
      icon: ShieldCheck,
      categoryLabel: 'Account Security',
      iconBgClass: 'bg-blue-50',
      iconColorClass: 'text-blue-600',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }

  // 7. Promotions & Deals
  if (upperType.includes('PROMOTION') || upperType.includes('DISCOUNT') || upperType.includes('DEAL') || upperType.includes('MARKETING')) {
    return {
      icon: Sparkles,
      categoryLabel: 'Promotion',
      iconBgClass: 'bg-rose-50',
      iconColorClass: 'text-[#DC2B53]',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }

  // 8. System & General Fallback
  return {
    icon: Bell,
    categoryLabel: upperType.replace(/_/g, ' '),
    iconBgClass: 'bg-gray-100',
    iconColorClass: 'text-gray-600',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
  };
}

/**
 * Format notification timestamp into user-friendly relative or calendar string
 */
export function formatNotificationTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) {
    return 'Just now';
  }
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
