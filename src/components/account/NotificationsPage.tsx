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
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notification Preferences</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Control how you want to be notified about your account activity.</p>
        </div>

        <div className="space-y-6">
          {preferences.map((pref) => (
            <div key={pref.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="max-w-md">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 flex items-center justify-center">
                    <pref.icon size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{pref.label}</h3>
                </div>
                <p className="text-xs text-gray-500 font-normal leading-relaxed">{pref.desc}</p>
              </div>

              <div className="flex flex-wrap gap-5">
                {[
                  { key: 'email', icon: Mail, label: 'Email' },
                  { key: 'push', icon: Bell, label: 'Push' },
                  { key: 'sms', icon: Smartphone, label: 'SMS' },
                ].map((channel) => (
                  <label key={channel.key} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        defaultChecked={(pref as any)[channel.key]} 
                        className="peer hidden" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-checked:bg-primary rounded-full transition-colors duration-200"></div>
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-xs peer-checked:translate-x-5 transition-transform duration-200"></div>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 group-hover:text-gray-900 transition-colors">
                      {channel.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button className="btn-primary text-xs cursor-pointer">
            Save Preferences
          </button>
        </div>
      </div>
    </AccountLayout>
  );
};
