import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { CheckCircle2, Truck, Package, ArrowRight, Printer, Share2 } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { viewParams, navigateTo } = useStorefront();
  const order = viewParams.confirmedOrder;

  if (!order) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold">No order details found</h2>
        <button onClick={() => navigateTo('home')} className="mt-4 px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl">
          Return Home
        </button>
      </div>
    );
  }

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
              ORDER CONFIRMED #{order.id}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              We have sent a receipt invoice to <span className="font-bold text-slate-800">{order.shippingAddress.email}</span>. Your electronics package is currently being processed.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 inline-flex items-center gap-4 text-xs font-semibold text-slate-700">
            <div>Tracking #: <span className="font-mono font-bold text-rose-600">{order.trackingNumber}</span></div>
            <div>•</div>
            <div>Estimated Delivery: <span className="font-bold text-slate-900">{order.estimatedDeliveryDate}</span></div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Truck size={16} className="text-rose-600" />
            <span>Package Delivery Status</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            {order.trackingSteps?.slice(0, 4).map((step, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-2xl border ${
                  step.completed 
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800' 
                    : step.current
                    ? 'border-rose-500 bg-rose-50 text-rose-800 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <div className="font-bold">{step.label}</div>
                <div className="text-[10px] mt-0.5">{step.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details Invoice */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            Order Items
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={item.productImage} alt="" className="w-12 h-12 object-cover rounded-xl border border-slate-200" />
                  <div>
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="text-[11px] text-slate-400">Qty: {item.quantity}</div>
                  </div>
                </div>
                <span className="font-bold text-slate-900">${item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-1 text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping ({order.shippingMethod})</span><span>${order.shippingFee.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span className="text-rose-600">${order.totalAmount.toFixed(2)}</span>
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
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Back to Storefront
          </button>
        </div>

      </div>
    </div>
  );
};
