import React from 'react';
import { AccountLayout } from './AccountLayout';
import { Clock, Shield, LogIn, ShoppingBag, Heart, User } from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const activities = [
    { type: 'login', title: 'Login detected from Chrome on MacOS', time: '1 hour ago', ip: '192.168.1.1', location: 'San Francisco, US', icon: LogIn, color: 'text-blue-500', bg: 'bg-blue-50' },
    { type: 'order', title: 'Order #ORD-88291 was delivered', time: '2 days ago', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { type: 'wishlist', title: 'Added "AuraBook Pro M3" to wishlist', time: '3 days ago', icon: Heart, color: 'text-primary', bg: 'bg-primary/5' },
    { type: 'profile', title: 'Profile photo was updated', time: '1 week ago', icon: User, color: 'text-amber-500', bg: 'bg-amber-50' },
    { type: 'security', title: 'Password was successfully changed', time: '2 weeks ago', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <AccountLayout activeTab="activity">
      <div className="bg-white rounded-[40px] p-8 sm:p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Security & Activity</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Review your recent account activity and login history.</p>
        </div>

        <div className="space-y-8">
          {activities.map((activity, idx) => (
            <div key={idx} className="flex gap-6">
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activity.bg} ${activity.color} shadow-sm z-10 relative`}>
                  <activity.icon size={20} />
                </div>
                {idx !== activities.length - 1 && (
                  <div className="absolute top-12 left-1/2 w-0.5 h-12 bg-slate-100 -translate-x-1/2"></div>
                )}
              </div>
              <div className="flex-1 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-900">{activity.title}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    {activity.time}
                  </div>
                </div>
                {activity.ip && (
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-tighter border border-slate-100">
                      IP: {activity.ip}
                    </div>
                    <div className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-tighter border border-slate-100">
                      {activity.location}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
           <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
             Sign out of all other sessions
           </button>
        </div>
      </div>
    </AccountLayout>
  );
};
