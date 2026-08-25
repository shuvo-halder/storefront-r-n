'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AccountLayout } from './AccountLayout';
import { useStorefront } from '../../context/StorefrontContext';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice } from '../../utils/formatters';
import { customerService } from '../../services/customerService';
import { CustomerPayment } from '../../types/customer';
import { getPaymentGatewayMeta, getPaymentStatusMeta } from '../../utils/trackingStatus';
import {
  CreditCard,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Filter
} from 'lucide-react';

const STATUS_FILTERS = [
  { label: 'All Payments', value: 'ALL' },
  { label: 'Success', value: 'SUCCESS' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Refunded', value: 'REFUNDED' },
  { label: 'Failed', value: 'FAILED' },
] as const;

export const PaymentsPage: React.FC = () => {
  const { publicSettings } = useStorefront();
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // Copy to clipboard helper
  const handleCopyTransactionId = (trxId: string) => {
    if (!trxId) return;
    navigator.clipboard?.writeText(trxId);
    setCopiedId(trxId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // TanStack Query for GET /customer/payments
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['customer', 'payments', { page, limit, status: selectedStatus }],
    queryFn: async () => {
      const res = await customerService.getPayments({
        page,
        limit,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      });
      if (res.status === 'error' && (!res.data || res.data.payments.length === 0 && res.message)) {
        throw new Error(res.message || 'Failed to fetch customer payments.');
      }
      return res;
    },
    staleTime: 30 * 1000,
  });

  const payments: CustomerPayment[] = response?.data?.payments || [];
  const pagination = response?.data?.pagination || {
    page: 1,
    limit: 10,
    total: payments.length,
    totalPages: Math.max(1, Math.ceil(payments.length / limit)),
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AccountLayout activeTab="payments">
      <div className="space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              <span>Payment History</span>
              {!isLoading && (
                <span className="text-xs font-bold px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                  {pagination.total}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              View all transactions, gateway receipts, and payment statuses across your orders.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh payments"
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
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-10 bg-gray-100 rounded w-full" />
              <div className="h-10 bg-gray-100 rounded w-full" />
              <div className="h-10 bg-gray-100 rounded w-full" />
            </div>
          </div>
        ) : isError ? (
          /* State: Error */
          <div className="bg-white rounded-xl border border-rose-200 p-8 text-center shadow-xs">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Failed to Load Payments</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-5 leading-relaxed">
              {error instanceof Error ? error.message : 'An error occurred while fetching your payment history.'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[#DC2B53] hover:bg-[#b02242] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw size={13} />
              <span>Try Again</span>
            </button>
          </div>
        ) : payments.length === 0 ? (
          /* State: Empty Payments */
          <div className="bg-white rounded-xl border border-gray-200 p-10 sm:p-14 text-center shadow-xs">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <CreditCard size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No payment transactions found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
              {selectedStatus !== 'ALL'
                ? `There are no transactions with status "${selectedStatus}". Try selecting all payments.`
                : "You haven't made any payment transactions yet. When you place an order, transaction records will appear here."}
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
                  href="/products"
                  className="px-4 py-2 bg-[#DC2B53] text-white font-semibold text-xs rounded-lg hover:bg-[#b02242] transition-colors inline-flex items-center gap-1.5"
                >
                  <ShoppingBag size={14} />
                  <span>Start Shopping</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* State: Payments List & Table */
          <div className="space-y-4">
            
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Transaction ID</th>
                    <th className="py-3.5 px-4">Gateway</th>
                    <th className="py-3.5 px-4">Associated Order</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {payments.map((p) => {
                    const gatewayMeta = getPaymentGatewayMeta(p.gateway || p.paymentMethod);
                    const statusMeta = getPaymentStatusMeta(p.status);
                    const GatewayIcon = gatewayMeta.icon;
                    const trxId = p.transactionId || p.id;
                    const orderId = p.orderId;
                    const orderNumber = p.orderNumber || (orderId ? `#${orderId.slice(-8)}` : '—');

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        
                        {/* Transaction ID */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-gray-800 font-semibold">
                            <span>{trxId ? trxId : 'N/A'}</span>
                            {trxId && (
                              <button
                                onClick={() => handleCopyTransactionId(trxId)}
                                className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors cursor-pointer"
                                title="Copy Transaction ID"
                              >
                                {copiedId === trxId ? (
                                  <Check size={13} className="text-emerald-600" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Gateway */}
                        <td className="py-4 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border border-gray-200 bg-gray-50 text-gray-800">
                            <GatewayIcon size={13} className="text-[#DC2B53]" />
                            <span>{gatewayMeta.name}</span>
                          </div>
                        </td>

                        {/* Associated Order */}
                        <td className="py-4 px-4">
                          {orderId ? (
                            <Link
                              href={`/account/orders/${orderId}`}
                              className="inline-flex items-center gap-1 font-semibold text-[#DC2B53] hover:underline"
                            >
                              <span>{orderNumber}</span>
                              <ExternalLink size={11} />
                            </Link>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-gray-900 text-sm">
                            {formatPrice(p.amount || 0, p.currency || currencyCode, currencySymbol)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusMeta.badgeClass}`}>
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-gray-500">
                          {formatDate(p.createdAt)}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3">
              {payments.map((p) => {
                const gatewayMeta = getPaymentGatewayMeta(p.gateway || p.paymentMethod);
                const statusMeta = getPaymentStatusMeta(p.status);
                const GatewayIcon = gatewayMeta.icon;
                const trxId = p.transactionId || p.id;
                const orderId = p.orderId;
                const orderNumber = p.orderNumber || (orderId ? `#${orderId.slice(-8)}` : '—');

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border border-gray-200 bg-gray-50 text-gray-800">
                        <GatewayIcon size={13} className="text-[#DC2B53]" />
                        <span>{gatewayMeta.name}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <div className="text-[11px] text-gray-500 font-medium">Amount Paid</div>
                        <div className="text-base font-bold text-gray-900">
                          {formatPrice(p.amount || 0, p.currency || currencyCode, currencySymbol)}
                        </div>
                      </div>

                      {orderId && (
                        <Link
                          href={`/account/orders/${orderId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#DC2B53] hover:underline"
                        >
                          <span>{orderNumber}</span>
                          <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <div className="flex items-center gap-1 font-mono">
                        <span>Trx:</span>
                        <span className="font-semibold text-gray-700">{trxId ? `${trxId.slice(0, 14)}...` : 'N/A'}</span>
                        {trxId && (
                          <button
                            onClick={() => handleCopyTransactionId(trxId)}
                            className="p-1 text-gray-400 hover:text-gray-700"
                            title="Copy Transaction ID"
                          >
                            {copiedId === trxId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                      <div>{formatDate(p.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-500 font-medium">
                  Showing <span className="font-bold text-gray-800">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-bold text-gray-800">{Math.min(page * limit, pagination.total)}</span> of{' '}
                  <span className="font-bold text-gray-800">{pagination.total}</span> payments
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
    </AccountLayout>
  );
};
