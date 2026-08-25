'use client';

import React from 'react';
import { SmartImage } from '../common/SmartImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from '../common/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '../../services/customerService';
import { 
  User, 
  LayoutDashboard,
  ShoppingBag, 
  Heart, 
  MapPin, 
  Bell, 
  Activity, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Receipt,
  Sparkles,
  CreditCard,
  Truck,
  Star
} from 'lucide-react';

interface AccountLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({ children, activeTab }) => {
  const router = useRouter();
  const { customer, user, logout } = useAuth();
  const activeUser = customer || user;

  const menuItems = [
    { id: 'account', href: '/account', label: 'Dashboard', icon: LayoutDashboard, isPrimary: true },
    { id: 'profile', href: '/account/profile', label: 'My Profile', icon: User, isPrimary: true },
    { id: 'orders', href: '/account/orders', label: 'Order History', icon: ShoppingBag, isPrimary: false },
    { id: 'shipments', href: '/account/shipments', label: 'Shipments & Tracking', icon: Truck, isPrimary: false },
    { id: 'payments', href: '/account/payments', label: 'Payment History', icon: CreditCard, isPrimary: false },
    { id: 'reviews', href: '/account/reviews', label: 'Product Reviews', icon: Star, isPrimary: false },
    { id: 'returns', href: '/account/returns', label: 'Returns', icon: RotateCcw, isPrimary: false },
    { id: 'refunds', href: '/account/refunds', label: 'Refunds', icon: Receipt, isPrimary: false },
    { id: 'wishlist', href: '/account/wishlist', label: 'Wishlist', icon: Heart, isPrimary: false },
    { id: 'addresses', href: '/account/addresses', label: 'Addresses', icon: MapPin, isPrimary: false },
    { id: 'notifications', href: '/account/notifications', label: 'Notifications', icon: Bell, isPrimary: false },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const displayName = activeUser?.fullName || 
    (activeUser?.firstName ? `${activeUser.firstName} ${activeUser.lastName || ''}`.trim() : 'Valued Customer');
  const avatarUrl = activeUser?.avatarUrl || activeUser?.avatar;

  // TanStack Query for authoritative customer unread notifications count
  const { data: customerDashboardData } = useQuery({
    queryKey: ['customer', 'dashboard'],
    queryFn: async () => {
      const res = await customerService.getDashboard();
      if (res.status === 'error' || !res.data) return null;
      return res.data;
    },
    enabled: Boolean(activeUser),
    staleTime: 60 * 1000,
  });

  const unreadNotificationsCount = customerDashboardData?.metrics?.unreadNotifications || 0;

  return (
    <ProtectedRoute>
      <div className="bg-[#F9FAFB] min-h-screen pt-20 pb-16">
        <div className="container-vyzobd px-4 sm:px-6 lg:px-8">
          
          {/* Mobile Navigation Header / Tab Pills */}
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                  {avatarUrl ? (
                    <SmartImage 
                      src={avatarUrl} 
                      alt={displayName} 
                      fill
                      fallbackType="avatar"
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">{displayName}</div>
                  <div className="text-xs text-gray-500 truncate">{activeUser?.email || activeUser?.phone || 'Account Member'}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-[#DC2B53] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Horizontal Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const showBadge = item.id === 'notifications' && unreadNotificationsCount > 0;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                      isActive
                        ? 'bg-[#111827] text-white border-[#111827]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-[#DC2B53]' : 'text-gray-400'} />
                    <span>{item.label}</span>
                    {showBadge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#DC2B53] text-white">
                        {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden sticky top-28">
                
                {/* User Identity Header */}
                <div className="p-6 bg-[#111827] text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 relative overflow-hidden flex-shrink-0">
                        {avatarUrl ? (
                          <SmartImage 
                            src={avatarUrl} 
                            alt={displayName} 
                            fill
                            fallbackType="avatar"
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-xl font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-white truncate">{displayName}</h3>
                        <div className="flex items-center gap-1.5 text-xs mt-0.5">
                          <ShieldCheck size={14} className="text-[#DC2B53]" />
                          <span className="text-[11px] font-medium text-gray-300">
                            {activeUser?.phoneVerified || activeUser?.emailVerified ? 'Verified Account' : 'Customer Account'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 font-medium truncate">{activeUser?.email || activeUser?.phone || 'customer@vyzobd.com'}</div>
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="p-3">
                  <div className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const showBadge = item.id === 'notifications' && unreadNotificationsCount > 0;

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={`
                            w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors group
                            ${isActive 
                              ? 'bg-[#FDF0F3] text-[#DC2B53]' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={17} className={isActive ? 'text-[#DC2B53]' : 'text-gray-400 group-hover:text-gray-600'} />
                            <span>{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {showBadge && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#DC2B53] text-white">
                                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                              </span>
                            )}
                            <ChevronRight 
                              size={14} 
                              className={`transition-transform duration-200 ${
                                isActive 
                                  ? 'text-[#DC2B53] translate-x-0.5' 
                                  : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-gray-400'
                              }`} 
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 text-gray-600 hover:text-[#DC2B53] hover:bg-[#FDF0F3] rounded-lg transition-colors font-semibold text-xs cursor-pointer"
                    >
                      <LogOut size={17} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </nav>

                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#DC2B53]" />
                    <span className="text-[11px] text-gray-600">Vyzobd Customer Portal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
              {children}
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};
