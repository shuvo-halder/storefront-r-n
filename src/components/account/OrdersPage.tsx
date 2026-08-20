'use client';

import React, { useState } from 'react';
import { SmartImage } from '../common/SmartImage';
import { useStorefront } from '../../context/StorefrontContext';
import { Order } from '../../types/storefront';
import { AccountLayout } from './AccountLayout';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice } from '../../utils/formatters';
import { Package, Truck, CheckCircle2, ChevronRight, X, Clock, RefreshCw, ShoppingBag } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { userOrders, navigateTo, publicSettings } = useStorefront();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  let currencyCode = 'BDT';
  let currencySymbol = '৳';
  try {
    const { settings } = useSettings();
    currencyCode = publicSettings?.general?.currency || settings?.general?.currency || 'BDT';
    currencySymbol = publicSettings?.general?.currencySymbol || settings?.general?.currencySymbol || (currencyCode === 'BDT' ? '৳' : '৳');
  } catch {
    // Ignore
  }

  return (
    <AccountLayout activeTab="orders">
      <div className="space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Order History ({userOrders.length})
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Track active shipments, view past receipts, and manage return requests.
            </p>
          </div>
          <div className="hidden sm:block">
            <button className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-200 transition-colors">
              <RefreshCw size={14} />
              <span>Refresh History</span>
            </button>
          </div>
        </div>

        {userOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-16 shadow-xs text-center space-y-5">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 border border-gray-100">
              <Package size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No orders placed yet</h3>
              <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto mt-1">
                Your recent purchases will show up here with live carrier tracking.
              </p>
            </div>
            <button
              onClick={() => navigateTo('shop')}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((ord) => (
              <div 
                key={ord.id}
                onClick={() => navigateTo('order-details', { id: ord.id })}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5 hover:border-gray-300 transition-colors group cursor-pointer"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-colors border border-gray-100">
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">Order #{ord.id}</div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">Placed on {new Date(ord.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full font-semibold text-xs ${
                      ord.status === 'Delivered' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-primary-light text-primary border border-primary/10'
                    }`}>
                      {ord.status}
                    </span>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-8 space-y-3">
                    {ord.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-lg border border-gray-200 overflow-hidden relative flex-shrink-0 bg-gray-50">
                          <SmartImage 
                            src={item.productImage} 
                            alt={item.productName} 
                            fill
                            fallbackType="product"
                            fallbackLabel={item.productName}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{item.productName}</div>
                          <div className="text-xs text-gray-500 font-medium mt-0.5">Qty: {item.quantity} • {formatPrice(item.unitPrice, currencyCode, currencySymbol)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-4 lg:text-right space-y-2.5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div>
                      <div className="text-[11px] font-medium text-gray-500 mb-0.5">Tracking Number</div>
                      <div className="text-xs font-mono font-bold text-gray-900">{ord.trackingNumber || 'UNAVAILABLE'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-gray-500 mb-0.5">Grand Total</div>
                      <div className="text-base font-bold text-primary">{formatPrice(ord.totalAmount, currencyCode, currencySymbol)}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(ord);
                      }}
                      className="w-full mt-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full relative z-10 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Shipment Tracking</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Order #{selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-gray-500 mb-0.5">Carrier Tracking ID</div>
                  <div className="text-xs font-mono font-bold text-primary">{selectedOrder.trackingNumber}</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200 text-primary">
                  <Truck size={18} />
                </div>
              </div>

              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {selectedOrder.trackingSteps?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 text-xs ${
                      step.completed 
                        ? 'bg-emerald-600 text-white' 
                        : step.current 
                        ? 'bg-primary text-white ring-4 ring-primary/20' 
                        : 'bg-white border-2 border-gray-200 text-gray-300'
                    }`}>
                      {step.completed ? <CheckCircle2 size={14} /> : <Clock size={12} />}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${step.completed || step.current ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-gray-500 font-normal mt-0.5">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-gray-900 text-white font-semibold text-xs rounded-lg hover:bg-gray-800 transition-colors shadow-xs"
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
