'use client';

import React from 'react';
import { AccountLayout } from './AccountLayout';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Heart, Package, Clock, Star, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useStorefront } from '../../context/StorefrontContext';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice } from '../../utils/formatters';
import Link from 'next/link';

export const AccountDashboard: React.FC = () => {
  const { user } = useAuth();
  const { userOrders, wishlist, publicSettings } = useStorefront();

  const activeShipmentsCount = userOrders.filter(o => 
    ['processing', 'shipped', 'pending', 'Placed'].includes(o.orderStatus || o.status || '')
  ).length;

  const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

  let currencyCode = 'BDT';
  let currencySymbol = '৳';
  try {
    const { settings } = useSettings();
    currencyCode = publicSettings?.general?.currency || settings?.general?.currency || 'BDT';
    currencySymbol = publicSettings?.general?.currencySymbol || settings?.general?.currencySymbol || (currencyCode === 'BDT' ? '৳' : '৳');
  } catch {
    // Ignore
  }

  const stats = [
    { label: 'Total Orders', value: userOrders.length.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Wishlist Items', value: wishlist.length.toString(), icon: Heart, color: 'text-primary', bg: 'bg-primary-light' },
    { label: 'Total Spend', value: formatPrice(totalSpent, currencyCode, currencySymbol), icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Shipments', value: activeShipmentsCount.toString(), icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <AccountLayout activeTab="account">
      <div className="space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Hello, {user?.fullName?.split(' ')[0] || 'Customer'}!</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Welcome back to your dashboard. You have <span className="text-primary font-semibold">{activeShipmentsCount} active shipments</span> in your account. 
              Ready to explore more premium tech?
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link 
                href="/products"
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </Link>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-800 text-xs font-semibold">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Verified Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs font-medium text-gray-500 mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Orders Mini */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
              <Link href="/account/orders" className="text-xs font-semibold text-primary hover:underline">View All</Link>
            </div>
            {userOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400 font-medium text-sm">
                No orders placed yet.
              </div>
            ) : (
              <div className="space-y-3">
                {userOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-gray-400 border border-gray-200 flex-shrink-0">
                        <ShoppingBag size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">#{order.orderNumber || order.id.slice(0, 8)}</div>
                        <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-900">{formatPrice(order.totalAmount || order.total || 0, currencyCode, currencySymbol)}</div>
                      <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                        {order.orderStatus || order.status || 'Placed'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Mini */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Account Status</h3>
              <Link href="/account/notifications" className="text-xs font-semibold text-primary hover:underline">Settings</Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="mt-0.5">
                  <ShieldCheck size={18} className="text-emerald-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Account Authenticated</div>
                  <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                    Logged in as {user?.email}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="mt-0.5">
                  <Star size={18} className="text-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Storefront Active Session</div>
                  <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                    <Clock size={12} />
                    <span>Session verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AccountLayout>
  );
};
