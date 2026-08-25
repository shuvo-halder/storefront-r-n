'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AccountLayout } from './AccountLayout';
import { useStorefront } from '../../context/StorefrontContext';
import { customerService } from '../../services/customerService';
import { CustomerShipment } from '../../types/customer';
import { getTrackingStatusMeta } from '../../utils/trackingStatus';
import { OrderTrackingTimeline } from './OrderTrackingTimeline';
import { SmartImage } from '../common/SmartImage';
import {
  Truck,
  Package,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Filter,
  X,
  Layers,
  MapPin
} from 'lucide-react';

const STATUS_FILTERS = [
  { label: 'All Packages', value: 'ALL' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Pending Dispatch', value: 'PENDING' },
] as const;

export const ShipmentsPage: React.FC = () => {
  const { publicSettings } = useStorefront();
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  
  // Tracking Modal State
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [activeTrackingOrderNumber, setActiveTrackingOrderNumber] = useState<string | null>(null);

  // TanStack Query for GET /customer/shipments
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['customer', 'shipments', { page, limit, status: selectedStatus }],
    queryFn: async () => {
      const res = await customerService.getShipments({
        page,
        limit,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      });
      if (res.status === 'error' && (!res.data || res.data.shipments.length === 0 && res.message)) {
        throw new Error(res.message || 'Failed to fetch customer shipments.');
      }
      return res;
    },
    staleTime: 30 * 1000,
  });

  // Query for Modal Quick Tracking
  const {
    data: trackingResponse,
    isLoading: isTrackingLoading,
    isFetching: isTrackingFetching,
    error: trackingError,
    refetch: refetchTracking,
  } = useQuery({
    queryKey: ['customer', 'order-tracking', activeTrackingOrderId],
    queryFn: async () => {
      if (!activeTrackingOrderId) return null;
      const res = await customerService.getOrderTracking(activeTrackingOrderId);
      if (res.status === 'error' && !res.data) {
        throw new Error(res.message || 'Failed to fetch real-time shipment tracking.');
      }
      return res.data;
    },
    enabled: Boolean(activeTrackingOrderId),
    staleTime: 15 * 1000,
  });

  const shipments: CustomerShipment[] = response?.data?.shipments || [];
  const pagination = response?.data?.pagination || {
    page: 1,
    limit: 10,
    total: shipments.length,
    totalPages: Math.max(1, Math.ceil(shipments.length / limit)),
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleOpenTracking = (orderId?: string, orderNumber?: string) => {
    if (!orderId) return;
    setActiveTrackingOrderId(orderId);
    setActiveTrackingOrderNumber(orderNumber || `#${orderId.slice(-8)}`);
  };

  return (
    <AccountLayout activeTab="shipments">
      <div className="space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              <span>Shipments & Delivery</span>
              {!isLoading && (
                <span className="text-xs font-bold px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                  {pagination.total}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Track courier parcels, delivery status, and package transit checkpoints across your orders.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh shipments"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mr-1 flex-shrink-0">
            <Filter size={13} />
            <span>Filter:</span>
          </div>
          {STATUS_FILTERS.map((f) => {
            const isSelected = selectedStatus === f.value;
            return (
              <button
                key={f.value}
                onClick={() => handleStatusChange(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
                  isSelected
                    ? 'bg-[#111827] text-white border-[#111827] shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* State: Loading Skeletons */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-2xs">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-20 bg-gray-100 rounded w-full" />
              <div className="h-10 bg-gray-100 rounded w-full" />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-2xs">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-20 bg-gray-100 rounded w-full" />
              <div className="h-10 bg-gray-100 rounded w-full" />
            </div>
          </div>
        ) : isError ? (
          /* State: Error */
          <div className="bg-white rounded-xl border border-rose-200 p-8 text-center shadow-xs">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Failed to Load Shipments</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-5 leading-relaxed">
              {error instanceof Error ? error.message : 'An error occurred while fetching your package shipments.'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[#DC2B53] hover:bg-[#b02242] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw size={13} />
              <span>Try Again</span>
            </button>
          </div>
        ) : shipments.length === 0 ? (
          /* State: Empty Shipments */
          <div className="bg-white rounded-xl border border-gray-200 p-10 sm:p-14 text-center shadow-xs">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <Truck size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No shipments found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
              {selectedStatus !== 'ALL'
                ? `There are no packages with status "${selectedStatus}". Try selecting all packages.`
                : "You don't have any active or previous shipments yet. When your orders are dispatched, you can track them here."}
            </p>
            <div className="flex items-center justify-center gap-3">
              {selectedStatus !== 'ALL' ? (
                <button
                  onClick={() => handleStatusChange('ALL')}
                  className="px-4 py-2 bg-gray-900 text-white font-semibold text-xs rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  href="/account/orders"
                  className="px-4 py-2 bg-[#DC2B53] text-white font-semibold text-xs rounded-lg hover:bg-[#b02242] transition-colors inline-flex items-center gap-1.5"
                >
                  <Package size={14} />
                  <span>View My Orders</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* State: Shipments List */
          <div className="space-y-4">
            {shipments.map((shp) => {
              const carrier = shp.carrier || shp.carrierName || 'Courier Service';
              const trackingNumber = shp.trackingNumber || '';
              const statusMeta = getTrackingStatusMeta(shp.status);
              const orderId = shp.orderId;
              const orderNumber = shp.orderNumber || (orderId ? `#${orderId.slice(-8)}` : '—');
              const items = Array.isArray(shp.items) ? shp.items : [];

              return (
                <div
                  key={shp.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:border-gray-300 transition-colors"
                >
                  {/* Shipment Card Header */}
                  <div className="p-4 sm:p-5 bg-gray-50/60 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-9 h-9 bg-white text-[#DC2B53] rounded-lg border border-gray-200 flex items-center justify-center shadow-2xs">
                        <Truck size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{carrier}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
                          <span>Tracking:</span>
                          <span className="font-mono font-bold text-[#DC2B53]">
                            {trackingNumber || 'Pending Dispatch'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                      {orderId && (
                        <div>
                          <span>Order: </span>
                          <Link
                            href={`/account/orders/${orderId}`}
                            className="font-bold text-gray-800 hover:text-[#DC2B53] transition-colors"
                          >
                            {orderNumber}
                          </Link>
                        </div>
                      )}
                      {shp.shippedAt && (
                        <div>
                          <span>Shipped: </span>
                          <strong className="text-gray-700">{formatDate(shp.shippedAt)}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipment Card Body */}
                  <div className="p-4 sm:p-5 space-y-4">
                    
                    {/* Status Banner Description */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                      <statusMeta.icon size={15} className="text-[#DC2B53] flex-shrink-0" />
                      <span>{statusMeta.description}</span>
                    </div>

                    {/* Included Items in this Package (if present) */}
                    {items.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Items in this package ({items.length})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {items.map((item, itemIdx) => {
                            const itemName = item.productName || item.name || 'Purchased Item';
                            const itemImage = item.productImage || item.image || '';
                            const itemQty = item.quantity || 1;

                            return (
                              <div
                                key={item.id || itemIdx}
                                className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100 shadow-2xs"
                              >
                                <div className="w-10 h-10 bg-gray-50 rounded-md border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                  {itemImage ? (
                                    <SmartImage
                                      src={itemImage}
                                      alt={itemName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Package size={14} />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold text-gray-900 truncate">
                                    {itemName}
                                  </div>
                                  <div className="text-[11px] text-gray-500">
                                    Qty: <strong className="text-gray-700">{itemQty}</strong>
                                    {item.variant && <span className="ml-1 text-gray-400">({item.variant})</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {orderId && (
                          <button
                            onClick={() => handleOpenTracking(orderId, orderNumber)}
                            className="px-3.5 py-1.5 bg-[#DC2B53] hover:bg-[#b02242] text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Truck size={13} />
                            <span>Live Tracking</span>
                          </button>
                        )}

                        {shp.trackingUrl && (
                          <a
                            href={shp.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg border border-gray-200 shadow-2xs transition-colors inline-flex items-center gap-1.5"
                            title="Open courier website in new tab"
                          >
                            <span>Courier Page</span>
                            <ExternalLink size={12} className="text-gray-400" />
                          </a>
                        )}
                      </div>

                      {orderId && (
                        <Link
                          href={`/account/orders/${orderId}`}
                          className="text-xs font-semibold text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
                        >
                          <span>View Full Order</span>
                          <ChevronRight size={13} />
                        </Link>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-500 font-medium">
                  Showing <span className="font-bold text-gray-800">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-bold text-gray-800">{Math.min(page * limit, pagination.total)}</span> of{' '}
                  <span className="font-bold text-gray-800">{pagination.total}</span> shipments
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page <= 1}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1)
                    .filter((p) => {
                      if (pagination.totalPages <= 7) return true;
                      if (p === 1 || p === pagination.totalPages) return true;
                      if (Math.abs(p - page) <= 1) return true;
                      return false;
                    })
                    .map((p, idx, arr) => {
                      const prevVal = arr[idx - 1];
                      const hasGap = prevVal && p - prevVal > 1;

                      return (
                        <React.Fragment key={p}>
                          {hasGap && <span className="px-1 text-xs text-gray-400">...</span>}
                          <button
                            onClick={() => setPage(p)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              page === p
                                ? 'bg-[#DC2B53] text-white shadow-xs'
                                : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                    disabled={page >= pagination.totalPages}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Live Tracking Modal */}
      {activeTrackingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs"
            onClick={() => setActiveTrackingOrderId(null)}
          />
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full relative z-10 shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Shipment Tracking</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Order {activeTrackingOrderNumber}
                </p>
              </div>
              <button
                onClick={() => setActiveTrackingOrderId(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Reusable Timeline Component with real backend data */}
            <OrderTrackingTimeline
              trackingData={trackingResponse}
              isLoading={isTrackingLoading}
              isFetching={isTrackingFetching}
              error={trackingError}
              onRetry={() => refetchTracking()}
              showExternalLink={true}
            />

            <div className="mt-8 flex gap-3 pt-4 border-t border-gray-100">
              <Link
                href={`/account/orders/${activeTrackingOrderId}`}
                className="flex-1 py-2.5 bg-gray-900 text-white text-center font-semibold text-xs rounded-lg hover:bg-gray-800 transition-colors shadow-2xs"
              >
                View Full Order
              </Link>
              <button
                onClick={() => setActiveTrackingOrderId(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </AccountLayout>
  );
};
