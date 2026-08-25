'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SmartImage } from '../common/SmartImage';
import { AccountLayout } from './AccountLayout';
import { useStorefront } from '../../context/StorefrontContext';
import { customerService } from '../../services/customerService';
import { 
  CustomerOrderDetails, 
  CustomerOrderItem, 
  CustomerPayment, 
  CustomerShipment,
  CustomerReturn,
  CustomerRefund,
  EligibleReviewItem
} from '../../types/customer';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice } from '../../utils/formatters';
import { 
  getPaymentGatewayMeta, 
  getPaymentStatusMeta, 
  getTrackingStatusMeta,
  getReturnStatusMeta,
  getRefundStatusMeta 
} from '../../utils/trackingStatus';
import { OrderTrackingTimeline } from './OrderTrackingTimeline';
import { ReturnRequestModal } from './ReturnRequestModal';
import { ReviewForm } from './ReviewForm';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard, 
  MapPin, 
  Clock, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FileText,
  Printer,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Receipt,
  Copy,
  Check,
  Layers,
  RotateCcw,
  Star,
  DollarSign
} from 'lucide-react';

export const OrderDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { viewParams, publicSettings } = useStorefront();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<EligibleReviewItem | null>(null);

  // Extract orderId from URL params (supports [id] or [orderId]) or viewParams fallback
  const orderId = (params?.id as string) || (params?.orderId as string) || viewParams?.id || '';

  // Currency resolution
  let currencyCode = 'BDT';
  let currencySymbol = '৳';
  try {
    const { settings } = useSettings();
    currencyCode = publicSettings?.general?.currency || settings?.general?.currency || 'BDT';
    currencySymbol = publicSettings?.general?.currencySymbol || settings?.general?.currencySymbol || (currencyCode === 'BDT' ? '৳' : '৳');
  } catch {
    // Ignore
  }

  // Copy helper
  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. TanStack Query for GET /customer/orders/:orderId
  const {
    data: orderResponse,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
    refetch: refetchOrder,
    isFetching: isOrderFetching,
  } = useQuery({
    queryKey: ['customer', 'order', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      const res = await customerService.getOrderById(orderId);
      if (res.status === 'error' || !res.data) {
        throw new Error(res.message || 'Order not found');
      }
      return res;
    },
    enabled: Boolean(orderId),
    staleTime: 30 * 1000,
  });

  // 2. TanStack Query for GET /customer/orders/:orderId/payments
  const {
    data: paymentsResponse,
    isLoading: isPaymentsLoading,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ['customer', 'order-payments', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await customerService.getOrderPayments(orderId);
      return res.data;
    },
    enabled: Boolean(orderId),
    staleTime: 30 * 1000,
  });

  // 3. TanStack Query for GET /customer/orders/:orderId/shipments
  const {
    data: shipmentsResponse,
    isLoading: isShipmentsLoading,
    refetch: refetchShipments,
  } = useQuery({
    queryKey: ['customer', 'order-shipments', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await customerService.getOrderShipments(orderId);
      return res.data;
    },
    enabled: Boolean(orderId),
    staleTime: 30 * 1000,
  });

  // 4. TanStack Query for GET /customer/orders/:orderId/tracking
  const {
    data: trackingResponse,
    isLoading: isTrackingLoading,
    isFetching: isTrackingFetching,
    error: trackingError,
    refetch: refetchTracking,
  } = useQuery({
    queryKey: ['customer', 'order-tracking', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await customerService.getOrderTracking(orderId);
      if (res.status === 'error' && !res.data) {
        throw new Error(res.message || 'Failed to load tracking.');
      }
      return res.data;
    },
    enabled: Boolean(orderId),
    staleTime: 15 * 1000,
  });

  // 5. TanStack Query for GET /customer/orders/:orderId/returns
  const {
    data: returnsResponse,
    isLoading: isReturnsLoading,
    refetch: refetchReturns,
  } = useQuery({
    queryKey: ['customer', 'order-returns', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await customerService.getOrderReturns(orderId);
      return res.data;
    },
    enabled: Boolean(orderId),
    staleTime: 30 * 1000,
  });

  // 6. TanStack Query for GET /customer/orders/:orderId/refunds
  const {
    data: refundsResponse,
    isLoading: isRefundsLoading,
    refetch: refetchRefunds,
  } = useQuery({
    queryKey: ['customer', 'order-refunds', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await customerService.getOrderRefunds(orderId);
      return res.data;
    },
    enabled: Boolean(orderId),
    staleTime: 30 * 1000,
  });

  const order: CustomerOrderDetails | null = orderResponse?.data || null;

  const handleRefetchAll = () => {
    refetchOrder();
    refetchPayments();
    refetchShipments();
    refetchTracking();
    refetchReturns();
    refetchRefunds();
  };

  const getStatusBadgeClass = (statusStr?: string) => {
    const s = (statusStr || '').toUpperCase();
    if (s.includes('DELIVERED') || s.includes('COMPLETED')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('PROCESSING') || s.includes('SHIPPED') || s.includes('OUT FOR DELIVERY')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (s.includes('PENDING') || s.includes('PLACED')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s.includes('CANCELLED') || s.includes('REJECTED') || s.includes('FAILED')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPaymentBadgeClass = (statusStr?: string) => {
    const s = (statusStr || '').toUpperCase();
    if (s.includes('PAID') || s.includes('SUCCESS')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('PENDING') || s.includes('UNPAID') || s.includes('COD')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s.includes('REFUNDED')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Loading State
  if (isOrderLoading) {
    return (
      <AccountLayout activeTab="orders">
        <div className="space-y-6 animate-pulse">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="space-y-2">
              <div className="w-24 h-4 bg-gray-200 rounded" />
              <div className="w-48 h-7 bg-gray-200 rounded" />
            </div>
            <div className="w-24 h-9 bg-gray-200 rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-2xs">
                <div className="w-32 h-5 bg-gray-200 rounded" />
                <div className="h-20 bg-gray-100 rounded" />
                <div className="h-20 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3 shadow-2xs">
                <div className="w-28 h-4 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </AccountLayout>
    );
  }

  // Error State
  if (isOrderError || !order) {
    return (
      <AccountLayout activeTab="orders">
        <div className="bg-white rounded-xl border border-rose-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Order Not Accessible</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
              {orderError instanceof Error 
                ? orderError.message 
                : 'Unable to locate the requested order. It may have been archived or belongs to a different session.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleRefetchAll()}
              className="px-4 py-2 bg-[#DC2B53] hover:bg-[#b02242] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Retry Order</span>
            </button>
            <Link
              href="/account/orders"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </AccountLayout>
    );
  }

  // Normalize order properties
  const orderCode = order.orderNumber || order.id || 'N/A';
  const status = (order.orderStatus || order.status || 'PENDING').toUpperCase();
  const paymentStatus = (order.paymentStatus || 'PENDING').toUpperCase();
  const paymentMethod = order.paymentMethod || 'Cash on Delivery';

  const orderDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent';

  const items: CustomerOrderItem[] = Array.isArray(order.items) ? order.items : [];
  
  // Financial breakdown
  const subtotal = order.subtotal ?? (items.reduce((acc, it) => acc + ((it.unitPrice || it.price || 0) * (it.quantity || 1)), 0));
  const shippingFee = order.shippingFee ?? order.shippingCost ?? 0;
  const tax = order.tax ?? 0;
  const discount = order.discount ?? 0;
  const totalAmount = order.totalAmount ?? order.total ?? (subtotal + shippingFee + tax - discount);

  // Address resolution
  const shippingAddress = order.shippingAddress || {};
  const hasShippingAddress = Boolean(
    shippingAddress.fullName ||
    shippingAddress.name ||
    shippingAddress.addressLine1 ||
    shippingAddress.address1 ||
    shippingAddress.city
  );

  // Payment Summary resolution (from payments query or fallback from order)
  const paymentSummaryData = paymentsResponse;
  const paymentsList: CustomerPayment[] = paymentSummaryData?.payments || [];
  const paidAmount = paymentSummaryData?.paidAmount ?? order.paidAmount ?? (paymentStatus === 'PAID' ? totalAmount : 0);
  const dueAmount = paymentSummaryData?.dueAmount ?? order.dueAmount ?? (paymentStatus === 'PAID' ? 0 : totalAmount - paidAmount);
  const refundedAmount = paymentSummaryData?.refundedAmount ?? 0;

  // Shipment Packages resolution (from shipments query or fallback from order)
  const packagesList: CustomerShipment[] = shipmentsResponse?.shipments || 
    (Array.isArray(order.shipments) ? order.shipments : order.shipment ? [order.shipment] : []);

  return (
    <AccountLayout activeTab="orders">
      <div className="space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <Link 
              href="/account/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#DC2B53] transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Orders List</span>
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Order #{orderCode}
              </h1>
              <span className={`px-2.5 py-1 rounded-md font-bold text-xs border ${getStatusBadgeClass(status)}`}>
                {status}
              </span>
              <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${getPaymentBadgeClass(paymentStatus)}`}>
                {paymentStatus}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
              <Clock size={13} className="text-gray-400" />
              <span>Placed on {orderDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Request Return CTA if order eligible */}
            {status !== 'CANCELLED' && (
              <button
                onClick={() => setIsReturnModalOpen(true)}
                className="px-3.5 py-2 bg-white text-gray-700 hover:text-[#DC2B53] font-semibold text-xs rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Request Return</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white text-gray-700 font-semibold text-xs rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Print Receipt"
            >
              <Printer size={14} />
              <span>Print Invoice</span>
            </button>
            <button 
              onClick={() => handleRefetchAll()}
              disabled={isOrderFetching}
              className="p-2 bg-white text-gray-700 font-semibold text-xs rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-60 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={14} className={isOrderFetching ? 'animate-spin text-[#DC2B53]' : ''} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column: Items, Payment Summary, Shipment Packages & Live Tracking */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Purchased Items Card */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Package size={18} className="text-[#DC2B53]" />
                  <span>Purchased Items ({items.length})</span>
                </h2>
                <span className="text-xs text-gray-500 font-medium">
                  Verified Order Items
                </span>
              </div>

              <div className="space-y-4">
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const itemName = item.productName || item.name || 'Store Product';
                    const itemImage = item.productImage || item.image || '';
                    const itemVariant = item.variantName || item.variant || null;
                    const itemQty = item.quantity || 1;
                    const unitPrice = item.unitPrice || item.price || 0;
                    const itemTotal = item.totalPrice || item.total || (unitPrice * itemQty);

                    return (
                      <div 
                        key={item.id || idx} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                          <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative">
                            <SmartImage 
                              src={itemImage} 
                              alt={itemName} 
                              fill
                              fallbackType="product"
                              fallbackLabel={itemName}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 truncate">
                              {itemName}
                            </h3>
                            {itemVariant && (
                              <p className="text-xs text-gray-500 font-medium mt-0.5">
                                Variant: <span className="text-gray-700">{itemVariant}</span>
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>Qty: <strong className="text-gray-800">{itemQty}</strong></span>
                              <span>•</span>
                              <span>Unit: {formatPrice(unitPrice, currencyCode, currencySymbol)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0">
                          <div className="text-sm font-bold text-gray-900">
                            {formatPrice(itemTotal, currencyCode, currencySymbol)}
                          </div>

                          {/* Write Review button for delivered items */}
                          {(status.includes('DELIVERED') || status.includes('COMPLETED')) && (
                            <button
                              onClick={() => {
                                setSelectedReviewItem({
                                  orderItemId: item.id || item.orderItemId || `${orderId}_${item.productId || idx}`,
                                  productId: item.productId || item.product?.id || '',
                                  productName: itemName,
                                  productImage: itemImage,
                                  variantName: itemVariant || undefined,
                                  orderId: order.id,
                                  orderNumber: orderCode,
                                  price: unitPrice,
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              <Star size={11} className="fill-amber-600 text-amber-600" />
                              <span>Write Review</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500 font-medium">
                    Order items packaged under batch reference #{orderCode}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Payment Summary & Transaction History Card (GET /customer/orders/:orderId/payments) */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard size={18} className="text-[#DC2B53]" />
                  <span>Payment & Financial Summary</span>
                </h2>
                <Link
                  href="/account/payments"
                  className="text-xs font-semibold text-[#DC2B53] hover:underline inline-flex items-center gap-1"
                >
                  <span>All Payments</span>
                  <ExternalLink size={11} />
                </Link>
              </div>

              {/* Financial Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-[11px] font-medium text-gray-500">Order Total</div>
                  <div className="text-sm font-bold text-gray-900 mt-0.5">
                    {formatPrice(totalAmount, currencyCode, currencySymbol)}
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                  <div className="text-[11px] font-medium text-emerald-800">Paid Amount</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">
                    {formatPrice(paidAmount, currencyCode, currencySymbol)}
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100">
                  <div className="text-[11px] font-medium text-amber-800">Due on Delivery</div>
                  <div className="text-sm font-bold text-amber-700 mt-0.5">
                    {formatPrice(dueAmount, currencyCode, currencySymbol)}
                  </div>
                </div>

                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100">
                  <div className="text-[11px] font-medium text-purple-800">Refunded</div>
                  <div className="text-sm font-bold text-purple-700 mt-0.5">
                    {formatPrice(refundedAmount, currencyCode, currencySymbol)}
                  </div>
                </div>
              </div>

              {/* Transaction Records List */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Payment Transactions ({paymentsList.length})
                </div>

                {paymentsList.length > 0 ? (
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {paymentsList.map((p, pIdx) => {
                      const gatewayMeta = getPaymentGatewayMeta(p.gateway || p.paymentMethod);
                      const statusMeta = getPaymentStatusMeta(p.status);
                      const GatewayIcon = gatewayMeta.icon;
                      const trxId = p.transactionId || p.id;
                      const pDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : null;

                      return (
                        <div
                          key={p.id || pIdx}
                          className="p-3.5 bg-white hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-[#DC2B53] flex-shrink-0">
                              <GatewayIcon size={14} />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 flex items-center gap-2">
                                <span>{gatewayMeta.name}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusMeta.badgeClass}`}>
                                  {statusMeta.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono mt-0.5">
                                <span>Trx: {trxId || 'N/A'}</span>
                                {trxId && (
                                  <button
                                    onClick={() => handleCopy(trxId)}
                                    className="p-0.5 text-gray-400 hover:text-gray-700"
                                    title="Copy transaction ID"
                                  >
                                    {copiedId === trxId ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right">
                            <div className="text-sm font-bold text-gray-900">
                              {formatPrice(p.amount || 0, p.currency || currencyCode, currencySymbol)}
                            </div>
                            {pDate && (
                              <div className="text-[10px] text-gray-400 font-medium">
                                {pDate}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 text-center text-xs text-gray-500">
                    Payment method: <strong className="text-gray-800">{paymentMethod}</strong> (Status: {paymentStatus})
                  </div>
                )}
              </div>
            </div>

            {/* 3. Shipment Packages Card (GET /customer/orders/:orderId/shipments) */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Layers size={18} className="text-[#DC2B53]" />
                  <span>Shipment Packages ({packagesList.length > 0 ? packagesList.length : '1'})</span>
                </h2>
                <Link
                  href="/account/shipments"
                  className="text-xs font-semibold text-[#DC2B53] hover:underline inline-flex items-center gap-1"
                >
                  <span>All Shipments</span>
                  <ExternalLink size={11} />
                </Link>
              </div>

              {packagesList.length > 0 ? (
                <div className="space-y-4">
                  {packagesList.map((pkg, pIdx) => {
                    const carrierName = pkg.carrier || pkg.carrierName || 'Store Courier Partner';
                    const pkgTracking = pkg.trackingNumber || '';
                    const pkgStatusMeta = getTrackingStatusMeta(pkg.status);
                    const pkgItems = Array.isArray(pkg.items) ? pkg.items : [];

                    return (
                      <div
                        key={pkg.id || pIdx}
                        className="p-4 bg-gray-50/60 rounded-xl border border-gray-200 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#DC2B53]">
                              <Truck size={15} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-900">{carrierName}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pkgStatusMeta.badgeClass}`}>
                                  {pkgStatusMeta.label}
                                </span>
                              </div>
                              <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                Tracking: <strong className="text-gray-800">{pkgTracking || 'Pending Dispatch'}</strong>
                              </div>
                            </div>
                          </div>

                          {pkg.trackingUrl && (
                            <a
                              href={pkg.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                            >
                              <span>Courier Page</span>
                              <ExternalLink size={12} className="text-gray-400" />
                            </a>
                          )}
                        </div>

                        {/* Included items in package */}
                        {pkgItems.length > 0 && (
                          <div className="pt-2 border-t border-gray-200/60">
                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                              Items in package:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {pkgItems.map((pi, piIdx) => (
                                <span
                                  key={pi.id || piIdx}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[11px] text-gray-700"
                                >
                                  <span>{pi.productName || pi.name || 'Item'}</span>
                                  <strong className="text-gray-900">×{pi.quantity || 1}</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 text-center text-xs text-gray-500">
                  Carrier dispatch package is currently in preparation with the warehouse team.
                </div>
              )}
            </div>

            {/* 4. Live Tracking Timeline Card (GET /customer/orders/:orderId/tracking) */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Truck size={18} className="text-[#DC2B53]" />
                  <span>Real-Time Tracking Checkpoints</span>
                </h2>
                <button
                  onClick={() => refetchTracking()}
                  disabled={isTrackingFetching}
                  className="text-xs font-semibold text-[#DC2B53] hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Update tracking live"
                >
                  <RefreshCw size={12} className={isTrackingFetching ? 'animate-spin' : ''} />
                  <span>{isTrackingFetching ? 'Updating...' : 'Live Refresh'}</span>
                </button>
              </div>

              {/* Embedded Timeline */}
              <OrderTrackingTimeline
                trackingData={trackingResponse}
                isLoading={isTrackingLoading}
                isFetching={isTrackingFetching}
                error={trackingError}
                onRetry={() => refetchTracking()}
                showExternalLink={true}
              />
            </div>

            {/* 5. Returns & Refunds History for this Order Card */}
            {((returnsResponse?.returns && returnsResponse.returns.length > 0) || 
              (refundsResponse?.refunds && refundsResponse.refunds.length > 0) ||
              (status.includes('DELIVERED') || status.includes('COMPLETED'))) && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <RotateCcw size={18} className="text-[#DC2B53]" />
                    <span>Returns & Financial Adjustments</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsReturnModalOpen(true)}
                      className="text-xs font-semibold text-[#DC2B53] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Request Return</span>
                    </button>
                  </div>
                </div>

                {/* Returns List */}
                {returnsResponse?.returns && returnsResponse.returns.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Submitted Return Requests ({returnsResponse.returns.length})
                    </div>
                    {returnsResponse.returns.map((ret: CustomerReturn) => {
                      const retMeta = getReturnStatusMeta(ret.status);
                      const RetIcon = retMeta.icon;
                      return (
                        <div
                          key={ret.id}
                          className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-gray-900">
                                Return #{ret.returnNumber || ret.id}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${retMeta.badgeClass}`}>
                                <RetIcon size={11} />
                                <span>{retMeta.label}</span>
                              </span>
                            </div>
                            {ret.reason && (
                              <p className="text-xs text-gray-600 mt-1">
                                <span className="font-medium">Reason:</span> {ret.reason}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            {ret.refundAmount !== undefined && (
                              <span className="text-xs font-bold text-emerald-700">
                                Refund: {formatPrice(ret.refundAmount, currencyCode, currencySymbol)}
                              </span>
                            )}
                            <Link
                              href="/account/returns"
                              className="text-xs font-semibold text-[#DC2B53] hover:underline inline-flex items-center gap-1"
                            >
                              <span>View Returns</span>
                              <ExternalLink size={11} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {/* Refunds List */}
                {refundsResponse?.refunds && refundsResponse.refunds.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Processed Refunds ({refundsResponse.refunds.length})
                    </div>
                    {refundsResponse.refunds.map((ref: CustomerRefund) => {
                      const refMeta = getRefundStatusMeta(ref.status);
                      const RefIcon = refMeta.icon;
                      return (
                        <div
                          key={ref.id}
                          className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-emerald-950">
                                Refund #{ref.refundNumber || ref.id}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${refMeta.badgeClass}`}>
                                <RefIcon size={11} />
                                <span>{refMeta.label}</span>
                              </span>
                            </div>
                            <div className="text-xs font-bold text-gray-900 mt-1">
                              Amount: {formatPrice(ref.amount, ref.currency || currencyCode, currencySymbol)}
                            </div>
                          </div>

                          <div className="self-end sm:self-auto">
                            <Link
                              href="/account/refunds"
                              className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
                            >
                              <span>View Refunds</span>
                              <ExternalLink size={11} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {/* Return Request prompt if delivered and no returns yet */}
                {(!returnsResponse?.returns || returnsResponse.returns.length === 0) &&
                 (!refundsResponse?.refunds || refundsResponse.refunds.length === 0) && (
                  <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 flex items-center justify-between">
                    <span>Need to return an item from this order?</span>
                    <button
                      onClick={() => setIsReturnModalOpen(true)}
                      className="font-bold text-[#DC2B53] hover:underline cursor-pointer"
                    >
                      Start Return Request &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Sidebar Column: Address, Billing, and Help */}
          <div className="space-y-6">
            
            {/* Delivery Address Card */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-2xs">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-[#DC2B53]" />
                <span>Shipping Address</span>
              </h2>
              {hasShippingAddress ? (
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-gray-900">
                    {shippingAddress.fullName || shippingAddress.name || 'Recipient'}
                  </div>
                  <div className="text-gray-600 font-normal leading-relaxed">
                    {shippingAddress.addressLine1 || shippingAddress.address1}
                    {(shippingAddress.addressLine2 || shippingAddress.address2) && (
                      <>
                        <br />
                        {shippingAddress.addressLine2 || shippingAddress.address2}
                      </>
                    )}
                    <br />
                    {[
                      shippingAddress.city,
                      shippingAddress.state,
                      shippingAddress.postalCode || shippingAddress.zip,
                    ].filter(Boolean).join(', ')}
                    {shippingAddress.country && (
                      <>
                        <br />
                        {shippingAddress.country}
                      </>
                    )}
                  </div>
                  {shippingAddress.phone && (
                    <div className="pt-1.5 font-semibold text-gray-700">
                      Phone: <span className="font-normal text-gray-600">{shippingAddress.phone}</span>
                    </div>
                  )}
                  {shippingAddress.email && (
                    <div className="text-gray-500 font-normal">
                      Email: {shippingAddress.email}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500 italic">
                  Digital delivery / Standard default address
                </div>
              )}
            </div>

            {/* Financial Breakdown Card */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-2xs">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Receipt size={16} className="text-[#DC2B53]" />
                <span>Cost Breakdown</span>
              </h2>
              
              <div className="space-y-3.5">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-medium text-gray-500">Method</div>
                    <div className="text-xs font-bold text-gray-900 mt-0.5">{paymentMethod}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPaymentBadgeClass(paymentStatus)}`}>
                    {paymentStatus}
                  </span>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="text-gray-900 font-semibold">
                      {formatPrice(subtotal, currencyCode, currencySymbol)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Shipping Fee</span>
                    <span className="text-gray-900 font-semibold">
                      {shippingFee > 0 ? formatPrice(shippingFee, currencyCode, currencySymbol) : 'Free'}
                    </span>
                  </div>

                  {tax > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">Estimated Tax</span>
                      <span className="text-gray-900 font-semibold">
                        {formatPrice(tax, currencyCode, currencySymbol)}
                      </span>
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex justify-between text-xs font-semibold text-emerald-600">
                      <span>Discount Applied</span>
                      <span>-{formatPrice(discount, currencyCode, currencySymbol)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-900">Grand Total</span>
                    <span className="text-lg font-bold text-[#DC2B53]">
                      {formatPrice(totalAmount, currencyCode, currencySymbol)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs pt-1 text-gray-500">
                    <span>Paid Amount:</span>
                    <span className="font-semibold text-emerald-600">
                      {formatPrice(paidAmount, currencyCode, currencySymbol)}
                    </span>
                  </div>

                  {dueAmount > 0 && (
                    <div className="flex justify-between text-xs text-amber-600 font-semibold">
                      <span>Due on Delivery:</span>
                      <span>{formatPrice(dueAmount, currencyCode, currencySymbol)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Support Card */}
            <div className="bg-gray-900 rounded-xl p-5 sm:p-6 text-white shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                <ShieldCheck size={16} className="text-[#DC2B53]" />
                <span>Customer Care</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Need help with this order?</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Our support team is available 24/7 for delivery inquiries, order edits, or return requests.
              </p>
              <Link
                href="/contact"
                className="w-full py-2 bg-white text-gray-900 text-center font-semibold text-xs rounded-lg hover:bg-gray-100 transition-colors inline-block"
              >
                Contact Support
              </Link>
            </div>

          </div>

        </div>

        {/* Modal: Return Request */}
        {isReturnModalOpen && order && (
          <ReturnRequestModal
            order={order}
            isOpen={isReturnModalOpen}
            onClose={() => setIsReturnModalOpen(false)}
            onSuccess={() => {
              refetchReturns();
              refetchOrder();
            }}
          />
        )}

        {/* Modal: Review Form */}
        {selectedReviewItem && (
          <ReviewForm
            item={selectedReviewItem}
            isOpen={!!selectedReviewItem}
            onClose={() => setSelectedReviewItem(null)}
            onSuccess={() => {
              setSelectedReviewItem(null);
            }}
          />
        )}

      </div>
    </AccountLayout>
  );
};
