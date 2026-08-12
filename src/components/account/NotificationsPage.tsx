'use client';

import React from 'react';
import { AccountLayout } from './AccountLayout';
import { Bell, Mail, Phone, Smartphone, MessageSquare } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const preferences = [
    { id: 'order_updates', label: 'Order Updates', desc: 'Get notified about your order status and shipping details.', icon: Bell, email: true, push: true, sms: true },
    { id: 'promotions', label: 'Promotional Offers', desc: 'Receive exclusive deals, sales and new product launches.', icon: MessageSquare, email: true, push: false, sms: false },
    { id: 'security', label: 'Security Alerts', desc: 'Important notifications about your account security and login activity.', icon: Smartphone, email: true, push: true, sms: false },
  ];

  return (
    <AccountLayout activeTab="notifications">
      <div className="bg-white rounded-[40px] p-8 sm:p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Preferences</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Control how you want to be notified about your account activity.</p>
        </div>

        <div className="space-y-10">
          {preferences.map((pref) => (
            <div key={pref.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-10 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="max-w-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                    <pref.icon size={18} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{pref.label}</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{pref.desc}</p>
              </div>

              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'email', icon: Mail, label: 'Email' },
                  { key: 'push', icon: Bell, label: 'Push' },
                  { key: 'sms', icon: Smartphone, label: 'SMS' },
                ].map((channel) => (
                  <label key={channel.key} className="flex flex-col items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        defaultChecked={(pref as any)[channel.key]} 
                        className="peer hidden" 
                      />
                      <div className="w-12 h-6 bg-slate-200 rounded-full peer-checked:bg-primary transition-colors duration-300"></div>
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-6 transition-transform duration-300"></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                      {channel.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
          <button className="px-8 py-3.5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-lg">
            Save Preferences
          </button>
        </div>
      </div>
    </AccountLayout>
  );
};
