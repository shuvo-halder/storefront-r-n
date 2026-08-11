import React, { useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types/storefront';
import { AccountLayout } from './AccountLayout';
import { Package, Truck, CheckCircle2, ChevronRight, X, Clock, RefreshCw } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { userOrders, navigateTo } = useStorefront();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <AccountLayout activeTab="orders">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Order History ({userOrders.length})
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Track active shipments, view past receipts, and manage return requests.
            </p>
          </div>
          <div className="hidden sm:block">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">
              <RefreshCw size={14} />
              <span>Refresh History</span>
            </button>
          </div>
        </div>

        {userOrders.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[40px] p-20 shadow-sm text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Package size={40} className="text-slate-300" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">No orders placed yet</h3>
              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-1">
                Your recent electronics purchases will show up here with live carrier tracking.
              </p>
            </div>
            <button
              onClick={() => navigateTo('shop')}
              className="px-10 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {userOrders.map((ord) => (
              <div 
                key={ord.id}
                onClick={() => navigateTo('order-details', { id: ord.id })}
                className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm space-y-6 hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 uppercase tracking-widest">Order #{ord.id}</div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase mt-1">Placed on {new Date(ord.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest ${
                      ord.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-primary/5 text-primary border border-primary/10'
                    }`}>
                      {ord.status}
                    </span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    {ord.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <img src={item.productImage} alt="" className="w-16 h-16 object-cover rounded-2xl border border-slate-100 shadow-sm" />
                        <div>
                          <div className="text-sm font-black text-slate-900 line-clamp-1">{item.productName}</div>
                          <div className="text-[11px] text-slate-400 font-bold uppercase mt-1">Qty: {item.quantity} • ${item.unitPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-4 lg:text-right space-y-3 bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tracking Number</div>
                      <div className="text-xs font-mono font-black text-slate-900">{ord.trackingNumber || 'UNAVAILABLE'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</div>
                      <div className="text-lg font-black text-primary font-mono">${ord.totalAmount.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(ord);
                      }}
                      className="w-full mt-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                      <span>Track Shipment</span>
                      <Truck size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="bg-white rounded-[40px] p-10 max-w-lg w-full relative z-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Shipment Tracking</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Order #{selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-3 bg-slate-50 text-slate-400 hover:text-primary rounded-2xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Carrier Tracking ID</div>
                  <div className="text-xs font-mono font-black text-primary">{selectedOrder.trackingNumber}</div>
                </div>
                <div className="p-2 bg-white rounded-xl shadow-sm text-primary">
                  <Truck size={20} />
                </div>
              </div>

              <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {selectedOrder.trackingSteps?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-6 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                      step.completed ? 'bg-emerald-500 text-white' : step.current ? 'bg-primary text-white animate-pulse' : 'bg-white border-2 border-slate-100 text-slate-200'
                    }`}>
                      {step.completed ? <CheckCircle2 size={14} /> : <Clock size={12} />}
                    </div>
                    <div>
                      <div className={`text-xs font-black uppercase tracking-tight ${step.completed || step.current ? 'text-slate-900' : 'text-slate-300'}`}>
                        {step.label}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium mt-1">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-colors shadow-xl"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
};

// Add missing ShoppingBag import
import { ShoppingBag } from 'lucide-react';
