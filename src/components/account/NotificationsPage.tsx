'use client';

import React, { useState } from 'react';
import { AccountLayout } from './AccountLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../../services/customerService';
import { CustomerNotification, CustomerNotificationQueryParams } from '../../types/customer';
import { NotificationCard } from './NotificationCard';
import { 
  Bell, 
  CheckCheck, 
  RefreshCw, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Inbox,
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState<number>(1);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const queryParams: CustomerNotificationQueryParams = {
    page,
    limit: 10,
    ...(activeFilter === 'unread' ? { unreadOnly: true } : {}),
  };

  // 1. TanStack Query for notifications
  const {
    data: notificationsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['customer', 'notifications', queryParams],
    queryFn: async () => {
      const res = await customerService.getNotifications(queryParams);
      if (res.status === 'error' || !res.data) {
        throw new Error(res.message || 'Failed to load notifications.');
      }
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount ?? 0;
  const pagination = notificationsData?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || notifications.length;

  // 2. Mutation: Mark Single Notification as Read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      setMarkingId(id);
      const res = await customerService.markNotificationAsRead(id);
      if (res.status === 'error') {
        throw new Error(res.message || 'Failed to mark notification as read.');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });
    },
    onSettled: () => {
      setMarkingId(null);
    },
  });

  // 3. Mutation: Mark All Notifications as Read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await customerService.markAllNotificationsAsRead();
      if (res.status === 'error') {
        throw new Error(res.message || 'Failed to mark all notifications as read.');
      }
      return res.data;
    },
    onSuccess: () => {
      setActionSuccessMsg('All notifications marked as read');
      setTimeout(() => setActionSuccessMsg(null), 3500);
      queryClient.invalidateQueries({ queryKey: ['customer', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });
    },
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id);
    } catch (err) {
      // Non-blocking error handling
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount <= 0 || markAllReadMutation.isPending) return;
    try {
      await markAllReadMutation.mutateAsync();
    } catch (err) {
      // Non-blocking error handling
    }
  };

  const handleFilterChange = (filter: 'all' | 'unread') => {
    setActiveFilter(filter);
    setPage(1);
  };

  return (
    <AccountLayout activeTab="notifications">
      <div className="space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-gray-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
                  <Bell size={24} className="text-[#DC2B53]" />
                  <span>Notifications</span>
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DC2B53] text-white">
                    {unreadCount > 99 ? '99+' : unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">
                Stay updated with your orders, payments, shipments and account activity.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 cursor-pointer disabled:opacity-50"
                title="Refresh notifications"
                aria-label="Refresh notifications"
              >
                <RefreshCw size={15} className={isFetching ? 'animate-spin text-[#DC2B53]' : ''} />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllReadMutation.isPending}
                  className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#DC2B53] text-xs font-bold rounded-lg border border-gray-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  aria-label="Mark all notifications as read"
                >
                  {markAllReadMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin text-[#DC2B53]" />
                  ) : (
                    <CheckCheck size={15} className="text-gray-500" />
                  )}
                  <span>Mark all as read</span>
                </button>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {actionSuccessMsg && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* Filter Pills Bar */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                activeFilter === 'all'
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>All Notifications</span>
              {notificationsData?.pagination?.total !== undefined && activeFilter === 'all' && (
                <span className="ml-1.5 opacity-80">({notificationsData.pagination.total})</span>
              )}
            </button>

            <button
              onClick={() => handleFilterChange('unread')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                activeFilter === 'unread'
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeFilter === 'unread' 
                    ? 'bg-[#DC2B53] text-white' 
                    : 'bg-rose-100 text-[#DC2B53]'
                }`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Section: Loading Skeletons, Error, Empty, or List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs animate-pulse flex items-start gap-4"
              >
                <div className="w-11 h-11 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-100 rounded w-28" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/5" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                  <div className="h-3 bg-gray-100 rounded w-1/3 pt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-white rounded-xl p-8 border border-red-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Unable to load notifications</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                {(error as Error)?.message || 'We could not fetch your notifications right now. Please try again.'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[#DC2B53] hover:bg-[#C52247] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Inbox size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {activeFilter === 'unread' ? "No unread notifications" : "You're all caught up"}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
                {activeFilter === 'unread' 
                  ? "You've read all your notifications." 
                  : "You don't have any notifications yet. We'll alert you here when your orders update."}
              </p>
            </div>
            {activeFilter === 'unread' && (
              <button
                onClick={() => handleFilterChange('all')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <span>View All Notifications</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                isMarkingRead={markingId === notification.id}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-gray-500">
              Showing page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({totalItems} total)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const hasGap = prevP && p - prevP > 1;
                    return (
                      <React.Fragment key={p}>
                        {hasGap && <span className="px-1 text-gray-400">…</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                            page === p
                              ? 'bg-[#DC2B53] text-white'
                              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>
    </AccountLayout>
  );
};
