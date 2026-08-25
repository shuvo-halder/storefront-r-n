'use client';

import React, { useState } from 'react';
import { AccountLayout } from './AccountLayout';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '../../services/customerService';
import { useStorefront } from '../../context/StorefrontContext';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice } from '../../utils/formatters';
import { getRefundStatusMeta, getPaymentGatewayMeta } from '../../utils/trackingStatus';
import { CustomerRefund } from '../../types/customer';
import Link from 'next/link';
import { 
  Receipt, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Calendar,
  RotateCcw,
  CreditCard,
  Building
} from 'lucide-react';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Refunds' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'FAILED', label: 'Failed / Rejected' },
];

export const RefundsPage: React.FC = () => {
  const { publicSettings } = useStorefront();
  const { settings } = useSettings();
  const currencyCode = publicSettings?.general?.currency || settings?.general?.currency || 'BDT';
  const currencySymbol = publicSettings?.general?.currencySymbol || settings?.general?.currencySymbol || '৳';

  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Query Refunds
  const { 
    data: refundsData, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['customer', 'refunds', { page, status: statusFilter }],
    queryFn: async () => {
      const res = await customerService.getRefunds({
        page,
        limit: 10,
        status: statusFilter,
      });
      if (res.status === 'error' || !res.data) {
        throw new Error(res.message || 'Failed to fetch refunds history.');
      }
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  const refunds = refundsData?.refunds || [];
  const pagination = refundsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const totalRefundedSum = refundsData?.totalRefunded;

  return (
    <AccountLayout activeTab="refunds">
      <div className="space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#DC2B53] uppercase tracking-wider mb-1">
              <Receipt size={14} />
              <span>Financial Adjustments</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Refunds History</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Review returned payments, approved adjustments, and processing transaction statuses.
            </p>
          </div>

          {totalRefundedSum !== undefined && totalRefundedSum > 0 && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold">
                <DollarSign size={20} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Refunded</div>
                <div className="text-lg font-bold text-emerald-950">
                  {formatPrice(totalRefundedSum, currencyCode, currencySymbol)}
                </div>
              </div>
            </div>
          )}
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
                <div className="h-14 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="bg-white rounded-xl p-8 border border-red-200 shadow-xs text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Failed to Load Refunds</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
              {error instanceof Error ? error.message : 'Unable to connect to the refunds service. Please try again.'}
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
        ) : refunds.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-xs text-center">
            <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <Receipt size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No refunds yet.</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
              {statusFilter !== 'ALL'
                ? `You don't have any refund transactions matching the "${statusFilter.toLowerCase()}" filter.`
                : 'Approved return refunds and payment adjustments will appear here automatically.'}
            </p>
            <Link
              href="/account/orders"
              className="btn-primary inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs"
            >
              <Receipt size={15} />
              <span>Browse Your Orders</span>
            </Link>
          </div>
        ) : (
          /* Refunds List */
          <div className="space-y-4">
            {refunds.map((ref: CustomerRefund) => {
              const statusMeta = getRefundStatusMeta(ref.status);
              const StatusIcon = statusMeta.icon;
              const gatewayMeta = getPaymentGatewayMeta(ref.method || ref.gateway);

              const formattedDate = ref.requestedAt || ref.createdAt
                ? new Date(ref.requestedAt || ref.createdAt!).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              const processedDate = ref.processedAt
                ? new Date(ref.processedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : null;

              return (
                <div
                  key={ref.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden hover:border-gray-300 transition-colors"
                >
                  {/* Card Top Banner */}
                  <div className="p-4 sm:p-5 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-bold text-gray-900">
                        Refund #{ref.refundNumber || ref.id}
                      </span>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar size={13} />
                        <span>Issued on {formattedDate}</span>
                      </div>
                      {ref.orderNumber && (
                        <>
                          <span className="text-gray-300">•</span>
                          <Link
                            href={`/account/orders/${ref.orderId}`}
                            className="font-medium text-[#DC2B53] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Order #{ref.orderNumber}</span>
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

                  {/* Body Info */}
                  <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-center">
                    
                    {/* Amount Block */}
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        Refund Amount
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatPrice(ref.amount, ref.currency || currencyCode, currencySymbol)}
                      </div>
                      {ref.reason && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="font-medium text-gray-700">Reason:</span> {ref.reason}
                        </div>
                      )}
                    </div>

                    {/* Method & Transaction */}
                    <div className="space-y-1 text-xs">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        Refund Method
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${gatewayMeta.badgeClass}`}>
                          <gatewayMeta.icon size={13} />
                          <span>{gatewayMeta.name}</span>
                        </span>
                      </div>
                      {ref.transactionId && (
                        <div className="text-[11px] text-gray-500 pt-0.5 font-mono">
                          Trx ID: {ref.transactionId}
                        </div>
                      )}
                    </div>

                    {/* Timeline & Return Link */}
                    <div className="space-y-1 text-xs sm:text-right">
                      {processedDate ? (
                        <div className="text-emerald-700 font-medium flex sm:justify-end items-center gap-1">
                          <CheckCircle2 size={13} />
                          <span>Processed on {processedDate}</span>
                        </div>
                      ) : (
                        <div className="text-amber-700 font-medium flex sm:justify-end items-center gap-1">
                          <Clock size={13} />
                          <span>Processing through gateway</span>
                        </div>
                      )}

                      {ref.returnId && (
                        <div className="pt-1">
                          <Link
                            href="/account/returns"
                            className="font-medium text-gray-500 hover:text-[#DC2B53] inline-flex items-center gap-1"
                          >
                            <RotateCcw size={12} />
                            <span>Linked to Return #{ref.returnNumber || ref.returnId}</span>
                          </Link>
                        </div>
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
    </AccountLayout>
  );
};
