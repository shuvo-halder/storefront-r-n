'use client';

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
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Security & Activity</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Review your recent account activity and login history.</p>
        </div>

        <div className="space-y-6">
          {activities.map((activity, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.bg} ${activity.color} border border-gray-100 shadow-xs z-10`}>
                  <activity.icon size={18} />
                </div>
                {idx !== activities.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-100 my-1"></div>
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{activity.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <Clock size={12} />
                    <span>{activity.time}</span>
                  </div>
                </div>
                {activity.ip && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="px-2.5 py-1 bg-gray-50 rounded-md text-[11px] font-medium text-gray-500 border border-gray-100">
                      IP: {activity.ip}
                    </div>
                    <div className="px-2.5 py-1 bg-gray-50 rounded-md text-[11px] font-medium text-gray-500 border border-gray-100">
                      {activity.location}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-100">
           <button className="text-xs font-semibold text-primary hover:underline cursor-pointer">
             Sign out of all other sessions
           </button>
        </div>
      </div>
    </AccountLayout>
  );
};
