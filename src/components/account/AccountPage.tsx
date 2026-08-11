import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { User, Mail, MapPin, Phone, LogOut, Package } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, logoutUser, setIsAuthModalOpen, navigateTo } = useStorefront();

  if (!user) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Sign in to manage your account settings</h2>
        <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Profile card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {user.fullName[0]}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{user.fullName}</h1>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('orders')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-800 rounded-xl transition-colors flex items-center gap-2"
            >
              <Package size={16} />
              <span>Orders</span>
            </button>
            <button
              onClick={logoutUser}
              className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Saved Address */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MapPin size={16} className="text-rose-600" />
            <span>Default Shipping Address</span>
          </h3>

          {user.defaultAddress ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">{user.defaultAddress.fullName}</div>
              <div>{user.defaultAddress.addressLine1}</div>
              <div>{user.defaultAddress.city}, {user.defaultAddress.state} {user.defaultAddress.postalCode}</div>
              <div>{user.defaultAddress.country}</div>
              <div className="text-slate-400 pt-1">Phone: {user.defaultAddress.phone}</div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No saved default address yet.</p>
          )}
        </div>

      </div>
    </div>
  );
};
