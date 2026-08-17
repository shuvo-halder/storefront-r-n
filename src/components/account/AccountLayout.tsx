'use client';

import React from 'react';
import { SmartImage } from '../common/SmartImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Bell, 
  Activity, 
  LogOut, 
  ChevronRight,
  Settings,
  ShieldCheck,
  RotateCcw,
  Receipt
} from 'lucide-react';

interface AccountLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({ children, activeTab }) => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const menuItems = [
    { id: 'account', href: '/account', label: 'Dashboard', icon: Activity },
    { id: 'profile', href: '/account/profile', label: 'My Profile', icon: User },
    { id: 'orders', href: '/account/orders', label: 'Order History', icon: ShoppingBag },
    { id: 'wishlist', href: '/account/wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', href: '/account/addresses', label: 'Addresses', icon: MapPin },
    { id: 'notifications', href: '/account/notifications', label: 'Notifications', icon: Bell },
    { id: 'activity', href: '/account/activity', label: 'Recent Activity', icon: Activity },
    { id: 'returns', href: '/account/returns', label: 'Returns Request', icon: RotateCcw },
    { id: 'refunds', href: '/account/refunds', label: 'Refund Claims', icon: Receipt },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen pt-24 pb-16">
      <div className="container-vyzobd">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden sticky top-28">
              
              {/* User Brief */}
              <div className="p-6 bg-[#111827] text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 relative overflow-hidden flex-shrink-0">
                      {user?.avatar ? (
                        <SmartImage 
                          src={user.avatar} 
                          alt={user.fullName || "User avatar"} 
                          fill
                          fallbackType="avatar"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User size={28} className="text-white/60" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-white truncate">{user?.fullName || 'Account User'}</h3>
                      <div className="flex items-center gap-1.5 text-primary-light text-xs mt-0.5">
                        <ShieldCheck size={13} className="text-primary" />
                        <span className="text-[11px] font-semibold text-gray-300">Verified Member</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 font-medium truncate">{user?.email || 'user@example.com'}</div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-3">
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`
                          w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-colors group
                          ${isActive 
                            ? 'bg-primary-light text-primary font-semibold' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'} />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight size={14} className={`transition-transform duration-200 ${isActive ? 'text-primary translate-x-0.5' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-gray-400'}`} />
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-gray-600 hover:text-primary hover:bg-primary-light rounded-lg transition-colors font-medium text-sm cursor-pointer"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>

              <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <Settings size={14} className="text-gray-400" />
                  <span>Account Settings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};

