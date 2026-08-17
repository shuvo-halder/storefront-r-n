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
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-xs">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Order Not Found</h3>
          <p className="text-gray-500 text-sm font-medium mt-1 mb-6">We couldn't find the order you're looking for.</p>
          <button 
            onClick={() => navigateTo('orders')}
            className="btn-primary text-sm"
          >
            Back to Orders
          </button>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout activeTab="orders">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigateTo('orders')}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Orders</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order Details</h1>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-sm font-semibold text-gray-600">#{order.id}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className={`px-3 py-1 rounded-full font-semibold text-xs ${
                order.status === 'Delivered' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-primary-light text-primary border border-primary/10'
              }`}>
                {order.status}
              </span>
              {order.status === 'Delivered' && !order.returnStatus && (
                <button 
                  onClick={() => navigateTo('return-request', { id: order.id })}
                  className="px-4 py-1.5 bg-gray-900 text-white font-semibold text-xs rounded-lg hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
                >
                  Return Items
                </button>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Order Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Items List */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs">
              <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2.5">
                <Package size={18} className="text-primary" />
                <span>Order Summary</span>
              </h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative">
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
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{item.productName}</h4>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {item.variantName || 'Standard Edition'}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-gray-900">${item.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Timeline */}
            {order.trackingSteps && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs">
                <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2.5">
                  <Truck size={18} className="text-primary" />
                  <span>Shipment Tracking</span>
                </h3>
                
                {order.trackingNumber && (
                   <div className="mb-6 p-3.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                     <div>
                       <div className="text-[11px] font-medium text-gray-500 mb-0.5">Carrier Tracking ID</div>
                       <div className="text-xs font-mono font-bold text-primary">{order.trackingNumber}</div>
                     </div>
                     <div className="text-xs font-semibold text-gray-600 px-2.5 py-1 bg-white rounded-md border border-gray-200">
                        Aura Logistics
                     </div>
                   </div>
                )}

                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {order.trackingSteps.map((step, idx) => (
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
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className={`text-xs font-bold ${step.completed || step.current ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </div>
                          {step.timestamp && (
                            <span className="text-[11px] font-medium text-gray-400">{step.timestamp}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-normal mt-0.5 leading-relaxed">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Return / Refund Info */}
            {(order.returnStatus && order.returnStatus !== 'Not Requested') && (
               <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs overflow-hidden relative">
                 <div className="relative z-10">
                   <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                     <RefreshCcw size={18} className="text-amber-500" />
                     <span>Return Information</span>
                   </h3>
                   <div className="flex items-center gap-3.5 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-amber-600 border border-amber-200 flex-shrink-0">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Return Status: {order.returnStatus}</div>
                        <p className="text-xs text-gray-600 font-normal mt-0.5">Your return request is currently being processed by our team.</p>
                      </div>
                   </div>
                 </div>
               </div>
            )}

            {refund && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span>Refund Details</span>
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-xs font-medium text-gray-500 mb-0.5">Amount Refunded</div>
                      <div className="text-base font-bold text-gray-900">${refund.amount.toFixed(2)}</div>
                    </div>
                    <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-xs font-medium text-gray-500 mb-0.5">Refund Status</div>
                      <div className={`text-xs font-bold ${refund.status === 'Processed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {refund.status}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-lg space-y-2.5 bg-gray-50">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">Provider</span>
                      <span className="text-gray-900 font-semibold">{refund.provider}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">Reason</span>
                      <span className="text-gray-900 font-semibold">{refund.reason}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">Processed On</span>
                      <span className="text-gray-900 font-semibold">{new Date(refund.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            
            {/* Delivery Address */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span>Shipping Address</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="font-bold text-gray-900">{order.shippingAddress.fullName}</div>
                <div className="text-gray-600 font-normal leading-relaxed">
                  {order.shippingAddress.addressLine1}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </div>
                <div className="pt-1 font-medium text-gray-500">
                  {order.shippingAddress.phone}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-primary" />
                <span>Payment & Billing</span>
              </h3>
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-gray-400 border border-gray-200">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">{order.paymentMethod}</div>
                    <div className="text-[10px] text-gray-500 font-medium">Transaction Secured</div>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900 font-medium">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900 font-medium">${order.shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Tax (8%)</span>
                    <span className="text-gray-900 font-medium">${order.tax.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-xs font-medium text-emerald-600">
                      <span>Discount</span>
                      <span>-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2.5 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-900">Total Amount</span>
                    <span className="text-lg font-bold text-primary">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-[#111827] rounded-xl p-6 text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-sm font-bold mb-2">Need Assistance?</h3>
                 <p className="text-xs text-gray-300 leading-relaxed mb-4">
                   Our customer support team is available 24/7 to help you with your order.
                 </p>
                 <button className="w-full py-2 bg-white text-gray-900 font-semibold text-xs rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                   Contact Support
                 </button>
               </div>
            </div>

          </div>

        </div>

      </div>
    </AccountLayout>
  );
};
