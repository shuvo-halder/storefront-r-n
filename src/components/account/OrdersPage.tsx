import React, { useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { Order } from '../../types/storefront';
import { Package, Truck, CheckCircle2, ChevronRight, X, Clock, RefreshCw } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { userOrders, user, setIsAuthModalOpen, navigateTo } = useStorefront();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!user) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Please sign in to view your order history</h2>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Order History ({userOrders.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track active shipments, view past receipts, and manage return requests.
          </p>
        </div>

        {userOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <Package size={36} className="text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No orders placed yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your recent electronics purchases will show up here with live carrier tracking.
            </p>
            <button
              onClick={() => navigateTo('shop')}
              className="px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((ord) => (
              <div 
                key={ord.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-rose-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900">Order #{ord.id}</span>
                    <span className="text-slate-400 ml-2">• Placed {new Date(ord.createdAt).toLocaleDateString()}</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase ${
                    ord.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {ord.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    {ord.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={item.productImage} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{item.productName}</div>
                          <div className="text-[11px] text-slate-400">Qty: {item.quantity} • ${item.unitPrice}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sm:text-right space-y-1 text-slate-600">
                    <div>Carrier Tracking: <span className="font-mono font-bold text-slate-900">{ord.trackingNumber || 'N/A'}</span></div>
                    <div>Total Paid: <span className="font-extrabold text-rose-600">${ord.totalAmount.toFixed(2)}</span></div>
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="mt-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Track Shipment</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Tracking Drawer/Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60" onClick={() => setSelectedOrder(null)} />
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full relative z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Tracking Order #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono">
                Tracking Number: <span className="font-bold text-rose-600">{selectedOrder.trackingNumber}</span>
              </div>

              <div className="space-y-2">
                {selectedOrder.trackingSteps?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${step.completed ? 'bg-emerald-500' : step.current ? 'bg-rose-600 animate-pulse' : 'bg-slate-200'}`} />
                    <div>
                      <div className="font-bold text-slate-900">{step.label}</div>
                      <div className="text-[11px] text-slate-500">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
