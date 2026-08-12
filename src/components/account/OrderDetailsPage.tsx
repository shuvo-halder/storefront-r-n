'use client';

import React, { useEffect, useState } from 'react';
import { SmartImage } from '../common/SmartImage';
import { AccountLayout } from './AccountLayout';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { Order, Refund } from '../../types/storefront';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const OrderDetailsPage: React.FC = () => {
  const { viewParams, navigateTo } = useStorefront();
  const [order, setOrder] = useState<Order | null>(null);
  const [refund, setRefund] = useState<Refund | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = viewParams.id;

  useEffect(() => {
    const fetchDetails = async () => {
      if (!orderId) return;
      setIsLoading(true);
      try {
        const [orderData, refundData] = await Promise.all([
          storefrontApi.getOrderById(orderId),
          storefrontApi.getRefundByOrderId(orderId)
        ]);
        setOrder(orderData);
        setRefund(refundData);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [orderId]);

  if (isLoading) {
    return (
      <AccountLayout activeTab="orders">
        <div className="min-h-[400px] flex items-center justify-center">
          <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AccountLayout>
    );
  }

  if (!order) {
    return (
      <AccountLayout activeTab="orders">
        <div className="bg-white rounded-[40px] p-12 text-center border border-slate-100 shadow-sm">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-black text-slate-900">Order Not Found</h3>
          <p className="text-slate-500 font-medium mt-2 mb-8">We couldn't find the order you're looking for.</p>
          <button 
            onClick={() => navigateTo('orders')}
            className="px-8 py-3.5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl"
          >
            Back to Orders
          </button>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout activeTab="orders">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigateTo('orders')}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors mb-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Orders</span>
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Details</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-bold text-slate-500">#{order.id}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-sm font-bold text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${
                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-primary/5 text-primary border border-primary/10'
              }`}>
                {order.status}
              </span>
              {order.status === 'Delivered' && !order.returnStatus && (
                <button 
                  onClick={() => navigateTo('return-request', { id: order.id })}
                  className="px-6 py-2 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all shadow-md"
                >
                  Return Items
                </button>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Items List */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <Package size={20} className="text-primary" />
                <span>Order Summary</span>
              </h3>
              <div className="space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 relative">
                      <SmartImage 
                        src={item.productImage} 
                        alt={item.productName} 
                        fill
                        fallbackType="product"
                        fallbackLabel={item.productName}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-900 truncate">{item.productName}</h4>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mt-1">
                        {item.variantName || 'Standard Edition'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-slate-500">Qty: {item.quantity}</span>
                        <span className="text-sm font-black text-slate-900 font-mono">${item.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Timeline */}
            {order.trackingSteps && (
              <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                  <Truck size={20} className="text-primary" />
                  <span>Shipment Tracking</span>
                </h3>
                
                {order.trackingNumber && (
                   <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                     <div>
                       <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Carrier Tracking ID</div>
                       <div className="text-xs font-mono font-black text-primary">{order.trackingNumber}</div>
                     </div>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-white rounded-lg shadow-sm border border-slate-100">
                        Aura Logistics
                     </div>
                   </div>
                )}

                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {order.trackingSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-6 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                        step.completed ? 'bg-emerald-500 text-white' : step.current ? 'bg-primary text-white animate-pulse' : 'bg-white border-2 border-slate-100 text-slate-200'
                      }`}>
                        {step.completed ? <CheckCircle2 size={14} /> : <Clock size={12} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className={`text-xs font-black uppercase tracking-tight ${step.completed || step.current ? 'text-slate-900' : 'text-slate-300'}`}>
                            {step.label}
                          </div>
                          {step.timestamp && (
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{step.timestamp}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Return / Refund Info */}
            {(order.returnStatus && order.returnStatus !== 'Not Requested') && (
               <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
                 <div className="relative z-10">
                   <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                     <RefreshCcw size={20} className="text-amber-500" />
                     <span>Return Information</span>
                   </h3>
                   <div className="flex items-center gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 uppercase tracking-widest">Return Status: {order.returnStatus}</div>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">Your return request is currently being processed by our quality assurance team.</p>
                      </div>
                   </div>
                 </div>
                 <RefreshCcw className="absolute -bottom-6 -right-6 text-amber-500/5 w-32 h-32 rotate-12" />
               </div>
            )}

            {refund && (
              <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-emerald-500" />
                  <span>Refund Details</span>
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount Refunded</div>
                      <div className="text-lg font-black text-slate-900 font-mono">${refund.amount.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Refund Status</div>
                      <div className={`text-xs font-black uppercase tracking-widest ${refund.status === 'Processed' ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {refund.status}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 border border-slate-100 rounded-2xl space-y-3">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Provider</span>
                      <span className="text-slate-900">{refund.provider}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Reason</span>
                      <span className="text-slate-900">{refund.reason}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Processed On</span>
                      <span className="text-slate-900">{new Date(refund.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            
            {/* Delivery Address */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                <MapPin size={16} className="text-primary" />
                <span>Shipping Address</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="font-black text-slate-900">{order.shippingAddress.fullName}</div>
                <div className="text-slate-500 font-medium leading-relaxed">
                  {order.shippingAddress.addressLine1}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </div>
                <div className="pt-2 text-xs font-bold text-slate-400">
                  {order.shippingAddress.phone}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                <CreditCard size={16} className="text-primary" />
                <span>Payment & Billing</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{order.paymentMethod}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Transaction Secured</div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-slate-900">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Shipping</span>
                    <span className="text-slate-900">${order.shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Tax (8%)</span>
                    <span className="text-slate-900">${order.tax.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-xs font-bold text-emerald-600">
                      <span>Discount</span>
                      <span>-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Amount</span>
                    <span className="text-xl font-black text-primary font-mono">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-sm font-black uppercase tracking-widest mb-4">Need Assistance?</h3>
                 <p className="text-xs text-white/60 font-medium leading-relaxed mb-6">
                   Our technical support team is available 24/7 to help you with your order.
                 </p>
                 <button className="w-full py-3 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all">
                   Contact Support
                 </button>
               </div>
               <ShieldCheck className="absolute -bottom-6 -right-6 text-white/5 w-32 h-32" />
            </div>

          </div>

        </div>

      </div>
    </AccountLayout>
  );
};
