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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
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
    <div className="bg-slate-50 min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden sticky top-28">
              
              {/* User Brief */}
              <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 relative overflow-hidden">
                      {user?.avatar ? (
                        <SmartImage 
                          src={user.avatar} 
                          alt={user.fullName || "User avatar"} 
                          fill
                          fallbackType="avatar"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User size={32} className="text-white/40" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-lg leading-tight truncate max-w-[140px]">{user?.fullName || 'Account User'}</h3>
                      <div className="flex items-center gap-1.5 text-rose-400">
                        <ShieldCheck size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Verified Member</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{user?.email || 'user@example.com'}</div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`
                          w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group
                          ${isActive ? 'bg-primary/5 text-primary shadow-sm font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            p-2 rounded-xl transition-colors
                            ${isActive ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-600'}
                          `}>
                            <Icon size={18} />
                          </div>
                          <span className="text-sm font-bold">{item.label}</span>
                        </div>
                        <ChevronRight size={14} className={`transition-transform duration-300 ${isActive ? 'translate-x-1 opacity-100' : 'opacity-0 -translate-x-2'}`} />
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3.5 text-primary hover:bg-primary/5 rounded-2xl transition-all font-bold text-sm cursor-pointer"
                  >
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <LogOut size={18} />
                    </div>
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <Settings size={14} />
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

