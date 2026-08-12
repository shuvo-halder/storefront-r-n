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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Addresses</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Manage your delivery and billing locations.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-lg">
            <Plus size={16} />
            <span>Add New Address</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white rounded-[40px] p-8 border shadow-sm transition-all ${addr.isDefault ? 'border-primary ring-1 ring-primary' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${addr.isDefault ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {addr.type === 'Home' ? <Home size={18} /> : <Briefcase size={18} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{addr.type}</h3>
                    {addr.isDefault && <span className="text-[9px] font-black text-primary uppercase tracking-widest">Default Address</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Edit2 size={14}/></button>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm font-bold text-slate-900">{addr.name}</div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{addr.address}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                   <MapPin size={12} className="text-primary" />
                   {addr.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AccountLayout>
  );
};
