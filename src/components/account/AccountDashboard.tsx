'use client';

import React from 'react';
import { AccountLayout } from './AccountLayout';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '../../services/customerService';
import { useStorefront } from '../../context/StorefrontContext';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice } from '../../utils/formatters';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Bell, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle,
  Package,
  User,
  Mail,
  Phone
} from 'lucide-react';

export const AccountDashboard: React.FC = () => {
  const { customer, user } = useAuth();
  const activeUser = customer || user;
  const { publicSettings } = useStorefront();
  const { settings } = useSettings();

  const currencyCode = publicSettings?.general?.currency || settings?.general?.currency || 'BDT';
  const currencySymbol = publicSettings?.general?.currencySymbol || settings?.general?.currencySymbol || '৳';

  // TanStack Query for single aggregated dashboard endpoint
  const { 
    data: dashboardData, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['customer', 'dashboard'],
    queryFn: async () => {
      const res = await customerService.getDashboard();
      if (res.status === 'error' || !res.data) {
        throw new Error(res.message || 'Failed to load customer dashboard data');
      }
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  const resolvedCustomer = dashboardData?.customer || {
    id: activeUser?.id || '',
    firstName: activeUser?.firstName || '',
    lastName: activeUser?.lastName || '',
    email: activeUser?.email || '',
    phone: activeUser?.phone || '',
    fullName: activeUser?.fullName || '',
  };

  const displayName = resolvedCustomer.firstName 
    ? resolvedCustomer.firstName 
    : (resolvedCustomer.fullName?.split(' ')[0] || 'Customer');

  const metrics = dashboardData?.metrics || {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    unreadNotifications: 0,
    eligibleReviews: 0,
  };

  const recentOrders = dashboardData?.recentOrders || [];

  return (
    <AccountLayout activeTab="account">
      <div className="space-y-6">
        
        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            {/* Banner Skeleton */}
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs h-40">
              <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-100 rounded-md w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
            </div>

            {/* Metrics Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs h-28">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-100 rounded-md w-3/4"></div>
                </div>
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 h-64"></div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 h-64"></div>
            </div>
          </div>
        ) : isError ? (
          /* Error State with Refresh Option */
          <div className="bg-white rounded-xl p-8 border border-red-200 shadow-xs text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Unable to Load Dashboard</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
              {error instanceof Error ? error.message : 'An unexpected error occurred while fetching your account metrics.'}
            </p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="btn-primary inline-flex items-center gap-2 text-xs cursor-pointer"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              <span>{isFetching ? 'Refreshing...' : 'Retry Connection'}</span>
            </button>
          </div>
        ) : (
          /* Loaded Dashboard Content */
          <>
            {/* Greeting & Identity Summary Banner */}
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                      Welcome back, {displayName}
                    </h1>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">
                      Here is an overview of your account activity, orders, and recent metrics.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/account/profile"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <User size={14} className="text-[#DC2B53]" />
                      <span>Edit Profile</span>
                    </Link>
                  </div>
                </div>

                {/* Identity Summary Badges */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <User size={15} className="text-gray-400" />
                    <span className="font-semibold text-gray-900">
                      {[resolvedCustomer.firstName, resolvedCustomer.lastName].filter(Boolean).join(' ') || resolvedCustomer.fullName || 'Customer'}
                    </span>
                  </div>

                  {resolvedCustomer.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={15} className="text-gray-400" />
                      <span className="text-gray-700">{resolvedCustomer.email}</span>
                    </div>
                  )}

                  {resolvedCustomer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={15} className="text-gray-400" />
                      <span className="text-gray-700">{resolvedCustomer.phone}</span>
                    </div>
                  )}

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-semibold ml-auto">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>Active Session</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Core Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Total Orders */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
                  <ShoppingBag size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</div>
                <div className="text-xs font-semibold text-gray-500 mt-0.5">Total Orders</div>
              </div>

              {/* Pending Orders */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-3">
                  <Clock size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{metrics.pendingOrders}</div>
                <div className="text-xs font-semibold text-gray-500 mt-0.5">Pending Orders</div>
              </div>

              {/* Completed Orders */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle2 size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{metrics.completedOrders}</div>
                <div className="text-xs font-semibold text-gray-500 mt-0.5">Completed Orders</div>
              </div>

              {/* Total Spent */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <div className="w-10 h-10 bg-[#FDF0F3] text-[#DC2B53] rounded-lg flex items-center justify-center mb-3">
                  <DollarSign size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(metrics.totalSpent || 0, currencyCode, currencySymbol)}
                </div>
                <div className="text-xs font-semibold text-gray-500 mt-0.5">Total Spent</div>
              </div>
            </div>

            {/* Lower Grid: Recent Orders + Additional Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Orders Section (2 Cols) */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
                    <p className="text-[11px] text-gray-500">Your latest purchases from Vyzobd</p>
                  </div>
                  <Link 
                    href="/account/orders" 
                    className="text-xs font-semibold text-[#DC2B53] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  /* Polished Empty State for Orders */
                  <div className="text-center py-10 px-4">
                    <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200">
                      <Package size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">No orders yet</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto mb-5 leading-relaxed">
                      You haven&apos;t placed any orders yet. Discover our latest items and trending deals.
                    </p>
                    <Link
                      href="/products"
                      className="btn-primary inline-flex items-center gap-2 text-xs"
                    >
                      <span>Explore Catalog</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  /* Orders List from aggregated dashboard */
                  <div className="space-y-3">
                    {recentOrders.slice(0, 5).map((order) => {
                      const orderCode = order.orderNumber || (order.id ? order.id.slice(0, 8) : 'ORD');
                      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Recent';
                      const amount = order.totalAmount || order.total || 0;
                      const orderStatus = order.orderStatus || order.status || 'Processing';

                      return (
                        <Link 
                          key={order.id || orderCode} 
                          href={`/account/orders/${order.id || orderCode}`}
                          className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-lg border border-gray-100 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-[#FDF0F3] group-hover:text-[#DC2B53] border border-gray-200 flex-shrink-0 transition-colors">
                              <ShoppingBag size={16} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900 group-hover:text-[#DC2B53] transition-colors">#{orderCode}</div>
                              <div className="text-[11px] text-gray-500 font-medium mt-0.5">{orderDate}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-gray-900">
                              {formatPrice(amount, currencyCode, currencySymbol)}
                            </div>
                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">
                              {orderStatus}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Side Indicators Section (1 Col) */}
              <div className="space-y-4">
                
                {/* Unread Notifications Indicator */}
                <Link
                  href="/account/notifications"
                  className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs block hover:border-gray-300 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Bell size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#DC2B53] transition-colors">
                          Notifications
                        </h4>
                        <div className="text-[11px] text-gray-500">Unread updates</div>
                      </div>
                    </div>
                    <span className="text-sm font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                      {metrics.unreadNotifications}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {metrics.unreadNotifications > 0 
                      ? `You have ${metrics.unreadNotifications} unread message(s) regarding your orders and promos.` 
                      : 'All your notifications are up to date.'}
                  </p>
                </Link>

                {/* Eligible Reviews Indicator */}
                <Link
                  href="/account/reviews?tab=eligible"
                  className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs block hover:border-gray-300 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Star size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#DC2B53] transition-colors">
                          Product Reviews
                        </h4>
                        <div className="text-[11px] text-gray-500">Eligible items</div>
                      </div>
                    </div>
                    <span className="text-sm font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                      {metrics.eligibleReviews}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {metrics.eligibleReviews > 0
                      ? `You have ${metrics.eligibleReviews} delivered item(s) awaiting your product review.`
                      : 'You have reviewed all your eligible delivered products.'}
                  </p>
                </Link>

                {/* Quick Catalog Banner */}
                <div className="bg-[#111827] text-white rounded-xl p-5 shadow-xs relative overflow-hidden">
                  <h4 className="text-sm font-bold mb-1">Discover New Arrivals</h4>
                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                    Explore curated collections, high-speed delivery, and best prices.
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DC2B53] hover:underline"
                  >
                    <span>Browse Store</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </AccountLayout>
  );
};
