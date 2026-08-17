'use client';

import React from 'react';
import { AccountLayout } from './AccountLayout';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase } from 'lucide-react';

export const AddressesPage: React.FC = () => {
  const addresses = [
    { id: 1, type: 'Home', isDefault: true, name: 'John Doe', address: '742 Evergreen Terrace, San Francisco, CA 94107', phone: '+1 234 567 890' },
    { id: 2, type: 'Office', isDefault: false, name: 'John Doe', address: 'One Apple Park Way, Cupertino, CA 95014', phone: '+1 098 765 432' },
  ];

  return (
    <AccountLayout activeTab="addresses">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Saved Addresses</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Manage your delivery and billing locations.</p>
          </div>
          <button className="btn-primary inline-flex items-center gap-2 text-xs">
            <Plus size={16} />
            <span>Add New Address</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white rounded-xl p-6 border shadow-xs transition-colors ${addr.isDefault ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${addr.isDefault ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {addr.type === 'Home' ? <Home size={16} /> : <Briefcase size={16} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{addr.type}</h3>
                    {addr.isDefault && <span className="text-[11px] font-semibold text-primary">Default Address</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"><Edit2 size={14}/></button>
                  <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-md transition-colors cursor-pointer"><Trash2 size={14}/></button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-900">{addr.name}</div>
                <p className="text-xs text-gray-600 leading-relaxed">{addr.address}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium pt-1">
                   <MapPin size={12} className="text-primary" />
                   <span>{addr.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AccountLayout>
  );
};
