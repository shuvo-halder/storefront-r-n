'use client';

import React, { useState } from 'react';
import { AccountLayout } from './AccountLayout';
import { SmartImage } from '../common/SmartImage';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '../../services/customerService';
import { useStorefront } from '../../context/StorefrontContext';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice } from '../../utils/formatters';
import { getReturnStatusMeta } from '../../utils/trackingStatus';
import { CustomerReturn } from '../../types/customer';
import { ReturnRequestModal } from './ReturnRequestModal';
import Link from 'next/link';
import { 
  RotateCcw, 
  Package, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
  ExternalLink,
  DollarSign,
  PlusCircle,
  HelpCircle,
  FileText
} from 'lucide-react';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Returns' },
  { id: 'PENDING', label: 'Pending Review' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'REJECTED', label: 'Rejected' },
];

export const ReturnsPage: React.FC = () => {
  const { publicSettings } = useStorefront();
  const { settings } = useSettings();
  const currencyCode = publicSettings?.general?.currency || settings?.general?.currency || 'BDT';
  const currencySymbol = publicSettings?.general?.currencySymbol || settings?.general?.currencySymbol || '৳';

  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Query Returns
  const { 
    data: returnsData, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['customer', 'returns', { page, status: statusFilter }],
    queryFn: async () => {
      const res = await customerService.getReturns({
        page,
        limit: 10,
        status: statusFilter,
      });
      if (res.status === 'error' || !res.data) {
        throw new Error(res.message || 'Failed to fetch returns history.');
      }
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  const returns = returnsData?.returns || [];
  const pagination = returnsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <AccountLayout activeTab="returns">
      <div className="space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#DC2B53] uppercase tracking-wider mb-1">
              <RotateCcw size={14} />
              <span>Customer Returns</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Returns & Replacements</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Track active return requests, view resolutions, and check refund statuses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/account/orders"
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Request Return on Order</span>
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {STATUS_FILTERS.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs animate-pulse space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-16 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="bg-white rounded-xl p-8 border border-red-200 shadow-xs text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Failed to Load Returns</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
              {error instanceof Error ? error.message : 'Unable to connect to the returns service. Please try again.'}
            </p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="btn-primary inline-flex items-center gap-2 text-xs cursor-pointer"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              <span>Retry</span>
            </button>
          </div>
        ) : returns.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-xs text-center">
            <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <RotateCcw size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No return requests yet.</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
              {statusFilter !== 'ALL'
                ? `You don't have any return requests matching the "${statusFilter.toLowerCase()}" filter.`
                : 'Need to return or exchange an item? You can submit return requests directly from your delivered orders.'}
            </p>
            <Link
              href="/account/orders"
              className="btn-primary inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs"
            >
              <Package size={15} />
              <span>View Your Orders</span>
            </Link>
          </div>
        ) : (
          /* Returns List */
          <div className="space-y-4">
            {returns.map((ret: CustomerReturn) => {
              const statusMeta = getReturnStatusMeta(ret.status);
              const StatusIcon = statusMeta.icon;
              const formattedDate = ret.requestedAt || ret.createdAt
                ? new Date(ret.requestedAt || ret.createdAt!).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              const updatedDate = ret.updatedAt
                ? new Date(ret.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : null;

              return (
                <div
                  key={ret.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden hover:border-gray-300 transition-colors"
                >
                  {/* Card Top Banner */}
                  <div className="p-4 sm:p-5 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-bold text-gray-900">
                        Return #{ret.returnNumber || ret.id}
                      </span>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar size={13} />
                        <span>Requested on {formattedDate}</span>
                      </div>
                      {ret.orderNumber && (
                        <>
                          <span className="text-gray-300">•</span>
                          <Link
                            href={`/account/orders/${ret.orderId}`}
                            className="font-medium text-[#DC2B53] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Order #{ret.orderNumber}</span>
                            <ExternalLink size={12} />
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}
                      >
                        <StatusIcon size={13} />
                        <span>{statusMeta.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Return Details & Items Body */}
                  <div className="p-4 sm:p-6 space-y-4">
                    
                    {/* Return Items List */}
                    {ret.items && ret.items.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Requested Return Items ({ret.items.length})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {ret.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-start gap-3"
                            >
                              <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-gray-200 flex-shrink-0 relative">
                                <SmartImage
                                  src={item.productImage}
                                  alt={item.productName || 'Product'}
                                  fill
                                  fallbackType="product"
                                  fallbackLabel={item.productName || 'Product'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                                  {item.productName || 'Product Item'}
                                </h4>
                                {item.variantName && (
                                  <p className="text-[11px] text-gray-500 mt-0.5">{item.variantName}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-600">
                                  <span className="font-semibold">Qty: {item.quantity}</span>
                                  {item.reason && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-gray-500">Reason: {item.reason}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Return Notes or Reason Summary if single */}
                    {(ret.reason || ret.notes) && (
                      <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/70 text-xs space-y-1">
                        {ret.reason && (
                          <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                            <span className="text-gray-500">Reason:</span>
                            <span>{ret.reason}</span>
                          </div>
                        )}
                        {ret.notes && (
                          <div className="text-gray-600 leading-relaxed font-normal">
                            <span className="font-semibold text-gray-500">Customer Note:</span> {ret.notes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Resolution / Refund info if available */}
                    {(ret.resolution || ret.refundAmount !== undefined || ret.resolutionNotes) && (
                      <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs flex items-start gap-2.5">
                        <DollarSign size={16} className="text-emerald-700 mt-0.5 flex-shrink-0" />
                        <div className="space-y-0.5">
                          <div className="font-bold text-emerald-950">
                            Resolution: {ret.resolution || 'Refund Processed'}
                          </div>
                          {ret.refundAmount !== undefined && (
                            <div className="text-emerald-800 font-medium">
                              Approved Refund Amount:{' '}
                              <span className="font-bold">
                                {formatPrice(ret.refundAmount, currencyCode, currencySymbol)}
                              </span>
                            </div>
                          )}
                          {ret.resolutionNotes && (
                            <div className="text-emerald-700 text-[11px]">{ret.resolutionNotes}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Card Footer Info */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                      <div>
                        {updatedDate && <span>Last updated on {updatedDate}</span>}
                      </div>
                      <div>
                        <Link
                          href={`/account/orders/${ret.orderId}`}
                          className="font-semibold text-[#DC2B53] hover:underline inline-flex items-center gap-1"
                        >
                          <span>View Order Details</span>
                          <ExternalLink size={13} />
                        </Link>
                      </div>
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
    </AccountLayout>
  );
};
