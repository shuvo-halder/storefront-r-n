'use client';

import React from 'react';
import { AccountLayout } from './AccountLayout';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Heart, Package, Clock, Star, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useStorefront } from '../../context/StorefrontContext';
import Link from 'next/link';

export const AccountDashboard: React.FC = () => {
  const { user } = useAuth();
  const { userOrders, wishlist, navigateTo } = useStorefront();

  const activeShipmentsCount = userOrders.filter(o => 
    ['processing', 'shipped', 'pending', 'Placed'].includes(o.orderStatus || o.status || '')
  ).length;

  const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

  const stats = [
    { label: 'Total Orders', value: userOrders.length.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Wishlist Items', value: wishlist.length.toString(), icon: Heart, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Total Spend', value: `$${totalSpent.toFixed(2)}`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Shipments', value: activeShipmentsCount.toString(), icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <AccountLayout activeTab="account">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Welcome Banner */}
        <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="relative z-10 max-w-lg">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Hello, {user?.fullName?.split(' ')[0] || 'Customer'}!</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Welcome back to your dashboard. You have <span className="text-primary font-bold">{activeShipmentsCount} active shipments</span> in your account. 
              Ready to explore more premium tech?
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link 
                href="/products"
                className="px-8 py-3.5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </Link>
              <div className="flex items-center gap-3 px-6 py-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <ShieldCheck size={20} className="text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Verified Account</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent hidden sm:block"></div>
          <Zap className="absolute -bottom-6 -right-6 text-primary/10 w-48 h-48 rotate-12" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon size={24} />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Orders Mini */}
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900">Recent Orders</h3>
              <Link href="/account/orders" className="text-xs font-bold text-primary hover:underline">View All</Link>
            </div>
            {userOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium text-xs">
                No orders placed yet.
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">#{order.orderNumber || order.id.slice(0, 8)}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">${(order.totalAmount || order.total || 0).toFixed(2)}</div>
                      <div className="text-[9px] font-black uppercase tracking-tighter text-emerald-500">
                        {order.orderStatus || order.status || 'Placed'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Mini */}
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900">Account Status</h3>
              <Link href="/account/notifications" className="text-xs font-bold text-primary hover:underline">Settings</Link>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1">
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Account Authenticated</div>
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                    Logged in as {user?.email}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1">
                  <Star size={16} className="text-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Storefront Active Session</div>
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                    <Clock size={10} />
                    Session verified
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
