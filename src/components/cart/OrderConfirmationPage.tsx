'use client';
import React, { useEffect, useState, useRef } from 'react';
import { SmartImage } from '../common/SmartImage';
import { useStorefront } from '../../context/StorefrontContext';
import { useSettings } from '../../context/SettingsContext';
import { storefrontApi } from '../../services/storefrontApi';
import { Order } from '../../types/storefront';
import { trackGA4Purchase } from '../../utils/analytics';
import { CheckCircle2, Truck, Package, ArrowRight, Printer, Share2, Loader2 } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { viewParams, navigateTo } = useStorefront();
  const [order, setOrder] = useState<Order | null>(viewParams.confirmedOrder || null);
  const [isLoading, setIsLoading] = useState<boolean>(!viewParams.confirmedOrder && Boolean(viewParams.orderId || viewParams.id));
  const hasTrackedPurchaseRef = useRef<boolean>(false);

  let currency = 'BDT';
  try {
    const { settings } = useSettings();
    currency = settings?.general?.currency || 'BDT';
  } catch {
    // Fallback if rendered outside SettingsProvider
  }

  // Load order from API if only orderId was provided in viewParams
  useEffect(() => {
    const fetchId = viewParams.orderId || viewParams.id;
    if (!order && fetchId) {
      setIsLoading(true);
      storefrontApi
        .getOrderById(fetchId)
        .then((fetched) => {
          if (fetched) {
            setOrder(fetched);
          }
        })
        .catch((err) => {
          console.error('[OrderConfirmationPage] Failed to fetch order details:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [order, viewParams.orderId, viewParams.id]);

  // Single authoritative purchase event dispatch on order confirmation
  useEffect(() => {
    if (order && !hasTrackedPurchaseRef.current) {
      hasTrackedPurchaseRef.current = true;
      trackGA4Purchase(order, currency);
    }
  }, [order, currency]);

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-slate-500 font-bold">Loading order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold">No order details found</h2>
        <button onClick={() => navigateTo('home')} className="mt-4 px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl">
          Return Home
        </button>
      </div>
    );
  }

  const displayOrderIdentifier = order.orderNumber || order.id;

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Celebration Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
              ORDER CONFIRMED #{displayOrderIdentifier}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              We have sent a receipt invoice to <span className="font-bold text-slate-800">{order.shippingAddress?.email || 'your email'}</span>. Your package is currently being processed.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 inline-flex items-center gap-4 text-xs font-semibold text-slate-700">
            <div>Tracking #: <span className="font-mono font-bold text-primary">{order.trackingNumber || 'Pending'}</span></div>
            {order.estimatedDeliveryDate && (
              <>
                <div>•</div>
                <div>Estimated Delivery: <span className="font-bold text-slate-900">{order.estimatedDeliveryDate}</span></div>
              </>
            )}
          </div>
        </div>

        {/* Tracking Timeline */}
        {order.trackingSteps && order.trackingSteps.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Truck size={16} className="text-primary" />
              <span>Package Delivery Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              {order.trackingSteps.slice(0, 4).map((step, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-2xl border ${
                    step.completed 
                      ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800' 
                      : step.current
                      ? 'border-primary bg-primary/5 text-rose-800 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  <div className="font-bold">{step.label}</div>
                  <div className="text-[10px] mt-0.5">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Details Invoice */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            Order Items
          </h3>

          <div className="divide-y divide-slate-100">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden relative flex-shrink-0">
                    <SmartImage 
                      src={item.productImage} 
                      alt={item.productName} 
                      fill
                      fallbackType="product"
                      fallbackLabel={item.productName}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="text-[11px] text-slate-400">Qty: {item.quantity}</div>
                  </div>
                </div>
                <span className="font-bold text-slate-900">${(item.totalPrice || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-1 text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span>${(order.subtotal || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping ({order.shippingMethod})</span><span>${(order.shippingFee || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${(order.tax || 0).toFixed(2)}</span></div>
            <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span className="text-primary">${(order.totalAmount || order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigateTo('orders')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            View My Orders History
          </button>
          <button
            onClick={() => navigateTo('home')}
            className="px-6 py-3 bg-primary hover:bg-primary text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Back to Storefront
          </button>
        </div>

      </div>
    </div>
  );
};
